import { useCallback, useEffect, useRef } from "react";
import { useAdminStore } from "../store/adminStore";

/**
 * Activity events that prove the user is actively using the application.
 * Any of these resets the inactivity countdown.
 */
const WINDOW_ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
  "click",
  "focus",
];

// visibilitychange lives on DocumentEventMap, not WindowEventMap
const DOCUMENT_ACTIVITY_EVENTS: (keyof DocumentEventMap)[] = [
  "visibilitychange",
];

interface UseInactivityTimerOptions {
  /**
   * How long (ms) without activity before the session is terminated.
   * This should match `SESSION_INACTIVITY_TIMEOUT_MINUTES` on the backend.
   * Default: 30 minutes.
   */
  timeoutMs?: number;
  /**
   * How early (ms) before the hard timeout to proactively refresh the token.
   * Default: 2 minutes before timeout.
   */
  refreshAheadMs?: number;
  /**
   * Whether the timer is active. Pass `false` when the user is not
   * authenticated to avoid setting up listeners unnecessarily.
   */
  enabled?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_REFRESH_AHEAD_MS = 2 * 60 * 1000; // 2 minutes before timeout

/**
 * Manages inactivity-based session timeout.
 *
 * - Listens for user activity events (mouse, keyboard, scroll, touch, etc.)
 * - Resets the inactivity countdown on every activity event.
 * - Before the inactivity deadline, proactively calls `refreshTokens()` so
 *   the backend's `lastUsedAt` is updated, keeping the sliding window alive.
 * - If the inactivity deadline passes without any activity, calls
 *   `inactivityLogout()` to end the session gracefully.
 */
export function useInactivityTimer({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  refreshAheadMs = DEFAULT_REFRESH_AHEAD_MS,
  enabled = true,
}: UseInactivityTimerOptions = {}) {
  const refreshTokens = useAdminStore((s) => s.refreshTokens);
  const inactivityLogout = useAdminStore((s) => s.inactivityLogout);

  // Timestamp of the last recorded activity
  const lastActivityRef = useRef<number>(Date.now());
  // Timer ID for the inactivity deadline check
  const deadlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Timer ID for the proactive refresh
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Prevent concurrent refresh calls
  const isRefreshingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (deadlineTimerRef.current !== null) {
      clearTimeout(deadlineTimerRef.current);
      deadlineTimerRef.current = null;
    }
    if (refreshTimerRef.current !== null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Schedule the next inactivity deadline check and the proactive refresh.
   * Called on mount and after every activity event.
   */
  const scheduleTimers = useCallback(() => {
    clearTimers();

    // Proactive refresh: fires `refreshAheadMs` before the inactivity deadline.
    // This keeps the backend's `lastUsedAt` sliding forward as long as the user
    // is active, so the 30-minute server-side inactivity window only triggers
    // when the frontend also thinks the user is inactive.
    const refreshDelay = timeoutMs - refreshAheadMs;
    if (refreshDelay > 0) {
      refreshTimerRef.current = setTimeout(async () => {
        if (isRefreshingRef.current) return;
        isRefreshingRef.current = true;
        try {
          await refreshTokens();
        } finally {
          isRefreshingRef.current = false;
        }
      }, refreshDelay);
    }

    // Inactivity deadline: if this fires the user has been idle for `timeoutMs`.
    deadlineTimerRef.current = setTimeout(() => {
      inactivityLogout();
    }, timeoutMs);
  }, [timeoutMs, refreshAheadMs, clearTimers, refreshTokens, inactivityLogout]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Throttle: only reschedule timers at most once every 5 seconds to avoid
    // hammering setTimeout on continuous events like mousemove.
    if (now - lastActivityRef.current >= 5_000) {
      lastActivityRef.current = now;
      scheduleTimers();
    }
  }, [scheduleTimers]);

  useEffect(() => {
    if (!enabled) return;

    scheduleTimers();

    for (const event of WINDOW_ACTIVITY_EVENTS) {
      window.addEventListener(event, handleActivity, { passive: true });
    }
    for (const event of DOCUMENT_ACTIVITY_EVENTS) {
      document.addEventListener(event, handleActivity, { passive: true });
    }

    return () => {
      clearTimers();
      for (const event of WINDOW_ACTIVITY_EVENTS) {
        window.removeEventListener(event, handleActivity);
      }
      for (const event of DOCUMENT_ACTIVITY_EVENTS) {
        document.removeEventListener(event, handleActivity);
      }
    };
  }, [enabled, handleActivity, scheduleTimers, clearTimers]);
}
