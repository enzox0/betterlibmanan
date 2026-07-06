import mongoose, { Schema, Document } from "mongoose";

// ─── Executive Official ───────────────────────────────────────────────────────

export interface IExecutiveOfficial extends Document {
  title: string;
  name: string;
  email: string;
  phone: string;
  hours: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExecutiveOfficialSchema = new Schema<IExecutiveOfficial>(
  {
    title: { type: String, required: true, trim: true, maxlength: 255 },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    email: { type: String, trim: true, default: "", maxlength: 255 },
    phone: { type: String, trim: true, default: "", maxlength: 100 },
    hours: { type: String, trim: true, default: "", maxlength: 255 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ExecutiveOfficialModel = mongoose.model<IExecutiveOfficial>(
  "ExecutiveOfficial",
  ExecutiveOfficialSchema,
);

// ─── Legislative Member ───────────────────────────────────────────────────────

export interface ILegislativeMember extends Document {
  name: string;
  position: string;
  committees: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LegislativeMemberSchema = new Schema<ILegislativeMember>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    position: { type: String, required: true, trim: true, maxlength: 255 },
    committees: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const LegislativeMemberModel = mongoose.model<ILegislativeMember>(
  "LegislativeMember",
  LegislativeMemberSchema,
);

// ─── Municipal Office ─────────────────────────────────────────────────────────

export interface IMunicipalOffice extends Document {
  name: string;
  description: string;
  phone: string;
  email: string;
  link: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const MunicipalOfficeSchema = new Schema<IMunicipalOffice>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    description: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "", maxlength: 100 },
    email: { type: String, trim: true, default: "", maxlength: 255 },
    link: { type: String, trim: true, default: "", maxlength: 500 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const MunicipalOfficeModel = mongoose.model<IMunicipalOffice>(
  "MunicipalOffice",
  MunicipalOfficeSchema,
);

// ─── Barangay ─────────────────────────────────────────────────────────────────

export interface IBarangay extends Document {
  name: string;
  captain: string;
  phone: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BarangaySchema = new Schema<IBarangay>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    captain: { type: String, required: true, trim: true, maxlength: 255 },
    phone: { type: String, required: true, trim: true, maxlength: 100 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const BarangayModel = mongoose.model<IBarangay>(
  "Barangay",
  BarangaySchema,
);
