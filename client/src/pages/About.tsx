const About = () => {
  return (
    <section className="min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Section Header */}
        <div className="mb-16">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            About Me
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight">
            Passionate about building
            <br />
            <span className="text-amber-500">real-world web applications</span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Description */}
          <div className="space-y-6 text-gray-600 text-lg">
            <p>
              I’m a Full Stack Developer focused on building scalable,
              maintainable, and performance-driven web applications using the
              MERN stack.
            </p>

            <p>
              My approach is simple: write clean code, follow solid
              architecture, and solve real problems. I enjoy working across the
              stack—from crafting responsive user interfaces to designing APIs
              and database schemas.
            </p>

            <p>
              I’m constantly learning, experimenting, and improving my skills to
              stay aligned with modern development practices and industry
              standards.
            </p>
          </div>

          {/* Right: Highlights */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              What I Focus On
            </h3>

            <ul className="space-y-4 text-gray-600">
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">▹</span>
                Building full-stack MERN applications
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">▹</span>
                Writing clean, scalable backend APIs
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">▹</span>
                Designing responsive, accessible UIs
              </li>
              <li className="flex gap-3">
                <span className="text-amber-500 font-bold">▹</span>
                Continuous learning & best practices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
