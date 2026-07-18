import mongoose, { Schema, Document } from "mongoose";

// ─── Discussion ───────────────────────────────────────────────────────────────

export interface IDiscussion extends Document {
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  title: string;
  tags: string[];
  replies: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
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
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
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

export interface IGroupMember {
  userId: string;
  displayName: string;
  avatarInitials: string;
  avatarUrl: string;
  joinedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  description: string;
  imageUrl: string;
  imageKey: string;
  memberCount: number;
  members: IGroupMember[];
  order: number;
  isActive: boolean;
  status: "pending" | "approved" | "rejected";
  proposedBy: string; // userId of the founder
  proposerName: string; // display name of the founder
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>(
  {
    userId: { type: String, required: true },
    displayName: { type: String, required: true, trim: true, maxlength: 64 },
    avatarInitials: { type: String, required: true, trim: true, maxlength: 4 },
    avatarUrl: { type: String, default: "", trim: true },
    joinedAt: { type: Date, default: () => new Date() },
  },
  { _id: false },
);

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 300 },
    imageUrl: { type: String, default: "", trim: true },
    imageKey: { type: String, default: "", trim: true },
    memberCount: { type: Number, default: 0, min: 0 },
    members: { type: [GroupMemberSchema], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    proposedBy: { type: String, default: "" },
    proposerName: { type: String, default: "", trim: true, maxlength: 64 },
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

// ─── Discussion Reply ─────────────────────────────────────────────────────────

export interface IDiscussionReply extends Document {
  discussionId: mongoose.Types.ObjectId;
  parentReplyId: mongoose.Types.ObjectId | null;
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  body: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionReplySchema = new Schema<IDiscussionReply>(
  {
    discussionId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityDiscussion",
      required: true,
      index: true,
    },
    parentReplyId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityDiscussionReply",
      default: null,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
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
    avatarUrl: {
      type: String,
      default: "",
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export const DiscussionReplyModel = mongoose.model<IDiscussionReply>(
  "CommunityDiscussionReply",
  DiscussionReplySchema,
);

// ─── Group Message ────────────────────────────────────────────────────────────

export interface IGroupMessage extends Document {
  groupId: mongoose.Types.ObjectId;
  replyToId: mongoose.Types.ObjectId | null;
  replyToAuthor: string;
  replyToText: string;
  userId: string;
  author: string;
  avatarInitials: string;
  avatarUrl: string;
  text: string;
  reactions: Map<string, string[]>;
  createdAt: Date;
  updatedAt: Date;
}

const GroupMessageSchema = new Schema<IGroupMessage>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityGroup",
      required: true,
      index: true,
    },
    replyToId: {
      type: Schema.Types.ObjectId,
      ref: "CommunityGroupMessage",
      default: null,
    },
    replyToAuthor: { type: String, default: "", trim: true, maxlength: 64 },
    replyToText: { type: String, default: "", trim: true, maxlength: 200 },
    userId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    author: { type: String, required: true, trim: true, maxlength: 64 },
    avatarInitials: { type: String, required: true, trim: true, maxlength: 4 },
    avatarUrl: { type: String, default: "", trim: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    reactions: { type: Map, of: [String], default: {} },
  },
  { timestamps: true },
);

export const GroupMessageModel = mongoose.model<IGroupMessage>(
  "CommunityGroupMessage",
  GroupMessageSchema,
);
