import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  registerRequest,
  loginRequest,
  getMeRequest,
  type PublicUser,
  type RegisterPayload,
  type LoginPayload,
} from "../services/user.api";

// ─── State shape ──────────────────────────────────────────────────────────────

interface UserState {
  isAuthenticated: boolean;
  token: string | null;
  user: PublicUser | null;
  isLoading: boolean;
  error: string | null;

  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  clearError: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const result = await registerRequest(payload);
          set({
            isAuthenticated: true,
            token: result.token,
            user: result.user,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(
              error,
              "Registration failed. Please try again.",
            ),
          });
          throw error;
        }
      },

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const result = await loginRequest(payload);
          set({
            isAuthenticated: true,
            token: result.token,
            user: result.user,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(
              error,
              "Invalid credentials. Please try again.",
            ),
          });
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          token: null,
          user: null,
          error: null,
        });
      },

      refreshMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await getMeRequest(token);
          set({ user });
        } catch {
          // Token expired or invalid — clear session silently
          set({ isAuthenticated: false, token: null, user: null });
        }
      },
    }),
    {
      name: "user-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
