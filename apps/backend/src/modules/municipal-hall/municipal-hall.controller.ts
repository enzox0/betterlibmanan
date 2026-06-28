import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedMunicipalHall,
  listAllMunicipalHall,
  createMunicipalHall,
  updateMunicipalHall,
  deleteMunicipalHall,
  uploadMunicipalHallImage,
} from "./municipal-hall.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IMunicipalHall } from "./municipal-hall.model";

const municipalHallSchema = z.object({
  title: z.string().trim().min(1).max(255),
  imageUrl: z.string().trim().url().optional(),
  imageKey: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  province: z.string().trim().optional(),
  barangays: z.string().trim().optional(),
  founded: z.string().trim().optional(),
  officeHoursWeekday: z.string().trim().optional(),
  officeHoursWeekend: z.string().trim().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

const uploadSchema = z.object({
  filename: z.string().trim().min(1),
  mimeType: z
    .string()
    .trim()
    .refine(
      (value) =>
        ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(value),
      "Unsupported image type",
    ),
  data: z.string().trim().min(1),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IMunicipalHall | any) {
  return {
    id: String(record._id),
    sectionKey: "municipal-hall",
    title: record.title,
    status: record.status,
    fields: {
      title: record.title,
      imageUrl: record.imageUrl ?? "",
      description: record.description ?? "",
      address: record.address ?? "",
      province: record.province ?? "",
      barangays: record.barangays ?? "",
      founded: record.founded ?? "",
      officeHoursWeekday: record.officeHoursWeekday ?? "",
      officeHoursWeekend: record.officeHoursWeekend ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedMunicipalHall(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedMunicipalHall();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminMunicipalHall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllMunicipalHall();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "MunicipalHall",
          description: "Listed Municipal Hall records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminMunicipalHall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = municipalHallSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createMunicipalHall(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "MunicipalHall",
          resourceId: String((record as any)._id),
          description: `Created Municipal Hall record: ${record.title}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminMunicipalHall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = municipalHallSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateMunicipalHall(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "MunicipalHall",
          resourceId: req.params.id,
          description: `Updated Municipal Hall record: ${record.title}`,
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

export async function deleteAdminMunicipalHall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteMunicipalHall(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "MunicipalHall",
          resourceId: req.params.id,
          description: "Deleted Municipal Hall record",
        },
      );
    }

    res.json({ success: true, message: "Municipal Hall record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminMunicipalHall(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const uploaded = await uploadMunicipalHallImage(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "MunicipalHall",
          resourceId: uploaded.key,
          description: `Uploaded municipal hall image ${parsed.data.filename}`,
        },
      );
    }

    res.status(201).json({ success: true, data: uploaded });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
