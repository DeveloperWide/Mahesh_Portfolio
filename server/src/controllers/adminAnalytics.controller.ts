import type { Request, Response } from "express";
import { CallBooking } from "../models/callBooking.model";
import { ContactMessage } from "../models/contactMessage.model";
import { getCallConfig } from "../utils/calls";

export const adminGetAnalytics = async (_req: Request, res: Response) => {
  const now = new Date();
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60_000);
  const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60_000);

  const cfg = getCallConfig();

  const [
    contactsTotal,
    contacts7d,
    callsTotal,
    callsUpcoming,
    revenueAgg,
    revenue30dAgg,
    lastContact,
    lastCall,
  ] = await Promise.all([
    ContactMessage.countDocuments({}),
    ContactMessage.countDocuments({ createdAt: { $gte: since7d } }),
    CallBooking.countDocuments({}),
    CallBooking.countDocuments({ startAt: { $gte: new Date(now.getTime() - 60 * 60_000) } }),
    CallBooking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    CallBooking.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: since30d } } },
      { $group: { _id: null, amount: { $sum: "$amount" } } },
    ]),
    ContactMessage.findOne({}).sort({ createdAt: -1 }).select({ createdAt: 1 }),
    CallBooking.findOne({}).sort({ createdAt: -1 }).select({ createdAt: 1 }),
  ]);

  const revenueTotal = Number(revenueAgg?.[0]?.amount ?? 0);
  const revenue30d = Number(revenue30dAgg?.[0]?.amount ?? 0);

  return res.status(200).json({
    contacts: {
      total: contactsTotal,
      last7d: contacts7d,
      lastAt: lastContact?.createdAt ?? null,
    },
    calls: {
      total: callsTotal,
      upcoming: callsUpcoming,
      lastAt: lastCall?.createdAt ?? null,
    },
    revenue: {
      currency: cfg.currency,
      totalMinor: revenueTotal,
      last30dMinor: revenue30d,
    },
    timeZone: cfg.timeZone,
    generatedAt: now.toISOString(),
  });
};

