import mongoose, { Schema, Document } from "mongoose";

export type AtAGlanceStatus = "published" | "draft";

export interface IAtAGlance extends Document {
  label: string;
  value: string;
  icon: string;
  sub: string;
  status: AtAGlanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const AtAGlanceSchema = new Schema<IAtAGlance>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    value: {
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
    sub: {
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

export const AtAGlanceModel = mongoose.model<IAtAGlance>(
  "AtAGlance",
  AtAGlanceSchema,
);
