import { AdminModel, IAdmin, AdminRole } from "@/modules/auth/admin.model";
import { Types } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateAccountInput {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: AdminRole;
  isActive?: boolean;
}

export interface UpdateAccountInput {
  displayName?: string;
  email?: string;
  role?: AdminRole;
  isActive?: boolean;
  password?: string; // optional — only when changing password
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function accountError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Return all admin accounts (password excluded).
 */
export async function listAccounts(): Promise<IAdmin[]> {
  return AdminModel.find().sort({ createdAt: 1 }).lean() as any;
}

/**
 * Return a single account by ID.
 */
export async function getAccount(id: string): Promise<IAdmin> {
  if (!Types.ObjectId.isValid(id)) throw accountError("Invalid ID", 400);

  const admin = await AdminModel.findById(id).lean() as any;
  if (!admin) throw accountError("Account not found", 404);

  return admin;
}

/**
 * Create a new admin account.
 * Returns the saved document (password excluded via toJSON transform).
 */
export async function createAccount(input: CreateAccountInput): Promise<IAdmin> {
  // Check uniqueness manually to give a clear error message
  const [existingUsername, existingEmail] = await Promise.all([
    AdminModel.findOne({ username: input.username.toLowerCase() }),
    AdminModel.findOne({ email: input.email.toLowerCase() }),
  ]);

  if (existingUsername) throw accountError("Username already taken", 409);
  if (existingEmail) throw accountError("Email already in use", 409);

  const admin = await AdminModel.create({
    username: input.username,
    password: input.password,
    displayName: input.displayName,
    email: input.email,
    role: input.role,
    isActive: input.isActive ?? true,
  });

  // Return without password
  return AdminModel.findById(admin._id).lean() as any;
}

/**
 * Update an existing account.
 */
export async function updateAccount(
  id: string,
  input: UpdateAccountInput,
): Promise<IAdmin> {
  if (!Types.ObjectId.isValid(id)) throw accountError("Invalid ID", 400);

  const admin = await AdminModel.findById(id).select("+password");
  if (!admin) throw accountError("Account not found", 404);

  // Check email uniqueness if being changed
  if (input.email && input.email.toLowerCase() !== admin.email) {
    const taken = await AdminModel.findOne({
      email: input.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (taken) throw accountError("Email already in use", 409);
  }

  // Apply updates
  if (input.displayName !== undefined) admin.displayName = input.displayName;
  if (input.email !== undefined) admin.email = input.email;
  if (input.role !== undefined) admin.role = input.role;
  if (input.isActive !== undefined) admin.isActive = input.isActive;
  if (input.password) admin.password = input.password; // pre-save hook will hash it

  await admin.save();

  return AdminModel.findById(id).lean() as any;
}

/**
 * Delete an account permanently.
 */
export async function deleteAccount(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw accountError("Invalid ID", 400);

  const result = await AdminModel.findByIdAndDelete(id);
  if (!result) throw accountError("Account not found", 404);
}

/**
 * Set account active/inactive status.
 */
export async function setAccountStatus(
  id: string,
  isActive: boolean,
): Promise<IAdmin> {
  return updateAccount(id, { isActive });
}
