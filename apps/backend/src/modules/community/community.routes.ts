import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.module";
import {
  getDiscussions,
  createDiscussion,
  deleteDiscussion,
  getGroups,
  listAllGroups,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getFeaturedEvent,
  rsvpFeaturedEvent,
  proposeGroup,
  listPendingGroups,
  updateGroupStatus,
  uploadGroupImage,
} from "./community.controller";

export const communityRouter: Router = Router();

// ─── Discussions ──────────────────────────────────────────────────────────────
// Public: anyone can read and post
communityRouter.get("/discussions", getDiscussions);
communityRouter.post("/discussions", createDiscussion);
// Admin-only: remove a discussion
communityRouter.delete("/discussions/:id", requireAuth, deleteDiscussion);

// ─── Groups ───────────────────────────────────────────────────────────────────
// Public: read approved groups and toggle membership
communityRouter.get("/groups", getGroups);
// Public: propose a new group
communityRouter.post("/groups", proposeGroup);
// Public: upload a group cover image
communityRouter.post("/groups/upload-image", uploadGroupImage);
// Public: toggle membership
communityRouter.post("/groups/join/:id", joinGroup);
communityRouter.post("/groups/leave/:id", leaveGroup);
// Admin only: list pending groups (must come before /:id param routes)
communityRouter.get("/groups/pending", requireAuth, listPendingGroups);
// Admin only: list all groups regardless of status
communityRouter.get("/groups/all", requireAuth, listAllGroups);
// Admin only: approve or reject a group
communityRouter.patch("/groups/:id/status", requireAuth, updateGroupStatus);
// Admin only: hard-delete a group
communityRouter.delete("/groups/:id", requireAuth, deleteGroup);

// ─── Featured Event ───────────────────────────────────────────────────────────
// Public: read and RSVP
communityRouter.get("/featured-event", getFeaturedEvent);
communityRouter.post("/featured-event/rsvp", rsvpFeaturedEvent);
