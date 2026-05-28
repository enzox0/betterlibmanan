import { BaseEntity } from './common';

export interface Service extends BaseEntity {
  name: string;
  description: string;
  shortDescription?: string;
  category: ServiceCategory;
  tags: string[];
  requirements: ServiceRequirement[];
  process: ProcessStep[];
  fees: ServiceFee[];
  contact: ServiceContact;
  documents: Document[];
  faqs: FAQ[];
  isOnline: boolean;
  estimatedTime?: string;
  departmentId?: string;
  order?: number;
  translations: Record<string, Partial<ServiceTranslation>>;
}

export enum ServiceCategory {
  CIVIL = 'civil',
  HEALTH = 'health',
  EDUCATION = 'education',
  BUSINESS = 'business',
  SOCIAL = 'social',
  PERMITS = 'permits',
  LICENSES = 'licenses',
  OTHER = 'other'
}

export interface ServiceRequirement {
  id: string;
  name: string;
  description?: string;
  isRequired: boolean;
  type: string;
}

export interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
  duration?: string;
  location?: string;
  isOnline: boolean;
}

export interface ServiceFee {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  isOptional: boolean;
}

export interface ServiceContact {
  office: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export interface ServiceTranslation {
  name: string;
  description: string;
  shortDescription: string;
}