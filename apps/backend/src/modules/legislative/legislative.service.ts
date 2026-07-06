import { Types } from "mongoose";
import {
  OrdinanceModel,
  ResolutionModel,
  ProcessStepModel,
  AboutPointModel,
  LegislativeSettingsModel,
  type IOrdinance,
  type IResolution,
  type IProcessStep,
  type IAboutPoint,
  type ILegislativeSettings,
  type ProcessStepVariant,
} from "./legislative.model";

function legislativeError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  ordinanceDescription:
    "Municipal ordinances enacted by the Sangguniang Bayan — local laws that govern the municipality and its residents.",
  ordinanceDefinition:
    "A municipal ordinance is a local law enacted by the Sangguniang Bayan (Municipal Council) that governs the municipality and its residents. Ordinances have the force and effect of law within the territorial jurisdiction of the municipality.",
  ordinanceCategories: [
    "Revenue & Taxation",
    "Business & Trade",
    "Public Safety",
    "Environment",
    "Traffic & Transportation",
    "Zoning & Land Use",
  ],
  ordinanceExternalLink: "https://sangguniangbayan.libmanan.gov.ph/",
  resolutionDescription:
    "Resolutions passed by the Sangguniang Bayan expressing the will or opinion of the legislative body on various matters.",
  resolutionDefinition:
    "A resolution is a formal expression of the opinion or will of the Sangguniang Bayan. Unlike ordinances, resolutions do not have the force and effect of law but serve as official statements of the legislative body.",
  resolutionTypes: [
    "Commendation",
    "Request/Appeal",
    "Support/Endorsement",
    "Condolence",
    "Authorization",
    "Appropriation",
  ],
  resolutionExternalLink: "https://sangguniangbayan.libmanan.gov.ph/",
  aboutTitle: "Understanding Local Legislation",
  aboutDescription:
    "Learn about the legislative process of the Sangguniang Bayan",
};

export async function getSettings(): Promise<ILegislativeSettings> {
  let settings = (await LegislativeSettingsModel.findOne().lean()) as any;
  if (!settings) {
    settings = await LegislativeSettingsModel.create(DEFAULT_SETTINGS);
    return LegislativeSettingsModel.findById(settings._id).lean() as any;
  }
  return settings;
}

export interface SettingsInput {
  ordinanceDescription?: string;
  ordinanceDefinition?: string;
  ordinanceCategories?: string[];
  ordinanceExternalLink?: string;
  resolutionDescription?: string;
  resolutionDefinition?: string;
  resolutionTypes?: string[];
  resolutionExternalLink?: string;
  aboutTitle?: string;
  aboutDescription?: string;
}

export async function updateSettings(
  input: SettingsInput,
): Promise<ILegislativeSettings> {
  let settings = await LegislativeSettingsModel.findOne();
  if (!settings) {
    settings = await LegislativeSettingsModel.create({
      ...DEFAULT_SETTINGS,
      ...input,
    });
    return LegislativeSettingsModel.findById(settings._id).lean() as any;
  }

  Object.assign(settings, input);
  await settings.save();
  return LegislativeSettingsModel.findById(settings._id).lean() as any;
}

// ─── Ordinances ───────────────────────────────────────────────────────────────

export async function listOrdinances(): Promise<IOrdinance[]> {
  return OrdinanceModel.find().sort({ createdAt: -1 }).lean() as any;
}

export interface OrdinanceInput {
  number: string;
  title: string;
  sessionDate: string;
}

export async function createOrdinance(
  input: OrdinanceInput,
): Promise<IOrdinance> {
  const created = await OrdinanceModel.create({
    number: input.number.trim(),
    title: input.title.trim(),
    sessionDate: input.sessionDate.trim(),
  });
  return OrdinanceModel.findById(created._id).lean() as any;
}

export async function updateOrdinance(
  id: string,
  input: OrdinanceInput,
): Promise<IOrdinance> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await OrdinanceModel.findById(id);
  if (!existing) throw legislativeError("Ordinance not found", 404);

  existing.number = input.number.trim();
  existing.title = input.title.trim();
  existing.sessionDate = input.sessionDate.trim();
  await existing.save();

  return OrdinanceModel.findById(id).lean() as any;
}

export async function deleteOrdinance(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await OrdinanceModel.findById(id);
  if (!existing) throw legislativeError("Ordinance not found", 404);

  await existing.deleteOne();
}

// ─── Resolutions ──────────────────────────────────────────────────────────────

export async function listResolutions(): Promise<IResolution[]> {
  return ResolutionModel.find().sort({ createdAt: -1 }).lean() as any;
}

export interface ResolutionInput {
  number: string;
  title: string;
  sessionDate: string;
}

export async function createResolution(
  input: ResolutionInput,
): Promise<IResolution> {
  const created = await ResolutionModel.create({
    number: input.number.trim(),
    title: input.title.trim(),
    sessionDate: input.sessionDate.trim(),
  });
  return ResolutionModel.findById(created._id).lean() as any;
}

export async function updateResolution(
  id: string,
  input: ResolutionInput,
): Promise<IResolution> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await ResolutionModel.findById(id);
  if (!existing) throw legislativeError("Resolution not found", 404);

  existing.number = input.number.trim();
  existing.title = input.title.trim();
  existing.sessionDate = input.sessionDate.trim();
  await existing.save();

  return ResolutionModel.findById(id).lean() as any;
}

export async function deleteResolution(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await ResolutionModel.findById(id);
  if (!existing) throw legislativeError("Resolution not found", 404);

  await existing.deleteOne();
}

// ─── Process Steps ────────────────────────────────────────────────────────────

export async function listProcessSteps(
  variant: ProcessStepVariant,
): Promise<IProcessStep[]> {
  return ProcessStepModel.find({ variant }).sort({ step: 1 }).lean() as any;
}

export interface ProcessStepInput {
  variant: ProcessStepVariant;
  step: number;
  title: string;
  description?: string;
}

export async function createProcessStep(
  input: ProcessStepInput,
): Promise<IProcessStep> {
  const created = await ProcessStepModel.create({
    variant: input.variant,
    step: input.step,
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
  });
  return ProcessStepModel.findById(created._id).lean() as any;
}

export async function updateProcessStep(
  id: string,
  input: ProcessStepInput,
): Promise<IProcessStep> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await ProcessStepModel.findById(id);
  if (!existing) throw legislativeError("Process step not found", 404);

  existing.variant = input.variant;
  existing.step = input.step;
  existing.title = input.title.trim();
  existing.description = (input.description ?? "").trim();
  await existing.save();

  return ProcessStepModel.findById(id).lean() as any;
}

export async function deleteProcessStep(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await ProcessStepModel.findById(id);
  if (!existing) throw legislativeError("Process step not found", 404);

  await existing.deleteOne();
}

/** Replace all steps for a variant in one shot (used after reordering). */
export async function replaceProcessSteps(
  variant: ProcessStepVariant,
  steps: Array<{
    id?: string;
    step: number;
    title: string;
    description: string;
  }>,
): Promise<IProcessStep[]> {
  await ProcessStepModel.deleteMany({ variant });
  const docs = steps.map((s, i) => ({
    variant,
    step: i + 1,
    title: s.title.trim(),
    description: (s.description ?? "").trim(),
  }));
  if (docs.length > 0) {
    await ProcessStepModel.insertMany(docs);
  }
  return ProcessStepModel.find({ variant }).sort({ step: 1 }).lean() as any;
}

// ─── About Points ─────────────────────────────────────────────────────────────

export async function listAboutPoints(): Promise<IAboutPoint[]> {
  return AboutPointModel.find().sort({ createdAt: 1 }).lean() as any;
}

export interface AboutPointInput {
  title: string;
  description: string;
}

export async function createAboutPoint(
  input: AboutPointInput,
): Promise<IAboutPoint> {
  const created = await AboutPointModel.create({
    title: input.title.trim(),
    description: input.description.trim(),
  });
  return AboutPointModel.findById(created._id).lean() as any;
}

export async function updateAboutPoint(
  id: string,
  input: AboutPointInput,
): Promise<IAboutPoint> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await AboutPointModel.findById(id);
  if (!existing) throw legislativeError("About point not found", 404);

  existing.title = input.title.trim();
  existing.description = input.description.trim();
  await existing.save();

  return AboutPointModel.findById(id).lean() as any;
}

export async function deleteAboutPoint(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw legislativeError("Invalid ID", 400);

  const existing = await AboutPointModel.findById(id);
  if (!existing) throw legislativeError("About point not found", 404);

  await existing.deleteOne();
}
