import mongoose, { Schema, Document } from "mongoose";

export type MedicalContactStatus = "published" | "draft";

export interface IMedicalContact extends Document {
  name: string;
  number: string;
  description: string;
  order: number;
  status: MedicalContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalContactSchema = new Schema<IMedicalContact>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    number: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, default: "", maxlength: 255 },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["published", "draft"],
      required: true,
      default: "draft",
    },
  },
  { timestamps: true },
);

export const MedicalContactModel = mongoose.model<IMedicalContact>(
  "MedicalContact",
  MedicalContactSchema,
);
