import { Types } from "mongoose";
import {
  MedicalContactModel,
  type MedicalContactStatus,
  type IMedicalContact,
} from "./medical-contacts.model";

export interface MedicalContactInput {
  name: string;
  number: string;
  description?: string;
  order?: number;
  status: MedicalContactStatus;
}

function medicalError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedMedicalContacts(): Promise<
  IMedicalContact[]
> {
  return MedicalContactModel.find({ status: "published" })
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function listAllMedicalContacts(): Promise<IMedicalContact[]> {
  return MedicalContactModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createMedicalContact(
  input: MedicalContactInput,
): Promise<IMedicalContact> {
  const created = await MedicalContactModel.create({
    name: input.name.trim(),
    number: input.number.trim(),
    description: (input.description ?? "").trim(),
    order: input.order ?? 0,
    status: input.status,
  });
  return MedicalContactModel.findById(created._id).lean() as any;
}

export async function updateMedicalContact(
  id: string,
  input: MedicalContactInput,
): Promise<IMedicalContact> {
  if (!Types.ObjectId.isValid(id)) throw medicalError("Invalid ID", 400);
  const existing = await MedicalContactModel.findById(id);
  if (!existing) throw medicalError("Medical contact not found", 404);

  existing.name = input.name.trim();
  existing.number = input.number.trim();
  existing.description = (
    input.description ??
    existing.description ??
    ""
  ).trim();
  if (input.order !== undefined) existing.order = input.order;
  existing.status = input.status;

  await existing.save();
  return MedicalContactModel.findById(id).lean() as any;
}

export async function deleteMedicalContact(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw medicalError("Invalid ID", 400);
  const existing = await MedicalContactModel.findById(id);
  if (!existing) throw medicalError("Medical contact not found", 404);
  await existing.deleteOne();
}
