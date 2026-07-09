import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/audit.service";
import * as svc from "./statistics.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toRecord(doc: any, section: string) {
  return {
    id: String(doc._id),
    sectionKey: section,
    ...doc,
    _id: undefined,
    __v: undefined,
  };
}

function handleServiceError(err: any, res: Response, next: NextFunction) {
  if (err?.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const municipalStatSchema = z.object({
  value: z.string().trim().min(1).max(255),
  label: z.string().trim().min(1).max(255),
  subLabel: z.string().trim().max(255).optional(),
  order: z.number().optional(),
});

const financeStatSchema = z.object({
  label: z.string().trim().min(1).max(255),
  value: z.string().trim().min(1).max(255),
  subValue: z.string().trim().max(255).optional(),
  order: z.number().optional(),
});

const financeCompositionSchema = z.object({
  label: z.string().trim().min(1).max(255),
  percentage: z.number().min(0).max(100),
  color: z.string().trim().min(1),
  order: z.number().optional(),
});

const populationPointSchema = z.object({
  year: z.number().int().min(1900).max(2200),
  pop: z.number().int().min(0),
});

const barangaySchema = z.object({
  name: z.string().trim().min(1).max(255),
  population: z.number().int().min(0),
});

const economyIndicatorSchema = z.object({
  label: z.string().trim().min(1).max(255),
  value: z.string().trim().min(1).max(255),
  subLabel: z.string().trim().max(255).optional(),
  order: z.number().optional(),
});

const economySectorSchema = z.object({
  name: z.string().trim().min(1).max(255),
  percentage: z.number().min(0).max(100),
  order: z.number().optional(),
});

const povertyEntrySchema = z.object({
  year: z.number().int().min(1900).max(2200),
  rate: z.number().min(0).max(100),
  confidenceInterval: z.string().trim().max(255).optional(),
  change: z.number().optional(),
  status: z.enum(["improved", "worsened", "stable"]),
});

const competitivenessItemSchema = z.object({
  category: z.string().trim().min(1).max(255),
  score: z.number().min(0),
  change: z.number().optional(),
  changeLabel: z.string().trim().max(100).optional(),
  order: z.number().optional(),
});

// ─── Public endpoint — full statistics bundle ─────────────────────────────────

export async function getPublicStatistics(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [
      municipal,
      financeStats,
      financeComposition,
      populationHistory,
      barangays,
      economyIndicators,
      economySectors,
      poverty,
      competitiveness,
    ] = await Promise.all([
      svc.listMunicipalStats(),
      svc.listFinanceStats(),
      svc.listFinanceComposition(),
      svc.listPopulationHistory(),
      svc.listBarangays(),
      svc.listEconomyIndicators(),
      svc.listEconomySectors(),
      svc.listPovertyEntries(),
      svc.listCompetitivenessItems(),
    ]);

    res.json({
      success: true,
      data: {
        municipal,
        financeStats,
        financeComposition,
        populationHistory,
        barangays,
        economyIndicators,
        economySectors,
        poverty,
        competitiveness,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Municipal Stats CRUD ─────────────────────────────────────────────────────

export async function getMunicipalStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listMunicipalStats();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "municipal-stats")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminMunicipalStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = municipalStatSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createMunicipalStat(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created municipal stat: ${record.label}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "municipal-stats") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminMunicipalStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = municipalStatSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateMunicipalStat(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated municipal stat: ${record.label}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "municipal-stats") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminMunicipalStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteMunicipalStat(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted municipal stat",
        },
      );
    res.json({ success: true, message: "Municipal stat deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Finance Stats CRUD ───────────────────────────────────────────────────────

export async function getFinanceStats(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listFinanceStats();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "finance-stats")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminFinanceStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financeStatSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createFinanceStat(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created finance stat: ${record.label}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "finance-stats") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminFinanceStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financeStatSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateFinanceStat(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated finance stat: ${record.label}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "finance-stats") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminFinanceStat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteFinanceStat(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted finance stat",
        },
      );
    res.json({ success: true, message: "Finance stat deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Finance Composition CRUD ─────────────────────────────────────────────────

export async function getFinanceComposition(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listFinanceComposition();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "finance-composition")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminFinanceComposition(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financeCompositionSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createFinanceComposition(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created finance composition: ${record.label}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "finance-composition") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminFinanceComposition(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = financeCompositionSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateFinanceComposition(
      req.params.id,
      parsed.data,
    );
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated finance composition: ${record.label}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "finance-composition") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminFinanceComposition(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteFinanceComposition(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted finance composition item",
        },
      );
    res.json({ success: true, message: "Finance composition item deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Population History CRUD ──────────────────────────────────────────────────

export async function getPopulationHistory(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listPopulationHistory();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "population")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPopulationPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = populationPointSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createPopulationPoint(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created population point: ${record.year}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "population") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminPopulationPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = populationPointSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updatePopulationPoint(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated population point: ${record.year}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "population") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminPopulationPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deletePopulationPoint(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted population point",
        },
      );
    res.json({ success: true, message: "Population point deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Barangays CRUD ───────────────────────────────────────────────────────────

export async function getBarangays(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listBarangays();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "barangays")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangaySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const records = await svc.createBarangay(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          description: `Created barangay: ${parsed.data.name}`,
        },
      );
    res.status(201).json({
      success: true,
      data: records.map((r) => toRecord(r, "barangays")),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangaySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const records = await svc.updateBarangay(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated barangay: ${parsed.data.name}`,
        },
      );
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "barangays")),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.deleteBarangay(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted barangay",
        },
      );
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "barangays")),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Economy Indicators CRUD ──────────────────────────────────────────────────

export async function getEconomyIndicators(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listEconomyIndicators();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "economy-indicators")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminEconomyIndicator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = economyIndicatorSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createEconomyIndicator(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created economy indicator: ${record.label}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "economy-indicators") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminEconomyIndicator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = economyIndicatorSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateEconomyIndicator(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated economy indicator: ${record.label}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "economy-indicators") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminEconomyIndicator(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteEconomyIndicator(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted economy indicator",
        },
      );
    res.json({ success: true, message: "Economy indicator deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Economy Sectors CRUD ─────────────────────────────────────────────────────

export async function getEconomySectors(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listEconomySectors();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "economy-sectors")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminEconomySector(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = economySectorSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createEconomySector(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created economy sector: ${record.name}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "economy-sectors") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminEconomySector(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = economySectorSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateEconomySector(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated economy sector: ${record.name}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "economy-sectors") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminEconomySector(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteEconomySector(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted economy sector",
        },
      );
    res.json({ success: true, message: "Economy sector deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Poverty Entries CRUD ─────────────────────────────────────────────────────

export async function getPovertyEntries(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listPovertyEntries();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "poverty")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPovertyEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = povertyEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createPovertyEntry(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created poverty entry: ${record.year}`,
        },
      );
    res.status(201).json({ success: true, data: toRecord(record, "poverty") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminPovertyEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = povertyEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updatePovertyEntry(req.params.id, parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated poverty entry: ${record.year}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "poverty") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminPovertyEntry(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deletePovertyEntry(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted poverty entry",
        },
      );
    res.json({ success: true, message: "Poverty entry deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Competitiveness Items CRUD ───────────────────────────────────────────────

export async function getCompetitivenessItems(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await svc.listCompetitivenessItems();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "competitiveness")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminCompetitivenessItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = competitivenessItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createCompetitivenessItem(parsed.data);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Statistics",
          resourceId: String((record as any)._id),
          description: `Created competitiveness item: ${record.category}`,
        },
      );
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "competitiveness") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function updateAdminCompetitivenessItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = competitivenessItemSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateCompetitivenessItem(
      req.params.id,
      parsed.data,
    );
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Statistics",
          resourceId: req.params.id,
          description: `Updated competitiveness item: ${record.category}`,
        },
      );
    res.json({ success: true, data: toRecord(record, "competitiveness") });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminCompetitivenessItem(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteCompetitivenessItem(req.params.id);
    if (req.admin)
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Statistics",
          resourceId: req.params.id,
          description: "Deleted competitiveness item",
        },
      );
    res.json({ success: true, message: "Competitiveness item deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}
