import { Types } from "mongoose";
import {
  ContactModel,
  type ContactStatus,
  type ContactType,
  type IContact,
} from "./contact.model";

export interface ContactInput {
  label: string;
  value: string;
  href?: string;
  description?: string;
  type?: ContactType;
  order?: number;
  status: ContactStatus;
}

function contactError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedContacts(): Promise<IContact[]> {
  return ContactModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllContacts(): Promise<IContact[]> {
  return ContactModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createContact(input: ContactInput): Promise<IContact> {
  const created = await ContactModel.create({
    label: input.label.trim(),
    value: input.value.trim(),
    href: (input.href ?? "").trim(),
    description: (input.description ?? "").trim(),
    type: input.type ?? "phone",
    order: input.order ?? 0,
    status: input.status,
  });

  return ContactModel.findById(created._id).lean() as any;
}

export async function updateContact(
  id: string,
  input: ContactInput,
): Promise<IContact> {
  if (!Types.ObjectId.isValid(id)) throw contactError("Invalid ID", 400);

  const existing = await ContactModel.findById(id);
  if (!existing) throw contactError("Contact record not found", 404);

  existing.label = input.label.trim();
  existing.value = input.value.trim();
  existing.href = (input.href ?? existing.href ?? "").trim();
  existing.description = (
    input.description ??
    existing.description ??
    ""
  ).trim();
  existing.type = input.type ?? existing.type;
  if (input.order !== undefined) existing.order = input.order;
  existing.status = input.status;

  await existing.save();

  return ContactModel.findById(id).lean() as any;
}

export async function deleteContact(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw contactError("Invalid ID", 400);

  const existing = await ContactModel.findById(id);
  if (!existing) throw contactError("Contact record not found", 404);

  await existing.deleteOne();
}
