import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { instance } from "../../utils/axiosInstance";
import type { Project } from "../../types/projectTypes";
import { markdownToSafeHtml } from "../../utils/markdown";

const ProjectDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await instance.get(`/projects/${slug}`);
        if (!alive) return;
        setProject(res.data.project ?? null);
        setError(null);
      } catch (err: any) {
        if (!alive) return;
        setError(err?.response?.data?.message || "Failed to load project");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const descriptionHtml = useMemo(() => {
    if (!project?.descriptionMd) return "";
    return markdownToSafeHtml(project.descriptionMd);
  }, [project?.descriptionMd]);

  return (
    <section className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="mb-8">
          <Link
            to="/work"
            className="text-sm font-semibold text-amber-600 hover:underline underline-offset-4"
          >
            ← Back to Work
          </Link>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : !project ? (
          <div className="text-gray-600">Project not found.</div>
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                {project.title}
              </h1>
              <p className="mt-4 text-lg text-gray-600">{project.tagline}</p>
            </div>

            {project.imageUrl ? (
              <div className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 mb-8">
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-10">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
                >
                  View Live
                </a>
              ) : null}
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Source Code
                </a>
              ) : null}
            </div>

            {project.descriptionMd ? (
              <div className="prose prose-gray max-w-none">
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            ) : (
              <p className="text-gray-600">
                No detailed description yet. (Add it from the admin dashboard.)
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ProjectDetails;

