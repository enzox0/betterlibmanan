import { StatisticsData } from '../types/types';

export const mockStatisticsData: StatisticsData = {
  municipal: [
    { value: '69,291', label: 'Population', subLabel: '2024 Census' },
    { value: '22', label: 'Barangays', subLabel: 'Administrative Units' },
    { value: '162.70', label: 'Land Area (km²)', subLabel: 'Total Municipal Area' },
    { value: '1st', label: 'Income Class', subLabel: 'Municipality Classification' }
  ],
  finance: {
    title: 'Municipal Income',
    subtitle: 'Financial standing for fiscal year 2023',
    stats: [
      { label: 'Annual Income', value: '₱371.33M', subValue: '₱371,329,918.71' },
      { label: 'IRA Share', value: '₱220.77M', subValue: 'Internal Revenue Allotment' },
      { label: 'IRA Dependency', value: '59.45%', subValue: 'National Tax Share' }
    ],
    composition: [
      { label: 'IRA', percentage: 59.45, color: 'bg-blue-600' },
      { label: 'Local', percentage: 40.55, color: 'bg-gray-700' }
    ],
    source: 'Bureau of Local Government Finance (BLGF) – 2023 SRE Data'
  },
  populationTrend: {
    year: 1990,
    population: 38006,
    growth: 82.3
  },
  barangayPopulation: [
    { rank: 1, name: 'Roxas', population: 9088 },
    { rank: 2, name: 'Quirino', population: 6572 },
    { rank: 3, name: 'Osmeña', population: 6403 },
    { rank: 4, name: 'Quezon', population: 5758 },
    { rank: 5, name: 'Curifang', population: 4885 },
    { rank: 6, name: 'Bagahabag', population: 4731 },
    { rank: 7, name: 'Uddiawan', population: 4217 },
    { rank: 8, name: 'Bascaran', population: 3845 },
    { rank: 9, name: 'Aggub', population: 3101 },
    { rank: 10, name: 'San Luis', population: 2668 },
    { rank: 11, name: 'Communal', population: 2586 },
    { rank: 12, name: 'Lactawan', population: 2109 },
    { rank: 13, name: 'San Juan', population: 1965 },
    { rank: 14, name: 'Concepcion', population: 1954 },
    { rank: 15, name: 'Dadap', population: 1409 },
    { rank: 16, name: 'Wacal', population: 1398 },
    { rank: 17, name: 'Bangaan', population: 1284 },
    { rank: 18, name: 'Tucal', population: 1244 },
    { rank: 19, name: 'Bangar', population: 1146 },
    { rank: 20, name: 'Pilar D. Galima', population: 1146 },
    { rank: 21, name: 'Poblacion North', population: 970 },
    { rank: 22, name: 'Poblacion South', population: 817 }
  ],
  economy: {
    indicators: [
      { label: 'Registered Businesses', value: '0', subLabel: '+8% from last year' },
      { label: 'Agricultural Land', value: '8,500 ha', subLabel: 'Rice & Corn Production' },
      { label: 'Employment Rate', value: '94.2%', subLabel: 'Labor Force Participation' }
    ],
    sectors: [
      { name: 'Agriculture', percentage: 45 },
      { name: 'Trade & Commerce', percentage: 30 },
      { name: 'Services', percentage: 20 },
      { name: 'Industry', percentage: 5 }
    ],
    source: 'Bureau of Local Government Finance (BLGF) - 2023'
  },
  poverty: [
    { year: 2018, rate: 7.0, confidenceInterval: '4.7% - 9.2%', change: -0.6, status: 'improved' },
    { year: 2021, rate: 6.4, confidenceInterval: '4.7% - 8.1%', change: 0, status: 'stable' }
  ],
  competitiveness: {
    overview: [
      { category: 'Economic Dynamism', score: 0.23, change: 12, changeLabel: '+12%', trendData: {} },
      { category: 'Government Efficiency', score: 1.17, change: -8, changeLabel: '-8%', trendData: {} },
      { category: 'Infrastructure', score: 0.40, change: 5, changeLabel: '+5%', trendData: {} },
      { category: 'Resiliency', score: 1.08, change: 0, changeLabel: 'Stable', trendData: {} },
      { category: 'Innovation', score: 0.68, change: 25, changeLabel: '+25%', trendData: {} }
    ],
    source: 'DTI Cities and Municipalities Competitiveness Index (CMCI)'
  }
};
