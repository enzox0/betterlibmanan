import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedPopularServices,
  listAllPopularServices,
  createPopularService,
  updatePopularService,
  deletePopularService,
  uploadPopularServiceIcon,
} from "./popular-services.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IPopularService } from "./popular-services.model";

const popularServiceSchema = z.object({
  name: z.string().trim().min(1).max(160),
  icon: z.string().trim().optional(),
  description: z.string().trim().optional(),
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

function toContentRecord(record: IPopularService | any) {
  return {
    id: String(record._id),
    sectionKey: "popular-services",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      icon: record.icon ?? "",
      description: record.description ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedPopularServices(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedPopularServices();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminPopularServices(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllPopularServices();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "PopularServices",
          description: "Listed Popular Services records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPopularService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = popularServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createPopularService(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "PopularServices",
          resourceId: String((record as any)._id),
          description: `Created Popular Service ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPopularService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = popularServiceSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updatePopularService(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "PopularServices",
          resourceId: req.params.id,
          description: `Updated Popular Service ${record.name}`,
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

export async function deleteAdminPopularService(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deletePopularService(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "PopularServices",
          resourceId: req.params.id,
          description: "Deleted Popular Service record",
        },
      );
    }

    res.json({ success: true, message: "Popular Service deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminPopularServiceIcon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = uploadSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const uploaded = await uploadPopularServiceIcon(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "PopularServices",
          resourceId: uploaded.key,
          description: `Uploaded Popular Service icon ${parsed.data.filename}`,
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
