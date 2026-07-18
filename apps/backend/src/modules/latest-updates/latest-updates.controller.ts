import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedLatestUpdates,
  listAllLatestUpdates,
  createLatestUpdate,
  updateLatestUpdate,
  deleteLatestUpdate,
} from "./latest-updates.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { ILatestUpdate } from "./latest-updates.model";

const latestUpdateSchema = z.object({
  title: z.string().trim().min(1).max(255),
  date: z.string().trim().optional(),
  summary: z.string().trim().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: ILatestUpdate | any) {
  return {
    id: String(record._id),
    sectionKey: "latest-updates",
    title: record.title,
    status: record.status,
    fields: {
      title: record.title,
      date: record.date ?? "",
      summary: record.summary ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedLatestUpdates(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedLatestUpdates();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminLatestUpdates(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllLatestUpdates();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "LatestUpdates",
          description: "Listed Latest Updates records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminLatestUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = latestUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createLatestUpdate(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "LatestUpdates",
          resourceId: String((record as any)._id),
          description: `Created Latest Update record: ${record.title}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminLatestUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = latestUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateLatestUpdate(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "LatestUpdates",
          resourceId: req.params.id,
          description: `Updated Latest Update record: ${record.title}`,
        },
      );
    }

    res.json({ success: true, data: toContentRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminLatestUpdate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteLatestUpdate(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "LatestUpdates",
          resourceId: req.params.id,
          description: "Deleted Latest Update record",
        },
      );
    }

    res.json({ success: true, message: "Latest Update record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
