import { Types } from "mongoose";
import {
  PopularServiceModel,
  type PopularServiceStatus,
  type IPopularService,
} from "./popular-services.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface PopularServiceInput {
  name: string;
  icon?: string;
  description?: string;
  status: PopularServiceStatus;
}

export interface PopularServiceUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function popularServiceError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedPopularServices(): Promise<
  IPopularService[]
> {
  return PopularServiceModel.find({ status: "published" })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function listAllPopularServices(): Promise<IPopularService[]> {
  return PopularServiceModel.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function createPopularService(
  input: PopularServiceInput,
): Promise<IPopularService> {
  const created = await PopularServiceModel.create({
    name: input.name.trim(),
    icon: (input.icon ?? "").trim(),
    description: (input.description ?? "").trim(),
    status: input.status,
  });

  return PopularServiceModel.findById(created._id).lean() as any;
}

export async function updatePopularService(
  id: string,
  input: PopularServiceInput,
): Promise<IPopularService> {
  if (!Types.ObjectId.isValid(id)) throw popularServiceError("Invalid ID", 400);

  const existing = await PopularServiceModel.findById(id);
  if (!existing) throw popularServiceError("Popular Service not found", 404);

  existing.name = input.name.trim();
  if (input.description !== undefined) {
    existing.description = (input.description ?? "").trim();
  }
  if (input.icon !== undefined) {
    existing.icon = (input.icon ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  return PopularServiceModel.findById(id).lean() as any;
}

export async function deletePopularService(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw popularServiceError("Invalid ID", 400);

  const existing = await PopularServiceModel.findById(id);
  if (!existing) throw popularServiceError("Popular Service not found", 404);

  await existing.deleteOne();
}

export async function uploadPopularServiceIcon(
  input: PopularServiceUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "popular-services",
  });
}
