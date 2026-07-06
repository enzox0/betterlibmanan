import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedMedicalContacts,
  listAllMedicalContacts,
  createMedicalContact,
  updateMedicalContact,
  deleteMedicalContact,
} from "./medical-contacts.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IMedicalContact } from "./medical-contacts.model";

const medicalContactSchema = z.object({
  name: z.string().trim().min(1).max(255),
  number: z.string().trim().min(1).max(60),
  description: z.string().trim().max(255).optional().default(""),
  order: z.number().int().optional().default(0),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IMedicalContact | any) {
  return {
    id: String(record._id),
    sectionKey: "medical-contacts",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      number: record.number,
      description: record.description ?? "",
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

export async function getPublishedMedicalContacts(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedMedicalContacts();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminMedicalContacts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllMedicalContacts();
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "MedicalContact",
          description: "Listed Medical Contact records",
        },
      );
    }
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminMedicalContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = medicalContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createMedicalContact(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "MedicalContact",
          resourceId: String((record as any)._id),
          description: `Created Medical Contact: ${record.name}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminMedicalContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = medicalContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateMedicalContact(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "MedicalContact",
          resourceId: req.params.id,
          description: `Updated Medical Contact: ${record.name}`,
        },
      );
    }
    res.json({ success: true, data: toContentRecord(record) });
  } catch (err: any) {
    handleError(err, res, next);
  }
}

export async function deleteAdminMedicalContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteMedicalContact(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "MedicalContact",
          resourceId: req.params.id,
          description: "Deleted Medical Contact record",
        },
      );
    }
    res.json({ success: true, message: "Medical contact deleted" });
  } catch (err: any) {
    handleError(err, res, next);
  }
}
