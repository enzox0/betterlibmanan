import { IconType } from "react-icons";

export interface ContactInfoItem {
  icon: IconType;
  title: string;
  value: string;
  href: string;
  description: string;
}

export interface Department {
  value: string;
  label: string;
}

export interface EmergencyContact {
  icon: IconType;
  name: string;
  number: string;
  description: string;
}

export interface MedicalEmergencyContact {
  icon: IconType;
  name: string;
  number: string;
  description: string;
}

export interface MunicipalOffice {
  name: string;
  number: string;
}

export interface SocialLink {
  icon: IconType;
  name: string;
  href: string;
  color: string;
}

export interface ContactData {
  contactInfo: ContactInfoItem[];
  departments: Department[];
  emergencyContacts: EmergencyContact[];
  medicalEmergencyContacts: MedicalEmergencyContact[];
  municipalOffices: MunicipalOffice[];
  socialLinks: SocialLink[];
}
