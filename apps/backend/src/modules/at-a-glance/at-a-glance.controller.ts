import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedAtAGlance,
  listAllAtAGlance,
  createAtAGlance,
  updateAtAGlance,
  deleteAtAGlance,
} from "./at-a-glance.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IAtAGlance } from "./at-a-glance.model";

const atAGlanceSchema = z.object({
  label: z.string().trim().min(1).max(160),
  value: z.string().trim().min(1).max(160),
  icon: z.string().trim().optional(),
  sub: z.string().trim().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IAtAGlance | any) {
  return {
    id: String(record._id),
    sectionKey: "at-a-glance",
    title: record.label,
    status: record.status,
    fields: {
      label: record.label,
      value: record.value,
      icon: record.icon ?? "",
      sub: record.sub ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedAtAGlance(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedAtAGlance();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminAtAGlance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllAtAGlance();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "AtAGlance",
          description: "Listed At a Glance records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminAtAGlance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = atAGlanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createAtAGlance(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "AtAGlance",
          resourceId: String((record as any)._id),
          description: `Created At a Glance record: ${record.label}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminAtAGlance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = atAGlanceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateAtAGlance(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "AtAGlance",
          resourceId: req.params.id,
          description: `Updated At a Glance record: ${record.label}`,
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

export async function deleteAdminAtAGlance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteAtAGlance(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "AtAGlance",
          resourceId: req.params.id,
          description: "Deleted At a Glance record",
        },
      );
    }

    res.json({ success: true, message: "At a Glance record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
