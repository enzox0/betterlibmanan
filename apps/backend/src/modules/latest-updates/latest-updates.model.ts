import mongoose, { Schema, Document } from "mongoose";

export type LatestUpdateStatus = "published" | "draft";

export interface ILatestUpdate extends Document {
  title: string;
  date: string;
  summary: string;
  status: LatestUpdateStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LatestUpdateSchema = new Schema<ILatestUpdate>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    date: {
      type: String,
      trim: true,
      default: "",
    },
    summary: {
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

export const LatestUpdateModel = mongoose.model<ILatestUpdate>(
  "LatestUpdate",
  LatestUpdateSchema,
);
