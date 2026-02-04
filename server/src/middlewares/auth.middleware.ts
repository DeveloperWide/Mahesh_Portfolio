import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { Session } from "../models/session.model";
import { User } from "../models/user.model";

export type AuthedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const getAdminEmail = () =>
  (process.env.ADMIN_EMAIL || "maheshrana9520@gmail.com").toLowerCase();

export const requireAuth = async (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const tokenHash = sha256(token);
    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    if (!session) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(session.userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };
    return next();
  } catch (err) {
    console.log("Auth middleware error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const requireAdmin = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) => {
  const adminEmail = getAdminEmail();
  const requestEmail = req.user?.email?.toLowerCase();

  if (!requestEmail) return res.status(401).json({ message: "Unauthorized" });
  if (requestEmail !== adminEmail) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return next();
};

export const isAdminEmail = (email: string) =>
  email.trim().toLowerCase() === getAdminEmail();

