const Refunds = () => {
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
              Email{" "}
              <a
                href="mailto:maheshrana9520@gmail.com"
                className="text-amber-700 font-semibold hover:underline underline-offset-4"
              >
                maheshrana9520@gmail.com
              </a>{" "}
              with your <span className="font-semibold">order/payment ID</span>{" "}
              and the booked date/time.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Processing time</h2>
            <p>
              Approved refunds are initiated within 3–7 business days. The final
              credit time depends on your bank/payment method.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Refunds;

