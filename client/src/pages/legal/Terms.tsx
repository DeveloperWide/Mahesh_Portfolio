const Terms = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-gray-600">
            Last updated: February 4, 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Overview</h2>
            <p>
              By using this website, submitting the contact form, or booking a
              call, you agree to these Terms. If you do not agree, please do
              not use the service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Call bookings</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                A booking is confirmed only after successful payment (when
                payments are enabled) and email confirmation.
              </li>
              <li>
                You are responsible for providing a valid email and joining at
                the scheduled time.
              </li>
              <li>
                We may reschedule in rare cases (e.g., connectivity issues or
                emergencies). If we cannot deliver the call, you may be eligible
                for a refund as described in the Refund Policy.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              Acceptable use
            </h2>
            <p>
              Do not misuse the service, attempt to bypass security, or submit
              harmful content. We may block abusive activity.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Payments</h2>
            <p>
              Payments are processed by our payment provider. We do not store
              your full card details. Payment references (order/payment IDs) are
              stored for reconciliation, support, and refund handling.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Limitation</h2>
            <p>
              The service is provided “as is”. To the maximum extent permitted
              by law, we are not liable for indirect or consequential damages.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p>
              Questions? Email{" "}
              <a
                href="mailto:maheshrana9520@gmail.com"
                className="text-amber-700 font-semibold hover:underline underline-offset-4"
              >
                maheshrana9520@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Terms;

