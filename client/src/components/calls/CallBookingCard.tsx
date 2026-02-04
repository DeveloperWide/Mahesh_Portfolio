import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { instance } from "../../utils/axiosInstance";
import type {
  CallsAvailabilityResponse,
  CreateCallBookingResponse,
  CreateCallCheckoutResponse,
  VerifyCallCheckoutResponse,
} from "../../types/callTypes";

const TOPICS = [
  "Project / Freelance",
  "Job / Internship",
  "Mentorship / Guidance",
  "Resume / Portfolio Review",
  "Other",
] as const;

const formatInTimeZone = (
  iso: string,
  timeZone: string,
  opts: Intl.DateTimeFormatOptions,
) => new Intl.DateTimeFormat(undefined, { timeZone, ...opts }).format(new Date(iso));

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

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = async () => {
  if (window.Razorpay) return true;
  return await new Promise<boolean>((resolve) => {
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CallBookingCard = () => {
  const [duration, setDuration] = useState<30 | 60>(30);
  const [data, setData] = useState<CallsAvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [title, setTitle] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = async (nextDuration?: 30 | 60) => {
    const d = nextDuration ?? duration;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await instance.get("/calls/availability", {
        params: { durationMinutes: d, days: 14 },
      });
      const payload = res.data as CallsAvailabilityResponse;
      setData(payload);

      const defaultDay =
        payload.days.find((day) => day.slots.length > 0)?.date ??
        payload.days[0]?.date ??
        null;

      setActiveDay((prev) => (prev && payload.days.some((d2) => d2.date === prev) ? prev : defaultDay));
      setSelectedStartAt(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load call slots");
      setData(null);
      setActiveDay(null);
      setSelectedStartAt(null);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    refresh(duration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const active = useMemo(() => {
    if (!data || !activeDay) return null;
    return data.days.find((d) => d.date === activeDay) ?? null;
  }, [data, activeDay]);

  const timeZone = data?.timeZone ?? "UTC";
  const minDate = data?.days[0]?.date;
  const maxDate = data?.days[data.days.length - 1]?.date;
  const priceText =
    data?.pricing?.currency && typeof data?.pricing?.amount === "number"
      ? formatMoney(data.pricing.amount, data.pricing.currency)
      : null;

  const selectedLabel = selectedStartAt
    ? formatInTimeZone(selectedStartAt, timeZone, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const onBookFree = async () => {
    if (!selectedStartAt) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await instance.post("/calls/bookings", {
        startAt: selectedStartAt,
        durationMinutes: duration,
        name,
        email,
        topic,
        title,
      });
      const payload = res.data as CreateCallBookingResponse;
      setSuccess(
        `Booked: ${formatInTimeZone(payload.booking.startAt, timeZone, {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })} (${payload.booking.durationMinutes}m)`,
      );
      setSelectedStartAt(null);
      setTitle("");
      await refresh(duration);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onPayAndBook = async () => {
    if (!selectedStartAt) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await instance.post("/calls/checkout", {
        startAt: selectedStartAt,
        durationMinutes: duration,
        name,
        email,
        topic,
        title,
      });

      const checkoutPayload = res.data as CreateCallCheckoutResponse;

      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        throw new Error("Failed to load Razorpay checkout.");
      }

      const rzp = new window.Razorpay({
        key: checkoutPayload.razorpay.keyId,
        amount: checkoutPayload.razorpay.amount,
        currency: checkoutPayload.razorpay.currency,
        name: "Mahesh Rana",
        description: title,
        order_id: checkoutPayload.razorpay.orderId,
        prefill: {
          name,
          email,
        },
        theme: { color: "#f59e0b" },
        handler: async (response: any) => {
          try {
            const verifyRes = await instance.post("/calls/verify", {
              checkoutId: checkoutPayload.checkout.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            const verifyPayload = verifyRes.data as VerifyCallCheckoutResponse;
            const booking = verifyPayload.booking;
            const status = String(booking.status || "").toLowerCase();

            if (status === "cancelled") {
              const serverMessage = (verifyRes.data as any)?.message as string | undefined;
              setSuccess(
                serverMessage ||
                  "Payment received, but we couldn’t confirm your selected slot. Please check your email for next steps.",
              );
            } else {
              setSuccess(
                `Booked: ${formatInTimeZone(booking.startAt, timeZone, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })} (${booking.durationMinutes}m)`,
              );
            }
            setSelectedStartAt(null);
            setTitle("");
            await refresh(duration);
          } catch (err: any) {
            setError(err?.response?.data?.message || "Payment verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
          },
        },
      });

      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Payment failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-gray-900">Book a Call</h3>
          <p className="mt-1 text-sm text-gray-600">
            Available <span className="font-semibold">8 PM → 9 AM</span>{" "}
            <span className="text-gray-400">({timeZone})</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setDuration(30)}
              className={`px-3 py-2 text-sm font-semibold ${
                duration === 30 ? "bg-gray-900 text-white" : "text-gray-800"
              }`}
            >
              30m
            </button>
            <button
              type="button"
              onClick={() => setDuration(60)}
              className={`px-3 py-2 text-sm font-semibold ${
                duration === 60 ? "bg-gray-900 text-white" : "text-gray-800"
              }`}
            >
              60m
            </button>
          </div>
          {priceText ? (
            <div className="text-xs font-semibold text-gray-700">{priceText}</div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">Pick a date</div>
            <div className="mt-1 text-xs text-gray-500">
              Select a date to view available times.
            </div>
          </div>

          <button
            type="button"
            onClick={() => refresh(duration)}
            className="text-sm font-semibold text-amber-700 hover:underline underline-offset-4 shrink-0"
            disabled={loadingSlots}
          >
            Refresh
          </button>
        </div>

        {loadingSlots ? (
          <div className="text-sm text-gray-600">Loading slots…</div>
        ) : !data || data.days.length === 0 ? (
          <div className="text-sm text-gray-600">No slots available.</div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={activeDay ?? ""}
              min={minDate}
              max={maxDate}
              onChange={(e) => {
                setActiveDay(e.target.value);
                setSelectedStartAt(null);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 w-full"
            />
            <div className="text-xs text-gray-500 shrink-0">
              {active?.slots.length ?? 0} slots
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-semibold text-gray-900">Pick a time</div>
          <div className="mt-2">
            {!active ? (
              <div className="text-sm text-gray-600">Select a date to see slots.</div>
            ) : active.slots.length === 0 ? (
              <div className="text-sm text-gray-600">No slots left for this day.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {active.slots.map((iso) => {
                  const label = formatInTimeZone(iso, timeZone, {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  const isSelected = iso === selectedStartAt;
                  return (
                    <button
                      type="button"
                      key={iso}
                      onClick={() => setSelectedStartAt(iso)}
                      className={`px-3 py-2 rounded-xl border text-sm font-semibold ${
                        isSelected
                          ? "border-amber-600 bg-amber-50 text-amber-800"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="text-sm font-semibold text-gray-900">Details</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              placeholder="Your name"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              placeholder="Email"
              type="email"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-500"
            >
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
              placeholder="Title (what you want to discuss)"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {selectedLabel ? `Selected: ${selectedLabel}` : "Select a slot to continue"}
            </div>

            <button
              type="button"
              onClick={data?.requirePayment ? onPayAndBook : onBookFree}
              disabled={
                submitting ||
                !selectedStartAt ||
                !name.trim() ||
                !email.trim() ||
                !title.trim()
              }
              className="px-5 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500"
            >
              {submitting
                ? "Processing…"
                : data?.requirePayment
                  ? `Pay & Book${priceText ? ` (${priceText})` : ""}`
                  : "Book Call"}
            </button>
          </div>

          <div className="mt-3 text-[11px] text-gray-500">
            By booking, you agree to{" "}
            <Link
              to="/terms"
              className="text-amber-700 font-semibold hover:underline underline-offset-4"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/refunds"
              className="text-amber-700 font-semibold hover:underline underline-offset-4"
            >
              Refund Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallBookingCard;
