import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listPublishedQuiz,
  listAllQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  bulkImportQuiz,
} from "./quiz.service";
import { writeAuditLog } from "@/modules/audit/audit.service";
import type { IQuiz } from "./quiz.model";

const quizSchema = z.object({
  question: z.string().trim().min(1).max(500),
  options: z
    .array(z.string().trim().min(1))
    .min(2, "At least 2 options are required")
    .max(6, "Maximum 6 options allowed"),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["published", "draft"]).default("draft"),
});

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toContentRecord(record: IQuiz | any) {
  return {
    id: String(record._id),
    sectionKey: "quiz",
    title: record.question,
    status: record.status,
    fields: {
      question: record.question,
      options: record.options ?? [],
      correctIndex: String(record.correctIndex ?? 0),
      explanation: record.explanation ?? "",
      category: record.category ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

export async function getPublishedQuiz(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listPublishedQuiz();
    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function getAdminQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAllQuiz();

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "READ",
          module: "Quiz",
          description: "Listed Quiz records",
        },
      );
    }

    res.json({ success: true, data: records.map(toContentRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    // Validate correctIndex is within options range
    if (parsed.data.correctIndex >= parsed.data.options.length) {
      res.status(400).json({
        success: false,
        message: "correctIndex must be a valid index within options array.",
      });
      return;
    }

    const record = await createQuiz(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Quiz",
          resourceId: String((record as any)._id),
          description: `Created Quiz record: ${record.question}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toContentRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = quizSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    if (parsed.data.correctIndex >= parsed.data.options.length) {
      res.status(400).json({
        success: false,
        message: "correctIndex must be a valid index within options array.",
      });
      return;
    }

    const record = await updateQuiz(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Quiz",
          resourceId: req.params.id,
          description: `Updated Quiz record: ${record.question}`,
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

export async function deleteAdminQuiz(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteQuiz(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Quiz",
          resourceId: req.params.id,
          description: "Deleted Quiz record",
        },
      );
    }

    res.json({ success: true, message: "Quiz record deleted" });
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
        question: z.string().trim().min(1).max(500),
        options: z
          .array(z.string().trim().min(1))
          .min(2, "At least 2 options are required")
          .max(6, "Maximum 6 options allowed"),
        correctIndex: z.number().int().min(0),
        explanation: z.string().trim().optional(),
        category: z.string().trim().optional(),
        status: z.enum(["published", "draft"]).optional(),
      }),
    )
    .min(1, "At least one item is required")
    .max(500, "Maximum 500 items per import"),
});

export async function bulkImportAdminQuiz(
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

    // Validate all correctIndex values are within bounds
    for (let i = 0; i < parsed.data.items.length; i++) {
      const item = parsed.data.items[i];
      if (item.correctIndex >= item.options.length) {
        res.status(400).json({
          success: false,
          message: `Item at index ${i}: correctIndex must be within the options range.`,
        });
        return;
      }
    }

    const records = await bulkImportQuiz(parsed.data.items);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Quiz",
          description: `Bulk imported ${parsed.data.items.length} Quiz records`,
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
