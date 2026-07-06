import { Types } from "mongoose";
import {
  ExecutiveOfficialModel,
  LegislativeMemberModel,
  MunicipalOfficeModel,
  BarangayModel,
  type IExecutiveOfficial,
  type ILegislativeMember,
  type IMunicipalOffice,
  type IBarangay,
} from "./government.model";

// ─── Error helper ─────────────────────────────────────────────────────────────

function govError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function validateId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw govError("Invalid ID", 400);
}

// ─── Input types ──────────────────────────────────────────────────────────────

export interface ExecutiveOfficialInput {
  title: string;
  name: string;
  email?: string;
  phone?: string;
  hours?: string;
  order?: number;
}

export interface LegislativeMemberInput {
  name: string;
  position: string;
  committees?: string[];
  order?: number;
}

export interface MunicipalOfficeInput {
  name: string;
  description: string;
  phone?: string;
  email?: string;
  link?: string;
  order?: number;
}

export interface BarangayInput {
  name: string;
  captain: string;
  phone: string;
  order?: number;
}

// ─── Executive Officials ──────────────────────────────────────────────────────

export async function listExecutiveOfficials(): Promise<IExecutiveOfficial[]> {
  return ExecutiveOfficialModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createExecutiveOfficial(
  input: ExecutiveOfficialInput,
): Promise<IExecutiveOfficial> {
  const created = await ExecutiveOfficialModel.create({
    title: input.title.trim(),
    name: input.name.trim(),
    email: (input.email ?? "").trim(),
    phone: (input.phone ?? "").trim(),
    hours: (input.hours ?? "").trim(),
    order: input.order ?? 0,
  });
  return ExecutiveOfficialModel.findById(created._id).lean() as any;
}

export async function updateExecutiveOfficial(
  id: string,
  input: ExecutiveOfficialInput,
): Promise<IExecutiveOfficial> {
  validateId(id);
  const existing = await ExecutiveOfficialModel.findById(id);
  if (!existing) throw govError("Executive official not found", 404);

  existing.title = input.title.trim();
  existing.name = input.name.trim();
  existing.email = (input.email ?? existing.email ?? "").trim();
  existing.phone = (input.phone ?? existing.phone ?? "").trim();
  existing.hours = (input.hours ?? existing.hours ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return ExecutiveOfficialModel.findById(id).lean() as any;
}

export async function deleteExecutiveOfficial(id: string): Promise<void> {
  validateId(id);
  const existing = await ExecutiveOfficialModel.findById(id);
  if (!existing) throw govError("Executive official not found", 404);
  await existing.deleteOne();
}

// ─── Legislative Members ──────────────────────────────────────────────────────

export async function listLegislativeMembers(): Promise<ILegislativeMember[]> {
  return LegislativeMemberModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createLegislativeMember(
  input: LegislativeMemberInput,
): Promise<ILegislativeMember> {
  const created = await LegislativeMemberModel.create({
    name: input.name.trim(),
    position: input.position.trim(),
    committees: (input.committees ?? []).map((c) => c.trim()).filter(Boolean),
    order: input.order ?? 0,
  });
  return LegislativeMemberModel.findById(created._id).lean() as any;
}

export async function updateLegislativeMember(
  id: string,
  input: LegislativeMemberInput,
): Promise<ILegislativeMember> {
  validateId(id);
  const existing = await LegislativeMemberModel.findById(id);
  if (!existing) throw govError("Legislative member not found", 404);

  existing.name = input.name.trim();
  existing.position = input.position.trim();
  existing.committees = (input.committees ?? existing.committees ?? [])
    .map((c) => c.trim())
    .filter(Boolean);
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return LegislativeMemberModel.findById(id).lean() as any;
}

export async function deleteLegislativeMember(id: string): Promise<void> {
  validateId(id);
  const existing = await LegislativeMemberModel.findById(id);
  if (!existing) throw govError("Legislative member not found", 404);
  await existing.deleteOne();
}

// ─── Municipal Offices ────────────────────────────────────────────────────────

export async function listMunicipalOffices(): Promise<IMunicipalOffice[]> {
  return MunicipalOfficeModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createMunicipalOffice(
  input: MunicipalOfficeInput,
): Promise<IMunicipalOffice> {
  const created = await MunicipalOfficeModel.create({
    name: input.name.trim(),
    description: input.description.trim(),
    phone: (input.phone ?? "").trim(),
    email: (input.email ?? "").trim(),
    link: (input.link ?? "").trim(),
    order: input.order ?? 0,
  });
  return MunicipalOfficeModel.findById(created._id).lean() as any;
}

export async function updateMunicipalOffice(
  id: string,
  input: MunicipalOfficeInput,
): Promise<IMunicipalOffice> {
  validateId(id);
  const existing = await MunicipalOfficeModel.findById(id);
  if (!existing) throw govError("Municipal office not found", 404);

  existing.name = input.name.trim();
  existing.description = input.description.trim();
  existing.phone = (input.phone ?? existing.phone ?? "").trim();
  existing.email = (input.email ?? existing.email ?? "").trim();
  existing.link = (input.link ?? existing.link ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return MunicipalOfficeModel.findById(id).lean() as any;
}

export async function deleteMunicipalOffice(id: string): Promise<void> {
  validateId(id);
  const existing = await MunicipalOfficeModel.findById(id);
  if (!existing) throw govError("Municipal office not found", 404);
  await existing.deleteOne();
}

// ─── Barangays ────────────────────────────────────────────────────────────────

export async function listBarangays(): Promise<IBarangay[]> {
  return BarangayModel.find().sort({ order: 1, name: 1 }).lean() as any;
}

export async function createBarangay(input: BarangayInput): Promise<IBarangay> {
  const created = await BarangayModel.create({
    name: input.name.trim(),
    captain: input.captain.trim(),
    phone: input.phone.trim(),
    order: input.order ?? 0,
  });
  return BarangayModel.findById(created._id).lean() as any;
}

export async function updateBarangay(
  id: string,
  input: BarangayInput,
): Promise<IBarangay> {
  validateId(id);
  const existing = await BarangayModel.findById(id);
  if (!existing) throw govError("Barangay not found", 404);

  existing.name = input.name.trim();
  existing.captain = input.captain.trim();
  existing.phone = input.phone.trim();
  if (input.order !== undefined) existing.order = input.order;

  await existing.save();
  return BarangayModel.findById(id).lean() as any;
}

export async function deleteBarangay(id: string): Promise<void> {
  validateId(id);
  const existing = await BarangayModel.findById(id);
  if (!existing) throw govError("Barangay not found", 404);
  await existing.deleteOne();
}
