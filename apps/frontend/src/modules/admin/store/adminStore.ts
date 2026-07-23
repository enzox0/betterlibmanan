import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminContentState, ContentRecord } from "../types/admin.types";
import { mockSections, mockRecords } from "../data/mockSections";
import {
  loginRequest,
  refreshRequest,
  logoutRequest,
  getMeRequest,
  updateMeRequest,
  type AdminProfile,
  type LoginPayload,
  type UpdateMePayload,
} from "../services/auth.api";

// ─── Auth slice ───────────────────────────────────────────────────────────────

export interface AdminAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  admin: AdminProfile | null;
  /** true while a login / refresh call is in-flight */
  isAuthLoading: boolean;
  authError: string | null;

  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  expireSession: () => void;
  /** Called when the inactivity timer fires — distinct from a token expiry */
  inactivityLogout: () => void;
  clearAuthError: () => void;
  /** Update the cached admin profile in the store after a self-service update */
  setAdmin: (admin: AdminProfile) => void;

  // Legacy modal helpers kept for backward compatibility
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // Session expired modal
  sessionExpiredModalOpen: boolean;
  /** 'token' = server rejected token, 'inactivity' = client-side idle timeout */
  sessionExpiredReason: "token" | "inactivity" | null;
  openSessionExpiredModal: () => void;
  closeSessionExpiredModal: () => void;
}

// ─── Store shape ──────────────────────────────────────────────────────────────

type AdminStore = AdminAuthState & AdminContentState;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // ── Auth state ──────────────────────────────────────────────────────────
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      admin: null,
      isAuthLoading: false,
      authError: null,
      loginModalOpen: false,
      sessionExpiredModalOpen: false,
      sessionExpiredReason: null,

      openLoginModal: () => set({ loginModalOpen: true }),
      closeLoginModal: () => set({ loginModalOpen: false }),
      openSessionExpiredModal: () => set({ sessionExpiredModalOpen: true }),
      closeSessionExpiredModal: () =>
        set({ sessionExpiredModalOpen: false, sessionExpiredReason: null }),
      expireSession: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          admin: null,
          isAuthLoading: false,
          authError: null,
          loginModalOpen: false,
          sessionExpiredModalOpen: true,
          sessionExpiredReason: "token",
        }),
      inactivityLogout: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          admin: null,
          isAuthLoading: false,
          authError: null,
          loginModalOpen: false,
          sessionExpiredModalOpen: true,
          sessionExpiredReason: "inactivity",
        }),
      clearAuthError: () => set({ authError: null }),

      setAdmin: (admin: AdminProfile) => set({ admin }),

      login: async (payload: LoginPayload) => {
        set({ isAuthLoading: true, authError: null });
        try {
          const tokens = await loginRequest(payload);
          set({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            admin: tokens.admin,
            loginModalOpen: false,
            sessionExpiredModalOpen: false,
            isAuthLoading: false,
            authError: null,
          });
        } catch (err: any) {
          const message =
            err?.response?.data?.message ||
            "Invalid credentials. Please try again.";
          set({
            isAuthenticated: false,
            isAuthLoading: false,
            authError: message,
          });
          throw new Error(message);
        }
      },

      logout: async () => {
        const { refreshToken, accessToken } = get();
        // Attempt server-side revocation (best effort)
        if (refreshToken && accessToken) {
          logoutRequest(refreshToken, accessToken).catch(() => {
            // Ignore — local state is cleared regardless
          });
        }
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          admin: null,
          authError: null,
          sessionExpiredModalOpen: false,
        });
      },

      refreshTokens: async (): Promise<boolean> => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const tokens = await refreshRequest(refreshToken);
          set({
            isAuthenticated: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            admin: tokens.admin,
          });
          return true;
        } catch {
          // Refresh failed — clear session and show the expiry modal.
          get().expireSession();
          return false;
        }
      },

      // ── Content state ───────────────────────────────────────────────────────
      sections: mockSections,
      records: mockRecords,

      addRecord: (sectionKey, record) => {
        const now = new Date().toISOString();
        const newRecord: ContentRecord = {
          ...record,
          id: crypto.randomUUID(),
          sectionKey,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          records: {
            ...state.records,
            [sectionKey]: [...(state.records[sectionKey] ?? []), newRecord],
          },
        }));
      },

      updateRecord: (sectionKey, id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          records: {
            ...state.records,
            [sectionKey]: (state.records[sectionKey] ?? []).map((rec) =>
              rec.id === id ? { ...rec, ...updates, updatedAt: now } : rec,
            ),
          },
        }));
      },

      deleteRecord: (sectionKey, id) => {
        set((state) => ({
          records: {
            ...state.records,
            [sectionKey]: (state.records[sectionKey] ?? []).filter(
              (rec) => rec.id !== id,
            ),
          },
        }));
      },

      replaceRecords: (sectionKey, records) => {
        set((state) => ({
          records: {
            ...state.records,
            [sectionKey]: records,
          },
        }));
      },

      getRecords: (sectionKey) => {
        return get().records[sectionKey] ?? [];
      },
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist auth tokens — not loading/error state or UI state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        admin: state.admin,
      }),
    },
  ),
);
