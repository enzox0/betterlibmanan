import mongoose, { Schema, Document } from "mongoose";

export type TourismStatus = "published" | "draft";
export type TourismCategory =
  "nature" | "water" | "heritage" | "viewpoint" | "photo" | "other";

export interface ISpotRating {
  sessionId: string;
  value: number; // 1–5
  ratedAt: Date;
}

export interface ITouristSpot extends Document {
  name: string;
  barangayName: string;
  description: string;
  category: TourismCategory;
  /** @deprecated kept for backward compat — use barangayName */
  location: string;
  entryFee: string;
  tags: string[];
  imageUrl: string;
  imageKey: string;
  ratings: ISpotRating[];
  status: TourismStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SpotRatingSchema = new Schema<ISpotRating>(
  {
    sessionId: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    ratedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const TouristSpotSchema = new Schema<ITouristSpot>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    barangayName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160,
    },
    // Kept for migration backwards-compat
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
    ratings: {
      type: [SpotRatingSchema],
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

export const TouristSpotModel = mongoose.model<ITouristSpot>(
  "TouristSpot",
  TouristSpotSchema,
);
