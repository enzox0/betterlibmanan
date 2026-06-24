import { Types } from "mongoose";
import {
  EmergencyContactModel,
  type EmergencyContactStatus,
  type IEmergencyContact,
} from "./emergency-contacts.model";

export interface EmergencyContactInput {
  name: string;
  number: string;
  icon?: string;
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
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllEmergencyContacts(): Promise<IEmergencyContact[]> {
  return EmergencyContactModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createEmergencyContact(
  input: EmergencyContactInput,
): Promise<IEmergencyContact> {
  const created = await EmergencyContactModel.create({
    name: input.name.trim(),
    number: input.number.trim(),
    icon: input.icon ?? "",
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
  existing.icon = input.icon ?? existing.icon;
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
