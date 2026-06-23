import { Types } from "mongoose";
import {
  AtAGlanceModel,
  type AtAGlanceStatus,
  type IAtAGlance,
} from "./at-a-glance.model";

export interface AtAGlanceInput {
  label: string;
  value: string;
  icon?: string;
  sub?: string;
  status: AtAGlanceStatus;
}

function atAGlanceError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

export async function listPublishedAtAGlance(): Promise<IAtAGlance[]> {
  return AtAGlanceModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllAtAGlance(): Promise<IAtAGlance[]> {
  return AtAGlanceModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createAtAGlance(
  input: AtAGlanceInput,
): Promise<IAtAGlance> {
  const created = await AtAGlanceModel.create({
    label: input.label.trim(),
    value: input.value.trim(),
    icon: (input.icon ?? "").trim(),
    sub: (input.sub ?? "").trim(),
    status: input.status,
  });

  return AtAGlanceModel.findById(created._id).lean() as any;
}

export async function updateAtAGlance(
  id: string,
  input: AtAGlanceInput,
): Promise<IAtAGlance> {
  if (!Types.ObjectId.isValid(id)) throw atAGlanceError("Invalid ID", 400);

  const existing = await AtAGlanceModel.findById(id);
  if (!existing) throw atAGlanceError("At a Glance record not found", 404);

  existing.label = input.label.trim();
  existing.value = input.value.trim();
  if (input.icon !== undefined) {
    existing.icon = (input.icon ?? "").trim();
  }
  if (input.sub !== undefined) {
    existing.sub = (input.sub ?? "").trim();
  }
  existing.status = input.status;

  await existing.save();

  return AtAGlanceModel.findById(id).lean() as any;
}

export async function deleteAtAGlance(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw atAGlanceError("Invalid ID", 400);

  const existing = await AtAGlanceModel.findById(id);
  if (!existing) throw atAGlanceError("At a Glance record not found", 404);

  await existing.deleteOne();
}
