import { IconType } from 'react-icons';

export interface ServiceCategory {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: IconType;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  steps?: string[];
  fee?: string;
  processingTime?: string;
  link?: string;
  categorySlug?: string;
}

export interface LifeEvent {
  id: string;
  title: string;
  icon: IconType;
  services: string[];
}

export interface ServicesData {
  categories: ServiceCategory[];
  lifeEvents: LifeEvent[];
}
