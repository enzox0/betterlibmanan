import mongoose, { Schema, Document } from "mongoose";

export type EmergencyContactStatus = "published" | "draft";

export interface IEmergencyContact extends Document {
  name: string;
  number: string;
  icon: string;
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
    icon: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
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
