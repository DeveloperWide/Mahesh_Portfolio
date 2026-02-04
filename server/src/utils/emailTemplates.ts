import type { ICallBooking } from "../models/callBooking.model";
import type { IContactMessage } from "../models/contactMessage.model";
import { getCallConfig } from "./calls";
import { publicLink } from "./publicSiteUrl";

export type EmailPayload = {
  subject: string;
  text: string;
  html: string;
};

const formatInTimeZone = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatMoney = (amountMinor: number, currency: string) => {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${major.toFixed(2)} ${currency}`;
  }
};

const safe = (value: unknown) => String(value ?? "").trim();

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const row = (label: string, value: string) => {
  const l = escapeHtml(label);
  const v = escapeHtml(value);
  return `<tr>
    <td style="padding:8px 10px; font-weight:600; background:#f9fafb; border:1px solid #e5e7eb; width:180px;">${l}</td>
    <td style="padding:8px 10px; border:1px solid #e5e7eb;">${v}</td>
  </tr>`;
};

export const buildCallBookingEmail = (
  booking: ICallBooking & { id?: string },
): EmailPayload => {
  const cfg = getCallConfig();
  const startAt = booking.startAt instanceof Date ? booking.startAt : new Date(booking.startAt);
  const endAt = new Date(startAt.getTime() + booking.durationMinutes * 60_000);

  const status = safe((booking as any).status || "scheduled").toUpperCase();
  const amount = Number((booking as any).amount ?? 0);
  const currency = safe((booking as any).currency || "INR");
  const paymentStatus = safe((booking as any).paymentStatus || "unpaid").toUpperCase();
  const provider = safe((booking as any).paymentProvider || "");

  const orderId = safe((booking as any).razorpayOrderId);
  const paymentId = safe((booking as any).razorpayPaymentId);
  const bookingId = safe((booking as any).id || (booking as any)._id);

  const when = `${formatInTimeZone(startAt, cfg.timeZone)} (${cfg.timeZone})`;
  const ends = `${formatInTimeZone(endAt, cfg.timeZone)} (${cfg.timeZone})`;
  const paymentLine =
    amount > 0
      ? `${paymentStatus} ${formatMoney(amount, currency)}${provider ? ` (${provider})` : ""}`
      : paymentStatus;

  const subjectPrefix =
    status === "CANCELLED" && paymentStatus === "PAID" && amount > 0
      ? "Payment received — slot not confirmed"
      : status === "CANCELLED"
        ? "Call booking cancelled"
        : "New call booking";
  const subject = `${subjectPrefix} — ${formatInTimeZone(startAt, cfg.timeZone)} (${booking.durationMinutes}m)`;

  const textLines: string[] = [];
  textLines.push("New Call Booking");
  textLines.push(`When: ${when}`);
  textLines.push(`Ends: ${ends}`);
  textLines.push(`Duration: ${booking.durationMinutes}m`);
  textLines.push(`Status: ${status}`);
  textLines.push(`Topic: ${safe(booking.topic)}`);
  textLines.push(`Title: ${safe(booking.title)}`);
  textLines.push(`Name: ${safe(booking.name)}`);
  textLines.push(`Email: ${safe(booking.email)}`);
  textLines.push(`Payment: ${paymentLine}`);
  if (orderId) textLines.push(`Order: ${orderId}`);
  if (paymentId) textLines.push(`Payment ID: ${paymentId}`);
  if (bookingId) textLines.push(`Booking ID: ${bookingId}`);

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45; color:#111827;">
    <h2 style="margin:0 0 12px;">New Call Booking</h2>
    <table style="border-collapse:collapse; width:100%; max-width:720px;">
      <tbody>
        ${row("When", when)}
        ${row("Ends", ends)}
        ${row("Duration", `${booking.durationMinutes}m`)}
        ${row("Status", status)}
        ${row("Topic", safe(booking.topic))}
        ${row("Title", safe(booking.title))}
        ${row("Name", safe(booking.name))}
        ${row("Email", safe(booking.email))}
        ${row("Payment", paymentLine)}
        ${orderId ? row("Order", orderId) : ""}
        ${paymentId ? row("Payment ID", paymentId) : ""}
        ${bookingId ? row("Booking ID", bookingId) : ""}
      </tbody>
    </table>
    <div style="margin-top:12px; font-size:12px; color:#6b7280;">
      Sent by your portfolio backend.
    </div>
  </div>
  `.trim();

  return { subject, text: textLines.join("\n"), html };
};

export const buildCallBookingAdminEmail = buildCallBookingEmail;

export const buildContactEmail = (
  contact: IContactMessage & { id?: string },
): EmailPayload => {
  const cfg = getCallConfig();
  const createdAt =
    contact.createdAt instanceof Date
      ? contact.createdAt
      : contact.createdAt
        ? new Date(contact.createdAt)
        : new Date();

  const id = safe((contact as any).id || (contact as any)._id);

  const at = `${formatInTimeZone(createdAt, cfg.timeZone)} (${cfg.timeZone})`;
  const subject = `New contact form — ${safe(contact.name) || "Unknown"}`;

  const textLines: string[] = [];
  textLines.push("New Contact Form");
  textLines.push(`At: ${at}`);
  textLines.push(`Name: ${safe(contact.name)}`);
  textLines.push(`Email: ${safe(contact.email)}`);
  textLines.push("Message:");
  textLines.push(safe(contact.message));
  if (id) textLines.push(`Contact ID: ${id}`);

  const htmlMessage = escapeHtml(safe(contact.message)).replace(/\n/g, "<br />");

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45; color:#111827;">
    <h2 style="margin:0 0 12px;">New Contact Form</h2>
    <table style="border-collapse:collapse; width:100%; max-width:720px;">
      <tbody>
        ${row("At", at)}
        ${row("Name", safe(contact.name))}
        ${row("Email", safe(contact.email))}
        ${id ? row("Contact ID", id) : ""}
      </tbody>
    </table>
    <div style="margin-top:12px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;">
      <div style="font-weight:700; margin-bottom:6px;">Message</div>
      <div style="white-space:normal;">${htmlMessage}</div>
    </div>
    <div style="margin-top:12px; font-size:12px; color:#6b7280;">
      Sent by your portfolio backend.
    </div>
  </div>
  `.trim();

  return { subject, text: textLines.join("\n"), html };
};

export const buildContactAdminEmail = buildContactEmail;

export const buildCallBookingCustomerEmail = (
  booking: ICallBooking & { id?: string },
): EmailPayload => {
  const cfg = getCallConfig();
  const startAt =
    booking.startAt instanceof Date ? booking.startAt : new Date(booking.startAt);
  const endAt = new Date(startAt.getTime() + booking.durationMinutes * 60_000);

  const status = safe((booking as any).status || "scheduled").toLowerCase();
  const isCancelled = status === "cancelled";

  const amount = Number((booking as any).amount ?? 0);
  const currency = safe((booking as any).currency || "INR");
  const paymentStatus = safe((booking as any).paymentStatus || "unpaid").toUpperCase();
  const provider = safe((booking as any).paymentProvider || "");

  const orderId = safe((booking as any).razorpayOrderId);
  const paymentId = safe((booking as any).razorpayPaymentId);

  const when = `${formatInTimeZone(startAt, cfg.timeZone)} (${cfg.timeZone})`;
  const ends = `${formatInTimeZone(endAt, cfg.timeZone)} (${cfg.timeZone})`;

  const paymentLine =
    amount > 0
      ? `${paymentStatus} ${formatMoney(amount, currency)}${provider ? ` (${provider})` : ""}`
      : "No payment required";

  const subject = isCancelled
    ? `Payment received — scheduling issue (${formatInTimeZone(startAt, cfg.timeZone)})`
    : `Your call is booked — ${formatInTimeZone(startAt, cfg.timeZone)} (${booking.durationMinutes}m)`;

  const textLines: string[] = [];
  textLines.push(`Hi ${safe(booking.name) || "there"},`);
  textLines.push("");
  textLines.push(
    isCancelled
      ? "We received your payment, but we could not confirm your selected slot because it was no longer available."
      : "Your call booking is confirmed.",
  );
  if (isCancelled) {
    textLines.push("Don’t worry — we will contact you to reschedule, or you can request a refund.");
  }
  textLines.push("");
  textLines.push(`When: ${when}`);
  textLines.push(`Ends: ${ends}`);
  textLines.push(`Duration: ${booking.durationMinutes}m`);
  textLines.push(`Topic: ${safe(booking.topic)}`);
  textLines.push(`Title: ${safe(booking.title)}`);
  textLines.push(`Payment: ${paymentLine}`);
  if (orderId) textLines.push(`Order: ${orderId}`);
  if (paymentId) textLines.push(`Payment ID: ${paymentId}`);
  textLines.push("");
  textLines.push(
    isCancelled ? "Want a reschedule or refund?" : "Need to reschedule/cancel or request a refund?",
  );
  textLines.push(`Refund Policy: ${publicLink("/refunds")}`);
  textLines.push(`Terms: ${publicLink("/terms")}`);
  textLines.push(`Privacy: ${publicLink("/privacy")}`);
  textLines.push("");
  textLines.push(
    isCancelled
      ? "Reply to this email with a few alternate time options (and your timezone)."
      : "If you need help, just reply to this email.",
  );

  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45; color:#111827;">
    <h2 style="margin:0 0 10px;">${isCancelled ? "Payment received — scheduling issue" : "Your call booking is confirmed"}</h2>
    <div style="margin:0 0 14px; color:#374151;">Hi ${escapeHtml(
      safe(booking.name) || "there",
    )}, ${
      isCancelled
        ? "we received your payment but could not confirm the selected slot."
        : "thanks for booking a call."
    }</div>

    <table style="border-collapse:collapse; width:100%; max-width:720px;">
      <tbody>
        ${row("When", when)}
        ${row("Ends", ends)}
        ${row("Duration", `${booking.durationMinutes}m`)}
        ${row("Topic", safe(booking.topic))}
        ${row("Title", safe(booking.title))}
        ${row("Payment", paymentLine)}
        ${orderId ? row("Order", orderId) : ""}
        ${paymentId ? row("Payment ID", paymentId) : ""}
      </tbody>
    </table>

    ${
      isCancelled
        ? `<div style="margin-top:14px; padding:12px 14px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px;">
      <div style="font-weight:800; color:#9a3412; margin-bottom:6px;">Next steps</div>
      <div style="font-size:14px; color:#7c2d12;">
        Reply to this email with a few alternate time options (and your timezone). If you prefer a refund, mention it and we’ll follow the refund policy.
      </div>
    </div>`
        : ""
    }

    <div style="margin-top:14px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;">
      <div style="font-weight:700; margin-bottom:6px;">Policies</div>
      <div style="font-size:14px;">
        <a href="${publicLink(
          "/refunds",
        )}" style="color:#b45309; font-weight:700; text-decoration:none;">Refunds</a>
        <span style="color:#9ca3af;"> • </span>
        <a href="${publicLink(
          "/terms",
        )}" style="color:#b45309; font-weight:700; text-decoration:none;">Terms</a>
        <span style="color:#9ca3af;"> • </span>
        <a href="${publicLink(
          "/privacy",
        )}" style="color:#b45309; font-weight:700; text-decoration:none;">Privacy</a>
      </div>
      <div style="margin-top:8px; font-size:13px; color:#6b7280;">
        Need help or a refund? Reply to this email and include your order/payment ID.
      </div>
    </div>

    <div style="margin-top:12px; font-size:12px; color:#6b7280;">
      Sent by your portfolio website.
    </div>
  </div>
  `.trim();

  return { subject, text: textLines.join("\n"), html };
};

export const buildContactCustomerEmail = (
  contact: IContactMessage & { id?: string },
): EmailPayload => {
  const cfg = getCallConfig();
  const createdAt =
    contact.createdAt instanceof Date
      ? contact.createdAt
      : contact.createdAt
        ? new Date(contact.createdAt)
        : new Date();

  const at = `${formatInTimeZone(createdAt, cfg.timeZone)} (${cfg.timeZone})`;

  const subject = `We received your message`;
  const textLines: string[] = [];
  textLines.push(`Hi ${safe(contact.name) || "there"},`);
  textLines.push("");
  textLines.push("Thanks for reaching out — we received your message.");
  textLines.push(`Time received: ${at}`);
  textLines.push("");
  textLines.push("Your message:");
  textLines.push(safe(contact.message));
  textLines.push("");
  textLines.push("We’ll get back to you soon.");
  textLines.push(`Terms: ${publicLink("/terms")}`);
  textLines.push(`Privacy: ${publicLink("/privacy")}`);

  const htmlMessage = escapeHtml(safe(contact.message)).replace(/\n/g, "<br />");
  const html = `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.45; color:#111827;">
    <h2 style="margin:0 0 10px;">We received your message</h2>
    <div style="margin:0 0 10px; color:#374151;">Hi ${escapeHtml(
      safe(contact.name) || "there",
    )}, thanks for reaching out. We’ll reply soon.</div>

    <table style="border-collapse:collapse; width:100%; max-width:720px;">
      <tbody>
        ${row("Time received", at)}
        ${row("Name", safe(contact.name))}
        ${row("Email", safe(contact.email))}
      </tbody>
    </table>

    <div style="margin-top:14px; padding:12px 14px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px;">
      <div style="font-weight:700; margin-bottom:6px;">Your message</div>
      <div style="white-space:normal;">${htmlMessage}</div>
    </div>

    <div style="margin-top:12px; font-size:12px; color:#6b7280;">
      <a href="${publicLink(
        "/terms",
      )}" style="color:#b45309; font-weight:700; text-decoration:none;">Terms</a>
      <span style="color:#9ca3af;"> • </span>
      <a href="${publicLink(
        "/privacy",
      )}" style="color:#b45309; font-weight:700; text-decoration:none;">Privacy</a>
    </div>
  </div>
  `.trim();

  return { subject, text: textLines.join("\n"), html };
};
