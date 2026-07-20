import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export const AdminRegistrationStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type AdminRegistrationStatus =
  (typeof AdminRegistrationStatus)[keyof typeof AdminRegistrationStatus];

export interface ITempAdminRegistration extends Document {
  tempId: string;
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
  otp: string;
  expiresAt: Date;
}

export interface IAdminRegistration extends Document {
  displayName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  reason?: string;
  status: AdminRegistrationStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  otp?: string;
  otpExpiresAt?: Date;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const TempAdminRegistrationSchema = new Schema<ITempAdminRegistration>(
  {
    tempId: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      maxlength: 128,
      default: "",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index for auto-deletion
    },
  },
  {
    timestamps: true,
  },
);

TempAdminRegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Only hash if it's a plain text password (not already a bcrypt hash)
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const AdminRegistrationSchema = new Schema<IAdminRegistration>(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 32,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      maxlength: 128,
      default: "",
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: String,
      default: "",
    },
    reviewedByName: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    otp: {
      type: String,
      default: "",
    },
    otpExpiresAt: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        return ret;
      },
    },
  },
);

AdminRegistrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Only hash if it's a plain text password (not already a bcrypt hash)
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

AdminRegistrationSchema.methods.comparePassword = function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const TempAdminRegistrationModel =
  mongoose.model<ITempAdminRegistration>(
    "TempAdminRegistration",
    TempAdminRegistrationSchema,
  );

export const AdminRegistrationModel = mongoose.model<IAdminRegistration>(
  "AdminRegistration",
  AdminRegistrationSchema,
);
