import { Types } from "mongoose";
import { BarangayMapModel } from "../barangay-map/barangay-map.model";
import {
  MunicipalStatModel,
  FinanceStatModel,
  FinanceCompositionModel,
  PopulationPointModel,
  BarangayModel,
  EconomyIndicatorModel,
  EconomySectorModel,
  PovertyEntryModel,
  CompetitivenessItemModel,
  type IMunicipalStat,
  type IFinanceStat,
  type IFinanceComposition,
  type IPopulationPoint,
  type IBarangay,
  type IEconomyIndicator,
  type IEconomySector,
  type IPovertyEntry,
  type ICompetitivenessItem,
  type PovertyStatus,
} from "./statistics.model";

function statsError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function validId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw statsError("Invalid ID", 400);
}

// ─── Municipal Stats ──────────────────────────────────────────────────────────

export interface MunicipalStatInput {
  value: string;
  label: string;
  subLabel?: string;
  order?: number;
}

export async function listMunicipalStats(): Promise<IMunicipalStat[]> {
  return MunicipalStatModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createMunicipalStat(
  input: MunicipalStatInput,
): Promise<IMunicipalStat> {
  const created = await MunicipalStatModel.create({
    value: input.value.trim(),
    label: input.label.trim(),
    subLabel: (input.subLabel ?? "").trim(),
    order: input.order ?? 0,
  });
  return MunicipalStatModel.findById(created._id).lean() as any;
}

export async function updateMunicipalStat(
  id: string,
  input: MunicipalStatInput,
): Promise<IMunicipalStat> {
  validId(id);
  const existing = await MunicipalStatModel.findById(id);
  if (!existing) throw statsError("Municipal stat not found", 404);
  existing.value = input.value.trim();
  existing.label = input.label.trim();
  existing.subLabel = (input.subLabel ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return MunicipalStatModel.findById(id).lean() as any;
}

export async function deleteMunicipalStat(id: string): Promise<void> {
  validId(id);
  const existing = await MunicipalStatModel.findById(id);
  if (!existing) throw statsError("Municipal stat not found", 404);
  await existing.deleteOne();
}

// ─── Finance Stats ────────────────────────────────────────────────────────────

export interface FinanceStatInput {
  label: string;
  value: string;
  subValue?: string;
  order?: number;
}

export async function listFinanceStats(): Promise<IFinanceStat[]> {
  return FinanceStatModel.find().sort({ order: 1, createdAt: 1 }).lean() as any;
}

export async function createFinanceStat(
  input: FinanceStatInput,
): Promise<IFinanceStat> {
  const created = await FinanceStatModel.create({
    label: input.label.trim(),
    value: input.value.trim(),
    subValue: (input.subValue ?? "").trim(),
    order: input.order ?? 0,
  });
  return FinanceStatModel.findById(created._id).lean() as any;
}

export async function updateFinanceStat(
  id: string,
  input: FinanceStatInput,
): Promise<IFinanceStat> {
  validId(id);
  const existing = await FinanceStatModel.findById(id);
  if (!existing) throw statsError("Finance stat not found", 404);
  existing.label = input.label.trim();
  existing.value = input.value.trim();
  existing.subValue = (input.subValue ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return FinanceStatModel.findById(id).lean() as any;
}

export async function deleteFinanceStat(id: string): Promise<void> {
  validId(id);
  const existing = await FinanceStatModel.findById(id);
  if (!existing) throw statsError("Finance stat not found", 404);
  await existing.deleteOne();
}

// ─── Finance Composition ──────────────────────────────────────────────────────

export interface FinanceCompositionInput {
  label: string;
  percentage: number;
  color: string;
  order?: number;
}

export async function listFinanceComposition(): Promise<IFinanceComposition[]> {
  return FinanceCompositionModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createFinanceComposition(
  input: FinanceCompositionInput,
): Promise<IFinanceComposition> {
  const created = await FinanceCompositionModel.create({
    label: input.label.trim(),
    percentage: Math.min(100, Math.max(0, input.percentage)),
    color: input.color.trim(),
    order: input.order ?? 0,
  });
  return FinanceCompositionModel.findById(created._id).lean() as any;
}

export async function updateFinanceComposition(
  id: string,
  input: FinanceCompositionInput,
): Promise<IFinanceComposition> {
  validId(id);
  const existing = await FinanceCompositionModel.findById(id);
  if (!existing) throw statsError("Finance composition item not found", 404);
  existing.label = input.label.trim();
  existing.percentage = Math.min(100, Math.max(0, input.percentage));
  existing.color = input.color.trim();
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return FinanceCompositionModel.findById(id).lean() as any;
}

export async function deleteFinanceComposition(id: string): Promise<void> {
  validId(id);
  const existing = await FinanceCompositionModel.findById(id);
  if (!existing) throw statsError("Finance composition item not found", 404);
  await existing.deleteOne();
}

// ─── Population History ───────────────────────────────────────────────────────

export interface PopulationPointInput {
  year: number;
  pop: number;
}

export async function listPopulationHistory(): Promise<IPopulationPoint[]> {
  return PopulationPointModel.find().sort({ year: 1 }).lean() as any;
}

export async function createPopulationPoint(
  input: PopulationPointInput,
): Promise<IPopulationPoint> {
  const existing = await PopulationPointModel.findOne({ year: input.year });
  if (existing)
    throw statsError(`A data point for year ${input.year} already exists`, 409);
  const created = await PopulationPointModel.create({
    year: input.year,
    pop: input.pop,
  });
  return PopulationPointModel.findById(created._id).lean() as any;
}

export async function updatePopulationPoint(
  id: string,
  input: PopulationPointInput,
): Promise<IPopulationPoint> {
  validId(id);
  const existing = await PopulationPointModel.findById(id);
  if (!existing) throw statsError("Population point not found", 404);

  // Check year uniqueness if year changed
  if (existing.year !== input.year) {
    const clash = await PopulationPointModel.findOne({
      year: input.year,
      _id: { $ne: id },
    });
    if (clash)
      throw statsError(
        `A data point for year ${input.year} already exists`,
        409,
      );
  }

  existing.year = input.year;
  existing.pop = input.pop;
  await existing.save();
  return PopulationPointModel.findById(id).lean() as any;
}

export async function deletePopulationPoint(id: string): Promise<void> {
  validId(id);
  const existing = await PopulationPointModel.findById(id);
  if (!existing) throw statsError("Population point not found", 404);
  await existing.deleteOne();
}

// ─── Barangays ────────────────────────────────────────────────────────────────

export interface BarangayInput {
  name: string;
  population: number;
}

/** Sync barangay population to BarangayMapModel (home module) */
async function syncBarangayPopulationToMap(
  name: string,
  population: number,
): Promise<void> {
  // Format population with commas for display
  const formattedPopulation = population.toLocaleString();

  // Find BarangayMap record by name (case-insensitive)
  const barangayMap = await BarangayMapModel.findOne({
    name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
  });

  if (barangayMap) {
    barangayMap.population = formattedPopulation;
    await barangayMap.save();
  }
}

/** Re-rank all barangays by descending population */
async function reRankBarangays(): Promise<void> {
  const all = await BarangayModel.find().sort({ population: -1 }).lean();
  const ops = all.map((b: any, i: number) => ({
    updateOne: {
      filter: { _id: b._id },
      update: { $set: { rank: i + 1 } },
    },
  }));
  if (ops.length) await BarangayModel.bulkWrite(ops);
}

export async function listBarangays(): Promise<IBarangay[]> {
  return BarangayModel.find().sort({ rank: 1 }).lean() as any;
}

export async function createBarangay(
  input: BarangayInput,
): Promise<IBarangay[]> {
  const existing = await BarangayModel.findOne({
    name: { $regex: new RegExp(`^${input.name.trim()}$`, "i") },
  });
  if (existing)
    throw statsError(`Barangay "${input.name}" already exists`, 409);

  await BarangayModel.create({
    rank: 0, // temporary — reRankBarangays will fix this
    name: input.name.trim(),
    population: input.population,
  });

  // Sync to BarangayMap
  await syncBarangayPopulationToMap(input.name.trim(), input.population);

  await reRankBarangays();
  return listBarangays();
}

export async function updateBarangay(
  id: string,
  input: BarangayInput,
): Promise<IBarangay[]> {
  validId(id);
  const existing = await BarangayModel.findById(id);
  if (!existing) throw statsError("Barangay not found", 404);

  // Check name uniqueness if changed
  if (existing.name.toLowerCase() !== input.name.trim().toLowerCase()) {
    const clash = await BarangayModel.findOne({
      name: { $regex: new RegExp(`^${input.name.trim()}$`, "i") },
      _id: { $ne: id },
    });
    if (clash) throw statsError(`Barangay "${input.name}" already exists`, 409);
  }

  existing.name = input.name.trim();
  existing.population = input.population;
  await existing.save();

  // Sync to BarangayMap
  await syncBarangayPopulationToMap(input.name.trim(), input.population);

  await reRankBarangays();
  return listBarangays();
}

export async function deleteBarangay(id: string): Promise<IBarangay[]> {
  validId(id);
  const existing = await BarangayModel.findById(id);
  if (!existing) throw statsError("Barangay not found", 404);
  await existing.deleteOne();
  await reRankBarangays();
  return listBarangays();
}

// ─── Economy Indicators ───────────────────────────────────────────────────────

export interface EconomyIndicatorInput {
  label: string;
  value: string;
  subLabel?: string;
  order?: number;
}

export async function listEconomyIndicators(): Promise<IEconomyIndicator[]> {
  return EconomyIndicatorModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createEconomyIndicator(
  input: EconomyIndicatorInput,
): Promise<IEconomyIndicator> {
  const created = await EconomyIndicatorModel.create({
    label: input.label.trim(),
    value: input.value.trim(),
    subLabel: (input.subLabel ?? "").trim(),
    order: input.order ?? 0,
  });
  return EconomyIndicatorModel.findById(created._id).lean() as any;
}

export async function updateEconomyIndicator(
  id: string,
  input: EconomyIndicatorInput,
): Promise<IEconomyIndicator> {
  validId(id);
  const existing = await EconomyIndicatorModel.findById(id);
  if (!existing) throw statsError("Economy indicator not found", 404);
  existing.label = input.label.trim();
  existing.value = input.value.trim();
  existing.subLabel = (input.subLabel ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return EconomyIndicatorModel.findById(id).lean() as any;
}

export async function deleteEconomyIndicator(id: string): Promise<void> {
  validId(id);
  const existing = await EconomyIndicatorModel.findById(id);
  if (!existing) throw statsError("Economy indicator not found", 404);
  await existing.deleteOne();
}

// ─── Economy Sectors ──────────────────────────────────────────────────────────

export interface EconomySectorInput {
  name: string;
  percentage: number;
  order?: number;
}

export async function listEconomySectors(): Promise<IEconomySector[]> {
  return EconomySectorModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createEconomySector(
  input: EconomySectorInput,
): Promise<IEconomySector> {
  const created = await EconomySectorModel.create({
    name: input.name.trim(),
    percentage: Math.min(100, Math.max(0, input.percentage)),
    order: input.order ?? 0,
  });
  return EconomySectorModel.findById(created._id).lean() as any;
}

export async function updateEconomySector(
  id: string,
  input: EconomySectorInput,
): Promise<IEconomySector> {
  validId(id);
  const existing = await EconomySectorModel.findById(id);
  if (!existing) throw statsError("Economy sector not found", 404);
  existing.name = input.name.trim();
  existing.percentage = Math.min(100, Math.max(0, input.percentage));
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return EconomySectorModel.findById(id).lean() as any;
}

export async function deleteEconomySector(id: string): Promise<void> {
  validId(id);
  const existing = await EconomySectorModel.findById(id);
  if (!existing) throw statsError("Economy sector not found", 404);
  await existing.deleteOne();
}

// ─── Poverty Entries ──────────────────────────────────────────────────────────

export interface PovertyEntryInput {
  year: number;
  rate: number;
  confidenceInterval?: string;
  change?: number;
  status: PovertyStatus;
}

export async function listPovertyEntries(): Promise<IPovertyEntry[]> {
  return PovertyEntryModel.find().sort({ year: 1 }).lean() as any;
}

export async function createPovertyEntry(
  input: PovertyEntryInput,
): Promise<IPovertyEntry> {
  const existing = await PovertyEntryModel.findOne({ year: input.year });
  if (existing)
    throw statsError(
      `A poverty entry for year ${input.year} already exists`,
      409,
    );
  const created = await PovertyEntryModel.create({
    year: input.year,
    rate: input.rate,
    confidenceInterval: (input.confidenceInterval ?? "").trim(),
    change: input.change ?? 0,
    status: input.status,
  });
  return PovertyEntryModel.findById(created._id).lean() as any;
}

export async function updatePovertyEntry(
  id: string,
  input: PovertyEntryInput,
): Promise<IPovertyEntry> {
  validId(id);
  const existing = await PovertyEntryModel.findById(id);
  if (!existing) throw statsError("Poverty entry not found", 404);

  if (existing.year !== input.year) {
    const clash = await PovertyEntryModel.findOne({
      year: input.year,
      _id: { $ne: id },
    });
    if (clash)
      throw statsError(
        `A poverty entry for year ${input.year} already exists`,
        409,
      );
  }

  existing.year = input.year;
  existing.rate = input.rate;
  existing.confidenceInterval = (input.confidenceInterval ?? "").trim();
  existing.change = input.change ?? 0;
  existing.status = input.status;
  await existing.save();
  return PovertyEntryModel.findById(id).lean() as any;
}

export async function deletePovertyEntry(id: string): Promise<void> {
  validId(id);
  const existing = await PovertyEntryModel.findById(id);
  if (!existing) throw statsError("Poverty entry not found", 404);
  await existing.deleteOne();
}

// ─── Competitiveness Items ────────────────────────────────────────────────────

export interface CompetitivenessItemInput {
  category: string;
  score: number;
  change?: number;
  changeLabel?: string;
  order?: number;
}

export async function listCompetitivenessItems(): Promise<
  ICompetitivenessItem[]
> {
  return CompetitivenessItemModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean() as any;
}

export async function createCompetitivenessItem(
  input: CompetitivenessItemInput,
): Promise<ICompetitivenessItem> {
  const created = await CompetitivenessItemModel.create({
    category: input.category.trim(),
    score: input.score,
    change: input.change ?? 0,
    changeLabel: (input.changeLabel ?? "").trim(),
    order: input.order ?? 0,
  });
  return CompetitivenessItemModel.findById(created._id).lean() as any;
}

export async function updateCompetitivenessItem(
  id: string,
  input: CompetitivenessItemInput,
): Promise<ICompetitivenessItem> {
  validId(id);
  const existing = await CompetitivenessItemModel.findById(id);
  if (!existing) throw statsError("Competitiveness item not found", 404);
  existing.category = input.category.trim();
  existing.score = input.score;
  existing.change = input.change ?? 0;
  existing.changeLabel = (input.changeLabel ?? "").trim();
  if (input.order !== undefined) existing.order = input.order;
  await existing.save();
  return CompetitivenessItemModel.findById(id).lean() as any;
}

export async function deleteCompetitivenessItem(id: string): Promise<void> {
  validId(id);
  const existing = await CompetitivenessItemModel.findById(id);
  if (!existing) throw statsError("Competitiveness item not found", 404);
  await existing.deleteOne();
}
