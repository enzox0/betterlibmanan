import { Types } from "mongoose";
import {
  SocialLinkModel,
  type SocialLinkPlatform,
  type ISocialLink,
} from "./social-links.model";

export interface SocialLinkInput {
  name: string;
  href: string;
  platform?: SocialLinkPlatform;
  order?: number;
}

function socialError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listAllSocialLinks(): Promise<ISocialLink[]> {
  return SocialLinkModel.find().sort({ order: 1, createdAt: 1 }).lean() as any;
}

export async function createSocialLink(
  input: SocialLinkInput,
): Promise<ISocialLink> {
  const created = await SocialLinkModel.create({
    name: input.name.trim(),
    href: input.href.trim(),
    platform: input.platform ?? "other",
    order: input.order ?? 0,
  });
  return SocialLinkModel.findById(created._id).lean() as any;
}

export async function updateSocialLink(
  id: string,
  input: SocialLinkInput,
): Promise<ISocialLink> {
  if (!Types.ObjectId.isValid(id)) throw socialError("Invalid ID", 400);
  const existing = await SocialLinkModel.findById(id);
  if (!existing) throw socialError("Social link not found", 404);

  existing.name = input.name.trim();
  existing.href = input.href.trim();
  existing.platform = input.platform ?? existing.platform;
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return SocialLinkModel.findById(id).lean() as any;
}

export async function deleteSocialLink(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw socialError("Invalid ID", 400);
  const existing = await SocialLinkModel.findById(id);
  if (!existing) throw socialError("Social link not found", 404);
  await existing.deleteOne();
}
