import type { Request, Response } from "express";
import { ContactMessage } from "../models/contactMessage.model";

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

export const adminListContactMessages = async (req: Request, res: Response) => {
  const limit = clampInt(req.query.limit, 100, { min: 1, max: 500 });
  const skip = clampInt(req.query.skip, 0, { min: 0, max: 100_000 });
  const q = String(req.query.q ?? "").trim().toLowerCase();

  const query: Record<string, any> = {};
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { message: { $regex: q, $options: "i" } },
    ];
  }

  const [messages, total] = await Promise.all([
    ContactMessage.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactMessage.countDocuments(query),
  ]);

  return res.status(200).json({ messages, total, limit, skip });
};

export const adminGetContactMessage = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const msg = await ContactMessage.findById(req.params.id);
  if (!msg) return res.status(404).json({ message: "Message not found" });
  return res.status(200).json({ message: msg });
};

