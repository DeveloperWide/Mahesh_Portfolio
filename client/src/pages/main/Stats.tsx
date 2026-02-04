const Stats = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Stats
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Consistency & Output
          </h2>
          <p className="mt-4 text-gray-600 text-lg max-w-2xl">
            A quick snapshot that’s recruiter-friendly: visible proof of
            shipping, learning, and staying consistent.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="border border-gray-200 rounded-2xl p-8 bg-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              GitHub Activity
            </h3>
            <p className="text-gray-600 mb-6">
              Contributions chart + streak style consistency.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <img
                src="https://ghchart.rshah.org/DeveloperWide"
                alt="GitHub contributions chart"
                className="w-full"
                loading="lazy"
              />
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-8 bg-white">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              What I Bring
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>Full-stack MERN delivery with TypeScript.</li>
              <li>Clean UI + API architecture (not just “it works”).</li>
              <li>Ownership mindset: ship, monitor, iterate.</li>
              <li>Client-ready communication for Upwork/teams.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;

