import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getSettings,
  updateSettings,
  listOrdinances,
  createOrdinance,
  updateOrdinance,
  deleteOrdinance,
  listResolutions,
  createResolution,
  updateResolution,
  deleteResolution,
  listProcessSteps,
  createProcessStep,
  updateProcessStep,
  deleteProcessStep,
  replaceProcessSteps,
  listAboutPoints,
  createAboutPoint,
  updateAboutPoint,
  deleteAboutPoint,
} from "./legislative.service";
import { writeAuditLog } from "@/modules/audit/audit.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  ordinanceDescription: z.string().trim().optional(),
  ordinanceDefinition: z.string().trim().optional(),
  ordinanceCategories: z.array(z.string().trim()).optional(),
  ordinanceExternalLink: z.string().trim().optional(),
  resolutionDescription: z.string().trim().optional(),
  resolutionDefinition: z.string().trim().optional(),
  resolutionTypes: z.array(z.string().trim()).optional(),
  resolutionExternalLink: z.string().trim().optional(),
  aboutTitle: z.string().trim().optional(),
  aboutDescription: z.string().trim().optional(),
});

const documentSchema = z.object({
  number: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1),
  sessionDate: z.string().trim().min(1).max(100),
});

const processStepSchema = z.object({
  variant: z.enum(["ordinance", "resolution"]),
  step: z.number().int().min(1),
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().optional(),
});

const replaceStepsSchema = z.object({
  variant: z.enum(["ordinance", "resolution"]),
  steps: z.array(
    z.object({
      id: z.string().optional(),
      step: z.number().int().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().default(""),
    }),
  ),
});

const aboutPointSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toDocRecord(record: any, sectionKey: string) {
  return {
    id: String(record._id),
    sectionKey,
    title: record.title,
    status: "published" as const,
    fields: {
      number: record.number,
      title: record.title,
      sessionDate: record.sessionDate,
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

function toStepRecord(record: any) {
  return {
    id: String(record._id),
    sectionKey: "legislative-process",
    title: record.title,
    status: "published" as const,
    fields: {
      variant: record.variant,
      step: record.step,
      title: record.title,
      description: record.description ?? "",
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

function toAboutRecord(record: any) {
  return {
    id: String(record._id),
    sectionKey: "legislative-about",
    title: record.title,
    status: "published" as const,
    fields: {
      title: record.title,
      description: record.description,
    },
    createdAt: new Date(record.createdAt).toISOString(),
    updatedAt: new Date(record.updatedAt).toISOString(),
  };
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getPublicSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminSettings(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const settings = await updateSettings(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Legislative",
          description: "Updated legislative settings",
        },
      );
    }

    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

// ─── Ordinances ───────────────────────────────────────────────────────────────

export async function getOrdinances(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listOrdinances();
    res.json({
      success: true,
      data: records.map((r) => toDocRecord(r, "ordinance")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminOrdinance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createOrdinance(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Legislative",
          resourceId: String((record as any)._id),
          description: `Created ordinance: ${record.number}`,
        },
      );
    }

    res
      .status(201)
      .json({ success: true, data: toDocRecord(record, "ordinance") });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminOrdinance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateOrdinance(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Legislative",
          resourceId: req.params.id,
          description: `Updated ordinance: ${record.number}`,
        },
      );
    }

    res.json({ success: true, data: toDocRecord(record, "ordinance") });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminOrdinance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteOrdinance(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Legislative",
          resourceId: req.params.id,
          description: "Deleted ordinance",
        },
      );
    }

    res.json({ success: true, message: "Ordinance deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── Resolutions ──────────────────────────────────────────────────────────────

export async function getResolutions(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listResolutions();
    res.json({
      success: true,
      data: records.map((r) => toDocRecord(r, "resolution")),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminResolution(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createResolution(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Legislative",
          resourceId: String((record as any)._id),
          description: `Created resolution: ${record.number}`,
        },
      );
    }

    res
      .status(201)
      .json({ success: true, data: toDocRecord(record, "resolution") });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminResolution(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = documentSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateResolution(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Legislative",
          resourceId: req.params.id,
          description: `Updated resolution: ${record.number}`,
        },
      );
    }

    res.json({ success: true, data: toDocRecord(record, "resolution") });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminResolution(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteResolution(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Legislative",
          resourceId: req.params.id,
          description: "Deleted resolution",
        },
      );
    }

    res.json({ success: true, message: "Resolution deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── Process Steps ────────────────────────────────────────────────────────────

export async function getProcessSteps(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const variant = req.query.variant as string;
    if (variant !== "ordinance" && variant !== "resolution") {
      res
        .status(400)
        .json({
          success: false,
          message: "variant must be 'ordinance' or 'resolution'",
        });
      return;
    }
    const records = await listProcessSteps(variant);
    res.json({ success: true, data: records.map(toStepRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminProcessStep(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = processStepSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createProcessStep(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Legislative",
          resourceId: String((record as any)._id),
          description: `Created ${parsed.data.variant} process step: ${record.title}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toStepRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminProcessStep(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = processStepSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateProcessStep(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Legislative",
          resourceId: req.params.id,
          description: `Updated process step: ${record.title}`,
        },
      );
    }

    res.json({ success: true, data: toStepRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminProcessStep(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteProcessStep(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Legislative",
          resourceId: req.params.id,
          description: "Deleted process step",
        },
      );
    }

    res.json({ success: true, message: "Process step deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function replaceAdminProcessSteps(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = replaceStepsSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const records = await replaceProcessSteps(
      parsed.data.variant,
      parsed.data.steps,
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
          module: "Legislative",
          description: `Replaced ${parsed.data.variant} process steps`,
        },
      );
    }

    res.json({ success: true, data: records.map(toStepRecord) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

// ─── About Points ─────────────────────────────────────────────────────────────

export async function getAboutPoints(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listAboutPoints();
    res.json({ success: true, data: records.map(toAboutRecord) });
  } catch (err) {
    next(err);
  }
}

export async function createAdminAboutPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = aboutPointSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await createAboutPoint(parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Legislative",
          resourceId: String((record as any)._id),
          description: `Created about point: ${record.title}`,
        },
      );
    }

    res.status(201).json({ success: true, data: toAboutRecord(record) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminAboutPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = aboutPointSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const record = await updateAboutPoint(req.params.id, parsed.data);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Legislative",
          resourceId: req.params.id,
          description: `Updated about point: ${record.title}`,
        },
      );
    }

    res.json({ success: true, data: toAboutRecord(record) });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}

export async function deleteAdminAboutPoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteAboutPoint(req.params.id);

    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Legislative",
          resourceId: req.params.id,
          description: "Deleted about point",
        },
      );
    }

    res.json({ success: true, message: "About point deleted" });
  } catch (err: any) {
    if (err.statusCode) {
      res.status(err.statusCode).json({ success: false, message: err.message });
      return;
    }
    next(err);
  }
}
