export interface MunicipalStat {
  value: string | number;
  label: string;
  subLabel: string;
}

export interface FinanceStat {
  label: string;
  value: string;
  subValue?: string;
}

export interface PopulationTrend {
  year: number;
  population: number;
  growth: number;
}

export interface BarangayPopulation {
  rank: number;
  name: string;
  population: number;
}

export interface EconomicIndicator {
  label: string;
  value: string;
  subLabel?: string;
}

export interface EconomicSector {
  name: string;
  percentage: number;
}

export interface PovertyStat {
  year: number;
  rate: number;
  confidenceInterval: string;
  change: number;
  status: 'improved' | 'worsened' | 'stable';
}

export interface CompetitivenessIndex {
  category: string;
  score: number;
  change: number;
  changeLabel: string;
  trendData: Record<string, number>;
}

export interface StatisticsData {
  municipal: MunicipalStat[];
  finance: {
    title: string;
    subtitle: string;
    stats: FinanceStat[];
    composition: {
      label: string;
      percentage: number;
      color: string;
    }[];
    source: string;
  };
  populationTrend: PopulationTrend;
  barangayPopulation: BarangayPopulation[];
  economy: {
    indicators: EconomicIndicator[];
    sectors: EconomicSector[];
    source: string;
  };
  poverty: PovertyStat[];
  competitiveness: {
    overview: CompetitivenessIndex[];
    source: string;
  };
}
