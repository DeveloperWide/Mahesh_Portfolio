import type { Request, Response } from "express";
import { Project } from "../models/project.model";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const makeDefaultTagline = (title: string) =>
  `"${title.trim()}" — built with care, shipped with purpose.`;

const ensureUniqueSlug = async (baseSlug: string) => {
  let slug = baseSlug;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const exists = await Project.exists({ slug });
    if (!exists) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
};

export const adminListProjects = async (_req: Request, res: Response) => {
  const projects = await Project.find().sort({ updatedAt: -1 });

  return res.status(200).json({ projects });
};

export const adminCreateProject = async (req: Request, res: Response) => {
  const {
    title,
    tagline,
    descriptionMd,
    tech,
    imageUrl,
    imagePublicId,
    githubUrl,
    liveUrl,
    featured,
  } = req.body as Partial<{
    title: string;
    tagline: string;
    descriptionMd: string;
    tech: string[];
    imageUrl: string;
    imagePublicId: string;
    githubUrl: string;
    liveUrl: string;
    featured: boolean;
  }>;

  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug || "project");

  const project = await Project.create({
    title: title.trim(),
    slug,
    tagline:
      typeof tagline === "string" && tagline.trim()
        ? tagline.trim()
        : makeDefaultTagline(title),
    descriptionMd: typeof descriptionMd === "string" ? descriptionMd : "",
    tech: Array.isArray(tech) ? tech.filter(Boolean) : [],
    imageUrl: typeof imageUrl === "string" ? imageUrl : "",
    imagePublicId: typeof imagePublicId === "string" ? imagePublicId : "",
    githubUrl: typeof githubUrl === "string" ? githubUrl : "",
    liveUrl: typeof liveUrl === "string" ? liveUrl : "",
    featured: Boolean(featured),
  });

  return res.status(201).json({ project });
};

export const adminUpdateProject = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const updates = req.body as Partial<{
    title: string;
    tagline: string;
    descriptionMd: string;
    tech: string[];
    imageUrl: string;
    imagePublicId: string;
    githubUrl: string;
    liveUrl: string;
    featured: boolean;
  }>;

  const allowed: Record<string, unknown> = {};
  if (typeof updates.title === "string") allowed.title = updates.title.trim();
  if (typeof updates.tagline === "string")
    allowed.tagline = updates.tagline.trim();
  if (typeof updates.descriptionMd === "string")
    allowed.descriptionMd = updates.descriptionMd;
  if (Array.isArray(updates.tech)) allowed.tech = updates.tech.filter(Boolean);
  if (typeof updates.imageUrl === "string") allowed.imageUrl = updates.imageUrl;
  if (typeof updates.imagePublicId === "string")
    allowed.imagePublicId = updates.imagePublicId;
  if (typeof updates.githubUrl === "string")
    allowed.githubUrl = updates.githubUrl;
  if (typeof updates.liveUrl === "string") allowed.liveUrl = updates.liveUrl;
  if (typeof updates.featured === "boolean")
    allowed.featured = updates.featured;

  const project = await Project.findByIdAndUpdate(id, allowed, {
    new: true,
  });

  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.status(200).json({ project });
};

export const adminDeleteProject = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const deleted = await Project.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Project not found" });
  return res.status(200).json({ ok: true });
};
