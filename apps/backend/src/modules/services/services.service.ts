import { Types } from "mongoose";
import {
  ServiceCategoryModel,
  LifeEventModel,
  type IServiceCategory,
  type ILifeEvent,
  type IServiceItem,
  type ServiceStatus,
} from "./services.model";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function serviceError(message: string, statusCode: number) {
  const err: any = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Category inputs ──────────────────────────────────────────────────────────

export interface CategoryInput {
  slug?: string;
  title: string;
  description?: string;
  iconKey?: string;
  status: ServiceStatus;
  services?: ServiceItemInput[];
}

export interface ServiceItemInput {
  id?: string;
  title: string;
  description?: string;
  fee?: string;
  processingTime?: string;
  link?: string;
  requirements?: string[];
  steps?: string[];
}

// ─── Life event inputs ────────────────────────────────────────────────────────

export interface LifeEventInput {
  slug?: string;
  title: string;
  iconKey?: string;
  serviceIds?: string[];
  status: ServiceStatus;
}

// ─── Category CRUD ────────────────────────────────────────────────────────────

export async function listPublishedCategories(): Promise<IServiceCategory[]> {
  return ServiceCategoryModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllCategories(): Promise<IServiceCategory[]> {
  return ServiceCategoryModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function getCategoryBySlug(
  slug: string,
): Promise<IServiceCategory | null> {
  return ServiceCategoryModel.findOne({ slug }).lean() as any;
}

export async function createCategory(
  input: CategoryInput,
): Promise<IServiceCategory> {
  const slug = (input.slug ?? generateSlug(input.title)).trim();

  const existing = await ServiceCategoryModel.findOne({ slug });
  if (existing) throw serviceError(`Slug "${slug}" is already taken.`, 409);

  const services: IServiceItem[] = (input.services ?? []).map((s) => ({
    id: s.id ?? generateSlug(s.title),
    title: s.title,
    description: s.description ?? "",
    fee: s.fee ?? "",
    processingTime: s.processingTime ?? "",
    link: s.link ?? "",
    requirements: s.requirements ?? [],
    steps: s.steps ?? [],
  }));

  const created = await ServiceCategoryModel.create({
    slug,
    title: input.title.trim(),
    description: (input.description ?? "").trim(),
    iconKey: (input.iconKey ?? "FaFileAlt").trim(),
    status: input.status,
    services,
  });

  return ServiceCategoryModel.findById(created._id).lean() as any;
}

export async function updateCategory(
  id: string,
  input: CategoryInput,
): Promise<IServiceCategory> {
  if (!Types.ObjectId.isValid(id)) throw serviceError("Invalid ID", 400);

  const existing = await ServiceCategoryModel.findById(id);
  if (!existing) throw serviceError("Category not found", 404);

  const slug = (input.slug ?? existing.slug).trim();

  // Check slug uniqueness (excluding self)
  const conflict = await ServiceCategoryModel.findOne({
    slug,
    _id: { $ne: existing._id },
  });
  if (conflict) throw serviceError(`Slug "${slug}" is already taken.`, 409);

  existing.slug = slug;
  existing.title = input.title.trim();
  existing.description = (input.description ?? "").trim();
  existing.iconKey = (input.iconKey ?? existing.iconKey).trim();
  existing.status = input.status;

  if (input.services !== undefined) {
    existing.services = input.services.map((s) => ({
      id: s.id ?? generateSlug(s.title),
      title: s.title,
      description: s.description ?? "",
      fee: s.fee ?? "",
      processingTime: s.processingTime ?? "",
      link: s.link ?? "",
      requirements: s.requirements ?? [],
      steps: s.steps ?? [],
    })) as any;
  }

  await existing.save();
  return ServiceCategoryModel.findById(id).lean() as any;
}

export async function deleteCategory(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw serviceError("Invalid ID", 400);

  const existing = await ServiceCategoryModel.findById(id);
  if (!existing) throw serviceError("Category not found", 404);

  await existing.deleteOne();
}

// ─── Individual service CRUD (within a category) ──────────────────────────────

export async function addServiceToCategory(
  categoryId: string,
  input: ServiceItemInput,
): Promise<IServiceCategory> {
  if (!Types.ObjectId.isValid(categoryId))
    throw serviceError("Invalid category ID", 400);

  const category = await ServiceCategoryModel.findById(categoryId);
  if (!category) throw serviceError("Category not found", 404);

  const serviceId = (input.id ?? generateSlug(input.title)).trim();
  const conflict = category.services.find((s) => s.id === serviceId);
  if (conflict)
    throw serviceError(
      `Service ID "${serviceId}" already exists in this category.`,
      409,
    );

  category.services.push({
    id: serviceId,
    title: input.title,
    description: input.description ?? "",
    fee: input.fee ?? "",
    processingTime: input.processingTime ?? "",
    link: input.link ?? "",
    requirements: input.requirements ?? [],
    steps: input.steps ?? [],
  } as any);

  await category.save();
  return ServiceCategoryModel.findById(categoryId).lean() as any;
}

export async function updateServiceInCategory(
  categoryId: string,
  serviceId: string,
  input: ServiceItemInput,
): Promise<IServiceCategory> {
  if (!Types.ObjectId.isValid(categoryId))
    throw serviceError("Invalid category ID", 400);

  const category = await ServiceCategoryModel.findById(categoryId);
  if (!category) throw serviceError("Category not found", 404);

  const idx = category.services.findIndex((s) => s.id === serviceId);
  if (idx === -1) throw serviceError("Service not found in category", 404);

  const newId = (input.id ?? serviceId).trim();
  // Check ID uniqueness if changing
  if (newId !== serviceId) {
    const conflict = category.services.find((s) => s.id === newId);
    if (conflict)
      throw serviceError(`Service ID "${newId}" already exists.`, 409);
  }

  category.services[idx] = {
    id: newId,
    title: input.title,
    description: input.description ?? "",
    fee: input.fee ?? "",
    processingTime: input.processingTime ?? "",
    link: input.link ?? "",
    requirements: input.requirements ?? [],
    steps: input.steps ?? [],
  } as any;

  await category.save();
  return ServiceCategoryModel.findById(categoryId).lean() as any;
}

export async function removeServiceFromCategory(
  categoryId: string,
  serviceId: string,
): Promise<IServiceCategory> {
  if (!Types.ObjectId.isValid(categoryId))
    throw serviceError("Invalid category ID", 400);

  const category = await ServiceCategoryModel.findById(categoryId);
  if (!category) throw serviceError("Category not found", 404);

  category.services = category.services.filter(
    (s) => s.id !== serviceId,
  ) as any;
  await category.save();
  return ServiceCategoryModel.findById(categoryId).lean() as any;
}

// ─── Life Event CRUD ──────────────────────────────────────────────────────────

export async function listPublishedLifeEvents(): Promise<ILifeEvent[]> {
  return LifeEventModel.find({ status: "published" })
    .sort({ createdAt: 1 })
    .lean() as any;
}

export async function listAllLifeEvents(): Promise<ILifeEvent[]> {
  return LifeEventModel.find().sort({ createdAt: 1 }).lean() as any;
}

export async function createLifeEvent(
  input: LifeEventInput,
): Promise<ILifeEvent> {
  const slug = (input.slug ?? generateSlug(input.title)).trim();

  const existing = await LifeEventModel.findOne({ slug });
  if (existing) throw serviceError(`Slug "${slug}" is already taken.`, 409);

  const created = await LifeEventModel.create({
    slug,
    title: input.title.trim(),
    iconKey: (input.iconKey ?? "FaStore").trim(),
    serviceIds: input.serviceIds ?? [],
    status: input.status,
  });

  return LifeEventModel.findById(created._id).lean() as any;
}

export async function updateLifeEvent(
  id: string,
  input: LifeEventInput,
): Promise<ILifeEvent> {
  if (!Types.ObjectId.isValid(id)) throw serviceError("Invalid ID", 400);

  const existing = await LifeEventModel.findById(id);
  if (!existing) throw serviceError("Life event not found", 404);

  const slug = (input.slug ?? existing.slug).trim();
  const conflict = await LifeEventModel.findOne({
    slug,
    _id: { $ne: existing._id },
  });
  if (conflict) throw serviceError(`Slug "${slug}" is already taken.`, 409);

  existing.slug = slug;
  existing.title = input.title.trim();
  existing.iconKey = (input.iconKey ?? existing.iconKey).trim();
  existing.serviceIds = input.serviceIds ?? existing.serviceIds;
  existing.status = input.status;

  await existing.save();
  return LifeEventModel.findById(id).lean() as any;
}

export async function deleteLifeEvent(id: string): Promise<void> {
  if (!Types.ObjectId.isValid(id)) throw serviceError("Invalid ID", 400);

  const existing = await LifeEventModel.findById(id);
  if (!existing) throw serviceError("Life event not found", 404);

  await existing.deleteOne();
}
