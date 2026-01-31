import { Link } from "react-router";

const projects = [
  {
    title: "MERN Portfolio",
    description:
      "A personal portfolio built using React, Tailwind CSS, Node.js, and MongoDB with a clean, modern UI.",
    tech: ["React", "Tailwind", "Node", "MongoDB"],
  },
  {
    title: "Task Management App",
    description:
      "A full-stack task manager with authentication, CRUD operations, and role-based access.",
    tech: ["React", "Express", "JWT", "MongoDB"],
  },
  {
    title: "API Backend",
    description:
      "A scalable REST API built with TypeScript, Express, and MongoDB following clean architecture.",
    tech: ["TypeScript", "Express", "MongoDB"],
  },
];

const Work = () => {
  return (
    <section className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm uppercase tracking-widest font-bold text-gray-600 mb-4">
            My Work
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            Projects I’ve Built
          </h2>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {projects.map((project, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {project.title}
              </h3>

              <p className="text-gray-600 mb-6">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <Link
                to="#"
                className="text-amber-500 font-medium hover:underline"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
