/**
 * useGroupSocket — real-time group chat hook.
 *
 * Joins the Socket.IO room for `groupId` while the component is mounted.
 * Pushes server-emitted messages / reactions / deletions directly into the
 * Zustand community store so the UI updates without a refetch.
 *
 * The sender is excluded from `group:message` broadcasts by the server
 * (via the `x-socket-id` header on POST /groups/:id/messages).  This hook
 * also injects the socket id into the store's send function so that header
 * is forwarded automatically.
 *
 * Usage:
 *   const { socketId } = useGroupSocket(groupId, token);
 */

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import type { GroupMessage } from "@/modules/admin/services/community.api";

export function useGroupSocket(groupId: string | undefined, token?: string) {
  const upsertMessage = useCommunityStore((s) => s._upsertGroupMessage);
  const updateMessage = useCommunityStore((s) => s._updateGroupMessage);
  const deleteMessage = useCommunityStore((s) => s._deleteGroupMessage);
  const socketIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!groupId) return;

    const socket = getSocket(token ? `Bearer ${token}` : undefined);
    socketIdRef.current = socket.id;

    const onConnect = () => {
      socketIdRef.current = socket.id;
    };

    const onGroupMessage = (raw: unknown) => {
      const msg = normaliseMessage(raw);
      if (!msg) return;
      // Skip if already added locally by the optimistic update in sendGroupMessage
      const existing =
        useCommunityStore.getState().messagesByGroup[groupId] ?? [];
      if (existing.some((m) => m._id === msg._id)) return;
      upsertMessage(groupId, msg);
    };

    const onGroupMessageReact = (raw: unknown) => {
      const msg = normaliseMessage(raw);
      if (!msg) return;
      // Overwrite with the server's authoritative reaction state.
      // This reconciles all clients — including the reactor who already saw
      // the optimistic update — with the canonical data from the database.
      updateMessage(groupId, msg);
    };

    const onGroupMessageDelete = (payload: {
      messageId: string;
      groupId: string;
    }) => {
      if (payload.groupId === groupId) {
        deleteMessage(groupId, payload.messageId);
      }
    };

    socket.on("connect", onConnect);
    socket.on("group:message", onGroupMessage);
    socket.on("group:message:react", onGroupMessageReact);
    socket.on("group:message:delete", onGroupMessageDelete);

    socket.emit("join_group", groupId, (ok: boolean) => {
      if (!ok)
        console.warn("[useGroupSocket] Server rejected join for", groupId);
    });

    return () => {
      socket.emit("leave_group", groupId);
      socket.off("connect", onConnect);
      socket.off("group:message", onGroupMessage);
      socket.off("group:message:react", onGroupMessageReact);
      socket.off("group:message:delete", onGroupMessageDelete);
    };
  }, [groupId, token, upsertMessage, updateMessage, deleteMessage]);

  return { socketId: socketIdRef.current };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalize a raw socket payload into a typed GroupMessage.
 * Mongoose `toObject()` serialises ObjectIds as strings and Maps as plain
 * objects — but the field names match the REST API exactly.
 */
function normaliseMessage(raw: unknown): GroupMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;

  // Ensure reactions is a plain Record<string, string[]>
  const rawReactions = m.reactions;
  let reactions: Record<string, string[]> = {};
  if (rawReactions && typeof rawReactions === "object") {
    reactions = rawReactions as Record<string, string[]>;
  }

  return {
    _id: String(m._id ?? ""),
    groupId: String(m.groupId ?? ""),
    replyToId: m.replyToId ? String(m.replyToId) : null,
    replyToAuthor: String(m.replyToAuthor ?? ""),
    replyToText: String(m.replyToText ?? ""),
    userId: String(m.userId ?? ""),
    author: String(m.author ?? ""),
    avatarInitials: String(m.avatarInitials ?? ""),
    avatarUrl: String(m.avatarUrl ?? ""),
    text: String(m.text ?? ""),
    reactions,
    createdAt: String(m.createdAt ?? new Date().toISOString()),
    updatedAt: String(m.updatedAt ?? new Date().toISOString()),
  };
}
