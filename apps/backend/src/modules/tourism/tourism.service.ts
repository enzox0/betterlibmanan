import { Types } from "mongoose";
import {
  TouristSpotModel,
  type TourismStatus,
  type TourismCategory,
  type ITouristSpot,
} from "./tourism.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface TouristSpotInput {
  name: string;
  location?: string;
  description?: string;
  category: TourismCategory;
  rating?: string;
  entryFee?: string;
  tags?: string[];
  imageUrl?: string;
  imageKey?: string;
  status: TourismStatus;
}

export interface TourismImageUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function tourismError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedTouristSpots(): Promise<ITouristSpot[]> {
  return TouristSpotModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllTouristSpots(): Promise<ITouristSpot[]> {
  return TouristSpotModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createTouristSpot(
  input: TouristSpotInput,
): Promise<ITouristSpot> {
  const created = await TouristSpotModel.create({
    name: input.name.trim(),
    location: (input.location ?? "").trim(),
    description: (input.description ?? "").trim(),
    category: input.category,
    rating: (input.rating ?? "").trim(),
    entryFee: (input.entryFee ?? "").trim(),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    imageUrl: (input.imageUrl ?? "").trim(),
    imageKey: (input.imageKey ?? "").trim(),
    status: input.status,
  });

  return TouristSpotModel.findById(created._id).lean() as any;
}

export async function updateTouristSpot(
  id: string,
  input: TouristSpotInput,
): Promise<ITouristSpot> {
  if (!Types.ObjectId.isValid(id)) throw tourismError("Invalid ID", 400);

  const existing = await TouristSpotModel.findById(id);
  if (!existing) throw tourismError("Tourist spot not found", 404);

  existing.name = input.name.trim();
  existing.location = (input.location ?? existing.location ?? "").trim();
  existing.description = (
    input.description ??
    existing.description ??
    ""
  ).trim();
  existing.category = input.category;
  existing.rating = (input.rating ?? existing.rating ?? "").trim();
  existing.entryFee = (input.entryFee ?? existing.entryFee ?? "").trim();
  existing.tags = (input.tags ?? existing.tags ?? [])
    .map((t) => t.trim())
    .filter(Boolean);

  if (input.imageUrl !== undefined) {
    existing.imageUrl = input.imageUrl.trim();
  }
  if (input.imageKey !== undefined) {
    existing.imageKey = input.imageKey.trim();
  }

  existing.status = input.status;

  await existing.save();

  return TouristSpotModel.findById(id).lean() as any;
}

export async function deleteTouristSpot(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw tourismError("Invalid ID", 400);

  const existing = await TouristSpotModel.findById(id);
  if (!existing) throw tourismError("Tourist spot not found", 404);

  // Clean up the image from R2 if one exists
  if (existing.imageKey) {
    deleteObjectFromR2(existing.imageKey).catch(() => {
      // Non-fatal — record is deleted regardless
    });
  }

  await existing.deleteOne();
}

export async function uploadTourismImage(
  input: TourismImageUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "tourism",
  });
}
