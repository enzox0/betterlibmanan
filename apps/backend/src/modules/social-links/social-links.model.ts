import mongoose, { Schema, Document } from "mongoose";

export type SocialLinkPlatform =
  | "facebook"
  | "twitter"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "other";

export interface ISocialLink extends Document {
  name: string;
  href: string;
  platform: SocialLinkPlatform;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    href: { type: String, required: true, trim: true, maxlength: 500 },
    platform: {
      type: String,
      enum: ["facebook", "twitter", "instagram", "youtube", "tiktok", "other"],
      default: "other",
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SocialLinkModel = mongoose.model<ISocialLink>(
  "SocialLink",
  SocialLinkSchema,
);
