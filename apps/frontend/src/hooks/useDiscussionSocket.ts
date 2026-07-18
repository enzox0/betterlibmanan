/**
 * useDiscussionSocket — real-time discussion replies hook.
 *
 * Joins the Socket.IO room for `discussionId` while mounted.
 * Pushes incoming replies and like-toggle updates into the Zustand store.
 *
 * Usage:
 *   const { socketId } = useDiscussionSocket(discussionId, token);
 */

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import type { DiscussionReply } from "@/modules/admin/services/community.api";

/**
 * Module-level set of reply IDs whose like was just applied locally
 * (by toggleLikeReply in the store).  When the server echoes the update
 * back via the socket we skip it once to prevent a double-apply on the
 * user who triggered the like.
 */
export const pendingLikeIds = new Set<string>();

export function useDiscussionSocket(
  discussionId: string | undefined,
  token?: string,
) {
  const upsertReply = useCommunityStore((s) => s._upsertDiscussionReply);
  const updateReply = useCommunityStore((s) => s._updateDiscussionReply);
  const incrementReplies = useCommunityStore(
    (s) => s._incrementDiscussionReplies,
  );
  const socketIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!discussionId) return;

    const socket = getSocket(token ? `Bearer ${token}` : undefined);
    socketIdRef.current = socket.id;

    const onConnect = () => {
      socketIdRef.current = socket.id;
    };

    const onDiscussionReply = (raw: unknown) => {
      const reply = normaliseReply(raw);
      if (!reply) return;
      // _upsertDiscussionReply is a no-op if the reply already exists locally
      // (optimistic update from postReply). Only increment the counter when it
      // is genuinely new (i.e. from another user).
      const existing =
        useCommunityStore.getState().repliesByDiscussion[discussionId] ?? [];
      const isNew = !existing.some((r) => r._id === reply._id);
      upsertReply(discussionId, reply);
      if (isNew) incrementReplies(discussionId);
    };

    const onDiscussionReplyLike = (raw: unknown) => {
      const reply = normaliseReply(raw);
      if (!reply) return;
      // If the current user triggered this like, their store was already updated
      // from the API response — skip the echo-back once to avoid a double-write.
      if (pendingLikeIds.has(reply._id)) {
        pendingLikeIds.delete(reply._id);
        return;
      }
      // Use _updateDiscussionReply (always overwrites) so other users' like
      // counts are updated even though the reply already exists locally.
      updateReply(discussionId, reply);
    };

    socket.on("connect", onConnect);
    socket.on("discussion:reply", onDiscussionReply);
    socket.on("discussion:reply:like", onDiscussionReplyLike);

    socket.emit("join_discussion", discussionId, (ok: boolean) => {
      if (!ok)
        console.warn(
          "[useDiscussionSocket] Server rejected join for",
          discussionId,
        );
    });

    return () => {
      socket.emit("leave_discussion", discussionId);
      socket.off("connect", onConnect);
      socket.off("discussion:reply", onDiscussionReply);
      socket.off("discussion:reply:like", onDiscussionReplyLike);
    };
  }, [discussionId, token, upsertReply, updateReply, incrementReplies]);

  return { socketId: socketIdRef.current };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normaliseReply(raw: unknown): DiscussionReply | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    _id: String(r._id ?? ""),
    discussionId: String(r.discussionId ?? ""),
    parentReplyId: r.parentReplyId ? String(r.parentReplyId) : null,
    userId: String(r.userId ?? ""),
    author: String(r.author ?? ""),
    avatarInitials: String(r.avatarInitials ?? ""),
    avatarUrl: String(r.avatarUrl ?? ""),
    body: String(r.body ?? ""),
    likes: typeof r.likes === "number" ? r.likes : 0,
    likedBy: Array.isArray(r.likedBy) ? (r.likedBy as string[]) : [],
    createdAt: String(r.createdAt ?? new Date().toISOString()),
    updatedAt: String(r.updatedAt ?? new Date().toISOString()),
  };
}
