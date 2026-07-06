import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedTouristSpots,
  listAllTouristSpots,
  createTouristSpot,
  updateTouristSpot,
  deleteTouristSpot,
  uploadTourismImage,
} from "./tourism.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { ITouristSpot } from "./tourism.model";

const touristSpotSchema = z.object({
  name: z.string().trim().min(1).max(255),
  location: z.string().trim().max(500).optional(),
  description: z.string().trim().optional(),
  category: z.enum([
    "nature",
    "water",
    "heritage",
    "viewpoint",
    "photo",
    "other",
  ]),
  rating: z.string().trim().max(10).optional(),
  entryFee: z.string().trim().max(255).optional(),
  tags: z.array(z.string().trim()).optional(),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  imageKey: z.string().trim().optional(),
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

function toContentRecord(record: ITouristSpot | any) {
  return {
    id: String(record._id),
    sectionKey: "tourism",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      location: record.location ?? "",
      description: record.description ?? "",
      category: record.category ?? "other",
      rating: record.rating ?? "",
      entryFee: record.entryFee ?? "",
      tags: record.tags ?? [],
      image: record.imageUrl ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedTouristSpots(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedTouristSpots();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminTouristSpots(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllTouristSpots();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "Tourism",
          description: "Listed tourist spot records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminTouristSpot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = touristSpotSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createTouristSpot(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Tourism",
          resourceId: String((record as any)._id),
          description: `Created tourist spot: ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminTouristSpot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = touristSpotSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateTouristSpot(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Tourism",
          resourceId: req.params.id,
          description: `Updated tourist spot: ${record.name}`,
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

export async function deleteAdminTouristSpot(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteTouristSpot(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Tourism",
          resourceId: req.params.id,
          description: "Deleted tourist spot",
        },
      );
    }

    res.json({ success: true, message: "Tourist spot deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminTourismImage(
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

    const uploaded = await uploadTourismImage(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Tourism",
          resourceId: uploaded.key,
          description: `Uploaded tourism image: ${parsed.data.filename}`,
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
