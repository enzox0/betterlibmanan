export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface LegislativeDocument {
  number: string;
  title: string;
  sessionDate: string;
}

export interface LegislativeData {
  main: {
    ordinanceLink: string;
    ordinanceDescription: string;
    resolutionLink: string;
    resolutionDescription: string;
    ordinanceSteps: ProcessStep[];
    resolutionSteps: ProcessStep[];
    about: {
      title: string;
      description: string;
      points: {
        title: string;
        description: string;
      }[];
    };
  };
  ordinance: {
    definition: string;
    categories: string[];
    documents: LegislativeDocument[];
    externalLink: string;
  };
  resolution: {
    definition: string;
    types: string[];
    documents: LegislativeDocument[];
    externalLink: string;
  };
}
