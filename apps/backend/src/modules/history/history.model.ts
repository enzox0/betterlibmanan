import mongoose, { Schema, Document } from "mongoose";

export type HistoryStatus = "published" | "draft";

export interface IHistory extends Document {
  title: string;
  content: string;
  year: string;
  status: HistoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const HistorySchema = new Schema<IHistory>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
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

export const HistoryModel = mongoose.model<IHistory>("History", HistorySchema);
