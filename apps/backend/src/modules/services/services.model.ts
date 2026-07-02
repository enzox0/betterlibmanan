import mongoose, { Schema, Document } from "mongoose";

export type ServiceStatus = "published" | "draft";

// ─── ServiceItem sub-document ─────────────────────────────────────────────────

export interface IServiceItem {
  id: string;
  title: string;
  description: string;
  fee?: string;
  processingTime?: string;
  link?: string;
  requirements: string[];
  steps: string[];
}

const ServiceItemSchema = new Schema<IServiceItem>(
  {
    id: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, default: "" },
    fee: { type: String, trim: true, default: "" },
    processingTime: { type: String, trim: true, default: "" },
    link: { type: String, trim: true, default: "" },
    requirements: [{ type: String, trim: true }],
    steps: [{ type: String, trim: true }],
  },
  { _id: false },
);

// ─── ServiceCategory document ─────────────────────────────────────────────────

export interface IServiceCategory extends Document {
  slug: string;
  title: string;
  description: string;
  iconKey: string; // string key resolved to an icon on the frontend
  status: ServiceStatus;
  services: IServiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceCategorySchema = new Schema<IServiceCategory>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, trim: true, default: "" },
    iconKey: { type: String, trim: true, default: "FaFileAlt" },
    status: {
      type: String,
      enum: ["published", "draft"],
      required: true,
      default: "draft",
    },
    services: { type: [ServiceItemSchema], default: [] },
  },
  { timestamps: true },
);

export const ServiceCategoryModel = mongoose.model<IServiceCategory>(
  "ServiceCategory",
  ServiceCategorySchema,
);

// ─── LifeEvent document ───────────────────────────────────────────────────────

export interface ILifeEvent extends Document {
  slug: string;
  title: string;
  iconKey: string;
  serviceIds: string[]; // array of ServiceItem ids
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const LifeEventSchema = new Schema<ILifeEvent>(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    iconKey: { type: String, trim: true, default: "FaStore" },
    serviceIds: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["published", "draft"],
      required: true,
      default: "draft",
    },
  },
  { timestamps: true },
);

export const LifeEventModel = mongoose.model<ILifeEvent>(
  "LifeEvent",
  LifeEventSchema,
);
