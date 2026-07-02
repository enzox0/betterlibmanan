import { create } from "zustand";
import {
  fetchAdminRegistrations,
  approveAdminRegistration,
  rejectAdminRegistration,
  deleteAdminRegistration,
  type AdminRegistration,
  type AdminRegistrationStatus,
} from "../services/admin-registrations.api";

// ─── State shape ──────────────────────────────────────────────────────────────

interface AdminRegistrationsState {
  registrations: AdminRegistration[];
  isLoading: boolean;
  error: string | null;

  fetchRegistrations: (
    accessToken: string,
    status?: AdminRegistrationStatus,
  ) => Promise<AdminRegistration[]>;
  approveRegistration: (
    id: string,
    accessToken: string,
  ) => Promise<AdminRegistration>;
  rejectRegistration: (
    id: string,
    rejectionReason: string,
    accessToken: string,
  ) => Promise<AdminRegistration>;
  deleteRegistration: (id: string, accessToken: string) => Promise<void>;
  clearError: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function upsertRegistration(
  list: AdminRegistration[],
  next: AdminRegistration,
): AdminRegistration[] {
  const idx = list.findIndex((r) => r._id === next._id);
  if (idx === -1) return [...list, next];
  const updated = [...list];
  updated[idx] = next;
  return updated;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAdminRegistrationsStore = create<AdminRegistrationsState>()(
  (set, get) => ({
    registrations: [],
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),

    fetchRegistrations: async (accessToken, status) => {
      set({ isLoading: true, error: null });
      try {
        const registrations = await fetchAdminRegistrations(
          accessToken,
          status,
        );
        set({ registrations });
        return registrations;
      } catch (error: any) {
        set({
          error: getErrorMessage(error, "Failed to load registrations."),
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    approveRegistration: async (id, accessToken) => {
      set({ error: null });
      try {
        const updated = await approveAdminRegistration(id, accessToken);
        set((state) => ({
          registrations: upsertRegistration(state.registrations, updated),
        }));
        return updated;
      } catch (error: any) {
        set({
          error: getErrorMessage(error, "Failed to approve registration."),
        });
        throw error;
      }
    },

    rejectRegistration: async (id, rejectionReason, accessToken) => {
      set({ error: null });
      try {
        const updated = await rejectAdminRegistration(
          id,
          rejectionReason,
          accessToken,
        );
        set((state) => ({
          registrations: upsertRegistration(state.registrations, updated),
        }));
        return updated;
      } catch (error: any) {
        set({
          error: getErrorMessage(error, "Failed to reject registration."),
        });
        throw error;
      }
    },

    deleteRegistration: async (id, accessToken) => {
      set({ error: null });
      try {
        await deleteAdminRegistration(id, accessToken);
        set((state) => ({
          registrations: state.registrations.filter((r) => r._id !== id),
        }));
      } catch (error: any) {
        set({
          error: getErrorMessage(error, "Failed to delete registration."),
        });
        throw error;
      }
    },
  }),
);
