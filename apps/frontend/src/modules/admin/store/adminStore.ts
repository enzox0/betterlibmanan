import { create } from 'zustand';
import type { AdminAuthState, AdminContentState, ContentRecord } from '../types/admin.types';
import { mockSections, mockRecords } from '../data/mockSections';

type AdminAuthSlice = AdminAuthState;

const createAuthSlice = (
  set: (fn: (state: AdminStore) => Partial<AdminStore>) => void,
): AdminAuthSlice => ({
  isAuthenticated: false,
  loginModalOpen: false,

  openLoginModal: () =>
    set(() => ({ loginModalOpen: true })),

  closeLoginModal: () =>
    set(() => ({ loginModalOpen: false })),

  login: () =>
    set(() => ({ isAuthenticated: true, loginModalOpen: false })),

  logout: () =>
    set(() => ({ isAuthenticated: false })),
});

type AdminContentSlice = AdminContentState;

const createContentSlice = (
  set: (fn: (state: AdminStore) => Partial<AdminStore>) => void,
  get: () => AdminStore,
): AdminContentSlice => ({
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
        [sectionKey]: (state.records[sectionKey] ?? []).filter((rec) => rec.id !== id),
      },
    }));
  },

  getRecords: (sectionKey) => {
    return get().records[sectionKey] ?? [];
  },
});

type AdminStore = AdminAuthSlice & AdminContentSlice;

export const useAdminStore = create<AdminStore>()((set, get) => ({
  ...createAuthSlice(set),
  ...createContentSlice(set, get),
}));
