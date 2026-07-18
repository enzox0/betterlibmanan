import mongoose, { Schema, Document } from "mongoose";

// ─── Ordinance ────────────────────────────────────────────────────────────────

export interface IOrdinance extends Document {
  number: string;
  title: string;
  sessionDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrdinanceSchema = new Schema<IOrdinance>(
  {
    number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sessionDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true },
);

export const OrdinanceModel = mongoose.model<IOrdinance>(
  "Ordinance",
  OrdinanceSchema,
);

// ─── Resolution ───────────────────────────────────────────────────────────────

export interface IResolution extends Document {
  number: string;
  title: string;
  sessionDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResolutionSchema = new Schema<IResolution>(
  {
    number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    sessionDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { timestamps: true },
);

export const ResolutionModel = mongoose.model<IResolution>(
  "Resolution",
  ResolutionSchema,
);

// ─── Process Step ─────────────────────────────────────────────────────────────

export type ProcessStepVariant = "ordinance" | "resolution";

export interface IProcessStep extends Document {
  variant: ProcessStepVariant;
  step: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProcessStepSchema = new Schema<IProcessStep>(
  {
    variant: {
      type: String,
      enum: ["ordinance", "resolution"],
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export const ProcessStepModel = mongoose.model<IProcessStep>(
  "LegislativeProcessStep",
  ProcessStepSchema,
);

// ─── About Point ──────────────────────────────────────────────────────────────

export interface IAboutPoint extends Document {
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const AboutPointSchema = new Schema<IAboutPoint>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const AboutPointModel = mongoose.model<IAboutPoint>(
  "LegislativeAboutPoint",
  AboutPointSchema,
);

// ─── Settings (singleton) ─────────────────────────────────────────────────────

export interface ILegislativeSettings extends Document {
  ordinanceDescription: string;
  ordinanceDefinition: string;
  ordinanceCategories: string[];
  ordinanceExternalLink: string;
  resolutionDescription: string;
  resolutionDefinition: string;
  resolutionTypes: string[];
  resolutionExternalLink: string;
  aboutTitle: string;
  aboutDescription: string;
  updatedAt: Date;
}

const LegislativeSettingsSchema = new Schema<ILegislativeSettings>(
  {
    ordinanceDescription: { type: String, trim: true, default: "" },
    ordinanceDefinition: { type: String, trim: true, default: "" },
    ordinanceCategories: { type: [String], default: [] },
    ordinanceExternalLink: { type: String, trim: true, default: "" },
    resolutionDescription: { type: String, trim: true, default: "" },
    resolutionDefinition: { type: String, trim: true, default: "" },
    resolutionTypes: { type: [String], default: [] },
    resolutionExternalLink: { type: String, trim: true, default: "" },
    aboutTitle: { type: String, trim: true, default: "" },
    aboutDescription: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export const LegislativeSettingsModel = mongoose.model<ILegislativeSettings>(
  "LegislativeSettings",
  LegislativeSettingsSchema,
);
