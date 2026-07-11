import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { AdminModel, IAdmin, AdminRole } from "./admin.model";
import { RefreshTokenModel } from "./refresh-token.model";
import { logger } from "@/shared/logger";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadBase64ImageInput,
  type UploadedObject,
} from "@/shared/storage";

// ─── JWT configuration ────────────────────────────────────────────────────────

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "change-me-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "change-me-refresh-secret";

const ACCESS_TOKEN_TTL = process.env.JWT_ACCESS_TTL || "15m"; // short-lived
const REFRESH_TOKEN_TTL_MS =
  parseInt(process.env.JWT_REFRESH_TTL_DAYS || "7", 10) * 24 * 60 * 60 * 1000;

if (process.env.NODE_ENV === "production") {
  if (
    ACCESS_SECRET === "change-me-access-secret" ||
    REFRESH_SECRET === "change-me-refresh-secret"
  ) {
    throw new Error(
      "[AUTH] JWT secrets must be set via JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in production.",
    );
  }
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub: string; // admin._id (string)
  username: string;
  displayName: string;
  role: AdminRole;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string; // unique token id — links to RefreshToken document
  type: "refresh";
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function signAccessToken(admin: IAdmin): string {
  const payload: AccessTokenPayload = {
    sub: (admin._id as any).toString(),
    username: admin.username,
    displayName: admin.displayName,
    role: admin.role,
    type: "access",
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
}

// ─── Auth operations ──────────────────────────────────────────────────────────

interface LoginOptions {
  username: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  admin: Pick<IAdmin, "_id" | "username" | "displayName" | "email" | "role">;
}

/**
 * Validate credentials and return a fresh access + refresh token pair.
 * Throws a plain Error with a `statusCode` property on failure so the
 * controller can surface the correct HTTP status.
 */
export async function login(opts: LoginOptions): Promise<AuthTokens> {
  const { username, password, userAgent, ipAddress } = opts;

  // Explicitly select password (excluded by default on the schema)
  const admin = await AdminModel.findOne({
    username: username.toLowerCase().trim(),
  }).select("+password");

  if (!admin || !admin.isActive) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  const isValid = await admin.comparePassword(password);
  if (!isValid) {
    const err: any = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  // Update last login timestamp (fire-and-forget, don't block response)
  AdminModel.findByIdAndUpdate(admin._id, { lastLoginAt: new Date() }).catch(
    (e) => logger.error("[AUTH] Failed to update lastLoginAt:", e),
  );

  const tokens = await issueTokenPair(admin, { userAgent, ipAddress });
  return tokens;
}

/**
 * Rotate a refresh token: verify it, revoke the old one, and issue a fresh pair.
 * Implements refresh token rotation — compromised tokens can't be reused.
 */
export async function refresh(rawRefreshToken: string): Promise<AuthTokens> {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(rawRefreshToken);
  } catch {
    const err: any = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  // Load the stored token document
  const storedToken = await RefreshTokenModel.findOne({
    token: rawRefreshToken,
  });

  if (
    !storedToken ||
    storedToken.isRevoked ||
    storedToken.expiresAt < new Date()
  ) {
    // Potential token reuse — revoke the entire family for this admin
    if (storedToken) {
      await RefreshTokenModel.updateMany(
        { adminId: storedToken.adminId },
        { isRevoked: true },
      );
      logger.warn(
        `[AUTH] Potential refresh token reuse detected for admin ${storedToken.adminId}`,
      );
    }
    const err: any = new Error("Refresh token is no longer valid");
    err.statusCode = 401;
    throw err;
  }

  // Revoke the used token
  storedToken.isRevoked = true;
  await storedToken.save();

  const admin = await AdminModel.findById(storedToken.adminId);
  if (!admin || !admin.isActive) {
    const err: any = new Error("Account not found or inactive");
    err.statusCode = 401;
    throw err;
  }

  return issueTokenPair(admin, {
    userAgent: storedToken.userAgent,
    ipAddress: storedToken.ipAddress,
  });
}

/**
 * Revoke a specific refresh token (logout from current device).
 * Silently succeeds if the token doesn't exist.
 */
export async function logout(rawRefreshToken: string): Promise<void> {
  await RefreshTokenModel.findOneAndUpdate(
    { token: rawRefreshToken },
    { isRevoked: true },
  );
}

/**
 * Revoke all refresh tokens for an admin (logout from all devices).
 */
export async function logoutAll(adminId: string): Promise<void> {
  await RefreshTokenModel.updateMany({ adminId }, { isRevoked: true });
}

// ─── Self-service profile operations ─────────────────────────────────────────

export interface UpdateMeInput {
  displayName?: string;
  email?: string;
  phone?: string;
  department?: string;
  bio?: string;
  avatarUrl?: string;
  avatarKey?: string;
}

/**
 * Update the authenticated admin's own profile fields.
 * Role and isActive cannot be changed via this endpoint.
 */
export async function updateMe(
  adminId: string,
  input: UpdateMeInput,
): Promise<
  Pick<
    IAdmin,
    | "_id"
    | "username"
    | "displayName"
    | "email"
    | "role"
    | "phone"
    | "department"
    | "bio"
    | "avatarUrl"
    | "avatarKey"
    | "lastLoginAt"
    | "passwordChangedAt"
    | "createdAt"
  >
> {
  const admin = await AdminModel.findById(adminId);
  if (!admin || !admin.isActive) {
    const err: any = new Error("Account not found");
    err.statusCode = 404;
    throw err;
  }

  // Check email uniqueness if being changed
  if (input.email && input.email.toLowerCase() !== admin.email) {
    const taken = await AdminModel.findOne({
      email: input.email.toLowerCase(),
      _id: { $ne: adminId },
    });
    if (taken) {
      const err: any = new Error("Email already in use");
      err.statusCode = 409;
      throw err;
    }
  }

  if (input.displayName !== undefined) admin.displayName = input.displayName;
  if (input.email !== undefined) admin.email = input.email;
  if (input.phone !== undefined) admin.phone = input.phone;
  if (input.department !== undefined) admin.department = input.department;
  if (input.bio !== undefined) admin.bio = input.bio;

  // Handle avatar changes
  const previousAvatarKey = admin.avatarKey;
  if (input.avatarKey !== undefined) {
    admin.avatarKey = input.avatarKey;
  }
  if (input.avatarUrl !== undefined) {
    admin.avatarUrl = input.avatarUrl;
  }

  // Delete old avatar if changed
  const avatarChanged =
    previousAvatarKey &&
    input.avatarKey !== undefined &&
    previousAvatarKey !== input.avatarKey;

  await admin.save();

  if (avatarChanged) {
    await deleteObjectFromR2(previousAvatarKey);
  }

  return AdminModel.findById(adminId).select("-password").lean() as any;
}

export interface UploadAvatarInput {
  filename: string;
  mimeType: string;
  data: string;
}

export interface ChangeMyPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export async function uploadAvatar(
  input: UploadAvatarInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "avatars",
  });
}

/**
 * Change the authenticated admin's own password after verifying the current one.
 */
export async function changeMyPassword(
  adminId: string,
  input: ChangeMyPasswordInput,
): Promise<void> {
  const admin = await AdminModel.findById(adminId).select("+password");
  if (!admin || !admin.isActive) {
    const err: any = new Error("Account not found");
    err.statusCode = 404;
    throw err;
  }

  const isValid = await admin.comparePassword(input.currentPassword);
  if (!isValid) {
    const err: any = new Error("Current password is incorrect");
    err.statusCode = 401;
    throw err;
  }

  admin.password = input.newPassword; // pre-save hook hashes + stamps passwordChangedAt
  await admin.save();
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function issueTokenPair(
  admin: IAdmin,
  opts: { userAgent?: string; ipAddress?: string } = {},
): Promise<AuthTokens> {
  const jti = crypto.randomUUID();

  // Build and sign the JWT refresh token
  const refreshPayload: RefreshTokenPayload = {
    sub: (admin._id as any).toString(),
    jti,
    type: "refresh",
  };
  const rawRefreshToken = jwt.sign(refreshPayload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TOKEN_TTL_MS}ms`,
  } as SignOptions);

  // Persist the refresh token so we can revoke it
  await RefreshTokenModel.create({
    token: rawRefreshToken,
    adminId: admin._id,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    userAgent: opts.userAgent,
    ipAddress: opts.ipAddress,
  });

  const accessToken = signAccessToken(admin);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    admin: {
      _id: admin._id,
      username: admin.username,
      displayName: admin.displayName,
      email: admin.email,
      role: admin.role,
    },
  };
}
