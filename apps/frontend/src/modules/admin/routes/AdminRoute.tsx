import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAdminStore } from "../store/adminStore";

/**
 * AdminRoute — protects all child routes under /admin.
 *
 * On mount it checks whether the persisted session is still valid:
 *   - If the access token is present and `isAuthenticated` is true, render the outlet.
 *   - If only a refresh token is available (e.g. page reload after the access
 *     token expired), attempt a silent refresh before deciding.
 *   - If nothing is available, redirect to /admin/login.
 */
export function AdminRoute() {
  const {
    isAuthenticated,
    accessToken,
    refreshToken,
    refreshTokens,
    sessionExpiredModalOpen,
  } = useAdminStore((s) => ({
    isAuthenticated: s.isAuthenticated,
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    refreshTokens: s.refreshTokens,
    sessionExpiredModalOpen: s.sessionExpiredModalOpen,
  }));

  const [checking, setChecking] = useState(!isAuthenticated && !!refreshToken);

  useEffect(() => {
    if (!isAuthenticated && refreshToken) {
      refreshTokens().finally(() => setChecking(false));
    }
  }, []); // run once on mount only

  if (checking) {
    // Brief loading state while the silent refresh resolves
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <svg
          className="h-8 w-8 animate-spin text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Loading"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (sessionExpiredModalOpen) {
    return null;
  }

  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
