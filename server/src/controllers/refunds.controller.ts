import type { Request, Response } from "express";
import mongoose from "mongoose";
import { CallBooking } from "../models/callBooking.model";
import { RefundRequest } from "../models/refundRequest.model";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidEmail = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export const createRefundRequest = async (req: Request, res: Response) => {
  const {
    name,
    email,
    reason,
    bookingId,
    razorpayOrderId,
    razorpayPaymentId,
  } = req.body as Partial<{
    name: string;
    email: string;
    reason: string;
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
  }>;

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const hasAnyId =
    (typeof bookingId === "string" && bookingId.trim() !== "") ||
    (typeof razorpayOrderId === "string" && razorpayOrderId.trim() !== "") ||
    (typeof razorpayPaymentId === "string" && razorpayPaymentId.trim() !== "");

  if (!hasAnyId) {
    return res.status(400).json({
      message: "Provide bookingId, razorpayOrderId, or razorpayPaymentId",
    });
  }

  const normalizedEmail = normalizeEmail(email);

  let booking = null as any;
  const bookingQuery: Record<string, any> = {};

  if (typeof bookingId === "string" && mongoose.isValidObjectId(bookingId)) {
    bookingQuery._id = bookingId;
  } else if (typeof razorpayPaymentId === "string" && razorpayPaymentId.trim()) {
    bookingQuery.razorpayPaymentId = razorpayPaymentId.trim();
  } else if (typeof razorpayOrderId === "string" && razorpayOrderId.trim()) {
    bookingQuery.razorpayOrderId = razorpayOrderId.trim();
  }

  if (Object.keys(bookingQuery).length > 0) {
    booking = await CallBooking.findOne(bookingQuery);
    // Basic safety: only auto-link booking if email matches.
    if (booking && String(booking.email).toLowerCase() !== normalizedEmail) {
      booking = null;
    }
  }

  try {
    const doc = await RefundRequest.create({
      kind: "call",
      name: typeof name === "string" ? name.trim() : undefined,
      email: normalizedEmail,
      reason: typeof reason === "string" ? reason.trim() : undefined,
      bookingId: booking?._id,
      razorpayOrderId:
        (booking?.razorpayOrderId as string | undefined) ||
        (typeof razorpayOrderId === "string"
          ? razorpayOrderId.trim()
          : undefined),
      razorpayPaymentId:
        (booking?.razorpayPaymentId as string | undefined) ||
        (typeof razorpayPaymentId === "string"
          ? razorpayPaymentId.trim()
          : undefined),
      amountMinor:
        typeof booking?.amount === "number" && Number.isFinite(booking.amount)
          ? booking.amount
          : undefined,
      currency:
        typeof booking?.currency === "string" && booking.currency.trim()
          ? booking.currency.trim()
          : undefined,
      status: "requested",
    });

    return res.status(201).json({ request: doc });
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Refund request already exists" });
    }
    throw err;
  }
};
