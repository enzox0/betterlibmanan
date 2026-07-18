import mongoose, { Schema, Document } from "mongoose";

export type BetterLugStatus = "published" | "draft";

export interface IBetterLug extends Document {
  name: string;
  websiteUrl: string;
  logoUrl: string;
  logoKey: string;
  status: BetterLugStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BetterLugSchema = new Schema<IBetterLug>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    logoKey: {
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

export const BetterLugModel = mongoose.model<IBetterLug>(
  "BetterLug",
  BetterLugSchema,
);
