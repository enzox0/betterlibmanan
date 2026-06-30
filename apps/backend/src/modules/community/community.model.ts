import mongoose, { Schema, Document, Types } from "mongoose";

// ─── Discussion ───────────────────────────────────────────────────────────────

export interface IDiscussion extends Document {
  author: string;
  avatarInitials: string;
  title: string;
  tags: string[];
  replies: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    avatarInitials: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    tags: {
      type: [String],
      default: [],
    },
    replies: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const DiscussionModel = mongoose.model<IDiscussion>(
  "CommunityDiscussion",
  DiscussionSchema,
);

// ─── Group ────────────────────────────────────────────────────────────────────

export interface IGroup extends Document {
  name: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  memberCount: number;
  order: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    imageKey: {
      type: String,
      default: "",
      trim: true,
    },
    memberCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const GroupModel = mongoose.model<IGroup>("CommunityGroup", GroupSchema);

// ─── Featured Event ───────────────────────────────────────────────────────────

export interface IFeaturedEvent extends Document {
  title: string;
  description: string;
  date: string;
  time: string;
  ctaLabel: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeaturedEventSchema = new Schema<IFeaturedEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    ctaLabel: {
      type: String,
      default: "Reserve a Seat",
      trim: true,
      maxlength: 60,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const FeaturedEventModel = mongoose.model<IFeaturedEvent>(
  "CommunityFeaturedEvent",
  FeaturedEventSchema,
);
