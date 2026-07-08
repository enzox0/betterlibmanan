import mongoose, { Schema, Document } from "mongoose";

// ─── Municipal Stat ───────────────────────────────────────────────────────────

export interface IMunicipalStat extends Document {
  value: string;
  label: string;
  subLabel: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MunicipalStatSchema = new Schema<IMunicipalStat>(
  {
    value: { type: String, required: true, trim: true, maxlength: 255 },
    label: { type: String, required: true, trim: true, maxlength: 255 },
    subLabel: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MunicipalStatModel = mongoose.model<IMunicipalStat>(
  "MunicipalStat",
  MunicipalStatSchema,
);

// ─── Finance Stat ─────────────────────────────────────────────────────────────

export interface IFinanceStat extends Document {
  label: string;
  value: string;
  subValue: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceStatSchema = new Schema<IFinanceStat>(
  {
    label: { type: String, required: true, trim: true, maxlength: 255 },
    value: { type: String, required: true, trim: true, maxlength: 255 },
    subValue: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const FinanceStatModel = mongoose.model<IFinanceStat>(
  "FinanceStat",
  FinanceStatSchema,
);

// ─── Finance Composition Item ─────────────────────────────────────────────────

export interface IFinanceComposition extends Document {
  label: string;
  percentage: number;
  color: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceCompositionSchema = new Schema<IFinanceComposition>(
  {
    label: { type: String, required: true, trim: true, maxlength: 255 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    color: { type: String, required: true, trim: true, default: "bg-blue-600" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const FinanceCompositionModel = mongoose.model<IFinanceComposition>(
  "FinanceComposition",
  FinanceCompositionSchema,
);

// ─── Population History Point ─────────────────────────────────────────────────

export interface IPopulationPoint extends Document {
  year: number;
  pop: number;
  createdAt: Date;
  updatedAt: Date;
}

const PopulationPointSchema = new Schema<IPopulationPoint>(
  {
    year: { type: Number, required: true },
    pop: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

PopulationPointSchema.index({ year: 1 }, { unique: true });

export const PopulationPointModel = mongoose.model<IPopulationPoint>(
  "PopulationPoint",
  PopulationPointSchema,
);

// ─── Barangay Population ──────────────────────────────────────────────────────

export interface IBarangay extends Document {
  rank: number;
  name: string;
  population: number;
  createdAt: Date;
  updatedAt: Date;
}

const BarangaySchema = new Schema<IBarangay>(
  {
    rank: { type: Number, required: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    population: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

BarangaySchema.index({ name: 1 }, { unique: true });

export const BarangayModel = mongoose.model<IBarangay>(
  "BarangayPopulation",
  BarangaySchema,
);

// ─── Economy Indicator ────────────────────────────────────────────────────────

export interface IEconomyIndicator extends Document {
  label: string;
  value: string;
  subLabel: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EconomyIndicatorSchema = new Schema<IEconomyIndicator>(
  {
    label: { type: String, required: true, trim: true, maxlength: 255 },
    value: { type: String, required: true, trim: true, maxlength: 255 },
    subLabel: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const EconomyIndicatorModel = mongoose.model<IEconomyIndicator>(
  "EconomyIndicator",
  EconomyIndicatorSchema,
);

// ─── Economy Sector ───────────────────────────────────────────────────────────

export interface IEconomySector extends Document {
  name: string;
  percentage: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EconomySectorSchema = new Schema<IEconomySector>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const EconomySectorModel = mongoose.model<IEconomySector>(
  "EconomySector",
  EconomySectorSchema,
);

// ─── Poverty Entry ────────────────────────────────────────────────────────────

export type PovertyStatus = "improved" | "worsened" | "stable";

export interface IPovertyEntry extends Document {
  year: number;
  rate: number;
  confidenceInterval: string;
  change: number;
  status: PovertyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const PovertyEntrySchema = new Schema<IPovertyEntry>(
  {
    year: { type: Number, required: true },
    rate: { type: Number, required: true, min: 0, max: 100 },
    confidenceInterval: { type: String, trim: true, default: "" },
    change: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["improved", "worsened", "stable"],
      required: true,
      default: "stable",
    },
  },
  { timestamps: true },
);

PovertyEntrySchema.index({ year: 1 }, { unique: true });

export const PovertyEntryModel = mongoose.model<IPovertyEntry>(
  "PovertyEntry",
  PovertyEntrySchema,
);

// ─── Competitiveness Item ─────────────────────────────────────────────────────

export interface ICompetitivenessItem extends Document {
  category: string;
  score: number;
  change: number;
  changeLabel: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitivenessItemSchema = new Schema<ICompetitivenessItem>(
  {
    category: { type: String, required: true, trim: true, maxlength: 255 },
    score: { type: Number, required: true, min: 0 },
    change: { type: Number, default: 0 },
    changeLabel: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const CompetitivenessItemModel = mongoose.model<ICompetitivenessItem>(
  "CompetitivenessItem",
  CompetitivenessItemSchema,
);
