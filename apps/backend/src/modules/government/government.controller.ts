import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listExecutiveOfficials,
  createExecutiveOfficial,
  updateExecutiveOfficial,
  deleteExecutiveOfficial,
  listLegislativeMembers,
  createLegislativeMember,
  updateLegislativeMember,
  deleteLegislativeMember,
  listMunicipalOffices,
  createMunicipalOffice,
  updateMunicipalOffice,
  deleteMunicipalOffice,
  listBarangays,
  createBarangay,
  updateBarangay,
  deleteBarangay,
} from "./government.service";
import { writeAuditLog } from "@/modules/audit/audit.service";

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const executiveSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  name: z.string().trim().min(1, "Name is required").max(255),
  email: z.string().trim().max(255).optional().default(""),
  phone: z.string().trim().max(100).optional().default(""),
  hours: z.string().trim().max(255).optional().default(""),
  order: z.number().int().optional().default(0),
});

const legislativeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  position: z.string().trim().min(1, "Position is required").max(255),
  committees: z.array(z.string().trim()).optional().default([]),
  order: z.number().int().optional().default(0),
});

const officeSchema = z.object({
  name: z.string().trim().min(1, "Office name is required").max(255),
  description: z.string().trim().min(1, "Description is required"),
  phone: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().max(255).optional().default(""),
  link: z.string().trim().max(500).optional().default(""),
  order: z.number().int().optional().default(0),
});

const barangaySchema = z.object({
  name: z.string().trim().min(1, "Barangay name is required").max(255),
  captain: z.string().trim().min(1, "Captain name is required").max(255),
  phone: z.string().trim().min(1, "Phone is required").max(100),
  order: z.number().int().optional().default(0),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}

function toRecord(entity: any, sectionKey: string, title: string) {
  return {
    id: String(entity._id),
    sectionKey,
    title,
    status: "published" as const,
    fields: { ...entity, id: undefined, _id: undefined, __v: undefined },
    createdAt: new Date(entity.createdAt).toISOString(),
    updatedAt: new Date(entity.updatedAt).toISOString(),
  };
}

function handleServiceError(err: any, res: Response, next: NextFunction) {
  if (err.statusCode) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }
  next(err);
}

// ─── Executive Officials ──────────────────────────────────────────────────────

export async function getExecutiveOfficials(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listExecutiveOfficials();
    res.json({
      success: true,
      data: records.map((r) =>
        toRecord(r, "executive", r.title + " — " + r.name),
      ),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminExecutiveOfficial(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = executiveSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createExecutiveOfficial(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Government",
          resourceId: String((record as any)._id),
          description: `Created executive official: ${record.name}`,
        },
      );
    }
    res.status(201).json({
      success: true,
      data: toRecord(record, "executive", record.title + " — " + record.name),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminExecutiveOfficial(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = executiveSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateExecutiveOfficial(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Government",
          resourceId: req.params.id,
          description: `Updated executive official: ${record.name}`,
        },
      );
    }
    res.json({
      success: true,
      data: toRecord(record, "executive", record.title + " — " + record.name),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminExecutiveOfficial(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteExecutiveOfficial(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Government",
          resourceId: req.params.id,
          description: "Deleted executive official",
        },
      );
    }
    res.json({ success: true, message: "Executive official deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Legislative Members ──────────────────────────────────────────────────────

export async function getLegislativeMembers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listLegislativeMembers();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "legislative", r.name)),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminLegislativeMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = legislativeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createLegislativeMember(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Government",
          resourceId: String((record as any)._id),
          description: `Created legislative member: ${record.name}`,
        },
      );
    }
    res.status(201).json({
      success: true,
      data: toRecord(record, "legislative", record.name),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminLegislativeMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = legislativeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateLegislativeMember(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Government",
          resourceId: req.params.id,
          description: `Updated legislative member: ${record.name}`,
        },
      );
    }
    res.json({
      success: true,
      data: toRecord(record, "legislative", record.name),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminLegislativeMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteLegislativeMember(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Government",
          resourceId: req.params.id,
          description: "Deleted legislative member",
        },
      );
    }
    res.json({ success: true, message: "Legislative member deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Municipal Offices ────────────────────────────────────────────────────────

export async function getMunicipalOffices(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listMunicipalOffices();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "offices", r.name)),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminMunicipalOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = officeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createMunicipalOffice(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Government",
          resourceId: String((record as any)._id),
          description: `Created municipal office: ${record.name}`,
        },
      );
    }
    res
      .status(201)
      .json({ success: true, data: toRecord(record, "offices", record.name) });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminMunicipalOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = officeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateMunicipalOffice(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Government",
          resourceId: req.params.id,
          description: `Updated municipal office: ${record.name}`,
        },
      );
    }
    res.json({ success: true, data: toRecord(record, "offices", record.name) });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminMunicipalOffice(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteMunicipalOffice(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Government",
          resourceId: req.params.id,
          description: "Deleted municipal office",
        },
      );
    }
    res.json({ success: true, message: "Municipal office deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

// ─── Barangays ────────────────────────────────────────────────────────────────

export async function getBarangays(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const records = await listBarangays();
    res.json({
      success: true,
      data: records.map((r) => toRecord(r, "barangays", r.name)),
    });
  } catch (err) {
    next(err);
  }
}

export async function createAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangaySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await createBarangay(parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "CREATE",
          module: "Government",
          resourceId: String((record as any)._id),
          description: `Created barangay: ${record.name}`,
        },
      );
    }
    res.status(201).json({
      success: true,
      data: toRecord(record, "barangays", record.name),
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = barangaySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }
    const record = await updateBarangay(req.params.id, parsed.data);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "UPDATE",
          module: "Government",
          resourceId: req.params.id,
          description: `Updated barangay: ${record.name}`,
        },
      );
    }
    res.json({
      success: true,
      data: toRecord(record, "barangays", record.name),
    });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}

export async function deleteAdminBarangay(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await deleteBarangay(req.params.id);
    if (req.admin) {
      writeAuditLog(
        {
          admin: req.admin,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"],
        },
        {
          action: "DELETE",
          module: "Government",
          resourceId: req.params.id,
          description: "Deleted barangay",
        },
      );
    }
    res.json({ success: true, message: "Barangay deleted" });
  } catch (err: any) {
    handleServiceError(err, res, next);
  }
}
