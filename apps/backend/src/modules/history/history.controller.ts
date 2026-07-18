import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedHistory,
  listAllHistory,
  createHistory,
  updateHistory,
  deleteHistory,
  bulkImportHistory,
} from "./history.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IHistory } from "./history.model";

const historySchema = z.object({
  title: z.string().trim().min(1).max(255),
  content: z.string().trim().optional(),
  year: z.string().trim().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IHistory | any) {
  return {
    id: String(record._id),
    sectionKey: "history",
    title: record.title,
    status: record.status,
    fields: {
      title: record.title,
      content: record.content ?? "",
      year: record.year ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedHistory(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedHistory();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllHistory();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "History",
          description: "Listed History records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = historySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createHistory(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "History",
          resourceId: String((record as any)._id),
          description: `Created History record: ${record.title}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = historySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateHistory(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "History",
          resourceId: req.params.id,
          description: `Updated History record: ${record.title}`,
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

export async function deleteAdminHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteHistory(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "History",
          resourceId: req.params.id,
          description: "Deleted History record",
        },
      );
    }

    res.json({ success: true, message: "History record deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

const bulkImportSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(255),
        content: z.string().trim().optional(),
        year: z.string().trim().optional(),
        status: z.enum(["published", "draft"]).optional(),
      }),
    )
    .min(1, "At least one item is required")
    .max(500, "Maximum 500 items per import"),
});

export async function bulkImportAdminHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = bulkImportSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const records = await bulkImportHistory(parsed.data.items);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "History",
          description: `Bulk imported ${parsed.data.items.length} History records`,
        },
      );
    }

    res.status(201).json({
      success: true,
      imported: parsed.data.items.length,
      data: records.map(toContentRecord),
    });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
