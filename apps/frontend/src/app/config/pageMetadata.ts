/**
 * Centralized SEO metadata for every public route.
 *
 * Rules:
 *  - title   : Page name only — the suffix " | BetterLibmanan" is appended
 *              automatically by PageMetadata unless isCustomTitle is true.
 *  - description : 140–160 characters. Unique per page. Target keyword first.
 *  - keywords    : Comma-separated, 5–10 terms. Include local geo modifiers.
 *  - canonicalPath : Explicit canonical path override (optional).
 *  - structuredData: Array of JSON-LD objects injected per-page (optional).
 */

export interface StructuredDataObject {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  structuredData?: StructuredDataObject[];
}

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

export const SITE_NAME = "BetterLibmanan";
export const BASE_URL = "https://www.betterlibmanan.org";
export const MUNICIPALITY = "Libmanan";
export const PROVINCE = "Camarines Sur";
export const REGION = "Bicol Region";
export const COUNTRY = "Philippines";

// ---------------------------------------------------------------------------
// Reusable structured-data fragments
// ---------------------------------------------------------------------------

const ORGANIZATION_SCHEMA: StructuredDataObject = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Local Government Unit of Libmanan",
  alternateName: "LGU Libmanan",
  url: BASE_URL,
  logo: `${BASE_URL}/betterlibmanan.png`,
  sameAs: [
    "https://www.facebook.com/profile.php?id=61590902231040",
    "https://github.com/enzox0/betterlibmanan",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: MUNICIPALITY,
    addressRegion: PROVINCE,
    addressCountry: "PH",
  },
  areaServed: {
    "@type": "City",
    name: MUNICIPALITY,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: PROVINCE,
    },
  },
};

// ---------------------------------------------------------------------------
// Per-route metadata map
// ---------------------------------------------------------------------------

export const PAGE_METADATA: Record<string, PageMetadata> = {
  // ── Home ──────────────────────────────────────────────────────────────────
  "/": {
    title: `BetterLibmanan.org | Official Portal of Libmanan, Camarines Sur`,
    description:
      "BetterLibmanan is the official digital transparency portal of Libmanan, Camarines Sur. Access government services, public records, legislation, and community resources online.",
    keywords:
      "Libmanan, BetterLibmanan, official portal, LGU Libmanan, Camarines Sur government, digital transparency, municipal services",
    structuredData: [
      ORGANIZATION_SCHEMA,
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: BASE_URL,
        description:
          "Official digital transparency portal for the Municipality of Libmanan, Camarines Sur.",
        potentialAction: {
          "@type": "SearchAction",
          target: `${BASE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "BetterLibmanan Digital Portal",
        description:
          "One-stop digital portal for Libmanan residents to access government services, public information, and community resources.",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        serviceType: "Municipal Government Portal",
        areaServed: { "@type": "City", name: "Libmanan" },
        url: BASE_URL,
      },
    ],
  },

  // ── About ─────────────────────────────────────────────────────────────────
  "/about": {
    title: "About BetterLibmanan",
    description:
      "Learn about BetterLibmanan — the digital transparency initiative built for the people of Libmanan, Camarines Sur, by civic-minded volunteers.",
    keywords:
      "about BetterLibmanan, about Libmanan, civic technology, transparency initiative, Camarines Sur",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "About BetterLibmanan",
        url: `${BASE_URL}/about`,
        description:
          "About page of BetterLibmanan — the official digital transparency portal for Libmanan, Camarines Sur.",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: BASE_URL },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "About",
              item: `${BASE_URL}/about`,
            },
          ],
        },
      },
    ],
  },

  // ── Government ────────────────────────────────────────────────────────────
  "/government": {
    title: "Libmanan Municipal Government",
    description:
      "Meet the officials and explore the organizational structure of the Municipal Government of Libmanan, Camarines Sur. View elected and appointed officials.",
    keywords:
      "Libmanan government, municipal officials, LGU Libmanan, mayor, councilors, government structure, Camarines Sur",
    structuredData: [
      ORGANIZATION_SCHEMA,
      {
        "@context": "https://schema.org",
        "@type": "GovernmentBuilding",
        name: "Libmanan Municipal Hall",
        address: {
          "@type": "PostalAddress",
          addressLocality: MUNICIPALITY,
          addressRegion: PROVINCE,
          addressCountry: "PH",
        },
        url: `${BASE_URL}/government`,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Government",
              item: `${BASE_URL}/government`,
            },
          ],
        },
      },
    ],
  },

  // ── Transparency ──────────────────────────────────────────────────────────
  "/transparency": {
    title: "Transparency Portal — LGU Libmanan",
    description:
      "Access public budget reports, financial statements, and official transparency documents of LGU Libmanan, Camarines Sur. Open government in action.",
    keywords:
      "transparency, LGU Libmanan budget, public records, open government, financial reports, Camarines Sur, LGSF",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Libmanan Transparency Portal",
        description:
          "Public access to budget documents, financial reports, and official records of the Municipal Government of Libmanan.",
        serviceType: "Government Transparency",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        areaServed: { "@type": "City", name: MUNICIPALITY },
        url: `${BASE_URL}/transparency`,
      },
    ],
  },

  // ── Statistics ────────────────────────────────────────────────────────────
  "/statistics": {
    title: "Libmanan Statistics & Demographic Data",
    description:
      "Official statistics and demographic data for Libmanan, Camarines Sur — population, land area, economic indicators, and development metrics.",
    keywords:
      "Libmanan statistics, Libmanan demographics, population data, Camarines Sur data, municipal data, PSA",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Libmanan Municipal Statistics",
        description:
          "Official statistical data for the Municipality of Libmanan, Camarines Sur, Philippines.",
        url: `${BASE_URL}/statistics`,
        provider: {
          "@type": "GovernmentOrganization",
          name: "LGU Libmanan",
          url: BASE_URL,
        },
        spatialCoverage: {
          "@type": "Place",
          name: "Libmanan",
          address: {
            "@type": "PostalAddress",
            addressLocality: MUNICIPALITY,
            addressRegion: PROVINCE,
            addressCountry: "PH",
          },
        },
      },
    ],
  },

  // ── Services ──────────────────────────────────────────────────────────────
  "/services": {
    title: "Government Services — Libmanan, Camarines Sur",
    description:
      "Complete directory of government services offered by LGU Libmanan — certificates, business permits, tax payments, health, agriculture, education, and more.",
    keywords:
      "LGU Libmanan services, government services, Camarines Sur, municipal services, public services, citizen services",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "LGU Libmanan Government Services",
        description:
          "Complete directory of government services for residents of Libmanan, Camarines Sur.",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        serviceType: "Municipal Services",
        areaServed: { "@type": "City", name: MUNICIPALITY },
        url: `${BASE_URL}/services`,
      },
    ],
  },

  "/services/certificates": {
    title: "Official Certificates — Libmanan, Camarines Sur",
    description:
      "Request official certificates from LGU Libmanan: barangay clearance, birth certificate assistance, residency certificates, and other official documents.",
    keywords:
      "certificates Libmanan, barangay clearance, government certificates, official documents, Camarines Sur certificates",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Certificate Issuance — LGU Libmanan",
        description:
          "Official certificate and document request services for residents of Libmanan, Camarines Sur.",
        serviceType: "Document Services",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        url: `${BASE_URL}/services/certificates`,
      },
    ],
  },

  "/services/business": {
    title: "Business Permits & Registration — Libmanan",
    description:
      "Apply for business permits, renewals, and registration through LGU Libmanan. Support for entrepreneurs and local businesses in Camarines Sur.",
    keywords:
      "business permit Libmanan, business registration, business license, Camarines Sur business, LGU permit",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Business Registration & Permits — LGU Libmanan",
        serviceType: "Business Licensing",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        url: `${BASE_URL}/services/business`,
      },
    ],
  },

  "/services/tax-payments": {
    title: "Tax Payments — LGU Libmanan",
    description:
      "Pay real property tax and other municipal taxes online via LGU Libmanan's digital payment portal. View tax due dates and payment records.",
    keywords:
      "real property tax Libmanan, pay municipal tax, LGU Libmanan tax, real estate tax Camarines Sur",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Municipal Tax Payments — LGU Libmanan",
        serviceType: "Tax Collection",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        url: `${BASE_URL}/services/tax-payments`,
      },
    ],
  },

  "/services/social-services": {
    title: "Social Welfare Services — Libmanan",
    description:
      "Social welfare programs and assistance services for residents of Libmanan, Camarines Sur — 4Ps, PWD, senior citizens, solo parents, and emergency assistance.",
    keywords:
      "social services Libmanan, DSWD, welfare programs, 4Ps, PWD assistance, solo parent, senior citizen benefits",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Social Welfare Services — LGU Libmanan",
        serviceType: "Social Services",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        url: `${BASE_URL}/services/social-services`,
      },
    ],
  },

  "/services/health": {
    title: "Public Health Services — Libmanan, Camarines Sur",
    description:
      "Health programs, medical assistance, and public health services from LGU Libmanan's Rural Health Unit (RHU). Vaccination, maternal care, and wellness programs.",
    keywords:
      "health services Libmanan, RHU Libmanan, public health Camarines Sur, vaccination, maternal care, medical assistance",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "GovernmentService",
        name: "Public Health Services — LGU Libmanan",
        serviceType: "Healthcare",
        provider: { "@type": "GovernmentOrganization", name: "LGU Libmanan" },
        url: `${BASE_URL}/services/health`,
      },
    ],
  },

  "/services/agriculture": {
    title: "Agriculture Services — Libmanan, Camarines Sur",
    description:
      "Agricultural support programs, farming assistance, and rural development services for farmers in Libmanan, Camarines Sur from the Municipal Agriculture Office.",
    keywords:
      "agriculture Libmanan, farming support Camarines Sur, MAO Libmanan, rice farmers, agricultural programs, rural development",
  },

  "/services/infrastructure": {
    title: "Infrastructure & Public Works — Libmanan",
    description:
      "Public infrastructure projects, road maintenance, and public works initiatives by LGU Libmanan's Municipal Engineering Office in Camarines Sur.",
    keywords:
      "infrastructure Libmanan, public works, MEO Libmanan, roads Camarines Sur, DPWH, construction projects",
  },

  "/services/education": {
    title: "Education Services — Libmanan, Camarines Sur",
    description:
      "Education programs, scholarship opportunities, and school services for students and families in Libmanan, Camarines Sur from LGU Libmanan.",
    keywords:
      "education Libmanan, scholarships Camarines Sur, LGU scholarship, DepEd Libmanan, schools, students",
  },

  "/services/public-safety": {
    title: "Public Safety & Emergency Services — Libmanan",
    description:
      "Public safety services, disaster risk reduction, emergency response, and community protection programs in Libmanan, Camarines Sur.",
    keywords:
      "public safety Libmanan, MDRRMO, disaster risk, emergency services Camarines Sur, BFP Libmanan",
  },

  "/services/environment": {
    title: "Environment & Natural Resources — Libmanan",
    description:
      "Environmental programs, waste management, clean-up drives, and green initiatives from LGU Libmanan's Environment and Natural Resources Office.",
    keywords:
      "environment Libmanan, waste management Camarines Sur, MENRO, solid waste, clean environment, sustainable Libmanan",
  },

  // ── Legislative ───────────────────────────────────────────────────────────
  "/legislative": {
    title: "Libmanan Sangguniang Bayan — Laws & Legislation",
    description:
      "Browse all municipal ordinances, resolutions, and legislative acts of the Sangguniang Bayan of Libmanan, Camarines Sur.",
    keywords:
      "Sangguniang Bayan Libmanan, ordinances, resolutions, municipal legislation, Camarines Sur laws, local government code",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Legislation",
        name: "Libmanan Municipal Legislation",
        description:
          "Official ordinances and resolutions of the Sangguniang Bayan of Libmanan, Camarines Sur.",
        legislationJurisdiction: {
          "@type": "City",
          name: MUNICIPALITY,
          containedInPlace: { "@type": "AdministrativeArea", name: PROVINCE },
        },
        url: `${BASE_URL}/legislative`,
      },
    ],
  },

  "/legislative/ordinances": {
    title: "Municipal Ordinances — Libmanan, Camarines Sur",
    description:
      "Full list of municipal ordinances enacted by the Sangguniang Bayan of Libmanan, Camarines Sur. Search and view local laws and regulations.",
    keywords:
      "ordinances Libmanan, local laws, Sangguniang Bayan ordinances, municipal code, Camarines Sur",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Legislation",
        name: "Libmanan Municipal Ordinances",
        legislationType: "Ordinance",
        legislationJurisdiction: { "@type": "City", name: MUNICIPALITY },
        url: `${BASE_URL}/legislative/ordinances`,
      },
    ],
  },

  "/legislative/resolutions": {
    title: "Sangguniang Bayan Resolutions — Libmanan",
    description:
      "Official resolutions passed by the Sangguniang Bayan of Libmanan, Camarines Sur. View decisions, appropriations, and formal positions of the municipal council.",
    keywords:
      "resolutions Libmanan, SB resolutions, municipal council, Camarines Sur, official decisions, appropriations",
  },

  // ── Tourism ───────────────────────────────────────────────────────────────
  "/tourism": {
    title: "Libmanan Tourism — Camarines Sur, Bicol",
    description:
      "Discover Libmanan's top tourist spots — Libmanan Cave, St. John the Baptist Parish, Sipocot River, heritage sites, and local cuisine in Camarines Sur, Bicol.",
    keywords:
      "Libmanan tourism, Libmanan Cave, tourist spots Camarines Sur, Bicol tourism, heritage church, Libmanan travel",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Libmanan, Camarines Sur",
        description:
          "Libmanan is a first-class municipality in Camarines Sur, Bicol Region, known for its Libmanan Cave, heritage church, and natural scenery.",
        url: `${BASE_URL}/tourism`,
        touristType: "Cultural, Nature, Heritage",
        geo: {
          "@type": "GeoCoordinates",
          latitude: "13.7057",
          longitude: "123.0610",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: MUNICIPALITY,
          addressRegion: PROVINCE,
          addressCountry: "PH",
        },
      },
    ],
  },

  // ── Community ─────────────────────────────────────────────────────────────
  "/community": {
    title: "Libmanan Community Hub",
    description:
      "Join the Libmanan community — peer groups, civic discussions, local announcements, and the Freedom Wall for the people of Camarines Sur.",
    keywords:
      "Libmanan community, civic engagement, peer groups, discussions, Camarines Sur residents, community forum",
  },

  "/community/groups": {
    title: "Community Peer Groups — Libmanan",
    description:
      "Browse and join peer groups created by residents of Libmanan, Camarines Sur. Connect with neighbors and engage in local issues.",
    keywords:
      "Libmanan groups, community groups, peer groups, civic groups, Camarines Sur community",
  },

  "/community/discussions": {
    title: "Community Discussions — Libmanan",
    description:
      "Participate in public discussions on local issues, announcements, and civic topics for the Municipality of Libmanan, Camarines Sur.",
    keywords:
      "Libmanan discussions, community forum, civic discussions, public forum Camarines Sur",
  },

  // ── Freedom Wall ──────────────────────────────────────────────────────────
  "/freedom-wall": {
    title: "Freedom Wall — Libmanan",
    description:
      "Share your thoughts, feedback, and messages on the BetterLibmanan Freedom Wall — an open civic voice board for residents of Libmanan, Camarines Sur.",
    keywords:
      "Freedom Wall Libmanan, public feedback, civic voice, resident feedback, Camarines Sur",
  },

  // ── Latest Updates ────────────────────────────────────────────────────────
  "/latest-updates": {
    title: "Latest Updates — LGU Libmanan News",
    description:
      "Stay updated with the latest news, announcements, and developments from the Municipality of Libmanan and LGU Libmanan, Camarines Sur.",
    keywords:
      "Libmanan news, LGU announcements, Libmanan updates, Camarines Sur news, municipal news",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "BetterLibmanan Latest Updates",
        description:
          "Latest news and announcements from LGU Libmanan, Camarines Sur.",
        url: `${BASE_URL}/latest-updates`,
        publisher: {
          "@type": "GovernmentOrganization",
          name: "LGU Libmanan",
          url: BASE_URL,
        },
      },
    ],
  },

  // ── Quiz ──────────────────────────────────────────────────────────────────
  "/quiz": {
    title: "Libmanan Quiz — Test Your Knowledge",
    description:
      "How well do you know Libmanan? Take our interactive quiz covering the history, culture, geography, government, and nature of Libmanan, Camarines Sur.",
    keywords:
      "Libmanan quiz, trivia about Libmanan, knowledge test, Bicol Region, Camarines Sur history, civic education",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Quiz",
        name: "Libmanan Knowledge Quiz",
        description:
          "Interactive quiz about the history, culture, and government of Libmanan, Camarines Sur.",
        url: `${BASE_URL}/quiz`,
        educationalLevel: "General",
        about: { "@type": "Place", name: MUNICIPALITY },
      },
    ],
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  "/contact": {
    title: "Contact LGU Libmanan",
    description:
      "Contact the Municipal Government of Libmanan, Camarines Sur. Find office hours, address, phone numbers, and send your inquiry online.",
    keywords:
      "contact LGU Libmanan, Libmanan municipal hall, phone number, office address, Camarines Sur government contact",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact LGU Libmanan",
        url: `${BASE_URL}/contact`,
        mainEntity: {
          "@type": "GovernmentOrganization",
          name: "Municipal Government of Libmanan",
          address: {
            "@type": "PostalAddress",
            addressLocality: MUNICIPALITY,
            addressRegion: PROVINCE,
            addressCountry: "PH",
          },
        },
      },
    ],
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  "/faq": {
    title: "Frequently Asked Questions — Libmanan Government Services",
    description:
      "Answers to common questions about LGU Libmanan services — how to get certificates, pay taxes, apply for permits, and access public information in Camarines Sur.",
    keywords:
      "FAQ Libmanan, frequently asked questions, LGU Libmanan FAQ, government services questions, Camarines Sur",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        name: "BetterLibmanan FAQ",
        url: `${BASE_URL}/faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is BetterLibmanan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "BetterLibmanan is the official digital transparency portal for the Municipality of Libmanan, Camarines Sur, Philippines. It provides citizens with access to government services, public records, legislation, and community resources.",
            },
          },
          {
            "@type": "Question",
            name: "How do I request a certificate from LGU Libmanan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can browse the available certificates and documents through the Services > Certificates section of BetterLibmanan. Requirements and procedures for each document type are listed on that page.",
            },
          },
          {
            "@type": "Question",
            name: "How do I pay my real property tax in Libmanan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Real property tax payments for Libmanan can be initiated through the Services > Tax Payments section. You may also visit the Libmanan Municipal Treasurer's Office directly.",
            },
          },
          {
            "@type": "Question",
            name: "Where is the Libmanan Municipal Hall?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The Libmanan Municipal Hall is located in Libmanan, Camarines Sur, Philippines. Visit the Contact page on BetterLibmanan for the exact address and office hours.",
            },
          },
        ],
      },
    ],
  },

  // ── Sitemap ───────────────────────────────────────────────────────────────
  "/sitemap": {
    title: "Site Map — BetterLibmanan",
    description:
      "Full site map of BetterLibmanan.org — find every page, government service, and resource for Libmanan, Camarines Sur in one place.",
    keywords: "sitemap, BetterLibmanan sitemap, all pages, site structure",
  },

  // ── Citizen's Charter ─────────────────────────────────────────────────────
  "/charter": {
    title: "Citizen's Charter — LGU Libmanan",
    description:
      "The Citizen's Charter of the Municipal Government of Libmanan, Camarines Sur — our commitment to timely, quality, and transparent public service.",
    keywords:
      "citizen's charter, LGU Libmanan charter, service commitment, Anti-Red Tape, ARTA, Camarines Sur",
  },

  // ── Legal ─────────────────────────────────────────────────────────────────
  "/terms": {
    title: "Terms of Use — BetterLibmanan",
    description:
      "Read the Terms of Use for BetterLibmanan.org before using this digital government portal for Libmanan, Camarines Sur.",
    keywords: "terms of use, BetterLibmanan terms, legal, user agreement",
  },

  "/privacy": {
    title: "Privacy Policy — BetterLibmanan",
    description:
      "Privacy Policy of BetterLibmanan.org — how we collect, use, and protect your personal information in compliance with the Philippine Data Privacy Act of 2012.",
    keywords:
      "privacy policy, data privacy, NPC, Data Privacy Act Philippines, BetterLibmanan privacy, personal information protection",
  },

  "/accessibility": {
    title: "Accessibility Statement — BetterLibmanan",
    description:
      "BetterLibmanan.org accessibility statement — our commitment to WCAG 2.1 AA compliance and inclusive design for all residents of Libmanan, Camarines Sur.",
    keywords:
      "accessibility, WCAG 2.1, inclusive design, screen reader, keyboard navigation, BetterLibmanan accessibility",
  },

  // ── Install ───────────────────────────────────────────────────────────────
  "/install": {
    title: "Install BetterLibmanan App",
    description:
      "Install BetterLibmanan as a Progressive Web App on your phone or desktop. Get instant access to Libmanan government services from your home screen.",
    keywords:
      "install BetterLibmanan, PWA, progressive web app, mobile app, home screen, Libmanan app",
  },

  // ── Error ─────────────────────────────────────────────────────────────────
  "/404": {
    title: "Page Not Found — BetterLibmanan",
    description:
      "The page you are looking for could not be found on BetterLibmanan.org. Return to the home page to find the information you need.",
    keywords: "404, not found, error",
    canonicalPath: "/",
  },
};

// ---------------------------------------------------------------------------
// Lookup helper with prefix matching for dynamic routes
// ---------------------------------------------------------------------------

/**
 * Returns the best-matching PageMetadata for a given pathname.
 * Tries exact match first, then falls back to the closest static
 * ancestor path (e.g. /community/groups/123 → /community/groups),
 * then the home page default.
 */
export function getPageMetadata(pathname: string): PageMetadata {
  // Exact match
  if (PAGE_METADATA[pathname]) return PAGE_METADATA[pathname];

  // Prefix fallback: strip trailing segments until a match is found
  const segments = pathname.split("/").filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const candidate = "/" + segments.slice(0, i).join("/");
    if (PAGE_METADATA[candidate]) return PAGE_METADATA[candidate];
  }

  // Final fallback: home page metadata
  return PAGE_METADATA["/"];
}
