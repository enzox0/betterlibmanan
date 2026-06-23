import type { AxiosError, AxiosInstance } from "axios";
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

export function attachAdminUnauthorizedInterceptor(apiClient: AxiosInstance) {
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && hasAuthorizationHeader(error)) {
        const { sessionExpiredModalOpen, expireSession } =
          useAdminStore.getState();
        if (!sessionExpiredModalOpen) {
          expireSession();
        }
      }

      return Promise.reject(error);
    },
  );

  return apiClient;
}
