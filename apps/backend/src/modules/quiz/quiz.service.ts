import { Types } from "mongoose";
import { QuizModel, type QuizStatus, type IQuiz } from "./quiz.model";

export interface QuizInput {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  status: QuizStatus;
}

function quizError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedQuiz(): Promise<IQuiz[]> {
  return QuizModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllQuiz(): Promise<IQuiz[]> {
  return QuizModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createQuiz(input: QuizInput): Promise<IQuiz> {
  const created = await QuizModel.create({
    question: input.question.trim(),
    options: input.options.map((o) => o.trim()),
    correctIndex: input.correctIndex,
    explanation: (input.explanation ?? "").trim(),
    category: (input.category ?? "").trim(),
    status: input.status,
  });

  return QuizModel.findById(created._id).lean() as any;
}

export async function updateQuiz(id: string, input: QuizInput): Promise<IQuiz> {
  if (!Types.ObjectId.isValid(id)) throw quizError("Invalid ID", 400);

  const existing = await QuizModel.findById(id);
  if (!existing) throw quizError("Quiz record not found", 404);

  existing.question = input.question.trim();
  existing.options = input.options.map((o) => o.trim());
  existing.correctIndex = input.correctIndex;
  if (input.explanation !== undefined) {
    existing.explanation = (input.explanation ?? "").trim();
  }
  if (input.category !== undefined) {
    existing.category = (input.category ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  return QuizModel.findById(id).lean() as any;
}

export async function deleteQuiz(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw quizError("Invalid ID", 400);

  const existing = await QuizModel.findById(id);
  if (!existing) throw quizError("Quiz record not found", 404);

  await existing.deleteOne();
}

export interface BulkQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  status?: QuizStatus;
}

/**
 * Bulk-insert an array of quiz items. Returns all inserted documents
 * sorted by createdAt ascending.
 */
export async function bulkImportQuiz(items: BulkQuizItem[]): Promise<IQuiz[]> {
  if (items.length === 0) throw quizError("No items to import", 400);
  if (items.length > 500) throw quizError("Maximum 500 items per import", 400);

  const docs = items.map((item) => ({
    question: item.question.trim(),
    options: item.options.map((o) => o.trim()),
    correctIndex: item.correctIndex,
    explanation: (item.explanation ?? "").trim(),
    category: (item.category ?? "").trim(),
    status: item.status ?? "draft",
  }));

  await QuizModel.insertMany(docs, { ordered: false });

  return QuizModel.find().sort({ createdAt: 1 }).lean() as any;
}
