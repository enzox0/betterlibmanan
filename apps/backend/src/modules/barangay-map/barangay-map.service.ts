import { Types } from "mongoose";
import { BarangayModel } from "../statistics/statistics.model";
import {
  BarangayMapModel,
  type BarangayMapStatus,
  type IBarangayMap,
  type IFestival,
} from "./barangay-map.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface BarangayMapInput {
  name: string;
  imageUrl?: string;
  imageKey?: string;
  description?: string;
  touristAttractions?: string[];
  population?: string;
  area?: string;
  festivals?: IFestival[];
  status: BarangayMapStatus;
}

export interface BarangayMapUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function barangayMapError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function normalizeString(value?: string): string {
  return (value ?? "").trim();
}

function normalizeList(values?: string[]): string[] {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function normalizeFestivals(festivals?: IFestival[]): IFestival[] {
  return (festivals ?? [])
    .map((festival) => ({
      name: (festival.name ?? "").trim(),
      date: (festival.date ?? "").trim(),
      description: (festival.description ?? "").trim(),
    }))
    .filter((festival) => festival.name);
}

/** Sync barangay map population to statistics BarangayModel */
async function syncBarangayPopulationToStats(
  name: string,
  populationStr?: string,
): Promise<void> {
  if (!populationStr) return;

  // Parse the population string to a number (remove commas, spaces, etc.)
  const population = parseInt(populationStr.replace(/[^0-9]/g, ""), 10);

  if (isNaN(population)) return;

  // Find Barangay record by name (case-insensitive)
  const barangay = await BarangayModel.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });

  if (barangay) {
    barangay.population = population;
    await barangay.save();

    // Re-rank all barangays since population changed
    const all = await BarangayModel.find().sort({ population: -1 }).lean();
    const ops = all.map((b: any, i: number) => ({
      updateOne: {
        filter: { _id: b._id },
        update: { $set: { rank: i + 1 } },
      },
    }));
    if (ops.length) await BarangayModel.bulkWrite(ops);
  }
}

export async function listPublishedBarangayMaps(): Promise<IBarangayMap[]> {
  return BarangayMapModel.find({ status: "published" })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function listAllBarangayMaps(): Promise<IBarangayMap[]> {
  return BarangayMapModel.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function createBarangayMap(
  input: BarangayMapInput,
): Promise<IBarangayMap> {
  const created = await BarangayMapModel.create({
    name: input.name.trim(),
    imageUrl: normalizeString(input.imageUrl),
    imageKey: normalizeString(input.imageKey),
    description: normalizeString(input.description),
    touristAttractions: normalizeList(input.touristAttractions),
    population: normalizeString(input.population),
    area: normalizeString(input.area),
    festivals: normalizeFestivals(input.festivals),
    status: input.status,
  });

  // Sync to statistics BarangayModel
  await syncBarangayPopulationToStats(input.name.trim(), input.population);

  return BarangayMapModel.findById(created._id).lean() as any;
}

export async function updateBarangayMap(
  id: string,
  input: BarangayMapInput,
): Promise<IBarangayMap> {
  if (!Types.ObjectId.isValid(id)) {
    throw barangayMapError("Invalid ID", 400);
  }

  const existing = await BarangayMapModel.findById(id);
  if (!existing) {
    throw barangayMapError("Barangay map record not found", 404);
  }

  const previousImageKey = existing.imageKey;
  const hasImageKeyUpdate = input.imageKey !== undefined;
  const nextImageKey = hasImageKeyUpdate
    ? normalizeString(input.imageKey)
    : previousImageKey;
  const imageChanged =
    hasImageKeyUpdate && previousImageKey && previousImageKey !== nextImageKey;

  existing.name = input.name.trim();
  existing.description = normalizeString(input.description);
  existing.touristAttractions = normalizeList(input.touristAttractions);
  existing.population = normalizeString(input.population);
  existing.area = normalizeString(input.area);
  existing.festivals = normalizeFestivals(input.festivals);
  existing.status = input.status;

  if (input.imageUrl !== undefined) {
    existing.imageUrl = normalizeString(input.imageUrl);
  }
  if (hasImageKeyUpdate) {
    existing.imageKey = nextImageKey;
  }

  await existing.save();

  // Sync to statistics BarangayModel
  await syncBarangayPopulationToStats(input.name.trim(), input.population);

  if (imageChanged) {
    await deleteObjectFromR2(previousImageKey);
  }

  return BarangayMapModel.findById(id).lean() as any;
}

export async function deleteBarangayMap(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) {
    throw barangayMapError("Invalid ID", 400);
  }

  const existing = await BarangayMapModel.findById(id);
  if (!existing) {
    throw barangayMapError("Barangay map record not found", 404);
  }

  const imageKey = existing.imageKey;
  await existing.deleteOne();
  await deleteObjectFromR2(imageKey);
}

export async function uploadBarangayMapImage(
  input: BarangayMapUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "barangay-map",
  });
}
