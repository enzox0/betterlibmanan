import mongoose, { Schema, Document } from "mongoose";

export type QuizStatus = "published" | "draft";

export interface IQuiz extends Document {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  status: QuizStatus;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 6,
        message: "A question must have between 2 and 6 options.",
      },
    },
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
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

export const QuizModel = mongoose.model<IQuiz>("Quiz", QuizSchema);
