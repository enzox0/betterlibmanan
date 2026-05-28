import { BaseEntity } from './common';

export interface Announcement extends BaseEntity {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isActive: boolean;
  publishedAt: string;
  expiresAt?: string;
  createdBy?: string;
  translations: Record<string, Partial<AnnouncementTranslation>>;
}

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface AnnouncementTranslation {
  title: string;
  content: string;
}