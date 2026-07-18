import { Types } from "mongoose";
import {
  EmergencyContactModel,
  type EmergencyContactStatus,
  type EmergencyContactCategory,
  type IEmergencyContact,
} from "./emergency-contacts.model";

export interface EmergencyContactInput {
  name: string;
  number: string;
  description?: string;
  category?: EmergencyContactCategory;
  icon?: string;
  order?: number;
  status: EmergencyContactStatus;
}

function emergencyContactError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedEmergencyContacts(): Promise<
  IEmergencyContact[]
> {
  return EmergencyContactModel.find({ status: "published" })
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function listAllEmergencyContacts(): Promise<IEmergencyContact[]> {
  return EmergencyContactModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createEmergencyContact(
  input: EmergencyContactInput,
): Promise<IEmergencyContact> {
  const created = await EmergencyContactModel.create({
    name: input.name.trim(),
    number: input.number.trim(),
    description: (input.description ?? "").trim(),
    category: input.category ?? "other",
    icon: (input.icon ?? "").trim(),
    order: input.order ?? 0,
    status: input.status,
  });
  return EmergencyContactModel.findById(created._id).lean() as any;
}

export async function updateEmergencyContact(
  id: string,
  input: EmergencyContactInput,
): Promise<IEmergencyContact> {
  if (!Types.ObjectId.isValid(id))
    throw emergencyContactError("Invalid ID", 400);

  const existing = await EmergencyContactModel.findById(id);
  if (!existing)
    throw emergencyContactError("Emergency contact not found", 404);

  existing.name = input.name.trim();
  existing.number = input.number.trim();
  existing.description = (
    input.description ??
    existing.description ??
    ""
  ).trim();
  existing.category = input.category ?? existing.category;
  existing.icon = (input.icon ?? existing.icon ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;
  existing.status = input.status;

  await existing.save();
  return EmergencyContactModel.findById(id).lean() as any;
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id))
    throw emergencyContactError("Invalid ID", 400);

  const existing = await EmergencyContactModel.findById(id);
  if (!existing)
    throw emergencyContactError("Emergency contact not found", 404);

  await existing.deleteOne();
}
