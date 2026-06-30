import { Request, Response } from "express";
import { z } from "zod";
import {
  DiscussionModel,
  GroupModel,
  FeaturedEventModel,
} from "./community.model";
import { uploadBase64ImageToR2 } from "@/shared/storage/r2";

// ─── Discussions ──────────────────────────────────────────────────────────────

/** GET /api/community/discussions — return all discussions, pinned first then newest */
export async function getDiscussions(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const discussions = await DiscussionModel.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: discussions });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch discussions" });
  }
}

const createDiscussionSchema = z.object({
  author: z.string().min(1).max(64).trim(),
  title: z.string().min(1).max(200).trim(),
  tags: z.array(z.string().max(40).trim()).max(4).default([]),
});

/** POST /api/community/discussions — create a new discussion thread */
export async function createDiscussion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = createDiscussionSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { author, title, tags } = parsed.data;
    const initials =
      author
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || author.slice(0, 2).toUpperCase();

    const discussion = await DiscussionModel.create({
      author,
      avatarInitials: initials,
      title,
      tags,
      replies: 0,
      isPinned: false,
    });

    res.status(201).json({ success: true, data: discussion });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to create discussion" });
  }
}

/** DELETE /api/community/discussions/:id — admin only */
export async function deleteDiscussion(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const doc = await DiscussionModel.findByIdAndDelete(id);
    if (!doc) {
      res.status(404).json({ success: false, message: "Discussion not found" });
      return;
    }
    res.json({ success: true, message: "Discussion deleted" });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete discussion" });
  }
}

// ─── Groups ───────────────────────────────────────────────────────────────────

/** GET /api/community/groups — return all active, approved groups, sorted by order */
export async function getGroups(_req: Request, res: Response): Promise<void> {
  try {
    const groups = await GroupModel.find({ isActive: true, status: "approved" })
      .sort({ order: 1, createdAt: 1 })
      .lean();
    res.json({ success: true, data: groups });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch groups" });
  }
}

const proposeGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().min(1).max(300).trim(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageKey: z.string().optional().or(z.literal("")),
});

/** POST /api/community/groups — propose a new group (public) */
export async function proposeGroup(req: Request, res: Response): Promise<void> {
  try {
    const parsed = proposeGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { name, description, imageUrl, imageKey } = parsed.data;
    const group = await GroupModel.create({
      name,
      description,
      imageUrl: imageUrl ?? "",
      imageKey: imageKey ?? "",
      memberCount: 0,
      isActive: true,
      status: "pending",
    });

    res.status(201).json({ success: true, data: group });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to propose group" });
  }
}

const uploadGroupImageSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  data: z.string().min(1),
});

/** POST /api/community/groups/upload-image — upload a group cover image to R2 (public) */
export async function uploadGroupImage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = uploadGroupImageSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const uploaded = await uploadBase64ImageToR2({
      ...parsed.data,
      folder: "community-groups",
    });

    res.status(201).json({ success: true, data: uploaded });
  } catch (err: any) {
    const status = err?.statusCode ?? 500;
    res.status(status).json({
      success: false,
      message: err?.message ?? "Failed to upload image",
    });
  }
}

/** GET /api/community/groups/all — list ALL groups for admin (all statuses) */
export async function listAllGroups(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const groups = await GroupModel.find()
      .sort({ status: 1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: groups });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch all groups" });
  }
}

/** DELETE /api/community/groups/:id — hard-delete a group (admin only) */
export async function deleteGroup(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const doc = await GroupModel.findByIdAndDelete(id);
    if (!doc) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }
    res.json({ success: true, message: "Group deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete group" });
  }
}

/** GET /api/community/groups/pending — list pending groups (admin only) */
export async function listPendingGroups(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const groups = await GroupModel.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: groups });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pending groups" });
  }
}

const updateGroupStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

/** PATCH /api/community/groups/:id/status — approve or reject a group (admin only) */
export async function updateGroupStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = updateGroupStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { id } = req.params;
    const group = await GroupModel.findByIdAndUpdate(
      id,
      { status: parsed.data.status },
      { new: true, lean: true },
    );

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    res.json({ success: true, data: group });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to update group status" });
  }
}

/** POST /api/community/groups/join/:id — increment member count (unauthenticated action) */
export async function joinGroup(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const group = await GroupModel.findByIdAndUpdate(
      id,
      { $inc: { memberCount: 1 } },
      { new: true, lean: true },
    );
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }
    res.json({ success: true, data: group });
  } catch {
    res.status(500).json({ success: false, message: "Failed to join group" });
  }
}

/** POST /api/community/groups/leave/:id — decrement member count */
export async function leaveGroup(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const group = await GroupModel.findByIdAndUpdate(
      id,
      { $inc: { memberCount: -1 } },
      { new: true, lean: true },
    );
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }
    res.json({ success: true, data: group });
  } catch {
    res.status(500).json({ success: false, message: "Failed to leave group" });
  }
}

// ─── Featured Event ───────────────────────────────────────────────────────────

/** GET /api/community/featured-event — return the single active featured event */
export async function getFeaturedEvent(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const event = await FeaturedEventModel.findOne({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Return null data gracefully when none is configured yet
    res.json({ success: true, data: event ?? null });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch featured event" });
  }
}

/** POST /api/community/featured-event/rsvp — no-op acknowledgement, no auth needed */
export async function rsvpFeaturedEvent(
  _req: Request,
  res: Response,
): Promise<void> {
  res.json({ success: true, message: "RSVP noted" });
}
