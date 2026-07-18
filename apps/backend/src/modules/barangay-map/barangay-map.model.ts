import mongoose, { Schema, Document } from "mongoose";

export type BarangayMapStatus = "published" | "draft";

export interface IBarangayMap extends Document {
  name: string;
  imageUrl: string;
  imageKey: string;
  description: string;
  touristAttractions: string[];
  population: string;
  area: string;
  festivals: string[];
  status: BarangayMapStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BarangayMapSchema = new Schema<IBarangayMap>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    imageKey: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },
    touristAttractions: {
      type: [String],
      default: [],
    },
    population: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    area: {
      type: String,
      trim: true,
      default: "",
      maxlength: 120,
    },
    festivals: {
      type: [String],
      default: [],
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

export const BarangayMapModel = mongoose.model<IBarangayMap>(
  "BarangayMap",
  BarangayMapSchema,
);
