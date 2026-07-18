import { Types } from "mongoose";
import {
  AdminRegistrationModel,
  IAdminRegistration,
  AdminRegistrationStatus,
} from "./admin-registration.model";
import { AdminModel } from "@/modules/auth/admin.model";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function regError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterAdminInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
}

export interface ReviewInput {
  status: "approved" | "rejected";
  rejectionReason?: string;
  reviewerId: string;
  reviewerName: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

/**
 * Look up an existing registration by email (public — for duplicate-check modal).
 * Returns only safe public fields: status, displayName, createdAt, rejectionReason.
 */
export async function lookupRegistrationByEmail(
  email: string,
): Promise<Pick<
  IAdminRegistration,
  "status" | "displayName" | "createdAt" | "rejectionReason"
> | null> {
  const reg = await AdminRegistrationModel.findOne({
    email: email.toLowerCase().trim(),
  })
    .select("status displayName createdAt rejectionReason")
    .lean();
  return reg as any;
}

/**
 * Submit a new admin registration request.
 * Checks uniqueness against both existing AdminRegistration records AND the
 * live Admin collection so we don't create duplicate usernames/emails.
 */
export async function submitRegistration(
  input: RegisterAdminInput,
): Promise<IAdminRegistration> {
  const username = input.username.toLowerCase().trim();
  const email = input.email.toLowerCase().trim();

  // Check against existing registrations (any status)
  const [existingRegByUsername, existingRegByEmail] = await Promise.all([
    AdminRegistrationModel.findOne({ username }),
    AdminRegistrationModel.findOne({ email }),
  ]);

  if (existingRegByUsername)
    throw regError("A registration with this username already exists.", 409);
  if (existingRegByEmail)
    throw regError("A registration with this email already exists.", 409);

  // Check against live admin accounts
  const [existingAdminByUsername, existingAdminByEmail] = await Promise.all([
    AdminModel.findOne({ username }),
    AdminModel.findOne({ email }),
  ]);

  if (existingAdminByUsername)
    throw regError("Username is already taken by an existing admin.", 409);
  if (existingAdminByEmail)
    throw regError("Email is already in use by an existing admin.", 409);

  const registration = await AdminRegistrationModel.create({
    displayName: input.displayName.trim(),
    username,
    email,
    password: input.password,
    phone: (input.phone ?? "").trim(),
    department: (input.department ?? "").trim(),
    reason: (input.reason ?? "").trim(),
    status: "pending",
  });

  return AdminRegistrationModel.findById(registration._id).lean() as any;
}

/**
 * List all registrations, optionally filtered by status.
 */
export async function listRegistrations(
  status?: AdminRegistrationStatus,
): Promise<IAdminRegistration[]> {
  const filter = status ? { status } : {};
  return AdminRegistrationModel.find(filter)
    .sort({ createdAt: -1 })
    .lean() as any;
}

/**
 * Get a single registration by ID.
 */
export async function getRegistration(id: string): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) throw regError("Invalid ID", 400);
  const reg = await AdminRegistrationModel.findById(id).lean();
  if (!reg) throw regError("Registration not found", 404);
  return reg as any;
}

/**
 * Approve a pending registration:
 *  1. Create a new Admin account from the registration data.
 *  2. Mark the registration as "approved".
 */
export async function approveRegistration(
  id: string,
  review: ReviewInput,
): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) throw regError("Invalid ID", 400);

  const reg = await AdminRegistrationModel.findById(id).select("+password");
  if (!reg) throw regError("Registration not found", 404);
  if (reg.status !== "pending")
    throw regError("Registration is no longer pending", 400);

  // Create the admin account — password is already hashed in the registration
  // so we use findOneAndUpdate after creating to bypass double-hashing.
  // We create a raw document with an already-hashed password by creating it
  // directly via Model.create with the hashed value after marking isModified false.
  // Safest approach: create via AdminModel with the plain stored hash directly
  // by using insertMany with the raw hash (bypasses pre-save hook).
  const adminData = {
    username: reg.username,
    displayName: reg.displayName,
    email: reg.email,
    password: reg.password, // already hashed
    role: "admin" as const,
    isActive: true,
    phone: reg.phone ?? "",
    department: reg.department ?? "",
  };

  // Use insertOne with the already-hashed password — we must bypass the
  // pre-save hook. We do this by calling collection.insertOne directly.
  await AdminModel.collection.insertOne({
    ...adminData,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Mark registration as approved
  reg.status = "approved";
  reg.reviewedBy = review.reviewerId;
  reg.reviewedByName = review.reviewerName;
  reg.reviewedAt = new Date();
  await reg.save();

  return AdminRegistrationModel.findById(id).lean() as any;
}

/**
 * Reject a pending registration.
 */
export async function rejectRegistration(
  id: string,
  review: ReviewInput,
): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) throw regError("Invalid ID", 400);

  const reg = await AdminRegistrationModel.findById(id);
  if (!reg) throw regError("Registration not found", 404);
  if (reg.status !== "pending")
    throw regError("Registration is no longer pending", 400);

  reg.status = "rejected";
  reg.reviewedBy = review.reviewerId;
  reg.reviewedByName = review.reviewerName;
  reg.reviewedAt = new Date();
  reg.rejectionReason = (review.rejectionReason ?? "").trim();
  await reg.save();

  return AdminRegistrationModel.findById(id).lean() as any;
}

/**
 * Delete a registration record (superadmin cleanup utility).
 */
export async function deleteRegistration(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw regError("Invalid ID", 400);
  const result = await AdminRegistrationModel.findByIdAndDelete(id);
  if (!result) throw regError("Registration not found", 404);
}
