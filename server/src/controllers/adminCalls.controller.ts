import type { Request, Response } from "express";
import { CallBooking, type CallBookingStatus } from "../models/callBooking.model";
import { CallSlotLock } from "../models/callSlotLock.model";
import { getCallConfig } from "../utils/calls";

const asStatus = (value: unknown): CallBookingStatus | null => {
  if (value === "scheduled") return "scheduled";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return null;
};

export const adminListCallBookings = async (req: Request, res: Response) => {
  const view = String(req.query.view ?? "upcoming");
  const status = asStatus(req.query.status);

  const query: Record<string, any> = {};
  if (status) query.status = status;

  if (view === "upcoming") {
    // Include very recent ones so admin can see "now/just started" items.
    query.startAt = { $gte: new Date(Date.now() - 60 * 60_000) };
  }

  const bookings = await CallBooking.find(query).sort({ startAt: 1 });
  return res.status(200).json({ bookings, timeZone: getCallConfig().timeZone });
};

export const adminUpdateCallBookingStatus = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const nextStatus = asStatus((req.body as any)?.status);
  if (!nextStatus) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const booking = await CallBooking.findByIdAndUpdate(
    id,
    { status: nextStatus },
    { new: true },
  );

  if (!booking) return res.status(404).json({ message: "Booking not found" });

  if (nextStatus === "cancelled") {
    await CallSlotLock.deleteMany({ bookingId: booking._id, kind: "booking" });
  }

  return res.status(200).json({ booking });
};
