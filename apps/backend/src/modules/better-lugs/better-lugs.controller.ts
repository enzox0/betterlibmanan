import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedBetterLugs,
  listAllBetterLugs,
  createBetterLug,
  updateBetterLug,
  deleteBetterLug,
  uploadBetterLugLogo,
} from "./better-lugs.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IBetterLug } from "./better-lugs.model";

const betterLugSchema = z.object({
  name: z.string().trim().min(1).max(160),
  websiteUrl: z.string().trim().url().or(z.literal("")).optional(),
  logoUrl: z.string().trim().url().or(z.literal("")).optional(),
  logoKey: z.string().trim().optional(),
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

function toContentRecord(record: IBetterLug | any) {
  return {
    id: String(record._id),
    sectionKey: "partner-logos",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      logo: record.logoUrl ?? "",
      websiteUrl: record.websiteUrl ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedBetterLugs(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedBetterLugs();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminBetterLugs(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllBetterLugs();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "BetterLUGs",
          description: "Listed Better LUG records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBetterLug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = betterLugSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createBetterLug(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "BetterLUGs",
          resourceId: String((record as any)._id),
          description: `Created Better LUG ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBetterLug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = betterLugSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((error) => error.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateBetterLug(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "BetterLUGs",
          resourceId: req.params.id,
          description: `Updated Better LUG ${record.name}`,
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

export async function deleteAdminBetterLug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteBetterLug(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "BetterLUGs",
          resourceId: req.params.id,
          description: "Deleted Better LUG record",
        },
      );
    }

    res.json({ success: true, message: "Better LUG deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminBetterLugLogo(
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

    const uploaded = await uploadBetterLugLogo(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "BetterLUGs",
          resourceId: uploaded.key,
          description: `Uploaded Better LUG logo ${parsed.data.filename}`,
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
