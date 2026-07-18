import { Types } from "mongoose";
import {
  LeadershipModel,
  type LeadershipStatus,
  type ILeadership,
} from "./leadership.model";
import {
  uploadBase64ImageToR2,
  deleteObjectFromR2,
  type UploadedObject,
} from "@/shared/storage";

export interface LeadershipInput {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  avatarKey?: string;
  status: LeadershipStatus;
}

export interface LeadershipUploadInput {
  filename: string;
  mimeType: string;
  data: string;
}

function leadershipError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedLeadership(): Promise<ILeadership[]> {
  return LeadershipModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllLeadership(): Promise<ILeadership[]> {
  return LeadershipModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createLeadership(
  input: LeadershipInput,
): Promise<ILeadership> {
  const created = await LeadershipModel.create({
    name: input.name.trim(),
    position: (input.position ?? "").trim(),
    email: (input.email ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    avatarUrl: (input.avatarUrl ?? "").trim(),
    avatarKey: (input.avatarKey ?? "").trim(),
    status: input.status,
  });

  return LeadershipModel.findById(created._id).lean() as any;
}

export async function updateLeadership(
  id: string,
  input: LeadershipInput,
): Promise<ILeadership> {
  if (!Types.ObjectId.isValid(id)) throw leadershipError("Invalid ID", 400);

  const existing = await LeadershipModel.findById(id);
  if (!existing) throw leadershipError("Leadership record not found", 404);

  existing.name = input.name.trim();
  existing.position = (input.position ?? existing.position ?? "").trim();
  existing.email = (input.email ?? existing.email ?? "").trim();
  existing.phone = (input.phone ?? existing.phone ?? "").trim();

  if (input.avatarUrl !== undefined) {
    existing.avatarUrl = input.avatarUrl.trim();
  }
  if (input.avatarKey !== undefined) {
    existing.avatarKey = input.avatarKey.trim();
  }

  existing.status = input.status;

  await existing.save();

  return LeadershipModel.findById(id).lean() as any;
}

export async function deleteLeadership(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw leadershipError("Invalid ID", 400);

  const existing = await LeadershipModel.findById(id);
  if (!existing) throw leadershipError("Leadership record not found", 404);

  // Clean up the avatar from R2 if one exists
  if (existing.avatarKey) {
    deleteObjectFromR2(existing.avatarKey).catch(() => {
      // Non-fatal — record is deleted regardless
    });
  }

  await existing.deleteOne();
}

export async function uploadLeadershipAvatar(
  input: LeadershipUploadInput,
): Promise<UploadedObject> {
  return uploadBase64ImageToR2({
    ...input,
    folder: "leadership",
  });
}
