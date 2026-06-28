import { Types } from "mongoose";
import {
  MunicipalHallModel,
  type MunicipalHallStatus,
  type IMunicipalHall,
} from "./municipal-hall.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface MunicipalHallInput {
  title: string;
  imageUrl?: string;
  imageKey?: string;
  description?: string;
  address?: string;
  province?: string;
  barangays?: string;
  founded?: string;
  officeHoursWeekday?: string;
  officeHoursWeekend?: string;
  status: MunicipalHallStatus;
}

export interface MunicipalHallUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function municipalHallError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedMunicipalHall(): Promise<IMunicipalHall[]> {
  return MunicipalHallModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllMunicipalHall(): Promise<IMunicipalHall[]> {
  return MunicipalHallModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createMunicipalHall(
  input: MunicipalHallInput,
): Promise<IMunicipalHall> {
  const created = await MunicipalHallModel.create({
    title: input.title.trim(),
    imageUrl: (input.imageUrl ?? "").trim(),
    imageKey: (input.imageKey ?? "").trim(),
    description: (input.description ?? "").trim(),
    address: (input.address ?? "").trim(),
    province: (input.province ?? "").trim(),
    barangays: (input.barangays ?? "").trim(),
    founded: (input.founded ?? "").trim(),
    officeHoursWeekday: (input.officeHoursWeekday ?? "").trim(),
    officeHoursWeekend: (input.officeHoursWeekend ?? "").trim(),
    status: input.status,
  });

  return MunicipalHallModel.findById(created._id).lean() as any;
}

export async function updateMunicipalHall(
  id: string,
  input: MunicipalHallInput,
): Promise<IMunicipalHall> {
  if (!Types.ObjectId.isValid(id)) throw municipalHallError("Invalid ID", 400);

  const existing = await MunicipalHallModel.findById(id);
  if (!existing)
    throw municipalHallError("Municipal Hall record not found", 404);

  const previousImageKey = existing.imageKey;
  // Only swap the image when a new key is explicitly provided
  const nextImageKey = input.imageKey
    ? input.imageKey.trim()
    : previousImageKey;
  const imageChanged =
    input.imageKey && previousImageKey && previousImageKey !== nextImageKey;

  existing.title = input.title.trim();
  if (input.imageUrl) existing.imageUrl = input.imageUrl.trim();
  existing.imageKey = nextImageKey;
  if (input.description !== undefined)
    existing.description = (input.description ?? "").trim();
  if (input.address !== undefined)
    existing.address = (input.address ?? "").trim();
  if (input.province !== undefined)
    existing.province = (input.province ?? "").trim();
  if (input.barangays !== undefined)
    existing.barangays = (input.barangays ?? "").trim();
  if (input.founded !== undefined)
    existing.founded = (input.founded ?? "").trim();
  if (input.officeHoursWeekday !== undefined)
    existing.officeHoursWeekday = (input.officeHoursWeekday ?? "").trim();
  if (input.officeHoursWeekend !== undefined)
    existing.officeHoursWeekend = (input.officeHoursWeekend ?? "").trim();
  existing.status = input.status;

  await existing.save();

  if (imageChanged) {
    await deleteObjectFromR2(previousImageKey);
  }

  return MunicipalHallModel.findById(id).lean() as any;
}

export async function deleteMunicipalHall(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw municipalHallError("Invalid ID", 400);

  const existing = await MunicipalHallModel.findById(id);
  if (!existing)
    throw municipalHallError("Municipal Hall record not found", 404);

  const imageKey = existing.imageKey;
  await existing.deleteOne();
  if (imageKey) {
    await deleteObjectFromR2(imageKey);
  }
}

export async function uploadMunicipalHallImage(
  input: MunicipalHallUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "municipal-hall",
  });
}
