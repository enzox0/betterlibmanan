import { Types } from "mongoose";
import {
  LatestUpdateModel,
  type LatestUpdateStatus,
  type ILatestUpdate,
} from "./latest-updates.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface LatestUpdateInput {
  title: string;
  date?: string;
  summary?: string;
  imageUrl?: string;
  imageKey?: string;
  sourceUrl?: string;
  status: LatestUpdateStatus;
}

export interface LatestUpdateUploadInput {
  filename: string;
  mimeType: string;
  data: string;
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
    imageUrl: (input.imageUrl ?? "").trim(),
    imageKey: (input.imageKey ?? "").trim(),
    sourceUrl: (input.sourceUrl ?? "").trim(),
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

  const previousImageKey = existing.imageKey;
  const hasImageKeyUpdate = input.imageKey !== undefined;
  const nextImageKey = hasImageKeyUpdate
    ? (input.imageKey ?? "").trim()
    : previousImageKey;
  const imageChanged =
    hasImageKeyUpdate && previousImageKey && previousImageKey !== nextImageKey;

  existing.title = input.title.trim();
  if (input.date !== undefined) {
    existing.date = (input.date ?? "").trim();
  }
  if (input.summary !== undefined) {
    existing.summary = (input.summary ?? "").trim();
  }
  if (input.imageUrl !== undefined) {
    existing.imageUrl = (input.imageUrl ?? "").trim();
  }
  if (input.imageKey !== undefined) {
    existing.imageKey = nextImageKey;
  }
  if (input.sourceUrl !== undefined) {
    existing.sourceUrl = (input.sourceUrl ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  if (imageChanged) {
    await deleteObjectFromR2(previousImageKey);
  }

  return LatestUpdateModel.findById(id).lean() as any;
}

export async function deleteLatestUpdate(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw latestUpdateError("Invalid ID", 400);

  const existing = await LatestUpdateModel.findById(id);
  if (!existing) throw latestUpdateError("Latest update record not found", 404);

  const imageKey = existing.imageKey;
  await existing.deleteOne();
  await deleteObjectFromR2(imageKey);
}

export async function uploadLatestUpdateImage(
  input: LatestUpdateUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "latest-updates",
  });
}
