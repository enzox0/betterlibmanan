import { Types } from "mongoose";
import {
  OfficeDirectoryModel,
  type IOfficeDirectory,
} from "./office-directory.model";

export interface OfficeDirectoryInput {
  name: string;
  number: string;
  order?: number;
}

function officeError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listAllOffices(): Promise<IOfficeDirectory[]> {
  return OfficeDirectoryModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createOffice(
  input: OfficeDirectoryInput,
): Promise<IOfficeDirectory> {
  const created = await OfficeDirectoryModel.create({
    name: input.name.trim(),
    number: input.number.trim(),
    order: input.order ?? 0,
  });
  return OfficeDirectoryModel.findById(created._id).lean() as any;
}

export async function updateOffice(
  id: string,
  input: OfficeDirectoryInput,
): Promise<IOfficeDirectory> {
  if (!Types.ObjectId.isValid(id)) throw officeError("Invalid ID", 400);
  const existing = await OfficeDirectoryModel.findById(id);
  if (!existing) throw officeError("Office not found", 404);

  existing.name = input.name.trim();
  existing.number = input.number.trim();
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return OfficeDirectoryModel.findById(id).lean() as any;
}

export async function deleteOffice(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw officeError("Invalid ID", 400);
  const existing = await OfficeDirectoryModel.findById(id);
  if (!existing) throw officeError("Office not found", 404);
  await existing.deleteOne();
}
