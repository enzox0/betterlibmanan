import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedEmergencyContacts,
  listAllEmergencyContacts,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "./emergency-contacts.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IEmergencyContact } from "./emergency-contacts.model";
const emergencyContactSchema = z.object({
  name: z.string().trim().min(1).max(255),
  number: z.string().trim().min(1).max(60),
  icon: z.string().trim().max(100).optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IEmergencyContact | any) {
  return {
    id: String(record._id),
    sectionKey: "emergency-contacts",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      number: record.number,
      icon: record.icon ?? "shield",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedEmergencyContacts(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedEmergencyContacts();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminEmergencyContacts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllEmergencyContacts();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "EmergencyContact",
          description: "Listed Emergency Contact records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = emergencyContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createEmergencyContact(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "EmergencyContact",
          resourceId: String((record as any)._id),
          description: `Created Emergency Contact: ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = emergencyContactSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateEmergencyContact(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "EmergencyContact",
          resourceId: req.params.id,
          description: `Updated Emergency Contact: ${record.name}`,
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

export async function deleteAdminEmergencyContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteEmergencyContact(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "EmergencyContact",
          resourceId: req.params.id,
          description: "Deleted Emergency Contact record",
        },
      );
    }

    res.json({ success: true, message: "Emergency contact deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
