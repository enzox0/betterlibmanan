import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
} from "./social-links.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { ISocialLink } from "./social-links.model";

const PLATFORMS = [
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "other",
] as const;

const socialLinkSchema = z.object({
  name: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(500),
  platform: z.enum(PLATFORMS).optional().default("other"),
  order: z.number().int().optional().default(0),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: ISocialLink | any) {
  return {
    id: String(record._id),
    sectionKey: "social-links",
    title: record.name,
    status: "published" as const,
    fields: {
      name: record.name,
      href: record.href,
      platform: record.platform ?? "other",
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

export async function getSocialLinks(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllSocialLinks();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminSocialLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = socialLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createSocialLink(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "SocialLink",
          resourceId: String((record as any)._id),
          description: `Created social link: ${record.name}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminSocialLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = socialLinkSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateSocialLink(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "SocialLink",
          resourceId: req.params.id,
          description: `Updated social link: ${record.name}`,
        },
      );
    }
    res.json({ success: true, data: toContentRecord(record) });
  } catch (err: any) {
    handleError(err, res, next);
  }
}

export async function deleteAdminSocialLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteSocialLink(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "SocialLink",
          resourceId: req.params.id,
          description: "Deleted social link",
        },
      );
    }
    res.json({ success: true, message: "Social link deleted" });
  } catch (err: any) {
    handleError(err, res, next);
  }
}
