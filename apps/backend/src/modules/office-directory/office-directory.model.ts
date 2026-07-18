import mongoose, { Schema, Document } from "mongoose";

export interface IOfficeDirectory extends Document {
  name: string;
  number: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeDirectorySchema = new Schema<IOfficeDirectory>(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    number: { type: String, required: true, trim: true, maxlength: 60 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const OfficeDirectoryModel = mongoose.model<IOfficeDirectory>(
  "OfficeDirectory",
  OfficeDirectorySchema,
);
