import mongoose, { Schema, Document } from "mongoose";

// ─── DpwhProject ──────────────────────────────────────────────────────────────

export interface IDpwhProject extends Document {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  province: string;
  region: string;
  contractor: string;
  startDate: string;
  completionDate: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
  createdAt: Date;
  updatedAt: Date;
}

const DpwhProjectSchema = new Schema<IDpwhProject>(
  {
    contractId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    budget: {
      type: Number,
      required: true,
      default: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    province: {
      type: String,
      trim: true,
      default: "CAMARINES SUR",
    },
    region: {
      type: String,
      trim: true,
      default: "Region V",
    },
    contractor: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: String,
      trim: true,
      default: "",
    },
    completionDate: {
      type: String,
      trim: true,
      default: null,
    },
    infraYear: {
      type: String,
      trim: true,
      default: "",
    },
    programName: {
      type: String,
      trim: true,
      default: "",
    },
    sourceOfFunds: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Unique contract ID per document
DpwhProjectSchema.index({ contractId: 1 }, { unique: true });

export const DpwhProjectModel = mongoose.model<IDpwhProject>(
  "DpwhProject",
  DpwhProjectSchema,
);

// ─── Financial Report ─────────────────────────────────────────────────────────

export interface IFinancialReport extends Document {
  fiscalYear: string;
  quarter: string; // Q1, Q2, Q3, Q4
  totalIncome: number;
  totalExpenditures: number;
  netOperatingIncome: number;
  fundBalance: number;
  incomeSources: Array<{ source: string; amount: number; percentage: number }>;
  expenditureAllocations: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  reportDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialReportSchema = new Schema<IFinancialReport>(
  {
    fiscalYear: {
      type: String,
      required: true,
      trim: true,
    },
    quarter: {
      type: String,
      required: true,
      trim: true,
      enum: ["Q1", "Q2", "Q3", "Q4"],
    },
    totalIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    totalExpenditures: {
      type: Number,
      required: true,
      default: 0,
    },
    netOperatingIncome: {
      type: Number,
      required: true,
      default: 0,
    },
    fundBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    incomeSources: {
      type: [
        {
          source: { type: String, required: true },
          amount: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
      ],
      default: [],
    },
    expenditureAllocations: {
      type: [
        {
          category: { type: String, required: true },
          amount: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
      ],
      default: [],
    },
    reportDate: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Unique constraint on fiscalYear + quarter
FinancialReportSchema.index({ fiscalYear: 1, quarter: 1 }, { unique: true });

export const FinancialReportModel = mongoose.model<IFinancialReport>(
  "FinancialReport",
  FinancialReportSchema,
);
