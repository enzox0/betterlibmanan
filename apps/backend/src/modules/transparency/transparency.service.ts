import { Types } from "mongoose";
import { DpwhProjectModel, type IDpwhProject } from "./transparency.model";

function transparencyError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectInput {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  province: string;
  region: string;
  contractor: string;
  startDate: string;
  completionDate?: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
}

export interface ProjectListOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function listProjects(
  options: ProjectListOptions = {},
): Promise<{ projects: IDpwhProject[]; total: number; summary: object }> {
  const { page = 1, limit = 50, search, category, status } = options;

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: "i" } },
      { contractId: { $regex: search, $options: "i" } },
      { contractor: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "All") {
    filter.category = category;
  }

  if (status && status !== "All") {
    filter.status = status;
  }

  const total = await DpwhProjectModel.countDocuments(filter);
  const skip = (page - 1) * limit;

  const projects = await DpwhProjectModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Compute summary over the full (unfiltered) collection
  const allProjects = await DpwhProjectModel.find({}).lean();
  const summary = {
    totalProjects: allProjects.length,
    completed: allProjects.filter((p) => p.status === "Completed").length,
    ongoing: allProjects.filter((p) => p.status === "On-Going").length,
    notStarted: allProjects.filter((p) => p.status === "Not Started").length,
    totalBudget: allProjects.reduce((s, p) => s + p.budget, 0),
  };

  return { projects: projects as unknown as IDpwhProject[], total, summary };
}

export async function getProjectById(id: string): Promise<IDpwhProject> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);

  const project = await DpwhProjectModel.findById(id).lean();
  if (!project) throw transparencyError("Project not found", 404);
  return project as unknown as IDpwhProject;
}

export async function createProject(
  input: ProjectInput,
): Promise<IDpwhProject> {
  // Check for duplicate contractId
  const existing = await DpwhProjectModel.findOne({
    contractId: input.contractId.trim(),
  });
  if (existing)
    throw transparencyError(
      `Contract ID "${input.contractId}" already exists`,
      409,
    );

  const created = await DpwhProjectModel.create({
    contractId: input.contractId.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
    status: input.status.trim(),
    budget: input.budget,
    amountPaid: input.amountPaid,
    progress: Math.min(100, Math.max(0, input.progress)),
    province: (input.province ?? "CAMARINES SUR").trim(),
    region: (input.region ?? "Region V").trim(),
    contractor: input.contractor.trim(),
    startDate: input.startDate.trim(),
    completionDate: input.completionDate?.trim() || null,
    infraYear: input.infraYear.trim(),
    programName: input.programName.trim(),
    sourceOfFunds: input.sourceOfFunds.trim(),
  });

  return DpwhProjectModel.findById(created._id).lean() as any;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<IDpwhProject> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);

  const existing = await DpwhProjectModel.findById(id);
  if (!existing) throw transparencyError("Project not found", 404);

  // If contractId changes, check it doesn't clash with another doc
  if (input.contractId.trim() !== existing.contractId) {
    const clash = await DpwhProjectModel.findOne({
      contractId: input.contractId.trim(),
      _id: { $ne: id },
    });
    if (clash)
      throw transparencyError(
        `Contract ID "${input.contractId}" already exists`,
        409,
      );
  }

  existing.contractId = input.contractId.trim();
  existing.description = input.description.trim();
  existing.category = input.category.trim();
  existing.status = input.status.trim();
  existing.budget = input.budget;
  existing.amountPaid = input.amountPaid;
  existing.progress = Math.min(100, Math.max(0, input.progress));
  existing.province = (input.province ?? "CAMARINES SUR").trim();
  existing.region = (input.region ?? "Region V").trim();
  existing.contractor = input.contractor.trim();
  existing.startDate = input.startDate.trim();
  existing.completionDate = input.completionDate?.trim() || null;
  existing.infraYear = input.infraYear.trim();
  existing.programName = input.programName.trim();
  existing.sourceOfFunds = input.sourceOfFunds.trim();

  await existing.save();
  return DpwhProjectModel.findById(id).lean() as any;
}

export async function deleteProject(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);

  const existing = await DpwhProjectModel.findById(id);
  if (!existing) throw transparencyError("Project not found", 404);

  await existing.deleteOne();
}

// ─── Financial Reports ────────────────────────────────────────────────────────

import {
  FinancialReportModel,
  type IFinancialReport,
} from "./transparency.model";

export interface FinancialReportInput {
  fiscalYear: string;
  quarter: string;
  totalIncome: number;
  totalExpenditures: number;
  netOperatingIncome: number;
  fundBalance: number;
  incomeSources: Array<{ source: string; amount: number; percentage: number }>;
  expenditureAllocations: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  reportDate?: string;
}

export async function listFinancialReports(): Promise<IFinancialReport[]> {
  return FinancialReportModel.find()
    .sort({ fiscalYear: -1, quarter: -1 })
    .lean() as any;
}

export async function getFinancialReport(
  id: string,
): Promise<IFinancialReport> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);
  const report = await FinancialReportModel.findById(id).lean();
  if (!report) throw transparencyError("Report not found", 404);
  return report as unknown as IFinancialReport;
}

export async function createFinancialReport(
  input: FinancialReportInput,
): Promise<IFinancialReport> {
  const existing = await FinancialReportModel.findOne({
    fiscalYear: input.fiscalYear.trim(),
    quarter: input.quarter.trim(),
  });
  if (existing)
    throw transparencyError(
      `A report for ${input.fiscalYear} ${input.quarter} already exists`,
      409,
    );

  const created = await FinancialReportModel.create({
    fiscalYear: input.fiscalYear.trim(),
    quarter: input.quarter.trim(),
    totalIncome: input.totalIncome,
    totalExpenditures: input.totalExpenditures,
    netOperatingIncome: input.netOperatingIncome,
    fundBalance: input.fundBalance,
    incomeSources: input.incomeSources ?? [],
    expenditureAllocations: input.expenditureAllocations ?? [],
    reportDate: (input.reportDate ?? "").trim(),
  });
  return FinancialReportModel.findById(created._id).lean() as any;
}

export async function updateFinancialReport(
  id: string,
  input: FinancialReportInput,
): Promise<IFinancialReport> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);

  const existing = await FinancialReportModel.findById(id);
  if (!existing) throw transparencyError("Report not found", 404);

  // Check for clash if fiscalYear/quarter changed
  if (
    input.fiscalYear.trim() !== existing.fiscalYear ||
    input.quarter.trim() !== existing.quarter
  ) {
    const clash = await FinancialReportModel.findOne({
      fiscalYear: input.fiscalYear.trim(),
      quarter: input.quarter.trim(),
      _id: { $ne: id },
    });
    if (clash)
      throw transparencyError(
        `A report for ${input.fiscalYear} ${input.quarter} already exists`,
        409,
      );
  }

  existing.fiscalYear = input.fiscalYear.trim();
  existing.quarter = input.quarter.trim();
  existing.totalIncome = input.totalIncome;
  existing.totalExpenditures = input.totalExpenditures;
  existing.netOperatingIncome = input.netOperatingIncome;
  existing.fundBalance = input.fundBalance;
  existing.incomeSources = input.incomeSources ?? [];
  existing.expenditureAllocations = input.expenditureAllocations ?? [];
  existing.reportDate = (input.reportDate ?? "").trim();

  await existing.save();
  return FinancialReportModel.findById(id).lean() as any;
}

export async function deleteFinancialReport(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw transparencyError("Invalid ID", 400);

  const existing = await FinancialReportModel.findById(id);
  if (!existing) throw transparencyError("Report not found", 404);

  await existing.deleteOne();
}

// ─── Bulk Import ──────────────────────────────────────────────────────────────

export interface BulkImportResult {
  inserted: number;
  skipped: number;
  errors: Array<{ contractId: string; reason: string }>;
}

/**
 * Upserts projects from a DPWH API JSON payload.
 * Projects whose contractId already exists are skipped (not overwritten).
 * Returns a summary of the operation.
 */
export async function bulkImportProjects(
  items: ProjectInput[],
): Promise<BulkImportResult> {
  let inserted = 0;
  let skipped = 0;
  const errors: Array<{ contractId: string; reason: string }> = [];

  for (const item of items) {
    try {
      const existing = await DpwhProjectModel.findOne({
        contractId: item.contractId.trim(),
      });

      if (existing) {
        skipped++;
        continue;
      }

      await DpwhProjectModel.create({
        contractId: item.contractId.trim(),
        description: item.description.trim(),
        category: item.category.trim(),
        status: item.status.trim(),
        budget: item.budget,
        amountPaid: item.amountPaid ?? 0,
        progress: Math.min(100, Math.max(0, item.progress ?? 0)),
        province: (item.province ?? "CAMARINES SUR").trim(),
        region: (item.region ?? "Region V").trim(),
        contractor: (item.contractor ?? "").trim(),
        startDate: (item.startDate ?? "").trim(),
        completionDate: item.completionDate?.trim() || null,
        infraYear: (item.infraYear ?? "").trim(),
        programName: (item.programName ?? "").trim(),
        sourceOfFunds: (item.sourceOfFunds ?? "").trim(),
      });

      inserted++;
    } catch (err: any) {
      errors.push({
        contractId: item.contractId ?? "unknown",
        reason: err?.message ?? "Unknown error",
      });
    }
  }

  return { inserted, skipped, errors };
}
