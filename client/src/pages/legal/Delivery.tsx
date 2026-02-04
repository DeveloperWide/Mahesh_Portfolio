const Delivery = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Legal
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Service Delivery Policy
          </h1>
          <p className="mt-3 text-gray-600">
            Last updated: February 4, 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              What you receive
            </h2>
            <p>
              This is a digital service. When you book a call, you receive a
              scheduled time slot and a confirmation email.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">
              Confirmation &amp; access
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                After successful payment, your booking is confirmed and the slot
                is reserved.
              </li>
              <li>
                Call details (joining method/meeting info) may be shared via
                email before the scheduled time.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Support</h2>
            <p>
              If you did not receive a confirmation email or need help, contact{" "}
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

export default Delivery;

