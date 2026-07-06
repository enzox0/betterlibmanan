import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listAllOffices,
  createOffice,
  updateOffice,
  deleteOffice,
} from "./office-directory.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IOfficeDirectory } from "./office-directory.model";

const officeSchema = z.object({
  name: z.string().trim().min(1).max(255),
  number: z.string().trim().min(1).max(60),
  order: z.number().int().optional().default(0),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IOfficeDirectory | any) {
  return {
    id: String(record._id),
    sectionKey: "office-directory",
    title: record.name,
    status: "published" as const,
    fields: {
      name: record.name,
      number: record.number,
      order: record.order ?? 0,
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

function handleError(err: any, res: Response, next: NextFunction) {
  if (err.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

export async function getOffices(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllOffices();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = officeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createOffice(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "OfficeDirectory",
          resourceId: String((record as any)._id),
          description: `Created office: ${record.name}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = officeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateOffice(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "OfficeDirectory",
          resourceId: req.params.id,
          description: `Updated office: ${record.name}`,
        },
      );
    }
    res.json({ success: true, data: toContentRecord(record) });
  } catch (err: any) {
    handleError(err, res, next);
  }
}

export async function deleteAdminOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteOffice(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "OfficeDirectory",
          resourceId: req.params.id,
          description: "Deleted office directory entry",
        },
      );
    }
    res.json({ success: true, message: "Office deleted" });
  } catch (err: any) {
    handleError(err, res, next);
  }
}
