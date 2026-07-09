import { Request, Response } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import {
  DiscussionModel,
  GroupModel,
  FeaturedEventModel,
  DiscussionReplyModel,
  GroupMessageModel,
} from "./community.model";
import { UserModel } from "../users/user.model";
import { uploadBase64ImageToR2 } from "@/shared/storage/r2";
import {
  emitGroupMessage,
  emitGroupMessageReaction,
  emitGroupMessageDelete,
  emitDiscussionReply,
  emitDiscussionReplyLike,
} from "@/gateway/websocket/socket";

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

    // Update avatarUrl with current user data
    const userIds = [...new Set(discussions.map((d) => d.userId))];
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select("_id avatarUrl")
      .lean();
    const userMap = new Map(
      users.map((u) => [u._id.toString(), u.avatarUrl ?? ""]),
    );

    const updatedDiscussions = discussions.map((d) => ({
      ...d,
      avatarUrl: userMap.get(d.userId) ?? d.avatarUrl,
    }));

    res.json({ success: true, data: updatedDiscussions });
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

    // Fetch the user's current avatarUrl from the DB so it's always accurate
    const userId = req.user!.sub;
    const user = await UserModel.findById(userId).lean();
    const avatarUrl = user?.avatarUrl ?? "";

    const initials =
      author
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || author.slice(0, 2).toUpperCase();

    const discussion = await DiscussionModel.create({
      userId,
      author,
      avatarInitials: initials,
      avatarUrl,
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

/** POST /api/community/groups — propose a new group (requireUser enforced in routes) */
export async function proposeGroup(req: Request, res: Response): Promise<void> {
  try {
    const parsed = proposeGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const { name, description, imageUrl, imageKey } = parsed.data;

    // Founder info — guaranteed by requireUser middleware
    const userId = req.user!.sub;
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const displayName = user.displayName;
    const avatarUrl = user.avatarUrl ?? "";
    const initials =
      displayName
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || displayName.slice(0, 2).toUpperCase();

    // Create group and immediately add the proposer as the first member
    const group = await GroupModel.create({
      name,
      description,
      imageUrl: imageUrl ?? "",
      imageKey: imageKey ?? "",
      memberCount: 1,
      members: [
        {
          userId,
          displayName,
          avatarInitials: initials,
          avatarUrl,
          joinedAt: new Date(),
        },
      ],
      isActive: true,
      status: "pending",
      proposedBy: userId,
      proposerName: displayName,
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

/** POST /api/community/groups/join/:id — join group (requireUser enforced in routes) */
export async function joinGroup(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.sub;

    // Fetch the user to get displayName and avatarUrl
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const displayName = user.displayName;
    const avatarUrl = user.avatarUrl ?? "";
    const initials =
      displayName
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || displayName.slice(0, 2).toUpperCase();

    const group = await GroupModel.findById(id);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      res.status(409).json({ success: false, message: "Already a member" });
      return;
    }

    group.members.push({
      userId,
      displayName,
      avatarInitials: initials,
      avatarUrl,
      joinedAt: new Date(),
    });
    group.memberCount = group.members.length;
    await group.save();

    const updated = await GroupModel.findById(id).lean();
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Failed to join group" });
  }
}

/** POST /api/community/groups/leave/:id — leave group (requireUser enforced in routes) */
export async function leaveGroup(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.sub;

    const group = await GroupModel.findById(id);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const wasMember = group.members.some((m) => m.userId === userId);
    if (!wasMember) {
      res.status(409).json({ success: false, message: "Not a member" });
      return;
    }

    group.members = group.members.filter((m) => m.userId !== userId);
    group.memberCount = group.members.length;
    await group.save();

    const updated = await GroupModel.findById(id).lean();
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Failed to leave group" });
  }
}

/** GET /api/community/groups/:id/members — list members with display names (public) */
export async function getGroupMembers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid group ID" });
      return;
    }
    const group = await GroupModel.findById(id)
      .select("members memberCount")
      .lean();
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }
    res.json({
      success: true,
      data: { members: group.members, memberCount: group.memberCount },
    });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch members" });
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

// ─── Discussion Replies ───────────────────────────────────────────────────────

/** GET /api/community/discussions/:id/replies — all replies, oldest first */
export async function getDiscussionReplies(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid discussion ID" });
      return;
    }
    const replies = await DiscussionReplyModel.find({ discussionId: id })
      .sort({ createdAt: 1 })
      .lean();

    // Update avatarUrl with current user data
    const userIds = [...new Set(replies.map((r) => r.userId))];
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select("_id avatarUrl")
      .lean();
    const userMap = new Map(
      users.map((u) => [u._id.toString(), u.avatarUrl ?? ""]),
    );

    const updatedReplies = replies.map((r) => ({
      ...r,
      avatarUrl: userMap.get(r.userId) ?? r.avatarUrl,
    }));

    res.json({ success: true, data: updatedReplies });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch replies" });
  }
}

const createReplySchema = z.object({
  author: z.string().min(1).max(64).trim(),
  body: z.string().min(1).max(500).trim(),
  parentReplyId: z.string().optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
});

/** POST /api/community/discussions/:id/replies — post a reply (requireUser enforced in routes) */
export async function createDiscussionReply(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid discussion ID" });
      return;
    }

    const parsed = createReplySchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const discussion = await DiscussionModel.findById(id);
    if (!discussion) {
      res.status(404).json({ success: false, message: "Discussion not found" });
      return;
    }

    const { author, body, parentReplyId, avatarUrl } = parsed.data;

    // Get userId from authenticated user
    const userId = req.user!.sub;

    // Validate parentReplyId if provided
    if (parentReplyId) {
      if (!Types.ObjectId.isValid(parentReplyId)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid parentReplyId" });
        return;
      }
      const parent = await DiscussionReplyModel.findById(parentReplyId);
      if (!parent || parent.discussionId.toString() !== id) {
        res
          .status(404)
          .json({ success: false, message: "Parent reply not found" });
        return;
      }
    }

    const initials =
      author
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || author.slice(0, 2).toUpperCase();

    const reply = await DiscussionReplyModel.create({
      discussionId: id,
      parentReplyId: parentReplyId ?? null,
      userId,
      author,
      avatarInitials: initials,
      avatarUrl: avatarUrl ?? "",
      body,
    });

    // Increment reply count on the discussion
    await DiscussionModel.findByIdAndUpdate(id, { $inc: { replies: 1 } });

    // Broadcast to all other clients currently viewing this discussion.
    // The sender already has the reply in their optimistic update, so we
    // deliberately exclude them via the socket-id header if provided.
    const senderSocketId = req.headers["x-socket-id"] as string | undefined;
    emitDiscussionReply(id, reply.toObject(), senderSocketId);

    res.status(201).json({ success: true, data: reply });
  } catch {
    res.status(500).json({ success: false, message: "Failed to post reply" });
  }
}

/** POST /api/community/replies/:id/like — toggle like (requireUser enforced in routes) */
export async function likeDiscussionReply(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid reply ID" });
      return;
    }

    const userId = req.user!.sub;
    const reply = await DiscussionReplyModel.findById(id);
    if (!reply) {
      res.status(404).json({ success: false, message: "Reply not found" });
      return;
    }

    const alreadyLiked = reply.likedBy.includes(userId);
    if (alreadyLiked) {
      reply.likedBy = reply.likedBy.filter((uid) => uid !== userId);
      reply.likes = Math.max(0, reply.likes - 1);
    } else {
      reply.likedBy.push(userId);
      reply.likes += 1;
    }
    await reply.save();

    // Broadcast the updated reply so all clients see the new like count.
    emitDiscussionReplyLike(reply.discussionId.toString(), reply.toObject());

    res.json({ success: true, data: reply });
  } catch {
    res.status(500).json({ success: false, message: "Failed to toggle like" });
  }
}

/** DELETE /api/community/replies/:id — admin only */
export async function deleteDiscussionReply(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const reply = await DiscussionReplyModel.findByIdAndDelete(id);
    if (!reply) {
      res.status(404).json({ success: false, message: "Reply not found" });
      return;
    }
    // Decrement reply count on the parent discussion
    await DiscussionModel.findByIdAndUpdate(reply.discussionId, {
      $inc: { replies: -1 },
    });
    res.json({ success: true, message: "Reply deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to delete reply" });
  }
}

// ─── Group Messages ───────────────────────────────────────────────────────────

/** GET /api/community/groups/:id/messages — fetch recent messages, oldest first */
export async function getGroupMessages(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid group ID" });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const messages = await GroupMessageModel.find({ groupId: id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Update avatarUrl with current user data
    const userIds = [...new Set(messages.map((m) => m.userId))];
    const users = await UserModel.find({ _id: { $in: userIds } })
      .select("_id avatarUrl")
      .lean();
    const userMap = new Map(
      users.map((u) => [u._id.toString(), u.avatarUrl ?? ""]),
    );

    const updatedMessages = messages.map((m) => ({
      ...m,
      avatarUrl: userMap.get(m.userId) ?? m.avatarUrl,
    }));

    res.json({ success: true, data: updatedMessages.reverse() });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch messages" });
  }
}

const createGroupMessageSchema = z.object({
  author: z.string().min(1).max(64).trim(),
  text: z.string().min(1).max(1000).trim(),
  replyToId: z.string().optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
});

/** POST /api/community/groups/:id/messages — send a message (requireUser enforced in routes) */
export async function createGroupMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: "Invalid group ID" });
      return;
    }

    const parsed = createGroupMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message);
      res.status(400).json({ success: false, message: errors[0], errors });
      return;
    }

    const group = await GroupModel.findById(id);
    if (!group || group.status !== "approved") {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const { author, text, replyToId, avatarUrl } = parsed.data;

    // Get userId from authenticated user
    const userId = req.user!.sub;

    let replyToAuthor = "";
    let replyToText = "";
    if (replyToId) {
      if (!Types.ObjectId.isValid(replyToId)) {
        res.status(400).json({ success: false, message: "Invalid replyToId" });
        return;
      }
      const parent = await GroupMessageModel.findById(replyToId).lean();
      if (parent && parent.groupId.toString() === id) {
        replyToAuthor = parent.author;
        replyToText = parent.text.slice(0, 200);
      }
    }

    const initials =
      author
        .split(/\s+/)
        .map((w) => w[0] ?? "")
        .slice(0, 2)
        .join("")
        .toUpperCase() || author.slice(0, 2).toUpperCase();

    const message = await GroupMessageModel.create({
      groupId: id,
      replyToId: replyToId ?? null,
      replyToAuthor,
      replyToText,
      userId,
      author,
      avatarInitials: initials,
      avatarUrl: avatarUrl ?? "",
      text,
    });

    // Broadcast to all other clients currently in the group room.
    const senderSocketId = req.headers["x-socket-id"] as string | undefined;
    emitGroupMessage(id, message.toObject(), senderSocketId);

    res.status(201).json({ success: true, data: message });
  } catch {
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
}

/** POST /api/community/groups/:id/messages/:msgId/react — toggle a reaction (requireUser) */
export async function reactToGroupMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id, msgId } = req.params;
    const { emoji } = req.body as { emoji?: string };
    if (!emoji || typeof emoji !== "string" || emoji.length > 8) {
      res.status(400).json({ success: false, message: "Invalid emoji" });
      return;
    }
    if (!Types.ObjectId.isValid(msgId)) {
      res.status(400).json({ success: false, message: "Invalid message ID" });
      return;
    }

    const userId = req.user!.sub;
    const msg = await GroupMessageModel.findOne({ _id: msgId, groupId: id });
    if (!msg) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }

    const existing: string[] = msg.reactions.get(emoji) ?? [];
    if (existing.includes(userId)) {
      // Remove reaction
      const updated = existing.filter((u) => u !== userId);
      if (updated.length === 0) {
        msg.reactions.delete(emoji);
      } else {
        msg.reactions.set(emoji, updated);
      }
    } else {
      msg.reactions.set(emoji, [...existing, userId]);
    }
    await msg.save();

    // Convert Mongoose Map → plain object so JSON.stringify / Socket.IO serialize it correctly.
    // msg.toObject() / toJSON() does NOT automatically flatten Map fields to POJOs —
    // they must be converted manually.
    const plain = msg.toObject({ flattenMaps: true });

    // Broadcast the updated message so all viewers see the new reaction counts.
    emitGroupMessageReaction(id, plain);

    res.json({ success: true, data: plain });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to react to message" });
  }
}

/** DELETE /api/community/groups/:groupId/messages/:messageId — admin only */
export async function deleteGroupMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { groupId, messageId } = req.params;
    const doc = await GroupMessageModel.findByIdAndDelete(messageId);
    if (!doc) {
      res.status(404).json({ success: false, message: "Message not found" });
      return;
    }
    // Notify all clients in the group room that the message was removed.
    emitGroupMessageDelete(groupId, messageId);
    res.json({ success: true, message: "Message deleted" });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to delete message" });
  }
}

// ─── Trending Hashtags ────────────────────────────────────────────────────────

/** GET /api/community/trending-tags — top tags by frequency from discussions */
export async function getTrendingTags(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const result = await DiscussionModel.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 12 },
      { $project: { _id: 0, label: "$_id", count: 1 } },
    ]);
    res.json({ success: true, data: result });
  } catch {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch trending tags" });
  }
}
