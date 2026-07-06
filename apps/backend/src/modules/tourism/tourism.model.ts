import mongoose, { Schema, Document } from "mongoose";

export type TourismStatus = "published" | "draft";
export type TourismCategory =
  | "nature"
  | "water"
  | "heritage"
  | "viewpoint"
  | "photo"
  | "other";

export interface ITouristSpot extends Document {
  name: string;
  location: string;
  description: string;
  category: TourismCategory;
  rating: string;
  entryFee: string;
  tags: string[];
  imageUrl: string;
  imageKey: string;
  status: TourismStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TouristSpotSchema = new Schema<ITouristSpot>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    location: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["nature", "water", "heritage", "viewpoint", "photo", "other"],
      required: true,
      default: "other",
    },
    rating: {
      type: String,
      trim: true,
      default: "",
      maxlength: 10,
    },
    entryFee: {
      type: String,
      trim: true,
      default: "",
      maxlength: 255,
    },
    tags: {
      type: [String],
      default: [],
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

export const TouristSpotModel = mongoose.model<ITouristSpot>(
  "TouristSpot",
  TouristSpotSchema,
);
