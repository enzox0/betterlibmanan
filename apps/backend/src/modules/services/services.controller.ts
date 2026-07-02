import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedCategories,
  listAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  addServiceToCategory,
  updateServiceInCategory,
  removeServiceFromCategory,
  listPublishedLifeEvents,
  listAllLifeEvents,
  createLifeEvent,
  updateLifeEvent,
  deleteLifeEvent,
} from "./services.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IServiceCategory, ILifeEvent } from "./services.model";

// ─── Validation schemas ───────────────────────────────────────────────────────

const serviceItemSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional(),
  fee: z.string().trim().max(255).optional(),
  processingTime: z.string().trim().max(255).optional(),
  link: z.string().trim().url().or(z.literal("")).optional(),
  requirements: z.array(z.string().trim()).optional(),
  steps: z.array(z.string().trim()).optional(),
});

const categorySchema = z.object({
  slug: z.string().trim().max(100).optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(1000).optional(),
  iconKey: z.string().trim().max(100).optional(),
  status: z.enum(["published", "draft"]).default("draft"),
  services: z.array(serviceItemSchema).optional(),
});

const lifeEventSchema = z.object({
  slug: z.string().trim().max(100).optional(),
  title: z.string().trim().min(1).max(255),
  iconKey: z.string().trim().max(100).optional(),
  serviceIds: z.array(z.string().trim()).optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

// ─── Serializers ──────────────────────────────────────────────────────────────

function toCategoryRecord(cat: IServiceCategory | any) {
  return {
    id: String(cat._id),
    slug: cat.slug,
    title: cat.title,
    description: cat.description ?? "",
    iconKey: cat.iconKey ?? "FaFileAlt",
    status: cat.status,
    services: (cat.services ?? []).map((s: any) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
      fee: s.fee ?? "",
      processingTime: s.processingTime ?? "",
      link: s.link ?? "",
      requirements: s.requirements ?? [],
      steps: s.steps ?? [],
      categorySlug: cat.slug,
    })),
    createdAt: new Date(cat.createdAt).toISOString(),
    updatedAt: new Date(cat.updatedAt).toISOString(),
  };
}

function toLifeEventRecord(ev: ILifeEvent | any) {
  return {
    id: String(ev._id),
    slug: ev.slug,
    title: ev.title,
    iconKey: ev.iconKey ?? "FaStore",
    serviceIds: ev.serviceIds ?? [],
    status: ev.status,
    createdAt: new Date(ev.createdAt).toISOString(),
    updatedAt: new Date(ev.updatedAt).toISOString(),
  };
}

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

// ─── Category controllers ─────────────────────────────────────────────────────

export async function getPublishedCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedCategories();
    res.json({ success: true, data: records.map(toCategoryRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminCategories(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllCategories();
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "Services",
          description: "Listed service categories",
        },
      );
    }
    res.json({ success: true, data: records.map(toCategoryRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlugController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const cat = await getCategoryBySlug(req.params.slug);
    if (!cat) {
      res.status(404).json({ success: false, message: "Category not found" });
      return;
    }
    res.json({ success: true, data: toCategoryRecord(cat) });
  } catch (err) {
    next(err);
  }
}

export async function createCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createCategory(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Services",
          resourceId: String((record as any)._id),
          description: `Created service category: ${record.title}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toCategoryRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateCategory(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Services",
          resourceId: req.params.id,
          description: `Updated service category: ${record.title}`,
        },
      );
    }
    res.json({ success: true, data: toCategoryRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteCategoryController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteCategory(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Services",
          resourceId: req.params.id,
          description: "Deleted service category",
        },
      );
    }
    res.json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── Individual service controllers ──────────────────────────────────────────

export async function addServiceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = serviceItemSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await addServiceToCategory(
      req.params.categoryId,
      parsed.data,
    );
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Services",
          resourceId: req.params.categoryId,
          description: `Added service "${parsed.data.title}" to category`,
        },
      );
    }
    res.status(201).json({ success: true, data: toCategoryRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateServiceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = serviceItemSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateServiceInCategory(
      req.params.categoryId,
      req.params.serviceId,
      parsed.data,
    );
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Services",
          resourceId: req.params.serviceId,
          description: `Updated service "${parsed.data.title}"`,
        },
      );
    }
    res.json({ success: true, data: toCategoryRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function removeServiceController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const record = await removeServiceFromCategory(
      req.params.categoryId,
      req.params.serviceId,
    );
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Services",
          resourceId: req.params.serviceId,
          description: "Removed service from category",
        },
      );
    }
    res.json({ success: true, data: toCategoryRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── Life event controllers ───────────────────────────────────────────────────

export async function getPublishedLifeEvents(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedLifeEvents();
    res.json({ success: true, data: records.map(toLifeEventRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminLifeEvents(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllLifeEvents();
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "Services",
          description: "Listed life events",
        },
      );
    }
    res.json({ success: true, data: records.map(toLifeEventRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createLifeEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = lifeEventSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createLifeEvent(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Services",
          resourceId: String((record as any)._id),
          description: `Created life event: ${record.title}`,
        },
      );
    }
    res.status(201).json({ success: true, data: toLifeEventRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function updateLifeEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = lifeEventSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateLifeEvent(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Services",
          resourceId: req.params.id,
          description: `Updated life event: ${record.title}`,
        },
      );
    }
    res.json({ success: true, data: toLifeEventRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteLifeEventController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteLifeEvent(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Services",
          resourceId: req.params.id,
          description: "Deleted life event",
        },
      );
    }
    res.json({ success: true, message: "Life event deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
