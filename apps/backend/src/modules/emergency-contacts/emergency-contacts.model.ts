import mongoose, { Schema, Document } from "mongoose";

export type EmergencyContactStatus = "published" | "draft";
export type EmergencyContactCategory =
  | "police"
  | "disaster"
  | "fire"
  | "welfare"
  | "government"
  | "traffic"
  | "medical"
  | "other";

export interface IEmergencyContact extends Document {
  name: string;
  number: string;
  description: string;
  category: EmergencyContactCategory;
  icon: string;
  order: number;
  status: EmergencyContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255,
    },
    category: {
      type: String,
      enum: [
        "police",
        "disaster",
        "fire",
        "welfare",
        "government",
        "traffic",
        "medical",
        "other",
      ],
      default: "other",
    },
    icon: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },
    order: {
      type: Number,
      default: 0,
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

export const EmergencyContactModel = mongoose.model<IEmergencyContact>(
  "EmergencyContact",
  EmergencyContactSchema,
);
