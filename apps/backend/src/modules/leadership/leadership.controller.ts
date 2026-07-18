import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedLeadership,
  listAllLeadership,
  createLeadership,
  updateLeadership,
  deleteLeadership,
  uploadLeadershipAvatar,
} from "./leadership.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { ILeadership } from "./leadership.model";

const leadershipSchema = z.object({
  name: z.string().trim().min(1).max(255),
  position: z.string().trim().max(255).optional(),
  email: z.string().trim().max(255).optional(),
  phone: z.string().trim().max(60).optional(),
  avatarUrl: z.string().trim().url().or(z.literal("")).optional(),
  avatarKey: z.string().trim().optional(),
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

function toContentRecord(record: ILeadership | any) {
  return {
    id: String(record._id),
    sectionKey: "leadership",
    title: record.name,
    status: record.status,
    fields: {
      name: record.name,
      position: record.position ?? "",
      email: record.email ?? "",
      phone: record.phone ?? "",
      avatar: record.avatarUrl ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedLeadership(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedLeadership();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminLeadership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllLeadership();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "Leadership",
          description: "Listed Leadership records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminLeadership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = leadershipSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createLeadership(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Leadership",
          resourceId: String((record as any)._id),
          description: `Created Leadership record: ${record.name}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminLeadership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = leadershipSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateLeadership(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Leadership",
          resourceId: req.params.id,
          description: `Updated Leadership record: ${record.name}`,
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

export async function deleteAdminLeadership(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteLeadership(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Leadership",
          resourceId: req.params.id,
          description: "Deleted Leadership record",
        },
      );
    }

    res.json({ success: true, message: "Leadership record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function uploadAdminLeadershipAvatar(
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

    const uploaded = await uploadLeadershipAvatar(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Leadership",
          resourceId: uploaded.key,
          description: `Uploaded Leadership avatar ${parsed.data.filename}`,
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
