/**
 * Socket.IO gateway for real-time community messaging.
 *
 * Rooms:
 *   group:<groupId>       — all active viewers of a group chat
 *   discussion:<id>       — all active viewers of a discussion thread
 *
 * Authentication:
 *   Optional — unauthenticated sockets can join rooms read-only.
 *   Write events (new messages, new replies) are only broadcast by the
 *   HTTP controller after persistence; the socket is used purely for
 *   fan-out, not as the message-acceptance path.
 *
 * Lifecycle:
 *   - connect          → auth handshake (optional bearer token)
 *   - join_group       → socket joins room `group:<id>`
 *   - leave_group      → socket leaves room `group:<id>`
 *   - join_discussion  → socket joins room `discussion:<id>`
 *   - leave_discussion → socket leaves room `discussion:<id>`
 *   - disconnect       → automatic room cleanup by Socket.IO
 *
 * Server-emitted events:
 *   group:message       — new GroupMessage document
 *   group:message:react — updated GroupMessage document (reactions changed)
 *   discussion:reply    — new DiscussionReply document
 *   discussion:reply:like — updated DiscussionReply document (likes changed)
 *
 * Scalability note:
 *   For multi-process deployments, replace the in-memory adapter with
 *   @socket.io/redis-adapter (REDIS_URL is already in .env.example).
 *   The rest of this file stays identical.
 */

import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import {
  verifyUserToken,
  UserTokenPayload,
} from "@/modules/users/user.service";
import { logger } from "@/shared/logger";

// ─── Augment socket data type ─────────────────────────────────────────────────

interface SocketData {
  user?: UserTokenPayload; // populated if a valid user token was supplied
}

// ─── Event maps (for documentation / type safety) ────────────────────────────

/** Events the SERVER emits to clients */
export interface ServerToClientEvents {
  "group:message": (message: unknown) => void;
  "group:message:react": (message: unknown) => void;
  "group:message:delete": (payload: {
    messageId: string;
    groupId: string;
  }) => void;
  "discussion:reply": (reply: unknown) => void;
  "discussion:reply:like": (reply: unknown) => void;
}

/** Events the CLIENT sends to the server */
interface ClientToServerEvents {
  join_group: (groupId: string, ack?: (ok: boolean) => void) => void;
  leave_group: (groupId: string) => void;
  join_discussion: (discussionId: string, ack?: (ok: boolean) => void) => void;
  leave_discussion: (discussionId: string) => void;
}

// ─── Singleton io instance (exported for use in controllers) ─────────────────

let _io: SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
> | null = null;

/**
 * Returns the Socket.IO server instance. Throws if not yet initialised.
 * Use `emitToGroup` / `emitToDiscussion` helpers instead of calling this directly.
 */
export function getIO(): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  SocketData
> {
  if (!_io)
    throw new Error(
      "[Socket.IO] Server not initialised. Call initSocketIO first.",
    );
  return _io;
}

// ─── Initialisation ───────────────────────────────────────────────────────────

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : ["http://localhost:3000", "http://localhost:5000"];

  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<string, never>,
    SocketData
  >(httpServer, {
    path: "/socket.io",
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Ping / pong keep-alive configuration
    pingTimeout: 20_000,
    pingInterval: 25_000,
    // Allow up to 1 MB per message (matches Express body-parser limit)
    maxHttpBufferSize: 1e6,
    // Use WebSocket where possible; fall back to long-polling automatically
    transports: ["websocket", "polling"],
    // Graceful reconnection window — clients accumulate events during this period
    connectTimeout: 10_000,
  });

  // ── Auth middleware (runs once per connection) ────────────────────────────
  // Token is optional: unauthenticated sockets get read-only access.
  // Authenticated sockets have their payload stored in socket.data.user.
  io.use((socket, next) => {
    const raw =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, "");

    if (!raw) {
      // Guest connection — allowed for read-only events
      return next();
    }

    try {
      const payload = verifyUserToken(raw);
      if (payload.type !== "user-access") return next(); // silently downgrade
      socket.data.user = payload;
    } catch {
      // Invalid / expired token — connect as guest rather than refusing
      // (so the client still gets live updates even with a stale token)
    }
    next();
  });

  // ── Connection handler ────────────────────────────────────────────────────
  io.on(
    "connection",
    (
      socket: Socket<
        ClientToServerEvents,
        ServerToClientEvents,
        Record<string, never>,
        SocketData
      >,
    ) => {
      const userId = socket.data.user?.sub ?? "(guest)";
      logger.debug(`[Socket.IO] connect  sid=${socket.id} uid=${userId}`);

      // ── join_group ──────────────────────────────────────────────────────────
      socket.on("join_group", (groupId, ack) => {
        if (!isValidId(groupId)) {
          ack?.(false);
          return;
        }
        const room = `group:${groupId}`;
        socket.join(room);
        logger.debug(`[Socket.IO] join_group sid=${socket.id} room=${room}`);
        ack?.(true);
      });

      // ── leave_group ─────────────────────────────────────────────────────────
      socket.on("leave_group", (groupId) => {
        socket.leave(`group:${groupId}`);
      });

      // ── join_discussion ─────────────────────────────────────────────────────
      socket.on("join_discussion", (discussionId, ack) => {
        if (!isValidId(discussionId)) {
          ack?.(false);
          return;
        }
        const room = `discussion:${discussionId}`;
        socket.join(room);
        logger.debug(
          `[Socket.IO] join_discussion sid=${socket.id} room=${room}`,
        );
        ack?.(true);
      });

      // ── leave_discussion ────────────────────────────────────────────────────
      socket.on("leave_discussion", (discussionId) => {
        socket.leave(`discussion:${discussionId}`);
      });

      // ── disconnect ──────────────────────────────────────────────────────────
      socket.on("disconnect", (reason) => {
        logger.debug(
          `[Socket.IO] disconnect sid=${socket.id} reason=${reason}`,
        );
      });
    },
  );

  _io = io as any;
  logger.info("[Socket.IO] Server initialised");
  return io;
}

// ─── Emitter helpers (called from HTTP controllers after DB persist) ──────────

/** Broadcast a new group message to everyone in the group room except the sender. */
export function emitGroupMessage(
  groupId: string,
  message: unknown,
  senderSocketId?: string,
): void {
  if (!_io) return;
  const room = `group:${groupId}`;
  if (senderSocketId) {
    _io.to(room).except(senderSocketId).emit("group:message", message);
  } else {
    _io.to(room).emit("group:message", message);
  }
}

/** Broadcast an updated group message (reactions changed) to the entire group room. */
export function emitGroupMessageReaction(
  groupId: string,
  message: unknown,
): void {
  if (!_io) return;
  _io.to(`group:${groupId}`).emit("group:message:react", message);
}

/** Notify the group room that a message was deleted (admin action). */
export function emitGroupMessageDelete(
  groupId: string,
  messageId: string,
): void {
  if (!_io) return;
  _io
    .to(`group:${groupId}`)
    .emit("group:message:delete", { messageId, groupId });
}

/** Broadcast a new discussion reply to everyone viewing the discussion. */
export function emitDiscussionReply(
  discussionId: string,
  reply: unknown,
  senderSocketId?: string,
): void {
  if (!_io) return;
  const room = `discussion:${discussionId}`;
  if (senderSocketId) {
    _io.to(room).except(senderSocketId).emit("discussion:reply", reply);
  } else {
    _io.to(room).emit("discussion:reply", reply);
  }
}

/** Broadcast a like-toggle update to everyone viewing the discussion. */
export function emitDiscussionReplyLike(
  discussionId: string,
  reply: unknown,
): void {
  if (!_io) return;
  _io.to(`discussion:${discussionId}`).emit("discussion:reply:like", reply);
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Basic MongoDB ObjectId format check — 24 hex chars. */
function isValidId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-f]{24}$/i.test(id);
}
