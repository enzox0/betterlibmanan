import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel, IUser } from "./user.model";

const ACCESS_SECRET =
  process.env.JWT_USER_ACCESS_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  "change-me-user-access-secret";
const ACCESS_TOKEN_TTL = process.env.JWT_USER_ACCESS_TTL || "30d";

// ─── Token ────────────────────────────────────────────────────────────────────

export interface UserTokenPayload {
  sub: string;
  username: string;
  displayName: string;
  type: "user-access";
}

export function signUserToken(user: IUser): string {
  const payload: UserTokenPayload = {
    sub: (user._id as any).toString(),
    username: user.username,
    displayName: user.displayName,
    type: "user-access",
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  } as SignOptions);
}

export function verifyUserToken(token: string): UserTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as UserTokenPayload;
}

// ─── Public user shape returned to frontend ───────────────────────────────────

export type PublicUser = Pick<
  IUser,
  "_id" | "displayName" | "username" | "email" | "avatarUrl" | "createdAt"
>;

// ─── Operations ───────────────────────────────────────────────────────────────

export interface RegisterInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

export async function register(
  input: RegisterInput,
): Promise<{ token: string; user: PublicUser }> {
  const existingEmail = await UserModel.findOne({
    email: input.email.toLowerCase().trim(),
  });
  if (existingEmail) {
    const err: any = new Error("Email is already in use.");
    err.statusCode = 409;
    throw err;
  }

  const existingUsername = await UserModel.findOne({
    username: input.username.toLowerCase().trim(),
  });
  if (existingUsername) {
    const err: any = new Error("Username is already taken.");
    err.statusCode = 409;
    throw err;
  }

  const user = await UserModel.create({
    displayName: input.displayName.trim(),
    username: input.username.toLowerCase().trim(),
    email: input.email.toLowerCase().trim(),
    password: input.password,
  });

  const token = signUserToken(user);
  const publicUser = await UserModel.findById(user._id).lean();
  return { token, user: publicUser as PublicUser };
}

export interface LoginInput {
  emailOrUsername: string;
  password: string;
}

export async function login(
  input: LoginInput,
): Promise<{ token: string; user: PublicUser }> {
  const identifier = input.emailOrUsername.toLowerCase().trim();
  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password");

  if (!user || !user.isActive) {
    const err: any = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  const valid = await user.comparePassword(input.password);
  if (!valid) {
    const err: any = new Error("Invalid credentials.");
    err.statusCode = 401;
    throw err;
  }

  UserModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() }).catch(
    () => {},
  );

  const token = signUserToken(user);
  const publicUser = await UserModel.findById(user._id).lean();
  return { token, user: publicUser as PublicUser };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(userId).lean();
  if (!user || !user.isActive) {
    const err: any = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user as PublicUser;
}

export interface UpdateMeInput {
  displayName?: string;
  email?: string;
  avatarUrl?: string;
}

export async function updateMe(
  userId: string,
  input: UpdateMeInput,
): Promise<PublicUser> {
  if (input.email) {
    const existing = await UserModel.findOne({
      email: input.email.toLowerCase().trim(),
      _id: { $ne: userId },
    });
    if (existing) {
      const err: any = new Error("Email is already in use.");
      err.statusCode = 409;
      throw err;
    }
  }

  const updates: Partial<IUser> = {};
  if (input.displayName) updates.displayName = input.displayName.trim();
  if (input.email) updates.email = input.email.toLowerCase().trim();
  if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;

  const user = await UserModel.findByIdAndUpdate(userId, updates, {
    new: true,
  }).lean();
  if (!user) {
    const err: any = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user as PublicUser;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await UserModel.findById(userId).select("+password");
  if (!user || !user.isActive) {
    const err: any = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  const valid = await user.comparePassword(currentPassword);
  if (!valid) {
    const err: any = new Error("Current password is incorrect.");
    err.statusCode = 400;
    throw err;
  }
  user.password = newPassword;
  await user.save();
}
