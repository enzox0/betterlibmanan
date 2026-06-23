import { Types } from "mongoose";
import {
  HistoryModel,
  type HistoryStatus,
  type IHistory,
} from "./history.model";

export interface HistoryInput {
  title: string;
  content?: string;
  year?: string;
  status: HistoryStatus;
}

function historyError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedHistory(): Promise<IHistory[]> {
  return HistoryModel.find({ status: "published" })
    .sort({ year: 1, createdAt: 1 })
    .lean() as any;
}

export async function listAllHistory(): Promise<IHistory[]> {
  return HistoryModel.find().sort({ year: 1, createdAt: 1 }).lean() as any;
}

export async function createHistory(input: HistoryInput): Promise<IHistory> {
  const created = await HistoryModel.create({
    title: input.title.trim(),
    content: (input.content ?? "").trim(),
    year: (input.year ?? "").trim(),
    status: input.status,
  });

  return HistoryModel.findById(created._id).lean() as any;
}

export async function updateHistory(
  id: string,
  input: HistoryInput,
): Promise<IHistory> {
  if (!Types.ObjectId.isValid(id)) throw historyError("Invalid ID", 400);

  const existing = await HistoryModel.findById(id);
  if (!existing) throw historyError("History record not found", 404);

  existing.title = input.title.trim();
  if (input.content !== undefined) {
    existing.content = (input.content ?? "").trim();
  }
  if (input.year !== undefined) {
    existing.year = (input.year ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  return HistoryModel.findById(id).lean() as any;
}

export async function deleteHistory(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw historyError("Invalid ID", 400);

  const existing = await HistoryModel.findById(id);
  if (!existing) throw historyError("History record not found", 404);

  await existing.deleteOne();
}

export interface BulkHistoryItem {
  title: string;
  content?: string;
  year?: string;
  status?: HistoryStatus;
}

/**
 * Bulk-insert an array of history items. Returns all inserted documents
 * sorted by the standard history order.
 */
export async function bulkImportHistory(
  items: BulkHistoryItem[],
): Promise<IHistory[]> {
  if (items.length === 0) throw historyError("No items to import", 400);
  if (items.length > 500)
    throw historyError("Maximum 500 items per import", 400);

  const docs = items.map((item) => ({
    title: item.title.trim(),
    content: (item.content ?? "").trim(),
    year: (item.year ?? "").trim(),
    status: item.status ?? "draft",
  }));

  await HistoryModel.insertMany(docs, { ordered: false });

  return HistoryModel.find().sort({ year: 1, createdAt: 1 }).lean() as any;
}
