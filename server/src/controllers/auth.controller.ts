import { Request, Response } from "express";
import { IUser } from "../types/user.types";
import { User } from "../models/user.model";

export const signup = async (req: Request<{}, {}, IUser>, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const existing = await User.findOne({ email });

  if (existing) {
    return res.status(400).json({
      message: "User already exist.",
    });
  }

  const newUser = new User({
    name,
    email,
    password,
  });
  const user = await newUser.save();

  return res.status(200).json({
    message: "User Successfully Created",
    user,
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

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "Wrong Crendentials",
    });
  }

  if (user?.password === password) {
    return res.status(200).json({
      message: "Logged in Successfully.",
      user,
    });
  } else {
    return res.status(400).json({
      message: "Wrong Crendentials",
    });
  }
};
