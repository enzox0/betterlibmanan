import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
} from "./user.service";
import { uploadBase64ImageToR2, deleteObjectFromR2 } from "@/shared/storage/r2";
import { UserModel } from "./user.model";

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

const updateMeSchema = z.object({
  displayName: z.string().min(2).max(64).trim().optional(),
  email: z.string().email().optional(),
  // Accept a real URL, a base64 data URL, or empty string to clear
  avatarUrl: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
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

/** PATCH /api/users/me */
export async function handleUpdateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = updateMeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { avatarUrl: rawAvatarUrl, ...rest } = parsed.data;
    const userId = req.user!.sub;
    let finalAvatarUrl: string | undefined = rawAvatarUrl;

    // If the client sent a base64 data URL, upload it to R2 and delete the old one
    if (rawAvatarUrl && rawAvatarUrl.startsWith("data:")) {
      // Delete old avatar from R2 if it exists
      const existingUser = await UserModel.findById(userId).lean();
      if (
        existingUser?.avatarUrl &&
        existingUser.avatarUrl.startsWith("http")
      ) {
        try {
          // Extract the key from the URL path (e.g. "avatars/abc123.jpg")
          const urlPath = new URL(existingUser.avatarUrl).pathname;
          const key = urlPath.replace(/^\//, ""); // strip leading slash
          await deleteObjectFromR2(key);
        } catch {
          // Non-critical — continue even if old image deletion fails
        }
      }

      // Parse mime type and filename from data URL header
      const mimeMatch = rawAvatarUrl.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch?.[1] ?? "image/jpeg";
      const ext = mimeType.split("/")[1] ?? "jpg";

      const uploaded = await uploadBase64ImageToR2({
        filename: `avatar.${ext}`,
        mimeType,
        data: rawAvatarUrl,
        folder: "avatars",
      });
      finalAvatarUrl = uploaded.url;
    }

    const user = await updateMe(userId, { ...rest, avatarUrl: finalAvatarUrl });
    res.json({ success: true, data: user });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

/** POST /api/users/me/password */
export async function handleChangePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    await changePassword(
      req.user!.sub,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    res.json({ success: true, message: "Password updated." });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
