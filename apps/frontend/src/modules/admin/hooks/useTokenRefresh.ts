import { useEffect, useRef } from "react";
import { useAdminStore } from "../store/adminStore";

/**
 * How early before access token expiry to proactively refresh it.
 * The default access token TTL is 15m; refresh 2m before it expires
 * so there's no gap where requests get rejected.
 */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes (matches backend default)
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000; // refresh 2 minutes early

/**
 * Schedules a proactive access-token refresh so the user never hits a
 * TOKEN_EXPIRED 401 while they are actively using the app.
 *
 * This hook runs once per authenticated session. When the session is lost
 * (isAuthenticated becomes false) the timer is cancelled automatically.
 */
export function useTokenRefresh() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const refreshTokens = useAdminStore((s) => s.refreshTokens);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const scheduleRefresh = () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(async () => {
        const success = await refreshTokens();
        // If the refresh succeeded, schedule the next one immediately.
        // If it failed, `refreshTokens` already called expireSession().
        if (success) {
          scheduleRefresh();
        }
      }, ACCESS_TOKEN_TTL_MS - REFRESH_BEFORE_EXPIRY_MS);
    };

    scheduleRefresh();

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAuthenticated, refreshTokens]);
}
