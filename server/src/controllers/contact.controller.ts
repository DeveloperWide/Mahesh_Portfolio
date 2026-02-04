import type { Request, Response } from "express";
import { ContactMessage } from "../models/contactMessage.model";
import { safeSendAdminEmail, safeSendEmail } from "../utils/email";
import { buildContactAdminEmail, buildContactCustomerEmail } from "../utils/emailTemplates";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidEmail = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

export const submitContactMessage = async (req: Request, res: Response) => {
  const { name, email, message } = req.body as Partial<{
    name: string;
    email: string;
    message: string;
  }>;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  const doc = await ContactMessage.create({
    name: name.trim(),
    email: normalizeEmail(email),
    message: message.trim(),
  });

  void safeSendAdminEmail(buildContactAdminEmail(doc as any), "contact_admin");
  void safeSendEmail(
    { to: doc.email, ...buildContactCustomerEmail(doc as any) },
    "contact_customer",
  );

  return res.status(201).json({ ok: true });
};
