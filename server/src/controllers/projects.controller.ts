import type { Request, Response } from "express";
import { Project } from "../models/project.model";

export const listProjects = async (_req: Request, res: Response) => {
  const projects = await Project.find().sort({ featured: -1, createdAt: -1 });

  return res.status(200).json({ projects });
};

export const getProjectBySlug = async (
  req: Request<{ slug: string }>,
  res: Response,
) => {
  const project = await Project.findOne({ slug: req.params.slug });

  if (!project) return res.status(404).json({ message: "Project not found" });
  return res.status(200).json({ project });
};
