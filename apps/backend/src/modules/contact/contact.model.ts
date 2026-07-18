import mongoose, { Schema, Document } from "mongoose";

export type ContactStatus = "published" | "draft";
export type ContactType = "phone" | "email" | "address" | "fax";

export interface IContact extends Document {
  label: string;
  value: string;
  href: string;
  description: string;
  type: ContactType;
  order: number;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    href: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["phone", "email", "address", "fax"],
      default: "phone",
    },
    order: {
      type: Number,
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

export const ContactModel = mongoose.model<IContact>("Contact", ContactSchema);
