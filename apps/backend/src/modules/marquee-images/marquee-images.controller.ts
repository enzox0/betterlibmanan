import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedMarqueeImages,
  listAllMarqueeImages,
  createMarqueeImage,
  updateMarqueeImage,
  deleteMarqueeImage,
  uploadMarqueeImage,
  reorderMarqueeImages,
} from "./marquee-images.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IMarqueeImage } from "./marquee-images.model";

const marqueeImageSchema = z.object({
  alt: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().url().optional(),
  imageKey: z.string().trim().min(1).optional(),
  rowNumber: z.number().int().min(1).max(3),
  order: z.number().int().min(0),
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

const reorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().trim().min(1),
      rowNumber: z.number().int().min(1).max(3),
      order: z.number().int().min(0),
    }),
  ),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IMarqueeImage | any) {
  return {
    id: String(record._id),
    sectionKey: "marquee-images",
    title: record.alt,
    status: record.status,
    fields: {
      alt: record.alt,
      imageUrl: record.imageUrl,
      imageKey: record.imageKey,
      rowNumber: record.rowNumber,
      order: record.order,
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedMarqueeImages(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedMarqueeImages();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminMarqueeImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllMarqueeImages();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "MarqueeImages",
          description: "Listed marquee image records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminMarqueeImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = marqueeImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createMarqueeImage(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "MarqueeImages",
          resourceId: String((record as any)._id),
          description: `Created marquee image ${record.alt}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminMarqueeImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = marqueeImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateMarqueeImage(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "MarqueeImages",
          resourceId: req.params.id,
          description: `Updated marquee image ${record.alt}`,
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

export async function deleteAdminMarqueeImage(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteMarqueeImage(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "MarqueeImages",
          resourceId: req.params.id,
          description: "Deleted marquee image record",
        },
      );
    }

    res.json({ success: true, message: "Marquee image deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminMarqueeImage(
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

    const uploaded = await uploadMarqueeImage(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "MarqueeImages",
          resourceId: uploaded.key,
          description: `Uploaded marquee image ${parsed.data.filename}`,
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

export async function reorderAdminMarqueeImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = reorderSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    await reorderMarqueeImages(parsed.data.updates);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "MarqueeImages",
          description: `Reordered ${parsed.data.updates.length} marquee images`,
        },
      );
    }

    res.json({ success: true, message: "Marquee images reordered" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
