import mongoose, { Schema, Document } from "mongoose";

export type PopularServiceStatus = "published" | "draft";

export interface IPopularService extends Document {
  name: string;
  icon: string;
  description: string;
  status: PopularServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PopularServiceSchema = new Schema<IPopularService>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    icon: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
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

export const PopularServiceModel = mongoose.model<IPopularService>(
  "PopularService",
  PopularServiceSchema,
);
