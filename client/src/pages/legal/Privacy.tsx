const Privacy = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Privacy Policy
          </h1>
          <p className="mt-3 text-gray-600">
            Last updated: February 4, 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Contact form: your name, email, and the message you submit.
              </li>
              <li>
                Call booking: your name, email, selected topic/title, slot
                time, duration, and payment references (order/payment IDs).
              </li>
              <li>
                Basic technical data: standard server logs (e.g., IP address,
                timestamps) for security and debugging.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              How we use your data
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To respond to your inquiry.</li>
              <li>To schedule and deliver the booked call/service.</li>
              <li>
                To confirm payments, handle refunds, and resolve disputes.
              </li>
              <li>To prevent abuse and protect the service.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with
              service providers only to operate the site (e.g., payment
              processing and email delivery). These providers process data on
              our behalf for the purposes described above.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Retention</h2>
            <p>
              We retain messages and booking records as long as necessary to
              provide the service, maintain records, and comply with legal or
              accounting obligations.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Your choices</h2>
            <p>
              You can request access, correction, or deletion of your data by
              emailing{" "}
              <a
                href="mailto:maheshrana9520@gmail.com"
                className="text-amber-700 font-semibold hover:underline underline-offset-4"
              >
                maheshrana9520@gmail.com
              </a>
              .
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            <p>
              If you have questions about this policy, contact us at{" "}
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

export default Privacy;

