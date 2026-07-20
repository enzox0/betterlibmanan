/**
 * Socket.IO client singleton.
 *
 * Connects lazily when first called — the connection is shared across the
 * entire app.  Authentication is optional: the token is injected when
 * available so the server can associate the socket with a user, but the
 * connection still works (read-only) for guests.
 *
 * Usage:
 *   import { getSocket } from "@/lib/socket";
 *   const socket = getSocket();                      // guest
 *   const socket = getSocket("Bearer eyJ...");       // authenticated
 *
 * Reconnection:
 *   Socket.IO's built-in exponential back-off handles transient network
 *   failures.  We configure a generous retry window so the UI degrades
 *   gracefully rather than giving up immediately.
 */

import { io, Socket } from "socket.io-client";

// Match server-side event contracts
interface ServerToClientEvents {
  "group:message": (message: unknown) => void;
  "group:message:react": (message: unknown) => void;
  "group:message:delete": (payload: {
    messageId: string;
    groupId: string;
  }) => void;
  "discussion:reply": (reply: unknown) => void;
  "discussion:reply:like": (reply: unknown) => void;
}

interface ClientToServerEvents {
  join_group: (groupId: string, ack?: (ok: boolean) => void) => void;
  leave_group: (groupId: string) => void;
  join_discussion: (discussionId: string, ack?: (ok: boolean) => void) => void;
  leave_discussion: (discussionId: string) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let _socket: AppSocket | null = null;

/**
 * Returns the shared Socket.IO connection, creating it on the first call.
 *
 * @param token  Optional "Bearer <jwt>" string.  When the token changes
 *               (e.g. user logs in or out) call `resetSocket()` so a fresh
 *               connection is made with the updated credentials.
 */
export function getSocket(token?: string): AppSocket {
  if (_socket?.connected) return _socket;

  // Derive the server origin for the Socket.IO connection.
  //
  // Priority:
  //   1. VITE_SOCKET_URL  — explicit override (e.g. wss://api.yourdomain.com)
  //   2. VITE_API_URL     — shared API base URL already set for HTTP calls
  //   3. Dev fallback     — direct to backend dev port (Vite proxy only handles /api, not /socket.io)
  //   4. Prod fallback    — same origin only works when frontend and backend are on the SAME domain.
  //                         If your backend is on a different domain/port, set VITE_API_URL or
  //                         VITE_SOCKET_URL in your production .env file.
  const serverUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? "http://localhost:5000" : window.location.origin);

  _socket = io(serverUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: token ? { token } : {},
    // Reconnection: try indefinitely with exponential back-off, capped at 10s
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 10_000,
    randomizationFactor: 0.5,
    // Timeout waiting for the initial connection response
    timeout: 10_000,
    // Do NOT auto-connect here — we connect explicitly below so callers always
    // get a connected (or connecting) socket.
    autoConnect: false,
  });

  _socket.connect();
  return _socket;
}

/**
 * Tear down the existing connection and clear the singleton.
 * Call this when the user's auth state changes (login / logout).
 */
export function resetSocket(): void {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}
