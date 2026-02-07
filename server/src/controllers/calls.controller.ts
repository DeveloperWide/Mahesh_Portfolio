import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CallBooking } from "../models/callBooking.model";
import { CallCheckout } from "../models/callCheckout.model";
import { CallSlotLock } from "../models/callSlotLock.model";
import {
  ceilToStepLocal,
  getCallConfig,
  getNightWindowForStartDate,
  isAllowedDuration,
  listAvailableSlots,
  requiredLockBlockStarts,
  startOfLocalDay,
} from "../utils/calls";
import {
  createRazorpayOrder,
  getRazorpayPublicConfig,
  getRazorpayPayment,
  razorpayIsConfigured,
  verifyRazorpaySignature,
} from "../utils/razorpay";
import {
  safeSendAdminEmail,
  safeSendEmail,
  shouldSendCustomerEmails,
} from "../utils/email";
import {
  buildCallBookingAdminEmail,
  buildCallBookingCustomerEmail,
} from "../utils/emailTemplates";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const CHECKOUT_RETENTION_DAYS = 30;
const CHECKOUT_RETENTION_MS = CHECKOUT_RETENTION_DAYS * 24 * 60 * 60_000;

const isValidEmail = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  // Simple, pragmatic check (not RFC perfect)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const getWindowForSlotStart = (startAt: Date, config: ReturnType<typeof getCallConfig>) => {
  const overnight = config.windowEndHour <= config.windowStartHour;

  if (overnight) {
    const h = startAt.getHours();
    if (h >= config.windowStartHour || h < config.windowEndHour) {
      const startDay = startOfLocalDay(startAt);
      if (h < config.windowEndHour) startDay.setDate(startDay.getDate() - 1);
      return getNightWindowForStartDate(
        startDay,
        config.windowStartHour,
        config.windowEndHour,
      );
    }
    return null;
  }

  const startDay = startOfLocalDay(startAt);
  const windowStart = new Date(startDay);
  windowStart.setHours(config.windowStartHour, 0, 0, 0);
  const windowEnd = new Date(startDay);
  windowEnd.setHours(config.windowEndHour, 0, 0, 0);
  return { windowStart, windowEnd };
};

export const getAvailability = async (req: Request, res: Response) => {
  const durationMinutesRaw = req.query.durationMinutes;
  const daysRaw = req.query.days;

  const durationMinutes = Number.parseInt(String(durationMinutesRaw ?? ""), 10);
  const days = Number.parseInt(String(daysRaw ?? ""), 10);

  const { config, days: availabilityDays } = await listAvailableSlots({
    durationMinutes,
    days: Number.isFinite(days) ? days : undefined,
  });

  const priceAmount =
    durationMinutes === 30
      ? config.price30
      : durationMinutes === 60
        ? config.price60
        : 0;

  return res.status(200).json({
    timeZone: config.timeZone,
    window: {
      startHour: config.windowStartHour,
      endHour: config.windowEndHour,
    },
    stepMinutes: config.stepMinutes,
    bufferMinutes: config.bufferMinutes,
    pricing: { amount: priceAmount, currency: config.currency },
    requirePayment: config.requirePayment,
    durationMinutes,
    days: availabilityDays,
  });
};

const validateCallRequest = (payload: {
  startAt?: unknown;
  durationMinutes?: unknown;
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  title?: unknown;
}) => {
  const config = getCallConfig();

  const {
    startAt,
    durationMinutes,
    name,
    email,
    topic,
    title,
  } = payload;

  if (!startAt || typeof startAt !== "string") {
    return { ok: false as const, message: "startAt is required" };
  }

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime())) {
    return { ok: false as const, message: "Invalid startAt" };
  }

  const duration = Number(durationMinutes);
  if (!Number.isFinite(duration) || !isAllowedDuration(duration)) {
    return { ok: false as const, message: "Invalid durationMinutes" };
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    return { ok: false as const, message: "Name is required" };
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return { ok: false as const, message: "Valid email is required" };
  }

  if (!topic || typeof topic !== "string" || !topic.trim()) {
    return { ok: false as const, message: "Topic is required" };
  }

  if (!title || typeof title !== "string" || !title.trim()) {
    return { ok: false as const, message: "Title is required" };
  }

  if (
    start.getSeconds() !== 0 ||
    start.getMilliseconds() !== 0 ||
    start.getMinutes() % config.stepMinutes !== 0
  ) {
    return {
      ok: false as const,
      message: `Slot must align to ${config.stepMinutes} minute steps`,
    };
  }

  const now = new Date();
  const earliest = ceilToStepLocal(
    new Date(now.getTime() + config.bufferMinutes * 60_000),
    config.stepMinutes,
  );
  if (start.getTime() < earliest.getTime()) {
    return { ok: false as const, message: "Slot is no longer available" };
  }

  const window = getWindowForSlotStart(start, config);
  if (!window) {
    return { ok: false as const, message: "Slot outside allowed window" };
  }

  const end = new Date(start.getTime() + duration * 60_000);
  if (start.getTime() < window.windowStart.getTime()) {
    return { ok: false as const, message: "Slot outside allowed window" };
  }
  if (end.getTime() > window.windowEnd.getTime()) {
    return { ok: false as const, message: "Slot ends after allowed window" };
  }

  // Horizon guard (auto mode): must be within configured autoDays window list.
  if (config.availabilityMode === "auto") {
    const overnight = config.windowEndHour <= config.windowStartHour;
    const baseDay = startOfLocalDay(now);
    if (overnight && now.getHours() < config.windowEndHour) {
      baseDay.setDate(baseDay.getDate() - 1);
    }
    const lastDay = new Date(baseDay);
    lastDay.setDate(lastDay.getDate() + config.autoDays - 1);
    const maxEnd = getNightWindowForStartDate(
      lastDay,
      config.windowStartHour,
      config.windowEndHour,
    ).windowEnd;
    if (start.getTime() >= maxEnd.getTime()) {
      return { ok: false as const, message: "Slot too far in future" };
    }
  }

  const blocks = requiredLockBlockStarts(start, duration, config.stepMinutes);
  if (blocks.length === 0) {
    return { ok: false as const, message: "Invalid slot duration" };
  }

  return {
    ok: true as const,
    config,
    start,
    duration,
    name: name.trim(),
    email: normalizeEmail(email),
    topic: topic.trim(),
    title: title.trim(),
    blocks,
  };
};

const getPriceForDuration = (durationMinutes: 30 | 60, config: ReturnType<typeof getCallConfig>) => {
  if (durationMinutes === 30) return { amount: config.price30, currency: config.currency };
  return { amount: config.price60, currency: config.currency };
};

export const createBooking = async (req: Request, res: Response) => {
  const parsed = validateCallRequest(req.body ?? {});
  if (!parsed.ok) return res.status(400).json({ message: parsed.message });

  if (parsed.config.requirePayment) {
    return res.status(402).json({ message: "Payment required. Use /calls/checkout." });
  }

  const bookingId = new mongoose.Types.ObjectId();

  try {
    await CallSlotLock.insertMany(
      parsed.blocks.map((b) => ({
        blockStartAt: b,
        kind: "booking",
        bookingId,
      })),
      { ordered: true },
    );
  } catch (err: any) {
    await CallSlotLock.deleteMany({ bookingId, kind: "booking" });
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slot already booked" });
    }
    throw err;
  }

  try {
    const booking = await CallBooking.create({
      _id: bookingId,
      startAt: parsed.start,
      durationMinutes: parsed.duration,
      name: parsed.name,
      email: parsed.email,
      topic: parsed.topic,
      title: parsed.title,
      status: "scheduled",
      paymentStatus: "paid",
      amount: 0,
      currency: parsed.config.currency,
    });

    void safeSendAdminEmail(
      buildCallBookingAdminEmail(booking as any),
      "call_booking_free_admin",
    );
    if (shouldSendCustomerEmails()) {
      void safeSendEmail(
        { to: booking.email, ...buildCallBookingCustomerEmail(booking as any) },
        "call_booking_free_customer",
      );
    }
    return res.status(201).json({ booking });
  } catch (err) {
    await CallSlotLock.deleteMany({ bookingId, kind: "booking" });
    throw err;
  }
};

export const createCheckout = async (req: Request, res: Response) => {
  const parsed = validateCallRequest(req.body ?? {});
  if (!parsed.ok) return res.status(400).json({ message: parsed.message });

  if (!parsed.config.requirePayment) {
    return res.status(400).json({ message: "Payments are disabled." });
  }

  if (!razorpayIsConfigured()) {
    return res.status(501).json({ message: "Razorpay is not configured." });
  }

  const { amount, currency } = getPriceForDuration(parsed.duration as 30 | 60, parsed.config);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid call price configuration." });
  }

  const holdId = new mongoose.Types.ObjectId();
  const holdExpiresAt = new Date(Date.now() + parsed.config.holdMinutes * 60_000);
  const expiresAt = new Date(Date.now() + CHECKOUT_RETENTION_MS);

  try {
    await CallSlotLock.insertMany(
      parsed.blocks.map((b) => ({
        blockStartAt: b,
        kind: "hold",
        holdId,
        expiresAt: holdExpiresAt,
      })),
      { ordered: true },
    );
  } catch (err: any) {
    await CallSlotLock.deleteMany({ holdId, kind: "hold" });
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Slot already booked" });
    }
    throw err;
  }

  try {
    const order = await createRazorpayOrder({
      amount,
      currency,
      receipt: `call_${holdId.toString()}`,
      notes: {
        startAt: parsed.start.toISOString(),
        durationMinutes: String(parsed.duration),
        topic: parsed.topic,
      },
    });

    const checkout = await CallCheckout.create({
      _id: holdId,
      startAt: parsed.start,
      durationMinutes: parsed.duration,
      name: parsed.name,
      email: parsed.email,
      topic: parsed.topic,
      title: parsed.title,
      amount,
      currency,
      razorpayOrderId: order.id,
      status: "created",
      holdExpiresAt,
      expiresAt,
    });

    return res.status(201).json({
      checkout: {
        id: checkout.id,
        expiresAt: checkout.holdExpiresAt,
      },
      razorpay: {
        ...getRazorpayPublicConfig(),
        orderId: order.id,
        amount,
        currency,
      },
      timeZone: parsed.config.timeZone,
    });
  } catch (err) {
    await CallSlotLock.deleteMany({ holdId, kind: "hold" });
    await CallCheckout.deleteOne({ _id: holdId });
    throw err;
  }
};

export const verifyCheckout = async (req: Request, res: Response) => {
  const { checkoutId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body as Partial<{
      checkoutId: string;
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    }>;

  if (!checkoutId || typeof checkoutId !== "string") {
    return res.status(400).json({ message: "checkoutId is required" });
  }
  if (!razorpayOrderId || typeof razorpayOrderId !== "string") {
    return res.status(400).json({ message: "razorpayOrderId is required" });
  }
  if (!razorpayPaymentId || typeof razorpayPaymentId !== "string") {
    return res.status(400).json({ message: "razorpayPaymentId is required" });
  }
  if (!razorpaySignature || typeof razorpaySignature !== "string") {
    return res.status(400).json({ message: "razorpaySignature is required" });
  }

  const checkout = await CallCheckout.findById(checkoutId);
  if (!checkout) return res.status(404).json({ message: "Checkout not found" });

  if (checkout.status === "paid" && checkout.bookingId) {
    const booking = await CallBooking.findById(checkout.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ booking });
  }

  if (checkout.razorpayOrderId !== razorpayOrderId) {
    return res.status(400).json({ message: "Order mismatch" });
  }

  const ok = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if (!ok) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  // Defense in depth: confirm the payment is real and matches our expected order/amount.
  const payment = await getRazorpayPayment(razorpayPaymentId);
  if (payment.order_id && payment.order_id !== razorpayOrderId) {
    return res.status(400).json({ message: "Payment/order mismatch" });
  }
  if (payment.amount !== checkout.amount || payment.currency !== checkout.currency) {
    return res.status(400).json({ message: "Payment amount mismatch" });
  }
  const captured =
    payment.captured === true || String(payment.status).toLowerCase() === "captured";
  if (!captured) {
    return res.status(400).json({
      message: `Payment is not captured (status: ${payment.status})`,
    });
  }

  const existing = await CallBooking.findOne({
    razorpayOrderId,
    razorpayPaymentId,
  });
  if (existing) {
    await CallCheckout.updateOne(
      { _id: checkout._id },
      {
        status: "paid",
        razorpayPaymentId,
        bookingId: existing._id,
        expiresAt: new Date(Date.now() + CHECKOUT_RETENTION_MS),
      },
    );
    return res.status(200).json({ booking: existing });
  }

  const config = getCallConfig();
  const blocks = requiredLockBlockStarts(
    checkout.startAt,
    checkout.durationMinutes,
    config.stepMinutes,
  );
  if (blocks.length === 0) {
    return res.status(400).json({ message: "Invalid slot duration" });
  }

  const holdExpiresAt: Date =
    (checkout as any).holdExpiresAt instanceof Date
      ? (checkout as any).holdExpiresAt
      : new Date((checkout as any).holdExpiresAt ?? checkout.expiresAt);

  const now = new Date();
  const holdExpired = holdExpiresAt.getTime() <= now.getTime();

  const bookingId = new mongoose.Types.ObjectId();

  let slotLocked = false;
  let slotLockError: "conflict" | null = null;

  // 1) Prefer converting the existing hold locks (race-safe because of unique index on blockStartAt).
  const convertedRes = await CallSlotLock.updateMany(
    { kind: "hold", holdId: checkout._id },
    {
      $set: { kind: "booking", bookingId },
      $unset: { holdId: "", expiresAt: "" },
    },
  );

  if (convertedRes.modifiedCount === blocks.length) {
    slotLocked = true;
  } else {
    // Cleanup partial conversion, if any.
    if (convertedRes.modifiedCount > 0) {
      await CallSlotLock.deleteMany({ kind: "booking", bookingId });
    }

    // 2) If hold already expired (or locks were TTL-cleaned), try direct booking locks.
    try {
      await CallSlotLock.insertMany(
        blocks.map((b) => ({ blockStartAt: b, kind: "booking", bookingId })),
        { ordered: true },
      );
      slotLocked = true;
    } catch (err: any) {
      await CallSlotLock.deleteMany({ kind: "booking", bookingId });
      if (err?.code === 11000) {
        slotLockError = "conflict";
      } else {
        throw err;
      }
    }
  }

  const booking = await CallBooking.create({
    _id: bookingId,
    startAt: checkout.startAt,
    durationMinutes: checkout.durationMinutes,
    name: checkout.name,
    email: checkout.email,
    topic: checkout.topic,
    title: checkout.title,
    status: slotLocked ? "scheduled" : "cancelled",
    paymentProvider: "razorpay",
    paymentStatus: "paid",
    amount: checkout.amount,
    currency: checkout.currency,
    razorpayOrderId: checkout.razorpayOrderId,
    razorpayPaymentId,
    paidAt: new Date(),
  }).catch(async (err) => {
    if (slotLocked) {
      await CallSlotLock.deleteMany({ kind: "booking", bookingId });
    }
    throw err;
  });

  await CallCheckout.updateOne(
    { _id: checkout._id },
    {
      status: "paid",
      razorpayPaymentId,
      bookingId,
      expiresAt: new Date(Date.now() + CHECKOUT_RETENTION_MS),
    },
  );

  void safeSendAdminEmail(
    buildCallBookingAdminEmail(booking as any),
    "call_booking_paid_admin",
  );
  if (shouldSendCustomerEmails()) {
    void safeSendEmail(
      { to: booking.email, ...buildCallBookingCustomerEmail(booking as any) },
      "call_booking_paid_customer",
    );
  }
  if (!slotLocked && slotLockError === "conflict") {
    return res.status(200).json({
      booking,
      message: holdExpired
        ? "Payment received, but the selected slot is no longer available. Please check your email."
        : "Payment received, but we could not confirm the slot. Please check your email.",
    });
  }
  return res.status(200).json({ booking });
};
