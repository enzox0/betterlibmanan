import { Types } from "mongoose";
import {
  BetterLugModel,
  type BetterLugStatus,
  type IBetterLug,
} from "./better-lugs.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface BetterLugInput {
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  logoKey?: string;
  status: BetterLugStatus;
}

export interface BetterLugUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function betterLugError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function normalizeWebsiteUrl(url?: string): string {
  return (url ?? "").trim();
}

export async function listPublishedBetterLugs(): Promise<IBetterLug[]> {
  return BetterLugModel.find({ status: "published" })
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function listAllBetterLugs(): Promise<IBetterLug[]> {
  return BetterLugModel.find()
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean() as any;
}

export async function createBetterLug(
  input: BetterLugInput,
): Promise<IBetterLug> {
  const created = await BetterLugModel.create({
    name: input.name.trim(),
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
    logoUrl: (input.logoUrl ?? "").trim(),
    logoKey: (input.logoKey ?? "").trim(),
    status: input.status,
  });

  return BetterLugModel.findById(created._id).lean() as any;
}

export async function updateBetterLug(
  id: string,
  input: BetterLugInput,
): Promise<IBetterLug> {
  if (!Types.ObjectId.isValid(id)) throw betterLugError("Invalid ID", 400);

  const existing = await BetterLugModel.findById(id);
  if (!existing) throw betterLugError("Better LUG not found", 404);

  const previousLogoKey = existing.logoKey;
  const hasLogoKeyUpdate = input.logoKey !== undefined;
  const nextLogoKey = hasLogoKeyUpdate
    ? (input.logoKey ?? "").trim()
    : previousLogoKey;
  const logoChanged =
    hasLogoKeyUpdate && previousLogoKey && previousLogoKey !== nextLogoKey;

  existing.name = input.name.trim();
  existing.websiteUrl = normalizeWebsiteUrl(input.websiteUrl);
  if (input.logoUrl !== undefined) {
    existing.logoUrl = input.logoUrl.trim();
  }
  if (hasLogoKeyUpdate) {
    existing.logoKey = nextLogoKey;
  }
  existing.status = input.status;

  await existing.save();

  if (logoChanged) {
    await deleteObjectFromR2(previousLogoKey);
  }

  return BetterLugModel.findById(id).lean() as any;
}

export async function deleteBetterLug(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw betterLugError("Invalid ID", 400);

  const existing = await BetterLugModel.findById(id);
  if (!existing) throw betterLugError("Better LUG not found", 404);

  const logoKey = existing.logoKey;
  await existing.deleteOne();
  await deleteObjectFromR2(logoKey);
}

export async function uploadBetterLugLogo(
  input: BetterLugUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "better-lugs",
  });
}
