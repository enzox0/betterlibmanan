import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { writeAuditLog } from "@/modules/audit/audit.service";
import * as svc from "./section-sources.service";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const SECTION_KEYS = [
  "stats-finance",
  "stats-population",
  "stats-barangays",
  "stats-economy",
  "stats-poverty",
  "stats-competitiveness",
  "transparency-financial-reports",
  "transparency-dpwh-projects",
] as const;

const sourceSchema = z.object({
  section: z.enum(SECTION_KEYS),
  label: z.string().trim().min(1).max(512),
  url: z.string().trim().url("Must be a valid URL").max(1024),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toRecord(doc: any) {
  return {
    _id: String(doc._id),
    section: doc.section,
    label: doc.label,
    url: doc.url,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
  };
}

function handleError(err: any, res: Response, next: NextFunction) {
  if (err?.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

// ─── Public — list all ────────────────────────────────────────────────────────

export async function getPublicSources(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sources = await svc.listAllSources();
    res.json({ success: true, data: sources.map(toRecord) });
  } catch (err) {
    next(err);
  }
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function adminListSources(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sources = await svc.listAllSources();
    res.json({ success: true, data: sources.map(toRecord) });
  } catch (err) {
    next(err);
  }
}

export async function adminCreateSource(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = sourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.createSource(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "SectionSources",
          resourceId: String((record as any)._id),
          description: `Upserted source for section: ${parsed.data.section}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toRecord(record) });
  } catch (err: any) {
    handleError(err, res, next);
  }
}

export async function adminUpdateSource(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = sourceSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ success: false, message: parsed.error.errors[0].message });
      return;
    }
    const record = await svc.updateSource(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "SectionSources",
          resourceId: req.params.id,
          description: `Updated source for section: ${parsed.data.section}`,
        },
      );
    }
    res.json({ success: true, data: toRecord(record) });
  } catch (err: any) {
    handleError(err, res, next);
  }
}

export async function adminDeleteSource(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await svc.deleteSource(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "SectionSources",
          resourceId: req.params.id,
          description: "Deleted section source",
        },
      );
    }
    res.json({ success: true, message: "Source deleted" });
  } catch (err: any) {
    handleError(err, res, next);
  }
}
