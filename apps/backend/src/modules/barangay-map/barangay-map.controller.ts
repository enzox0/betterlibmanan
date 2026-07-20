import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedBarangayMaps,
  listAllBarangayMaps,
  createBarangayMap,
  updateBarangayMap,
  deleteBarangayMap,
  uploadBarangayMapImage,
} from "./barangay-map.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IBarangayMap, IFestival } from "./barangay-map.model";

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeFestivalList(value: unknown): IFestival[] {
  if (Array.isArray(value)) {
    return value
      .map((item: any) => ({
        name: String(item.name ?? "").trim(),
        date: String(item.date ?? "").trim(),
        description: String(item.description ?? "").trim(),
      }))
      .filter((festival) => festival.name);
  }

  return [];
}

const barangayMapSchema = z.object({
  name: z.string().trim().min(1).max(160),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  imageKey: z.string().trim().optional(),
  description: z.string().trim().max(5000).optional(),
  touristAttractions: z.unknown().optional(),
  population: z.string().trim().max(120).optional(),
  area: z.string().trim().max(120).optional(),
  festivals: z.unknown().optional(),
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

function toContentRecord(record: IBarangayMap | any) {
  return {
    id: String(record._id),
    sectionKey: "barangay-map",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      image: record.imageUrl ?? "",
      imageUrl: record.imageUrl ?? "",
      imageKey: record.imageKey ?? "",
      description: record.description ?? "",
      touristAttractions: (record.touristAttractions ?? []).join(", "),
      population: record.population ?? "",
      area: record.area ?? "",
      festivals: record.festivals ?? [],
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedBarangayMapRecords(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedBarangayMaps();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminBarangayMapRecords(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllBarangayMaps();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "BarangayMap",
          description: "Listed barangay map records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBarangayMapRecord(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangayMapSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createBarangayMap({
      ...parsed.data,
      touristAttractions: normalizeStringList(parsed.data.touristAttractions),
      festivals: normalizeFestivalList(parsed.data.festivals),
    });

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "BarangayMap",
          resourceId: String((record as any)._id),
          description: `Created barangay map record ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBarangayMapRecord(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangayMapSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateBarangayMap(req.params.id, {
      ...parsed.data,
      touristAttractions: normalizeStringList(parsed.data.touristAttractions),
      festivals: normalizeFestivalList(parsed.data.festivals),
    });

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "BarangayMap",
          resourceId: req.params.id,
          description: `Updated barangay map record ${record.name}`,
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

export async function deleteAdminBarangayMapRecord(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteBarangayMap(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "BarangayMap",
          resourceId: req.params.id,
          description: "Deleted barangay map record",
        },
      );
    }

    res.json({ success: true, message: "Barangay map record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminBarangayMapImage(
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

    const uploaded = await uploadBarangayMapImage(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "BarangayMap",
          resourceId: uploaded.key,
          description: `Uploaded barangay map image ${parsed.data.filename}`,
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
