const courses = [
  {
    title: "MERN Full-Stack (Udemy)",
    subtitle: "Project-based, from zero to deploy",
    href: "https://www.udemy.com/",
  },
  {
    title: "React + TypeScript (Udemy)",
    subtitle: "Build clean UI systems that scale",
    href: "https://www.udemy.com/",
  },
];

const Courses = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-14">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            Courses
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Learn With Me
          </h2>
          <p className="mt-4 text-gray-600 text-lg max-w-2xl">
            If you prefer structured learning, here are my Udemy courses. Pick a
            track and start building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {courses.map((course) => (
            <a
              key={course.title}
              href={course.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 bg-white"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 mb-6">{course.subtitle}</p>
              <span className="text-amber-600 font-semibold">
                Open on Udemy →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;

