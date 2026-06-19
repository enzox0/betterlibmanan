import { BaseEntity } from "./common";
import { Service } from "./services";

export interface Department extends BaseEntity {
  name: string;
  description?: string;
  shortName?: string;
  head?: string;
  contact: DepartmentContact;
  services: string[] | Service[];
  location?: Location;
  socialLinks?: SocialLinks;
  order: number;
  parentId?: string;
  translations: Record<string, Partial<DepartmentTranslation>>;
}

export interface DepartmentContact {
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  hours?: string;
}

export interface Location {
  address: string;
  city: string;
  province: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

export interface DepartmentTranslation {
  name: string;
  description: string;
}

export interface Official extends BaseEntity {
  name: string;
  position: string;
  departmentId?: string;
  bio?: string;
  photoUrl?: string;
  contact: OfficialContact;
  termStart?: string;
  termEnd?: string;
  order: number;
  isActive: boolean;
}

export interface OfficialContact {
  phone?: string;
  email?: string;
  office?: string;
}
