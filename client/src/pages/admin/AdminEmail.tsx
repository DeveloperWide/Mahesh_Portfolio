import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { AdminContactMessage, AdminContactMessagesResponse } from "../../types/adminTypes";
import type { AdminCallBookingsResponse, CallBooking } from "../../types/callTypes";

type Recipient = {
  key: string;
  kind: "contact" | "call";
  name: string;
  email: string;
  createdAt?: string;
  vars: Record<string, string>;
  label: string;
};

const formatWhen = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
};

const AdminEmail = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<string>("");
  const selected = useMemo(
    () => recipients.find((r) => r.key === selectedKey) ?? null,
    [recipients, selectedKey],
  );

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const availableVars = useMemo(() => {
    const v = selected?.vars ?? {};
    return Object.keys(v).sort((a, b) => a.localeCompare(b));
  }, [selected?.vars]);

  const loadRecipients = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsRes, callsRes] = await Promise.all([
        instance.get("/admin/contacts", { params: { limit: 200 } }),
        instance.get("/admin/calls/bookings", { params: { view: "all" } }),
      ]);

      const contactsPayload = contactsRes.data as AdminContactMessagesResponse;
      const callsPayload = callsRes.data as AdminCallBookingsResponse;

      const contactRecipients: Recipient[] = (contactsPayload.messages ?? []).map(
        (m: AdminContactMessage) => ({
          key: `contact:${m.id}`,
          kind: "contact",
          name: m.name,
          email: m.email,
          createdAt: m.createdAt,
          vars: {
            name: m.name,
            userName: m.name,
            email: m.email,
            contactId: m.id,
          },
          label: `${m.name} <${m.email}> (Contact${m.createdAt ? ` • ${formatWhen(m.createdAt)}` : ""})`,
        }),
      );

      const callRecipients: Recipient[] = (callsPayload.bookings ?? []).map(
        (b: CallBooking) => ({
          key: `call:${b.id}`,
          kind: "call",
          name: b.name,
          email: b.email,
          createdAt: b.createdAt,
          vars: {
            name: b.name,
            userName: b.name,
            email: b.email,
            bookingId: b.id,
            orderId: String(b.razorpayOrderId ?? ""),
            paymentId: String(b.razorpayPaymentId ?? ""),
            title: String(b.title ?? ""),
            topic: String(b.topic ?? ""),
            startAt: String(b.startAt ?? ""),
          },
          label: `${b.name} <${b.email}> (Call${b.startAt ? ` • ${formatWhen(b.startAt)}` : ""})`,
        }),
      );

      const all = [...callRecipients, ...contactRecipients].sort((a, b) =>
        (b.createdAt || "").localeCompare(a.createdAt || ""),
      );

      setRecipients(all);
      setSelectedKey((prev) => (prev && all.some((r) => r.key === prev) ? prev : ""));
      setError(null);
    } catch (err: any) {
      setRecipients([]);
      setSelectedKey("");
      setError(err?.response?.data?.message || "Failed to load recipients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    setTo(selected.email);
    if (!subject.trim()) {
      setSubject("Regarding your message / booking");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey]);

  const onSend = async () => {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const vars = selected?.vars ?? {};
      await instance.post("/admin/email/send", {
        to,
        subject,
        message,
        variables: vars,
      });
      setSuccess("Email sent.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Email</h1>
            <p className="mt-2 text-gray-600">
              Send emails from the admin panel. Supports variables like{" "}
              <span className="font-mono">{`{name}`}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={loadRecipients}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50"
            disabled={loading}
          >
            Refresh list
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="border border-gray-200 bg-white rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-800">Recipient</div>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-500"
              disabled={loading || recipients.length === 0}
            >
              <option value="">Manual / custom</option>
              {recipients.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </select>
            {loading ? (
              <div className="text-xs text-gray-500">Loading recipients…</div>
            ) : recipients.length === 0 ? (
              <div className="text-xs text-gray-500">
                No recipients yet (contact messages / call bookings).
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-gray-800">To</div>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              placeholder="email@example.com"
              type="email"
            />
          </div>
        </div>

        {availableVars.length > 0 ? (
          <div>
            <div className="text-sm font-semibold text-gray-800">Variables</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableVars.map((k) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => {
                    const token = `{${k}}`;
                    setMessage((prev) =>
                      prev ? prev + (prev.endsWith("\n") ? "" : "\n") + token : token,
                    );
                  }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-800 font-semibold hover:bg-gray-100"
                >
                  {`{${k}}`}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Click a variable to insert it into the message.
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">Subject</div>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
            placeholder="Subject"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold text-gray-800">Message</div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
            placeholder="Write your message…"
            rows={10}
          />
          <div className="text-xs text-gray-500">
            Tip: use <span className="font-mono">{`{name}`}</span>,{" "}
            <span className="font-mono">{`{email}`}</span>,{" "}
            <span className="font-mono">{`{orderId}`}</span>,{" "}
            <span className="font-mono">{`{paymentId}`}</span> (if available).
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSend}
            disabled={sending || !to.trim() || !subject.trim() || !message.trim()}
            className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500"
          >
            {sending ? "Sending…" : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmail;

