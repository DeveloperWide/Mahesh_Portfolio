import { Request, Response } from "express";
import { IUser } from "../types/user.types";
import { User } from "../models/user.model";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import crypto from "crypto";
import { Session } from "../models/session.model";
import { isAdminEmail } from "../middlewares/auth.middleware";

const sha256 = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

const createSession = async (userId: string) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await Session.create({ userId, tokenHash, expiresAt });
  return { token, expiresAt };
};

export const signup = async (req: Request<{}, {}, IUser>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (isAdminEmail(normalizedEmail)) {
    const requiredSecret = process.env.ADMIN_SIGNUP_SECRET;
    if (requiredSecret) {
      const providedSecret =
        req.header("x-admin-signup-secret") ||
        (req.body as any)?.adminSignupSecret;
      if (providedSecret !== requiredSecret) {
        return res.status(403).json({
          message: "Admin signup is disabled.",
        });
      }
    }
  }

  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    return res.status(400).json({
      message: "User already exist.",
    });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  const user = await newUser.save();
  const session = await createSession(user.id);

  return res.status(200).json({
    message: "User Successfully Created",
    user,
    token: session.token,
    isAdmin: isAdminEmail(user.email),
  });
};

export const login = async (
  req: Request<{}, {}, Omit<IUser, "name">>,
  res: Response,
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return res.status(404).json({
      message: "Wrong Crendentials",
    });
  }
  const hashedPassword = user?.password;

  const isPasswordMatch = await comparePassword(password, hashedPassword);

  if (isPasswordMatch) {
    const session = await createSession(user.id);
    return res.status(200).json({
      message: "Logged in Successfully.",
      user,
      token: session.token,
      isAdmin: isAdminEmail(user.email),
    });
  } else {
    return res.status(400).json({
      message: "Wrong Crendentials",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(200).json({ ok: true });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) return res.status(200).json({ ok: true });

  const tokenHash = sha256(token);
  await Session.deleteOne({ tokenHash });
  return res.status(200).json({ ok: true });
};
