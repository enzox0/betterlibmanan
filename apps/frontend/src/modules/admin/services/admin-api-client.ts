import type { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useAdminStore } from "../store/adminStore";

function hasAuthorizationHeader(error: AxiosError): boolean {
  const headers = error.config?.headers as
    | {
        Authorization?: string;
        authorization?: string;
        get?: (name: string) => string | undefined;
      }
    | undefined;

  if (!headers) {
    return false;
  }

  if (typeof headers.get === "function") {
    return Boolean(headers.get("Authorization"));
  }

  return Boolean(headers.Authorization || headers.authorization);
}

/**
 * Track whether a token refresh is already in flight so concurrent 401s
 * don't each independently trigger a refresh race.
 */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Attaches a response interceptor that:
 *  1. On 401 with an Authorization header → attempts a silent token refresh.
 *  2. If the refresh succeeds → retries the original request with the new token.
 *  3. If the refresh fails → calls expireSession() to show the session expired modal.
 *
 * This ensures users are never interrupted by a token expiry while they are
 * actively using the application.
 */
export function attachAdminUnauthorizedInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retried?: boolean;
      };

      // Only intercept 401s on requests that carried an auth header,
      // and only retry once to prevent infinite loops.
      if (
        error.response?.status === 401 &&
        hasAuthorizationHeader(error) &&
        !originalRequest._retried
      ) {
        originalRequest._retried = true;

        const store = useAdminStore.getState();

        // If the session-expired modal is already open there's nothing more to do.
        if (store.sessionExpiredModalOpen) {
          return Promise.reject(error);
        }

        // Deduplicate concurrent refresh calls
        if (!refreshPromise) {
          refreshPromise = store.refreshTokens().finally(() => {
            refreshPromise = null;
          });
        }

        const success = await refreshPromise;

        if (success) {
          // Swap in the new access token and retry the original request
          const newToken = useAdminStore.getState().accessToken;
          if (originalRequest.headers && newToken) {
            (originalRequest.headers as Record<string, string>)[
              "Authorization"
            ] = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        }

        // refreshTokens() already called expireSession() on failure
        return Promise.reject(error);
      }

      return Promise.reject(error);
    },
  );

  return apiClient;
}
