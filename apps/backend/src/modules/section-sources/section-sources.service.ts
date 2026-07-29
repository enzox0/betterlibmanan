import { Types } from "mongoose";
import {
  SectionSourceModel,
  type SectionKey,
  type ISectionSource,
} from "./section-sources.model";

function srcError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function validId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw srcError("Invalid ID", 400);
}

export interface SectionSourceInput {
  section: SectionKey;
  label: string;
  url: string;
}

/** Return all sources (one per section, latest wins) */
export async function listAllSources(): Promise<ISectionSource[]> {
  return SectionSourceModel.find()
    .sort({ section: 1, updatedAt: -1 })
    .lean() as any;
}

/** Return sources for a given section (latest first) */
export async function listSourcesBySection(
  section: SectionKey,
): Promise<ISectionSource[]> {
  return SectionSourceModel.find({ section })
    .sort({ updatedAt: -1 })
    .lean() as any;
}

/** Upsert: one canonical record per section */
export async function upsertSource(
  input: SectionSourceInput,
): Promise<ISectionSource> {
  const doc = await SectionSourceModel.findOneAndUpdate(
    { section: input.section },
    { label: input.label.trim(), url: input.url.trim() },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return doc as any;
}

/** Create a new source record (admin creates, previous one is replaced via upsert in practice) */
export async function createSource(
  input: SectionSourceInput,
): Promise<ISectionSource> {
  return upsertSource(input);
}

export async function updateSource(
  id: string,
  input: SectionSourceInput,
): Promise<ISectionSource> {
  validId(id);
  const existing = await SectionSourceModel.findById(id);
  if (!existing) throw srcError("Source not found", 404);
  existing.section = input.section;
  existing.label = input.label.trim();
  existing.url = input.url.trim();
  await existing.save();
  return SectionSourceModel.findById(id).lean() as any;
}

export async function deleteSource(id: string): Promise<void> {
  validId(id);
  const existing = await SectionSourceModel.findById(id);
  if (!existing) throw srcError("Source not found", 404);
  await existing.deleteOne();
}
