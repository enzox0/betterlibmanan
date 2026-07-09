import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  registerRequest,
  loginRequest,
  getMeRequest,
  updateProfileRequest,
  changePasswordRequest,
  type PublicUser,
  type RegisterPayload,
  type LoginPayload,
  type UpdateProfilePayload,
  type ChangePasswordPayload,
} from "../services/user.api";
import { resetSocket } from "@/lib/socket";

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
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
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
          // Reconnect socket with the new user token
          resetSocket();
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
          // Reconnect socket so it authenticates with the new token
          resetSocket();
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
        // Drop the authenticated socket and reconnect as guest
        resetSocket();
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

      updateProfile: async (payload) => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          const user = await updateProfileRequest(payload, token);
          set({ user, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Failed to update profile."),
          });
          throw error;
        }
      },

      changePassword: async (payload) => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true, error: null });
        try {
          await changePasswordRequest(payload, token);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: getErrorMessage(error, "Failed to change password."),
          });
          throw error;
        }
      },
    }),
    {
      name: "user-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        // Persist user without avatarUrl — it can be a large base64 string.
        // avatarUrl is restored on next app load via refreshMe().
        user: state.user
          ? {
              _id: state.user._id,
              displayName: state.user.displayName,
              username: state.user.username,
              email: state.user.email,
              createdAt: state.user.createdAt,
              avatarUrl: state.user.avatarUrl?.startsWith("data:")
                ? "" // never persist raw base64
                : state.user.avatarUrl,
            }
          : null,
      }),
    },
  ),
);
