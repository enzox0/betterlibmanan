import mongoose, { Schema, Document } from "mongoose";

export type MarqueeImageStatus = "published" | "draft";

export interface IMarqueeImage extends Document {
  alt: string;
  imageUrl: string;
  imageKey: string;
  rowNumber: number;
  order: number;
  status: MarqueeImageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeImageSchema = new Schema<IMarqueeImage>(
  {
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    imageUrl: {
      type: String,
      trim: true,
      required: true,
    },
    imageKey: {
      type: String,
      trim: true,
      required: true,
    },
    rowNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
      default: 1,
    },
    order: {
      type: Number,
      required: true,
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

MarqueeImageSchema.index({ rowNumber: 1, order: 1 });
MarqueeImageSchema.index({ status: 1, rowNumber: 1, order: 1 });

export const MarqueeImageModel = mongoose.model<IMarqueeImage>(
  "MarqueeImage",
  MarqueeImageSchema,
);
