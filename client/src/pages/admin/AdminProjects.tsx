import { useEffect, useMemo, useState } from "react";
import { instance } from "../../utils/axiosInstance";
import type { Project } from "../../types/projectTypes";
import MarkdownEditor from "../../components/admin/MarkdownEditor";
import {
  cloudinaryIsConfigured,
  uploadProjectImage,
} from "../../utils/cloudinary";

const emptyForm = {
  title: "",
  tagline: "",
  tech: "",
  githubUrl: "",
  liveUrl: "",
  featured: false,
  imageUrl: "",
  imagePublicId: "",
  descriptionMd: "",
};

type FormState = typeof emptyForm;

const AdminProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId) ?? null,
    [projects, activeId],
  );

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await instance.get("/admin/projects");
      setProjects(res.data.projects ?? []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeProject) {
      setForm(emptyForm);
      return;
    }
    setForm({
      title: activeProject.title ?? "",
      tagline: activeProject.tagline ?? "",
      tech: (activeProject.tech ?? []).join(", "),
      githubUrl: activeProject.githubUrl ?? "",
      liveUrl: activeProject.liveUrl ?? "",
      featured: Boolean(activeProject.featured),
      imageUrl: activeProject.imageUrl ?? "",
      imagePublicId: activeProject.imagePublicId ?? "",
      descriptionMd: activeProject.descriptionMd ?? "",
    });
  }, [activeProject]);

  const buildPayload = (state: FormState) => ({
    title: state.title,
    tagline: state.tagline,
    tech: state.tech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    githubUrl: state.githubUrl,
    liveUrl: state.liveUrl,
    featured: state.featured,
    imageUrl: state.imageUrl,
    imagePublicId: state.imagePublicId,
    descriptionMd: state.descriptionMd,
  });

  return (
    <div className="space-y-8">
      <div className="border border-gray-200 bg-white rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-2 text-gray-600">
          Add/update projects here — the public Work page updates automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
        {/* List */}
        <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">All</div>
            <button
              type="button"
              className="text-sm font-semibold text-amber-600 hover:underline underline-offset-4"
              onClick={() => setActiveId(null)}
            >
              + New
            </button>
          </div>

          {loading ? (
            <div className="p-4 text-gray-600">Loading…</div>
          ) : error ? (
            <div className="p-4 text-red-600">{error}</div>
          ) : projects.length === 0 ? (
            <div className="p-4 text-gray-600">No projects yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {projects.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={`w-full text-left p-4 hover:bg-gray-50 ${
                    activeId === p.id ? "bg-gray-50" : ""
                  }`}
                  onClick={() => setActiveId(p.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        /work/{p.slug}
                      </div>
                    </div>
                    {p.featured ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="border border-gray-200 bg-white rounded-2xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-600">
                {activeProject ? "Edit Project" : "Create Project"}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {activeProject ? activeProject.title : "New Project"}
              </div>
            </div>

            {activeProject ? (
              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-50"
                onClick={async () => {
                  const ok = confirm("Delete this project?");
                  if (!ok) return;
                  try {
                    await instance.delete(`/admin/projects/${activeProject.id}`);
                    setActiveId(null);
                    await refresh();
                  } catch (err: any) {
                    alert(
                      err?.response?.data?.message || "Failed to delete project",
                    );
                  }
                }}
              >
                Delete
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((s) => ({ ...s, title: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                placeholder="e.g. Client CRM Dashboard"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Tagline (1 line)
              </label>
              <input
                value={form.tagline}
                onChange={(e) =>
                  setForm((s) => ({ ...s, tagline: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                placeholder='"Built to scale — clean UI, solid backend."'
              />
              <div className="text-xs text-gray-500">
                If left empty, a default quoted tagline is generated.
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-gray-800">
                Tech (comma separated)
              </label>
              <input
                value={form.tech}
                onChange={(e) => setForm((s) => ({ ...s, tech: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                placeholder="React, Node, MongoDB, TypeScript"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                Live URL
              </label>
              <input
                value={form.liveUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, liveUrl: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-800">
                GitHub URL
              </label>
              <input
                value={form.githubUrl}
                onChange={(e) =>
                  setForm((s) => ({ ...s, githubUrl: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((s) => ({ ...s, featured: e.target.checked }))
              }
            />
            <label htmlFor="featured" className="text-sm font-semibold text-gray-800">
              Featured
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-gray-900">
                Project Image
              </div>
              <div className="text-xs text-gray-500">
                {cloudinaryIsConfigured
                  ? "Cloudinary ready"
                  : "Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to enable upload"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  disabled={!cloudinaryIsConfigured || uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploading(true);
                      const result = await uploadProjectImage(file);
                      setForm((s) => ({
                        ...s,
                        imageUrl: result.url,
                        imagePublicId: result.publicId,
                      }));
                    } catch (err: any) {
                      alert(err?.message || "Image upload failed");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, imageUrl: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  placeholder="Or paste image URL"
                />
              </div>

              <div className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="Project"
                    className="w-full h-44 object-cover object-center"
                  />
                ) : (
                  <div className="h-44 flex items-center justify-center text-sm text-gray-500">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>

          <MarkdownEditor
            label="Description (Markdown)"
            value={form.descriptionMd}
            onChange={(next) => setForm((s) => ({ ...s, descriptionMd: next }))}
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              className="px-5 py-3 rounded-lg bg-gray-900 text-white font-semibold hover:bg-gray-800 disabled:opacity-60"
              onClick={async () => {
                try {
                  setSaving(true);
                  if (activeProject) {
                    await instance.put(
                      `/admin/projects/${activeProject.id}`,
                      buildPayload(form),
                    );
                  } else {
                    await instance.post("/admin/projects", buildPayload(form));
                  }
                  await refresh();
                  setActiveId(null);
                } catch (err: any) {
                  alert(err?.response?.data?.message || "Save failed");
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Saving…" : activeProject ? "Update Project" : "Create Project"}
            </button>

            <button
              type="button"
              className="px-5 py-3 rounded-lg border border-gray-200 text-gray-900 font-semibold hover:bg-gray-50"
              onClick={() => {
                setActiveId(null);
                setForm(emptyForm);
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;

