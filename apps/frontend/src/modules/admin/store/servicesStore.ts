import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  listPublicCategories,
  listAdminCategories,
  createCategoryRequest,
  updateCategoryRequest,
  deleteCategoryRequest,
  addServiceRequest,
  updateServiceRequest,
  removeServiceRequest,
  listPublicLifeEvents,
  listAdminLifeEvents,
  createLifeEventRequest,
  updateLifeEventRequest,
  deleteLifeEventRequest,
  type ServiceCategoryRecord,
  type LifeEventRecord,
  type CategoryPayload,
  type ServiceItemPayload,
  type LifeEventPayload,
} from "../services/services.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getErrorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function sortByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function upsert<T extends { id: string; createdAt: string }>(
  list: T[],
  item: T,
): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return sortByCreatedAt([...list, item]);
  const next = [...list];
  next[idx] = item;
  return sortByCreatedAt(next);
}

// ─── State interface ──────────────────────────────────────────────────────────

interface ServicesState {
  // Categories
  adminCategories: ServiceCategoryRecord[];
  publicCategories: ServiceCategoryRecord[];
  isAdminCategoriesLoading: boolean;
  isPublicCategoriesLoading: boolean;

  // Life events
  adminLifeEvents: LifeEventRecord[];
  publicLifeEvents: LifeEventRecord[];
  isAdminLifeEventsLoading: boolean;
  isPublicLifeEventsLoading: boolean;

  error: string | null;
  clearError: () => void;

  // Fetch
  fetchAdminCategories: (
    accessToken: string,
  ) => Promise<ServiceCategoryRecord[]>;
  fetchPublicCategories: () => Promise<ServiceCategoryRecord[]>;
  fetchAdminLifeEvents: (accessToken: string) => Promise<LifeEventRecord[]>;
  fetchPublicLifeEvents: () => Promise<LifeEventRecord[]>;

  // Category CRUD
  createCategory: (
    payload: CategoryPayload,
    accessToken: string,
  ) => Promise<ServiceCategoryRecord>;
  updateCategory: (
    id: string,
    payload: CategoryPayload,
    accessToken: string,
  ) => Promise<ServiceCategoryRecord>;
  deleteCategory: (id: string, accessToken: string) => Promise<void>;

  // Service CRUD
  addService: (
    categoryId: string,
    payload: ServiceItemPayload,
    accessToken: string,
  ) => Promise<ServiceCategoryRecord>;
  updateService: (
    categoryId: string,
    serviceId: string,
    payload: ServiceItemPayload,
    accessToken: string,
  ) => Promise<ServiceCategoryRecord>;
  removeService: (
    categoryId: string,
    serviceId: string,
    accessToken: string,
  ) => Promise<ServiceCategoryRecord>;

  // Life event CRUD
  createLifeEvent: (
    payload: LifeEventPayload,
    accessToken: string,
  ) => Promise<LifeEventRecord>;
  updateLifeEvent: (
    id: string,
    payload: LifeEventPayload,
    accessToken: string,
  ) => Promise<LifeEventRecord>;
  deleteLifeEvent: (id: string, accessToken: string) => Promise<void>;
}

// Deduplicate in-flight fetches
let adminCatFetch: Promise<ServiceCategoryRecord[]> | null = null;
let publicCatFetch: Promise<ServiceCategoryRecord[]> | null = null;
let adminLeFetch: Promise<LifeEventRecord[]> | null = null;
let publicLeFetch: Promise<LifeEventRecord[]> | null = null;

function derivePublicCategories(
  records: ServiceCategoryRecord[],
): ServiceCategoryRecord[] {
  return sortByCreatedAt(records.filter((r) => r.status === "published"));
}

function derivePublicLifeEvents(records: LifeEventRecord[]): LifeEventRecord[] {
  return sortByCreatedAt(records.filter((r) => r.status === "published"));
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      adminCategories: [],
      publicCategories: [],
      isAdminCategoriesLoading: false,
      isPublicCategoriesLoading: false,

      adminLifeEvents: [],
      publicLifeEvents: [],
      isAdminLifeEventsLoading: false,
      isPublicLifeEventsLoading: false,

      error: null,
      clearError: () => set({ error: null }),

      // ── Fetch ────────────────────────────────────────────────────────────────

      fetchAdminCategories: async (accessToken) => {
        if (adminCatFetch) return adminCatFetch;
        set({ isAdminCategoriesLoading: true, error: null });
        adminCatFetch = (async () => {
          try {
            const records = await listAdminCategories(accessToken);
            const sorted = sortByCreatedAt(records);
            set({
              adminCategories: sorted,
              publicCategories: derivePublicCategories(sorted),
            });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load service categories.",
              ),
            });
            throw error;
          } finally {
            set({ isAdminCategoriesLoading: false });
            adminCatFetch = null;
          }
        })();
        return adminCatFetch;
      },

      fetchPublicCategories: async () => {
        if (publicCatFetch) return publicCatFetch;
        set({ isPublicCategoriesLoading: true, error: null });
        publicCatFetch = (async () => {
          try {
            const records = await listPublicCategories();
            set({ publicCategories: sortByCreatedAt(records) });
            return records;
          } catch (error: any) {
            set({
              error: getErrorMessage(
                error,
                "Failed to load service categories.",
              ),
            });
            throw error;
          } finally {
            set({ isPublicCategoriesLoading: false });
            publicCatFetch = null;
          }
        })();
        return publicCatFetch;
      },

      fetchAdminLifeEvents: async (accessToken) => {
        if (adminLeFetch) return adminLeFetch;
        set({ isAdminLifeEventsLoading: true, error: null });
        adminLeFetch = (async () => {
          try {
            const records = await listAdminLifeEvents(accessToken);
            const sorted = sortByCreatedAt(records);
            set({
              adminLifeEvents: sorted,
              publicLifeEvents: derivePublicLifeEvents(sorted),
            });
            return sorted;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load life events."),
            });
            throw error;
          } finally {
            set({ isAdminLifeEventsLoading: false });
            adminLeFetch = null;
          }
        })();
        return adminLeFetch;
      },

      fetchPublicLifeEvents: async () => {
        if (publicLeFetch) return publicLeFetch;
        set({ isPublicLifeEventsLoading: true, error: null });
        publicLeFetch = (async () => {
          try {
            const records = await listPublicLifeEvents();
            set({ publicLifeEvents: sortByCreatedAt(records) });
            return records;
          } catch (error: any) {
            set({
              error: getErrorMessage(error, "Failed to load life events."),
            });
            throw error;
          } finally {
            set({ isPublicLifeEventsLoading: false });
            publicLeFetch = null;
          }
        })();
        return publicLeFetch;
      },

      // ── Category CRUD ────────────────────────────────────────────────────────

      createCategory: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createCategoryRequest(payload, accessToken);
          const next = upsert(get().adminCategories, record);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
          return record;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to create category.") });
          throw error;
        }
      },

      updateCategory: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateCategoryRequest(id, payload, accessToken);
          const next = upsert(get().adminCategories, record);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
          return record;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to update category.") });
          throw error;
        }
      },

      deleteCategory: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteCategoryRequest(id, accessToken);
          const next = get().adminCategories.filter((c) => c.id !== id);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to delete category.") });
          throw error;
        }
      },

      // ── Service CRUD ─────────────────────────────────────────────────────────

      addService: async (categoryId, payload, accessToken) => {
        set({ error: null });
        try {
          const updated = await addServiceRequest(
            categoryId,
            payload,
            accessToken,
          );
          const next = upsert(get().adminCategories, updated);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to add service.") });
          throw error;
        }
      },

      updateService: async (categoryId, serviceId, payload, accessToken) => {
        set({ error: null });
        try {
          const updated = await updateServiceRequest(
            categoryId,
            serviceId,
            payload,
            accessToken,
          );
          const next = upsert(get().adminCategories, updated);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to update service.") });
          throw error;
        }
      },

      removeService: async (categoryId, serviceId, accessToken) => {
        set({ error: null });
        try {
          const updated = await removeServiceRequest(
            categoryId,
            serviceId,
            accessToken,
          );
          const next = upsert(get().adminCategories, updated);
          set({
            adminCategories: next,
            publicCategories: derivePublicCategories(next),
          });
          return updated;
        } catch (error: any) {
          set({ error: getErrorMessage(error, "Failed to remove service.") });
          throw error;
        }
      },

      // ── Life Event CRUD ──────────────────────────────────────────────────────

      createLifeEvent: async (payload, accessToken) => {
        set({ error: null });
        try {
          const record = await createLifeEventRequest(payload, accessToken);
          const next = upsert(get().adminLifeEvents, record);
          set({
            adminLifeEvents: next,
            publicLifeEvents: derivePublicLifeEvents(next),
          });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to create life event."),
          });
          throw error;
        }
      },

      updateLifeEvent: async (id, payload, accessToken) => {
        set({ error: null });
        try {
          const record = await updateLifeEventRequest(id, payload, accessToken);
          const next = upsert(get().adminLifeEvents, record);
          set({
            adminLifeEvents: next,
            publicLifeEvents: derivePublicLifeEvents(next),
          });
          return record;
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to update life event."),
          });
          throw error;
        }
      },

      deleteLifeEvent: async (id, accessToken) => {
        set({ error: null });
        try {
          await deleteLifeEventRequest(id, accessToken);
          const next = get().adminLifeEvents.filter((e) => e.id !== id);
          set({
            adminLifeEvents: next,
            publicLifeEvents: derivePublicLifeEvents(next),
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error, "Failed to delete life event."),
          });
          throw error;
        }
      },
    }),
    {
      name: "services-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminCategories: state.adminCategories,
        publicCategories: state.publicCategories,
        adminLifeEvents: state.adminLifeEvents,
        publicLifeEvents: state.publicLifeEvents,
      }),
    },
  ),
);
