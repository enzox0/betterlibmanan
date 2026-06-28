import mongoose, { Schema, Document } from "mongoose";

export type MunicipalHallStatus = "published" | "draft";

export interface IMunicipalHall extends Document {
  title: string;
  imageUrl?: string;
  imageKey?: string;
  description: string;
  address: string;
  province: string;
  barangays: string;
  founded: string;
  officeHoursWeekday: string;
  officeHoursWeekend: string;
  status: MunicipalHallStatus;
  createdAt: Date;
  updatedAt: Date;
}

const MunicipalHallSchema = new Schema<IMunicipalHall>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
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
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    province: {
      type: String,
      trim: true,
      default: "",
    },
    barangays: {
      type: String,
      trim: true,
      default: "",
    },
    founded: {
      type: String,
      trim: true,
      default: "",
    },
    officeHoursWeekday: {
      type: String,
      trim: true,
      default: "",
    },
    officeHoursWeekend: {
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

export const MunicipalHallModel = mongoose.model<IMunicipalHall>(
  "MunicipalHall",
  MunicipalHallSchema,
);
