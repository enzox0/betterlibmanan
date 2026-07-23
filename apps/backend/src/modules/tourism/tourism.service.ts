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
  barangayName?: string;
  description?: string;
  category: TourismCategory;
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
    barangayName: (input.barangayName ?? "").trim(),
    location: (input.barangayName ?? "").trim(), // keep location in sync
    description: (input.description ?? "").trim(),
    category: input.category,
    entryFee: (input.entryFee ?? "").trim(),
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    imageUrl: (input.imageUrl ?? "").trim(),
    imageKey: (input.imageKey ?? "").trim(),
    ratings: [],
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
  existing.barangayName = (
    input.barangayName ??
    existing.barangayName ??
    ""
  ).trim();
  existing.location = existing.barangayName; // keep in sync
  existing.description = (
    input.description ??
    existing.description ??
    ""
  ).trim();
  existing.category = input.category;
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

  if (existing.imageKey) {
    deleteObjectFromR2(existing.imageKey).catch(() => {});
  }

  await existing.deleteOne();
}

/**
 * Upsert a constituent's rating for a spot (one rating per sessionId).
 * Returns the updated spot with recalculated average.
 */
export async function rateTouristSpot(
  id: string,
  sessionId: string,
  value: number,
): Promise<ITouristSpot> {
  if (!Types.ObjectId.isValid(id)) throw tourismError("Invalid ID", 400);
  if (value < 1 || value > 5) throw tourismError("Rating must be 1–5", 400);
  if (!sessionId?.trim()) throw tourismError("Session ID required", 400);

  const spot = await TouristSpotModel.findById(id);
  if (!spot) throw tourismError("Tourist spot not found", 404);

  // Upsert: remove existing rating for this session, then add new one
  spot.ratings = spot.ratings.filter((r) => r.sessionId !== sessionId);
  spot.ratings.push({ sessionId, value, ratedAt: new Date() });

  await spot.save();
  return TouristSpotModel.findById(id).lean() as any;
}

export async function uploadTourismImage(
  input: TourismImageUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "tourism",
  });
}
