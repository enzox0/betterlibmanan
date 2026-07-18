import { Types } from "mongoose";
import {
  LatestUpdateModel,
  type LatestUpdateStatus,
  type ILatestUpdate,
} from "./latest-updates.model";

export interface LatestUpdateInput {
  title: string;
  date?: string;
  summary?: string;
  status: LatestUpdateStatus;
}

function latestUpdateError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedLatestUpdates(): Promise<ILatestUpdate[]> {
  return LatestUpdateModel.find({ status: "published" })
    .sort({ date: -1, createdAt: -1 })
    .lean() as any;
}

export async function listAllLatestUpdates(): Promise<ILatestUpdate[]> {
  return LatestUpdateModel.find()
    .sort({ date: -1, createdAt: -1 })
    .lean() as any;
}

export async function createLatestUpdate(
  input: LatestUpdateInput,
): Promise<ILatestUpdate> {
  const created = await LatestUpdateModel.create({
    title: input.title.trim(),
    date: (input.date ?? "").trim(),
    summary: (input.summary ?? "").trim(),
    status: input.status,
  });

  return LatestUpdateModel.findById(created._id).lean() as any;
}

export async function updateLatestUpdate(
  id: string,
  input: LatestUpdateInput,
): Promise<ILatestUpdate> {
  if (!Types.ObjectId.isValid(id)) throw latestUpdateError("Invalid ID", 400);

  const existing = await LatestUpdateModel.findById(id);
  if (!existing) throw latestUpdateError("Latest update record not found", 404);

  existing.title = input.title.trim();
  if (input.date !== undefined) {
    existing.date = (input.date ?? "").trim();
  }
  if (input.summary !== undefined) {
    existing.summary = (input.summary ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  return LatestUpdateModel.findById(id).lean() as any;
}

export async function deleteLatestUpdate(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw latestUpdateError("Invalid ID", 400);

  const existing = await LatestUpdateModel.findById(id);
  if (!existing) throw latestUpdateError("Latest update record not found", 404);

  await existing.deleteOne();
}
