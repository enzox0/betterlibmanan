export interface ExecutiveOfficial {
  title: string;
  name: string;
  email: string;
  phone: string;
  hours: string;
}

export interface LegislativeOfficial {
  name: string;
  position: string;
  committees: string[];
}

export interface MunicipalOffice {
  name: string;
  description: string;
  phone?: string;
  email?: string;
  link?: string;
}

export interface Barangay {
  name: string;
  captain: string;
  phone: string;
}

export interface GovernmentData {
  executive: ExecutiveOfficial[];
  legislative: LegislativeOfficial[];
  offices: MunicipalOffice[];
  barangays: Barangay[];
}
