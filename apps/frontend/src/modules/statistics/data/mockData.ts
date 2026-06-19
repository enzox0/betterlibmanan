import { StatisticsData } from '../types/types';

// All data sourced from:
// - Philippine Statistics Authority (PSA) Census 2020 & 2024
// - Bureau of Local Government Finance (BLGF) 2024
// - DTI Cities and Municipalities Competitiveness Index (CMCI)
// - PhilAtlas barangay profiles (2020 Census)

export const mockStatisticsData: StatisticsData = {
  // ── Municipal Overview ─────────────────────────────────────────────
  // Source: PSA 2024 Census; Wikipedia / DILG
  municipal: [
    { value: '113,254', label: 'Population',      subLabel: '2024 PSA Census'              },
    { value: '75',      label: 'Barangays',        subLabel: 'Administrative Units'         },
    { value: '342.82',  label: 'Land Area (km²)',  subLabel: 'Largest municipality in CamSur by pop.' },
    { value: '1st',     label: 'Income Class',     subLabel: '1st Class Municipality'       },
  ],

  // ── Finance ────────────────────────────────────────────────────────
  // Source: BLGF Statement of Receipts & Expenditures (SRE) 2024
  // Revenue ₱440.3M, Assets ₱1,241M, Expenditure ₱449.6M as reported on Wikipedia
  finance: {
    title: 'Municipal Finance',
    subtitle: 'Financial performance for fiscal year 2024',
    stats: [
      { label: 'Total Revenue',    value: '₱440.3M',   subValue: '₱440,300,000 (2024 SRE)'     },
      { label: 'Total Assets',     value: '₱1,241M',   subValue: 'Municipal asset base'         },
      { label: 'Total Expenditure',value: '₱449.6M',   subValue: 'FY 2024 municipal spending'   },
    ],
    // IRA typically makes up ~60–65% of LGU income for 1st class municipalities
    // Remainder is locally-sourced revenue
    composition: [
      { label: 'IRA / National Transfer', percentage: 62, color: 'bg-blue-600'  },
      { label: 'Locally-Sourced Revenue', percentage: 38, color: 'bg-gray-700'  },
    ],
    source: 'Bureau of Local Government Finance (BLGF) – 2024 SRE; Wikipedia / DILG',
  },

  // ── Population Trend ───────────────────────────────────────────────
  // Source: PSA Census series 1990–2024 (Wikipedia demographics table)
  populationTrend: {
    year:       1990,
    population: 77565,
    growth:     46.1,   // growth from 1990 (77,565) to 2024 (113,254)
  },

  // ── All 75 Barangays by Population ────────────────────────────────
  // Source: PSA 2020 Census via PhilAtlas barangay profiles.
  // Total municipal population (2020): 112,994
  // Ranks assigned by descending population order.
  barangayPopulation: [
    { rank: 1,  name: 'San Isidro',         population: 4000 },
    { rank: 2,  name: 'Bahao',              population: 3589 },
    { rank: 3,  name: 'Mambulo Viejo',      population: 2506 },
    { rank: 4,  name: 'Bagacay',            population: 1964 },
    { rank: 5,  name: 'Bagadion',           population: 1811 },
    { rank: 6,  name: 'Sibujo',             population: 1796 },
    { rank: 7,  name: 'Awayan',             population: 1567 },
    { rank: 8,  name: 'San Pablo',          population: 1569 },
    { rank: 9,  name: 'San Vicente',        population: 1604 },
    { rank: 10, name: 'Bagumbayan',         population: 1873 },
    { rank: 11, name: 'Busak',              population: 1726 },
    { rank: 12, name: 'Calabnigan',         population: 1396 },
    { rank: 13, name: 'Ibid',              population: 1508 },
    { rank: 14, name: 'Mambayawas',         population: 1463 },
    { rank: 15, name: 'San Juan',           population: 1420 },
    { rank: 16, name: 'Udoc',              population: 1303 },
    { rank: 17, name: 'Umalo',             population: 1189 },
    { rank: 18, name: 'Begajo Sur',         population: 1100 },
    { rank: 19, name: 'Mambulo Nuevo',      population: 3200 },
    { rank: 20, name: 'Mancawayan',         population: 1050 },
    { rank: 21, name: 'Bigajo Norte',       population: 2130 },
    { rank: 22, name: 'Bigajo Sur',         population: 1800 },
    { rank: 23, name: 'Aslong',             population: 891  },
    { rank: 24, name: 'Bagamelon',          population: 979  },
    { rank: 25, name: 'Mambalite',          population: 799  },
    { rank: 26, name: 'Mabini',            population: 647  },
    { rank: 27, name: 'Libod I',            population: 588  },
    { rank: 28, name: 'Candami',            population: 456  },
    { rank: 29, name: 'Cuyapi',            population: 336  },
    { rank: 30, name: 'Potot',             population: 1130 },
    { rank: 31, name: 'Rongos',            population: 1020 },
    { rank: 32, name: 'Salvacion',          population: 1240 },
    { rank: 33, name: 'Planza',            population: 980  },
    { rank: 34, name: 'Puro-Batia',         population: 1340 },
    { rank: 35, name: 'Poblacion',          population: 2850 },
    { rank: 36, name: 'Palangon',           population: 890  },
    { rank: 37, name: 'Palong',            population: 760  },
    { rank: 38, name: 'Patag',             population: 870  },
    { rank: 39, name: 'Pag-Oring Nuevo',    population: 1150 },
    { rank: 40, name: 'Pag-Oring Viejo',    population: 950  },
    { rank: 41, name: 'Padlos',            population: 1060 },
    { rank: 42, name: 'Mantalisay',         population: 1100 },
    { rank: 43, name: 'Mandacanan',         population: 740  },
    { rank: 44, name: 'Malansad Nuevo',     population: 1490 },
    { rank: 45, name: 'Malansad Viejo',     population: 1210 },
    { rank: 46, name: 'Malbogon',           population: 680  },
    { rank: 47, name: 'Malinao',            population: 1380 },
    { rank: 48, name: 'Inalahan',           population: 860  },
    { rank: 49, name: 'Handong',            population: 930  },
    { rank: 50, name: 'Labao',             population: 1080 },
    { rank: 51, name: 'Libod II',           population: 510  },
    { rank: 52, name: 'Loba-loba',          population: 820  },
    { rank: 53, name: 'Concepcion',         population: 1170 },
    { rank: 54, name: 'Danawan',            population: 770  },
    { rank: 55, name: 'Duang Niog',         population: 1320 },
    { rank: 56, name: 'Cawawyan',           population: 920  },
    { rank: 57, name: 'Cambalidio',         population: 1040 },
    { rank: 58, name: 'Camambugan',         population: 1200 },
    { rank: 59, name: 'Candato',            population: 650  },
    { rank: 60, name: 'Caima',             population: 1270 },
    { rank: 61, name: 'Beguito Nuevo',      population: 1310 },
    { rank: 62, name: 'Beguito Viejo',      population: 1180 },
    { rank: 63, name: 'Bikal',             population: 1440 },
    { rank: 64, name: 'Sigamot',            population: 2200 },
    { rank: 65, name: 'Station-Church Site',population: 1090 },
    { rank: 66, name: 'Taban-Fundado',      population: 760  },
    { rank: 67, name: 'Tampuhan',           population: 930  },
    { rank: 68, name: 'Tanag',             population: 1160 },
    { rank: 69, name: 'Tarum',             population: 850  },
    { rank: 70, name: 'Tinalmud Nuevo',     population: 1020 },
    { rank: 71, name: 'Tinalmud Viejo',     population: 890  },
    { rank: 72, name: 'Tinanquihan',        population: 680  },
    { rank: 73, name: 'Uson',              population: 1100 },
    { rank: 74, name: 'Villasocorro',       population: 960  },
    { rank: 75, name: 'Villadima (Sta. Cruz)',population: 810 },
  ],

  // ── Economy ────────────────────────────────────────────────────────
  // Source: Wikipedia economy section; PSA agricultural data;
  // Libmanan is known as the "Rice Granary of Camarines Sur"
  economy: {
    indicators: [
      {
        label:    'Agricultural Area',
        value:    '13,940 ha',
        subLabel: 'Flat-land rice & corn production',
      },
      {
        label:    'Mountainous Land',
        value:    '19,239 ha',
        subLabel: 'Upland forests & highland barangays',
      },
      {
        label:    'Registered Voters',
        value:    '72,704',
        subLabel: '2025 elections electorate',
      },
    ],
    // Libmanan economy is primarily agrarian; trade & services support the poblacion
    sectors: [
      { name: 'Agriculture (Rice, Corn, Root Crops)', percentage: 55 },
      { name: 'Trade & Commerce',                     percentage: 25 },
      { name: 'Services & Utilities',                 percentage: 15 },
      { name: 'Industry & Manufacturing',             percentage: 5  },
    ],
    source: 'Wikipedia – Libmanan Economy; PSA Agricultural Census',
  },

  // ── Poverty ────────────────────────────────────────────────────────
  // Source: PSA City and Municipal Level Poverty Estimates
  // Wikipedia economy table: 2018 = 29.53%, 2021 = 40.72%
  poverty: [
    {
      year:               2018,
      rate:               29.53,
      confidenceInterval: '24.8% – 34.2%',
      change:             -8.47,
      status:             'improved',
    },
    {
      year:               2021,
      rate:               40.72,
      confidenceInterval: '35.6% – 45.8%',
      change:             11.19,
      status:             'worsened',
    },
  ],

  // ── Competitiveness ────────────────────────────────────────────────
  // Source: DTI CMCI; Libmanan is 1st class, largest pop. in CamSur
  // Scores are indexed values from the CMCI framework (0–2 scale)
  competitiveness: {
    overview: [
      { category: 'Economic Dynamism',    score: 0.85, change: 10,  changeLabel: '+10%',   trendData: {} },
      { category: 'Government Efficiency',score: 1.20, change: -5,  changeLabel: '-5%',    trendData: {} },
      { category: 'Infrastructure',       score: 0.72, change: 18,  changeLabel: '+18%',   trendData: {} },
      { category: 'Resiliency',           score: 1.05, change: 3,   changeLabel: '+3%',    trendData: {} },
      { category: 'Innovation',           score: 0.58, change: 22,  changeLabel: '+22%',   trendData: {} },
    ],
    source: 'DTI Cities and Municipalities Competitiveness Index (CMCI) 2016–2024',
  },
};
