import type { Request, Response } from "express";
import { sendEmail } from "../utils/email";

const isValidEmail = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const replaceAllCompat = (input: string, search: string, replacement: string) =>
  input.split(search).join(replacement);

const applyVars = (input: string, vars: Record<string, string>) => {
  let out = input;
  for (const [key, raw] of Object.entries(vars)) {
    const value = String(raw ?? "");
    // Support both {name} and {{name}}.
    out = replaceAllCompat(out, `{${key}}`, value);
    out = replaceAllCompat(out, `{{${key}}}`, value);
  }
  return out;
};

const buildHtml = (payload: { subject: string; message: string }) => {
  const safeSubject = escapeHtml(payload.subject);
  const safeBody = escapeHtml(payload.message).replace(/\n/g, "<br />");

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.55; color:#111827;">
    <div style="max-width:720px; margin:0 auto; padding:18px 12px;">
      <div style="font-weight:800; font-size:16px; margin-bottom:10px;">${safeSubject}</div>
      <div style="padding:14px 16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; font-size:14px;">
        ${safeBody}
      </div>
      <div style="margin-top:10px; font-size:12px; color:#6b7280;">
        Sent from your portfolio admin panel.
      </div>
    </div>
  </div>
  `.trim();
};

export const adminSendEmail = async (req: Request, res: Response) => {
  const { to, subject, message, variables } = req.body as Partial<{
    to: string | string[];
    subject: string;
    message: string;
    variables: Record<string, string>;
  }>;

  const toList = (Array.isArray(to) ? to : [to ?? ""])
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);

  if (toList.length === 0) {
    return res.status(400).json({ message: "Recipient (to) is required" });
  }
  if (toList.some((e) => !isValidEmail(e))) {
    return res.status(400).json({ message: "Invalid recipient email" });
  }

  if (!subject || typeof subject !== "string" || !subject.trim()) {
    return res.status(400).json({ message: "Subject is required" });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ message: "Message is required" });
  }

  const vars =
    variables && typeof variables === "object" && !Array.isArray(variables)
      ? Object.fromEntries(
          Object.entries(variables).map(([k, v]) => [k, String(v ?? "")]),
        )
      : {};

  const renderedSubject = applyVars(subject.trim(), vars);
  const renderedMessage = applyVars(message.trim(), vars);

  await sendEmail({
    to: toList,
    subject: renderedSubject,
    text: renderedMessage,
    html: buildHtml({ subject: renderedSubject, message: renderedMessage }),
  });

  return res.status(200).json({ ok: true });
};
