import type { Request, Response } from "express";
import { CallBooking } from "../models/callBooking.model";
import { RefundRequest } from "../models/refundRequest.model";
import { createRazorpayRefund, razorpayIsConfigured } from "../utils/razorpay";

const clampInt = (
  value: unknown,
  fallback: number,
  opts?: { min?: number; max?: number },
) => {
  const n = Number.parseInt(String(value ?? ""), 10);
  const raw = Number.isFinite(n) ? n : fallback;
  const min = opts?.min ?? Number.NEGATIVE_INFINITY;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(min, raw));
};

export const adminListRefundRequests = async (req: Request, res: Response) => {
  const limit = clampInt(req.query.limit, 100, { min: 1, max: 500 });
  const skip = clampInt(req.query.skip, 0, { min: 0, max: 100_000 });
  const status = String(req.query.status ?? "").trim();

  const query: Record<string, any> = {};
  if (status) query.status = status;

  const [requests, total] = await Promise.all([
    RefundRequest.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    RefundRequest.countDocuments(query),
  ]);

  return res.status(200).json({ requests, total, limit, skip });
};

export const adminApproveRefundRequest = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  if (!razorpayIsConfigured()) {
    return res.status(501).json({ message: "Razorpay is not configured." });
  }

  const rr = await RefundRequest.findById(req.params.id);
  if (!rr) return res.status(404).json({ message: "Refund request not found" });

  if (rr.status !== "requested") {
    return res.status(400).json({ message: `Refund request is ${rr.status}` });
  }

  // Find booking to determine amount/payment id.
  const booking = rr.bookingId
    ? await CallBooking.findById(rr.bookingId)
    : rr.razorpayPaymentId
      ? await CallBooking.findOne({ razorpayPaymentId: rr.razorpayPaymentId })
      : rr.razorpayOrderId
        ? await CallBooking.findOne({ razorpayOrderId: rr.razorpayOrderId })
        : null;

  const paymentId =
    (booking?.razorpayPaymentId as string | undefined) ||
    (rr.razorpayPaymentId as string | undefined);

  const amountMinor =
    typeof booking?.amount === "number" && Number.isFinite(booking.amount)
      ? booking.amount
      : typeof rr.amountMinor === "number" && Number.isFinite(rr.amountMinor)
        ? rr.amountMinor
        : 0;

  const currency =
    (typeof booking?.currency === "string" && booking.currency.trim()
      ? booking.currency.trim()
      : rr.currency || "") || undefined;

  if (!paymentId) {
    return res.status(400).json({ message: "Missing razorpayPaymentId" });
  }
  if (!amountMinor || amountMinor <= 0) {
    return res.status(400).json({ message: "Invalid refund amount" });
  }

  try {
    const refund = await createRazorpayRefund({
      paymentId,
      amount: amountMinor,
      notes: {
        email: rr.email,
        kind: rr.kind,
        bookingId: String(booking?._id ?? rr.bookingId ?? ""),
        requestId: rr.id,
      },
    });

    rr.status = "refunded";
    rr.refundId = refund.id;
    rr.processedAt = new Date();
    rr.amountMinor = amountMinor;
    rr.currency = currency || rr.currency;
    await rr.save();

    return res.status(200).json({ request: rr, refund });
  } catch (err: any) {
    rr.status = "failed";
    rr.adminNote = String(err?.message || err);
    rr.processedAt = new Date();
    await rr.save();
    throw err;
  }
};

export const adminRejectRefundRequest = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { note } = req.body as Partial<{ note: string }>;

  const rr = await RefundRequest.findById(req.params.id);
  if (!rr) return res.status(404).json({ message: "Refund request not found" });

  if (rr.status !== "requested") {
    return res.status(400).json({ message: `Refund request is ${rr.status}` });
  }

  rr.status = "rejected";
  rr.adminNote = typeof note === "string" ? note.trim() : undefined;
  rr.processedAt = new Date();
  await rr.save();

  return res.status(200).json({ request: rr });
};

