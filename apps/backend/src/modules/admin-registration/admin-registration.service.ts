import { Types } from "mongoose";
import {
  AdminRegistrationModel,
  IAdminRegistration,
  AdminRegistrationStatus,
  TempAdminRegistrationModel,
} from "./admin-registration.model";
import { AdminModel } from "@/modules/auth/admin.model";
import { mailer } from "@/shared/mailer";
import {
  createOtpEmail,
  createRegistrationSuccessEmail,
  createApprovalEmail,
} from "@/shared/mailer/templates";
import crypto from "crypto";

const TEMP_REGISTRATION_TTL = 15 * 60 * 1000; // 15 minutes

const regError = (msg: string, statusCode = 400) => {
  const err = new Error(msg) as any;
  err.statusCode = statusCode;
  return err;
};

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

export async function initiateRegistration(input: {
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
}): Promise<{ tempId: string }> {
  const username = input.username.toLowerCase().trim();
  const email = input.email.toLowerCase().trim();

  const existingReg = await AdminRegistrationModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existingReg) {
    throw regError(
      "A registration with this username or email already exists",
      409,
    );
  }

  const existingAdmin = await AdminModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existingAdmin) {
    throw regError(
      "Username or email is already in use by an existing admin",
      409,
    );
  }

  const tempId = crypto.randomUUID();
  const otp = generateOtp();

  await TempAdminRegistrationModel.create({
    tempId,
    displayName: input.displayName.trim(),
    username,
    email,
    password: input.password,
    phone: input.phone?.trim(),
    department: input.department?.trim(),
    reason: input.reason?.trim(),
    otp,
    expiresAt: new Date(Date.now() + TEMP_REGISTRATION_TTL),
  });

  const otpEmail = createOtpEmail(otp, input.displayName.trim());
  await mailer.sendMail({
    from: config.smtp.from,
    to: email,
    subject: otpEmail.subject,
    text: otpEmail.text,
    html: otpEmail.html,
  });

  return { tempId };
}

export async function resendOtp(tempId: string): Promise<void> {
  const tempReg = await TempAdminRegistrationModel.findOne({ tempId });
  if (!tempReg) {
    throw regError("Registration session expired. Please try again", 404);
  }

  const otp = generateOtp();
  tempReg.otp = otp;
  tempReg.expiresAt = new Date(Date.now() + TEMP_REGISTRATION_TTL);
  await tempReg.save();

  const otpEmail = createOtpEmail(otp, tempReg.displayName);
  await mailer.sendMail({
    from: config.smtp.from,
    to: tempReg.email,
    subject: otpEmail.subject,
    text: otpEmail.text,
    html: otpEmail.html,
  });
}

export async function verifyOtpAndCompleteRegistration(
  tempId: string,
  otp: string,
): Promise<IAdminRegistration> {
  const tempReg = await TempAdminRegistrationModel.findOne({ tempId }).select(
    "+password",
  );
  if (!tempReg) {
    throw regError("Registration session expired. Please try again", 404);
  }

  if (tempReg.otp !== otp) {
    throw regError("Invalid OTP", 400);
  }

  const existingReg = await AdminRegistrationModel.findOne({
    $or: [{ username: tempReg.username }, { email: tempReg.email }],
  });
  if (existingReg) {
    throw regError(
      "A registration with this username or email already exists",
      409,
    );
  }
  const existingAdmin = await AdminModel.findOne({
    $or: [{ username: tempReg.username }, { email: tempReg.email }],
  });
  if (existingAdmin) {
    throw regError(
      "Username or email is already in use by an existing admin",
      409,
    );
  }

  const registration = await AdminRegistrationModel.create({
    displayName: tempReg.displayName,
    username: tempReg.username,
    email: tempReg.email,
    password: tempReg.password,
    phone: tempReg.phone,
    department: tempReg.department,
    reason: tempReg.reason,
    status: AdminRegistrationStatus.PENDING,
    isEmailVerified: true,
  });

  await TempAdminRegistrationModel.deleteOne({ tempId });

  const successEmail = createRegistrationSuccessEmail(tempReg.displayName);
  await mailer.sendMail({
    from: config.smtp.from,
    to: tempReg.email,
    subject: successEmail.subject,
    text: successEmail.text,
    html: successEmail.html,
  });

  return AdminRegistrationModel.findById(registration._id).lean() as any;
}

export async function listRegistrations(
  status?: AdminRegistrationStatus,
): Promise<IAdminRegistration[]> {
  const filter = status ? { status } : {};
  return AdminRegistrationModel.find(filter)
    .sort({ createdAt: -1 })
    .lean()
    .exec() as unknown as IAdminRegistration[];
}

export async function getRegistration(id: string): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) {
    throw regError("Invalid registration ID", 400);
  }

  const registration = await AdminRegistrationModel.findById(id).lean();
  if (!registration) {
    throw regError("Registration not found", 404);
  }

  return registration as unknown as IAdminRegistration;
}

export async function approveRegistration(
  id: string,
  adminId: string,
  adminName: string,
): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) {
    throw regError("Invalid registration ID", 400);
  }

  const registration = await AdminRegistrationModel.findById(id);
  if (!registration) {
    throw regError("Registration not found", 404);
  }

  if (registration.status !== AdminRegistrationStatus.PENDING) {
    throw regError("Registration has already been reviewed", 400);
  }

  const registrationWithPassword =
    await AdminRegistrationModel.findById(id).select("+password");
  if (!registrationWithPassword) {
    throw regError("Registration not found", 404);
  }

  const admin = new AdminModel({
    displayName: registration.displayName,
    username: registration.username,
    email: registration.email,
    password: registrationWithPassword.password,
    phone: registration.phone,
    department: registration.department,
    role: "admin",
  });

  await admin.save();

  registration.status = AdminRegistrationStatus.APPROVED;
  registration.reviewedBy = adminId;
  registration.reviewedByName = adminName;
  registration.reviewedAt = new Date();
  await registration.save();

  // Send approval email
  const approvalEmail = createApprovalEmail(registration.displayName);
  await mailer.sendMail({
    from: config.smtp.from,
    to: registration.email,
    subject: approvalEmail.subject,
    text: approvalEmail.text,
    html: approvalEmail.html,
  });

  return AdminRegistrationModel.findById(id).lean() as any;
}

export async function rejectRegistration(
  id: string,
  rejectionReason: string,
  adminId: string,
  adminName: string,
): Promise<IAdminRegistration> {
  if (!Types.ObjectId.isValid(id)) {
    throw regError("Invalid registration ID", 400);
  }

  const registration = await AdminRegistrationModel.findById(id);
  if (!registration) {
    throw regError("Registration not found", 404);
  }

  if (registration.status !== AdminRegistrationStatus.PENDING) {
    throw regError("Registration has already been reviewed", 400);
  }

  registration.status = AdminRegistrationStatus.REJECTED;
  registration.rejectionReason = rejectionReason;
  registration.reviewedBy = adminId;
  registration.reviewedByName = adminName;
  registration.reviewedAt = new Date();
  await registration.save();

  return AdminRegistrationModel.findById(id).lean() as any;
}

export async function deleteRegistration(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw regError("Invalid registration ID", 400);
  }

  const registration = await AdminRegistrationModel.findById(id);
  if (!registration) {
    throw regError("Registration not found", 404);
  }

  await AdminRegistrationModel.findByIdAndDelete(id);
}

export async function lookupRegistrationByEmail(email: string): Promise<{
  status: AdminRegistrationStatus;
  displayName: string;
  username: string;
  createdAt: Date;
  rejectionReason?: string;
} | null> {
  const registration = await AdminRegistrationModel.findOne({
    email: email.toLowerCase().trim(),
  }).lean();

  if (!registration) {
    return null;
  }

  return {
    status: registration.status as AdminRegistrationStatus,
    displayName: registration.displayName,
    username: registration.username,
    createdAt: registration.createdAt,
    rejectionReason: registration.rejectionReason,
  };
}

export const submitRegistration = async (input: any) => {
  console.warn(
    "submitRegistration is deprecated, use initiateRegistration instead",
  );
  return await initiateRegistration(input);
};

import { config } from "@/shared/config";
