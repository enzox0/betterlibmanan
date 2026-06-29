import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { register, login, getMe } from "./user.service";

const registerSchema = z.object({
  displayName: z.string().min(2).max(64).trim(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores.",
    )
    .trim(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1),
  password: z.string().min(1),
});

/** POST /api/users/register */
export async function handleRegister(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const result = await register(parsed.data);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/** POST /api/users/login */
export async function handleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const result = await login(parsed.data);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    if (err.statusCode === 401) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }
    next(err);
  }
}

/** GET /api/users/me */
export async function handleGetMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await getMe(req.user!.sub);
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
