import type React from "react";

export type FieldType =
  | "text"
  | "textarea"
  | "image"
  | "url"
  | "date"
  | "select"
  | "icon-picker";
export type ContentStatus = "published" | "draft";

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // for 'select' type
}

export interface ContentRecord {
  id: string; // UUID or database ID
  sectionKey: string;
  title: string; // always present, used for table "Title/Name" column
  status: ContentStatus;
  fields: Record<string, string>; // keyed by FieldDefinition.key
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface SectionSchema {
  key: string; // e.g. 'hero', 'leadership'
  displayName: string; // e.g. 'Hero', 'Leadership'
  fields: FieldDefinition[];
  supportsPreview: boolean;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthLoading: boolean;
  authError: string | null;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  clearAuthError: () => void;
}

export interface AdminContentState {
  sections: SectionSchema[];
  records: Record<string, ContentRecord[]>; // keyed by sectionKey
  addRecord: (
    sectionKey: string,
    record: Omit<ContentRecord, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateRecord: (
    sectionKey: string,
    id: string,
    updates: Partial<ContentRecord>,
  ) => void;
  deleteRecord: (sectionKey: string, id: string) => void;
  replaceRecords: (sectionKey: string, records: ContentRecord[]) => void;
  getRecords: (sectionKey: string) => ContentRecord[];
}

export interface StatsCardProps {
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  accentColor: "blue" | "green" | "yellow" | "red";
}

export interface ContentFormProps {
  mode: "create" | "edit";
  sectionKey: string;
  initialData?: ContentRecord;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLElement>;
  onSubmitted?: () => Promise<void> | void;
}
