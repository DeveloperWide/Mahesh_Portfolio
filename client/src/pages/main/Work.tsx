import { Link } from "react-router";
import { useEffect, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { Project } from "../../types/projectTypes";

const Work = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await instance.get("/projects");
        if (!alive) return;
        setProjects(res.data.projects ?? []);
        setError(null);
      } catch (err: any) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Failed to load projects");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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
        {loading ? (
          <div className="text-gray-600">Loading projects…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-gray-600">
            No projects yet. (Add them from the admin dashboard.)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 bg-white"
              >
                {project.imageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div className="p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 mb-6">{project.tagline}</p>

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

                  <div className="flex items-center gap-4">
                    <Link
                      to={`/work/${project.slug}`}
                      className="text-amber-600 font-semibold hover:underline underline-offset-4"
                    >
                      View Details →
                    </Link>
                    {project.liveUrl ? (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline underline-offset-4"
                      >
                        Live
                      </a>
                    ) : null}
                    {project.githubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-600 hover:text-gray-900 hover:underline underline-offset-4"
                      >
                        GitHub
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;
