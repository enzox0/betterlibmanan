import mongoose, { Schema, Document } from "mongoose";

// ─── Valid section keys ───────────────────────────────────────────────────────
// statistics page sections
// transparency page sections
export type SectionKey =
  | "stats-finance"
  | "stats-population"
  | "stats-barangays"
  | "stats-economy"
  | "stats-poverty"
  | "stats-competitiveness"
  | "transparency-financial-reports"
  | "transparency-dpwh-projects";

export interface ISectionSource extends Document {
  section: SectionKey;
  label: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSourceSchema = new Schema<ISectionSource>(
  {
    section: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "stats-finance",
        "stats-population",
        "stats-barangays",
        "stats-economy",
        "stats-poverty",
        "stats-competitiveness",
        "transparency-financial-reports",
        "transparency-dpwh-projects",
      ],
    },
    label: { type: String, required: true, trim: true, maxlength: 512 },
    url: { type: String, required: true, trim: true, maxlength: 1024 },
  },
  { timestamps: true },
);

// One source per section (only the latest one is shown)
// We allow multiple entries and let the app use the most recent, OR
// just keep it flexible — one document per section is enforced via upsert in the UI.
SectionSourceSchema.index({ section: 1 });

export const SectionSourceModel = mongoose.model<ISectionSource>(
  "SectionSource",
  SectionSourceSchema,
);
