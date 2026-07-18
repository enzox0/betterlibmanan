import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  adminId: Types.ObjectId;
  expiresAt: Date;
  isRevoked: boolean;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index — auto-deletes expired tokens
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    userAgent: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const RefreshTokenModel = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
