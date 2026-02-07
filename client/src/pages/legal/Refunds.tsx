import { useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { CreateRefundRequestResponse } from "../../types/refundTypes";

const Refunds = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [razorpayOrderId, setRazorpayOrderId] = useState("");
  const [razorpayPaymentId, setRazorpayPaymentId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await instance.post("/refunds", {
        name,
        email,
        reason,
        razorpayOrderId: razorpayOrderId || undefined,
        razorpayPaymentId: razorpayPaymentId || undefined,
      });
      void (res.data as CreateRefundRequestResponse);
      setSuccess("Refund request submitted. We’ll review and contact you by email.");
      setReason("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit refund request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-3 text-gray-600">
            Last updated: February 4, 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Cancellations</h2>
            <p>
              If you need to cancel or reschedule, please contact us as early as
              possible using your booking email.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Refunds</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                If we cannot deliver the scheduled call due to our side, you are
                eligible for a full refund or a reschedule (your choice).
              </li>
              <li>
                If you cancel at least <span className="font-semibold">24 hours</span>{" "}
                before the scheduled start time, you are eligible for a full
                refund.
              </li>
              <li>
                Cancellations within 24 hours and no-shows are typically
                non-refundable (we may make exceptions case-by-case).
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              How to request a refund
            </h2>
            <p>
              Use the form below (recommended) or email{" "}
              <a
                href="mailto:maheshrana9520@gmail.com"
                className="text-amber-700 font-semibold hover:underline underline-offset-4"
              >
                maheshrana9520@gmail.com
              </a>{" "}
              with your <span className="font-semibold">order/payment ID</span>.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Processing time</h2>
            <p>
              Approved refunds are initiated within 3–7 business days. The final
              credit time depends on your bank/payment method.
            </p>
          </div>

          <div className="space-y-4 border border-gray-200 bg-white rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900">Refund request form</h2>
            <p className="text-sm text-gray-600">
              Please provide your email and at least one ID (payment ID preferred).
            </p>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {success}
              </div>
            ) : null}

            <form className="space-y-3" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                  placeholder="Your name (optional)"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                  placeholder="Your email"
                  type="email"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={razorpayPaymentId}
                  onChange={(e) => setRazorpayPaymentId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                  placeholder="Razorpay Payment ID (recommended)"
                />
                <input
                  value={razorpayOrderId}
                  onChange={(e) => setRazorpayOrderId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                  placeholder="Razorpay Order ID (optional)"
                />
              </div>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500"
                placeholder="Reason (optional)"
                rows={4}
              />

              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="px-6 py-3 rounded-xl bg-amber-500 text-gray-900 font-semibold hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Refunds;
