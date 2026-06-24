import mongoose, { Schema, Document } from "mongoose";

export type LeadershipStatus = "published" | "draft";

export interface ILeadership extends Document {
  name: string;
  position: string;
  email: string;
  phone: string;
  avatarUrl: string;
  avatarKey: string;
  status: LeadershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LeadershipSchema = new Schema<ILeadership>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    position: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255,
    },
    email: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 60,
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
    avatarKey: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      required: true,
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

export const LeadershipModel = mongoose.model<ILeadership>(
  "Leadership",
  LeadershipSchema,
);
