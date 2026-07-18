import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import { requireUser } from "@/modules/users/user.middleware";
import {
  getDiscussions,
  createDiscussion,
  deleteDiscussion,
  getGroups,
  listAllGroups,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  getFeaturedEvent,
  rsvpFeaturedEvent,
  proposeGroup,
  listPendingGroups,
  updateGroupStatus,
  uploadGroupImage,
  getDiscussionReplies,
  createDiscussionReply,
  likeDiscussionReply,
  deleteDiscussionReply,
  getGroupMessages,
  createGroupMessage,
  deleteGroupMessage,
  reactToGroupMessage,
  getTrendingTags,
} from "./community.controller";

export const communityRouter: Router = Router();

// ─── Discussions ──────────────────────────────────────────────────────────────
communityRouter.get("/discussions", getDiscussions);
communityRouter.post("/discussions", requireUser, createDiscussion);
communityRouter.delete("/discussions/:id", requireAuth, deleteDiscussion);

// ─── Discussion Replies ───────────────────────────────────────────────────────
communityRouter.get("/discussions/:id/replies", getDiscussionReplies);
communityRouter.post(
  "/discussions/:id/replies",
  requireUser,
  createDiscussionReply,
);
communityRouter.post("/replies/:id/like", requireUser, likeDiscussionReply);
communityRouter.delete("/replies/:id", requireAuth, deleteDiscussionReply);

// ─── Groups ───────────────────────────────────────────────────────────────────
communityRouter.get("/groups", getGroups);
communityRouter.post("/groups", requireUser, proposeGroup);
communityRouter.post("/groups/upload-image", uploadGroupImage);
communityRouter.post("/groups/join/:id", requireUser, joinGroup);
communityRouter.post("/groups/leave/:id", requireUser, leaveGroup);
communityRouter.get("/groups/pending", requireAuth, listPendingGroups);
communityRouter.get("/groups/all", requireAuth, listAllGroups);
communityRouter.patch("/groups/:id/status", requireAuth, updateGroupStatus);
communityRouter.delete("/groups/:id", requireAuth, deleteGroup);
communityRouter.get("/groups/:id/members", getGroupMembers);

// ─── Group Messages ───────────────────────────────────────────────────────────
communityRouter.get("/groups/:id/messages", getGroupMessages);
communityRouter.post("/groups/:id/messages", requireUser, createGroupMessage);
communityRouter.post(
  "/groups/:id/messages/:msgId/react",
  requireUser,
  reactToGroupMessage,
);
communityRouter.delete(
  "/groups/:groupId/messages/:messageId",
  requireAuth,
  deleteGroupMessage,
);

// ─── Featured Event ───────────────────────────────────────────────────────────
communityRouter.get("/featured-event", getFeaturedEvent);
communityRouter.post("/featured-event/rsvp", rsvpFeaturedEvent);

// ─── Trending Tags ────────────────────────────────────────────────────────────
communityRouter.get("/trending-tags", getTrendingTags);
