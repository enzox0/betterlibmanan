import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  content: string;
  x: number;
  y: number;
  color: string;
  rotation: number;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    x: {
      type: Number,
      required: true,
      default: 0,
    },
    y: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    rotation: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const NoteModel = mongoose.model<INote>('Note', NoteSchema);
