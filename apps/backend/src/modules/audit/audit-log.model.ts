import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Action enum ─────────────────────────────────────────────────────────────

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "APPROVE"
  | "REJECT";

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAuditLog extends Document {
  adminId: Types.ObjectId;
  adminUsername: string;
  adminDisplayName: string;
  adminRole: string;
  action: AuditAction;
  module: string; // e.g. "Auth", "AccountManagement"
  resourceId?: string; // affected document ID, if any
  description: string; // human-readable summary
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    adminUsername: { type: String, required: true },
    adminDisplayName: { type: String, required: true },
    adminRole: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "LOGOUT_ALL",
        "CREATE",
        "READ",
        "UPDATE",
        "DELETE",
        "ACTIVATE",
        "DEACTIVATE",
        "APPROVE",
        "REJECT",
      ],
      required: true,
      index: true,
    },
    module: { type: String, required: true, index: true },
    resourceId: { type: String },
    description: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Compound index for efficient dashboard queries (newest first per admin)
AuditLogSchema.index({ adminId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = mongoose.model<IAuditLog>(
  "AuditLog",
  AuditLogSchema,
);
