import { Types } from "mongoose";
import {
  MarqueeImageModel,
  type MarqueeImageStatus,
  type IMarqueeImage,
} from "./marquee-images.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface MarqueeImageInput {
  alt: string;
  imageUrl?: string;
  imageKey?: string;
  rowNumber: number;
  order: number;
  status: MarqueeImageStatus;
}

export interface MarqueeImageUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function marqueeImageError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedMarqueeImages(): Promise<IMarqueeImage[]> {
  return MarqueeImageModel.find({ status: "published" })
    .sort({ rowNumber: 1, order: 1 })
    .lean() as any;
}

export async function listAllMarqueeImages(): Promise<IMarqueeImage[]> {
  return MarqueeImageModel.find()
    .sort({ rowNumber: 1, order: 1 })
    .lean() as any;
}

export async function createMarqueeImage(
  input: MarqueeImageInput,
): Promise<IMarqueeImage> {
  if (!input.imageUrl || !input.imageKey) {
    throw marqueeImageError(
      "imageUrl and imageKey are required when creating a marquee image",
      400,
    );
  }
  const created = await MarqueeImageModel.create({
    alt: input.alt.trim(),
    imageUrl: input.imageUrl.trim(),
    imageKey: input.imageKey.trim(),
    rowNumber: input.rowNumber,
    order: input.order,
    status: input.status,
  });

  return MarqueeImageModel.findById(created._id).lean() as any;
}

export async function updateMarqueeImage(
  id: string,
  input: MarqueeImageInput,
): Promise<IMarqueeImage> {
  if (!Types.ObjectId.isValid(id)) throw marqueeImageError("Invalid ID", 400);

  const existing = await MarqueeImageModel.findById(id);
  if (!existing) throw marqueeImageError("Marquee image not found", 404);

  const previousImageKey = existing.imageKey;
  // Only swap the image when a new key is explicitly provided
  const nextImageKey = input.imageKey
    ? input.imageKey.trim()
    : previousImageKey;
  const imageChanged =
    input.imageKey && previousImageKey && previousImageKey !== nextImageKey;

  existing.alt = input.alt.trim();
  if (input.imageUrl) existing.imageUrl = input.imageUrl.trim();
  existing.imageKey = nextImageKey;
  existing.rowNumber = input.rowNumber;
  existing.order = input.order;
  existing.status = input.status;

  await existing.save();

  if (imageChanged) {
    await deleteObjectFromR2(previousImageKey);
  }

  return MarqueeImageModel.findById(id).lean() as any;
}

export async function deleteMarqueeImage(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw marqueeImageError("Invalid ID", 400);

  const existing = await MarqueeImageModel.findById(id);
  if (!existing) throw marqueeImageError("Marquee image not found", 404);

  const imageKey = existing.imageKey;
  await existing.deleteOne();
  await deleteObjectFromR2(imageKey);
}

export async function uploadMarqueeImage(
  input: MarqueeImageUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "marquee-images",
  });
}

export async function reorderMarqueeImages(
  updates: Array<{ id: string; rowNumber: number; order: number }>,
): Promise<void> {
  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { _id: new Types.ObjectId(update.id) },
      update: { $set: { rowNumber: update.rowNumber, order: update.order } },
    },
  }));

  if (bulkOps.length > 0) {
    await MarqueeImageModel.bulkWrite(bulkOps);
  }
}
