import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bulkImportProjects,
} from "./transparency.service";
import { writeAuditLog } from "@/modules/audit/audit.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const projectSchema = z.object({
  contractId: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(255),
  status: z.string().trim().min(1).max(100),
  budget: z.number().min(0),
  amountPaid: z.number().min(0).default(0),
  progress: z.number().int().min(0).max(100).default(0),
  province: z.string().trim().default("CAMARINES SUR"),
  region: z.string().trim().default("Region V"),
  contractor: z.string().trim().default(""),
  startDate: z.string().trim().default(""),
  completionDate: z.string().trim().nullable().optional(),
  infraYear: z.string().trim().default(""),
  programName: z.string().trim().default(""),
  sourceOfFunds: z.string().trim().default(""),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toProjectRecord(p: any) {
  return {
    id: String(p._id),
    contractId: p.contractId,
    description: p.description,
    category: p.category,
    status: p.status,
    budget: p.budget,
    amountPaid: p.amountPaid ?? 0,
    progress: p.progress ?? 0,
    location: {
      province: p.province ?? "CAMARINES SUR",
      region: p.region ?? "Region V",
    },
    contractor: p.contractor ?? "",
    startDate: p.startDate ?? "",
    completionDate: p.completionDate ?? null,
    infraYear: p.infraYear ?? "",
    programName: p.programName ?? "",
    sourceOfFunds: p.sourceOfFunds ?? "",
    createdAt: new Date(p.createdAt).toISOString(),
    updatedAt: new Date(p.updatedAt).toISOString(),
  };
}

// ─── Controllers ─────────────────────────────────────────────────────────────

export async function getProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = parseInt((req.query.page as string) ?? "1") || 1;
    const limit = Math.min(
      parseInt((req.query.limit as string) ?? "50") || 50,
      200,
    );
    const search = (req.query.search as string) ?? undefined;
    const category = (req.query.category as string) ?? undefined;
    const status = (req.query.status as string) ?? undefined;

    const { projects, total, summary } = await listProjects({
      page,
      limit,
      search,
      category,
      status,
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        data: projects.map(toProjectRecord),
        summary,
        pagination: {
          page,
          limit,
          totalCount: total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const project = await getProjectById(req.params.id);
    res.json({ success: true, data: toProjectRecord(project) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function createAdminProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const project = await createProject(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Transparency",
          resourceId: String((project as any)._id),
          description: `Created DPWH project: ${project.contractId}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toProjectRecord(project) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateAdminProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const project = await updateProject(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Transparency",
          resourceId: req.params.id,
          description: `Updated DPWH project: ${project.contractId}`,
        },
      );
    }

    res.json({ success: true, data: toProjectRecord(project) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminProject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteProject(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Transparency",
          resourceId: req.params.id,
          description: "Deleted DPWH project",
        },
      );
    }

    res.json({ success: true, message: "Project deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── Bulk Import ─────────────────────────────────────────────────────────────

const dpwhItemSchema = z.object({
  contractId: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().default(""),
  status: z.string().trim().default(""),
  budget: z.number().default(0),
  amountPaid: z.number().default(0),
  progress: z.number().default(0),
  location: z
    .object({
      province: z.string().trim().default("CAMARINES SUR"),
      region: z.string().trim().default("Region V"),
    })
    .optional(),
  contractor: z.string().trim().default(""),
  startDate: z.string().trim().default(""),
  completionDate: z.string().trim().nullable().optional(),
  infraYear: z.string().trim().default(""),
  programName: z.string().trim().default(""),
  sourceOfFunds: z.string().trim().default(""),
});

const bulkImportSchema = z.object({
  // Accept the full DPWH API envelope or a plain array
  data: z.union([
    z.object({
      data: z.array(dpwhItemSchema),
    }),
    z.array(dpwhItemSchema),
  ]),
});

export async function bulkImportAdminProjects(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = bulkImportSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    // Normalise: unwrap DPWH envelope if present
    const rawItems = Array.isArray(parsed.data.data)
      ? parsed.data.data
      : (parsed.data.data as any).data;

    const items = rawItems.map((item: any) => ({
      contractId: item.contractId,
      description: item.description,
      category: item.category,
      status: item.status,
      budget: item.budget,
      amountPaid: item.amountPaid ?? 0,
      progress: item.progress ?? 0,
      province: item.location?.province ?? "CAMARINES SUR",
      region: item.location?.region ?? "Region V",
      contractor: item.contractor ?? "",
      startDate: item.startDate ?? "",
      completionDate: item.completionDate ?? null,
      infraYear: item.infraYear ?? "",
      programName: item.programName ?? "",
      sourceOfFunds: item.sourceOfFunds ?? "",
    }));

    const result = await bulkImportProjects(items);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Transparency",
          description: `Bulk imported ${result.inserted} DPWH projects (${result.skipped} skipped)`,
        },
      );
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Financial Reports ────────────────────────────────────────────────────────
import {
  listFinancialReports,
  getFinancialReport,
  createFinancialReport,
  updateFinancialReport,
  deleteFinancialReport,
} from "./transparency.service";

const breakdownItemSchema = z.object({
  source: z.string().trim().optional(),
  category: z.string().trim().optional(),
  amount: z.number().min(0),
  percentage: z.number().min(0).max(100),
});

const financialReportSchema = z.object({
  fiscalYear: z.string().trim().min(1).max(20),
  quarter: z.enum(["Q1", "Q2", "Q3", "Q4"]),
  totalIncome: z.number().min(0),
  totalExpenditures: z.number().min(0),
  netOperatingIncome: z.number(),
  fundBalance: z.number().min(0),
  incomeSources: z
    .array(
      z.object({
        source: z.string().trim().min(1),
        amount: z.number().min(0),
        percentage: z.number().min(0).max(100),
      }),
    )
    .default([]),
  expenditureAllocations: z
    .array(
      z.object({
        category: z.string().trim().min(1),
        amount: z.number().min(0),
        percentage: z.number().min(0).max(100),
      }),
    )
    .default([]),
  reportDate: z.string().trim().optional(),
});

function toReportRecord(r: any) {
  return {
    id: String(r._id),
    fiscalYear: r.fiscalYear,
    quarter: r.quarter,
    totalIncome: r.totalIncome,
    totalExpenditures: r.totalExpenditures,
    netOperatingIncome: r.netOperatingIncome,
    fundBalance: r.fundBalance,
    incomeSources: r.incomeSources ?? [],
    expenditureAllocations: r.expenditureAllocations ?? [],
    reportDate: r.reportDate ?? "",
    createdAt: new Date(r.createdAt).toISOString(),
    updatedAt: new Date(r.updatedAt).toISOString(),
  };
}

export async function getFinancialReports(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const reports = await listFinancialReports();
    res.json({ success: true, data: reports.map(toReportRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getFinancialReportById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const report = await getFinancialReport(req.params.id);
    res.json({ success: true, data: toReportRecord(report) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function createAdminFinancialReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financialReportSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const report = await createFinancialReport(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Transparency",
          resourceId: String((report as any)._id),
          description: `Created financial report: ${report.fiscalYear} ${report.quarter}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toReportRecord(report) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateAdminFinancialReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financialReportSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const report = await updateFinancialReport(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Transparency",
          resourceId: req.params.id,
          description: `Updated financial report: ${report.fiscalYear} ${report.quarter}`,
        },
      );
    }
    res.json({ success: true, data: toReportRecord(report) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminFinancialReport(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteFinancialReport(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Transparency",
          resourceId: req.params.id,
          description: "Deleted financial report",
        },
      );
    }
    res.json({ success: true, message: "Report deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
