interface PageMetadata {
  title: string;
  description: string;
  keywords?: string;
}

/**
 * Page metadata configuration for all routes
 * This centralizes SEO metadata management
 */
export const PAGE_METADATA: Record<string, PageMetadata> = {
  // Home
  "/": {
    title: "BetterLibmanan.org | Official Portal",
    description:
      "BetterLibmanan - Comprehensive enterprise-grade library management system designed for modern libraries. Streamline cataloging, circulation, and patron management.",
    keywords:
      "library management, library system, digital library, book management, library automation",
  },

  // Services
  "/services": {
    title: "Services",
    description:
      "Explore our comprehensive library services including certificates, business support, tax payments, social services, and more.",
    keywords:
      "library services, municipal services, public services, government services",
  },
  "/services/certificates": {
    title: "Certificates",
    description:
      "Request and manage official certificates and documentation through our secure online portal.",
    keywords:
      "certificates, official documents, government certificates, document requests",
  },
  "/services/business": {
    title: "Business Services",
    description:
      "Business registration, permits, and support services for entrepreneurs and local businesses.",
    keywords:
      "business services, business registration, business permits, entrepreneurship",
  },
  "/services/tax-payments": {
    title: "Tax Payments",
    description:
      "Convenient online tax payment services. Pay your taxes securely and view payment history.",
    keywords:
      "tax payments, online tax, municipal tax, property tax, tax services",
  },
  "/services/social-services": {
    title: "Social Services",
    description:
      "Access community social services, assistance programs, and welfare support.",
    keywords:
      "social services, community services, welfare, assistance programs",
  },
  "/services/health": {
    title: "Health Services",
    description:
      "Public health services, health programs, and medical assistance information.",
    keywords: "health services, public health, medical services, healthcare",
  },
  "/services/agriculture": {
    title: "Agriculture Services",
    description:
      "Agricultural support, farming programs, and resources for the agricultural community.",
    keywords: "agriculture, farming, agricultural services, rural development",
  },
  "/services/infrastructure": {
    title: "Infrastructure Services",
    description:
      "Infrastructure development, public works, and facility management services.",
    keywords: "infrastructure, public works, development, facilities",
  },
  "/services/education": {
    title: "Education Services",
    description:
      "Educational programs, school services, and learning resources.",
    keywords: "education, schools, learning, educational programs",
  },
  "/services/public-safety": {
    title: "Public Safety",
    description:
      "Public safety services, emergency response, and community protection programs.",
    keywords: "public safety, emergency services, community safety, protection",
  },
  "/services/environment": {
    title: "Environment Services",
    description:
      "Environmental programs, waste management, and sustainability initiatives.",
    keywords:
      "environment, sustainability, waste management, green initiatives",
  },

  // Legislative
  "/legislative": {
    title: "Legislative",
    description:
      "Access municipal legislation, ordinances, resolutions, and legal framework.",
    keywords: "legislation, laws, ordinances, resolutions, legal framework",
  },
  "/legislative/ordinances": {
    title: "Ordinances",
    description: "Browse and search municipal ordinances and local laws.",
    keywords: "ordinances, local laws, municipal ordinances, legislation",
  },
  "/legislative/resolutions": {
    title: "Resolutions",
    description: "View municipal resolutions and official decisions.",
    keywords: "resolutions, municipal resolutions, official decisions",
  },

  // Other Pages
  "/government": {
    title: "Government",
    description:
      "Learn about our government structure, officials, and administrative organization.",
    keywords: "government, municipal government, officials, administration",
  },
  "/statistics": {
    title: "Statistics",
    description:
      "Explore municipal statistics, demographic data, and public information.",
    keywords:
      "statistics, data, demographics, municipal data, public information",
  },
  "/transparency": {
    title: "Transparency",
    description:
      "Access public records, budgets, and transparency reports in accordance with open government principles.",
    keywords:
      "transparency, public records, open government, accountability, budget",
  },
  "/contact": {
    title: "Contact Us",
    description:
      "Get in touch with us. Find contact information, office locations, and send us your inquiries.",
    keywords: "contact, contact us, get in touch, office locations, inquiries",
  },

  // Tourism
  "/tourism": {
    title: "Tourism",
    description:
      "Discover the natural and cultural wonders of Libmanan, Camarines Sur — from caves and rivers to heritage churches and local cuisine.",
    keywords:
      "tourism, Libmanan tourism, tourist spots, Camarines Sur, Bicol tourism, travel, heritage, nature",
  },

  // Quiz
  "/quiz": {
    title: "Libmanan Quiz",
    description:
      "Test your knowledge of Libmanan, Camarines Sur with our interactive quiz covering history, culture, geography, government, and nature.",
    keywords:
      "Libmanan quiz, trivia, knowledge test, Bicol, Camarines Sur, interactive quiz",
  },

  // Error Pages
  "/404": {
    title: "Page Not Found",
    description: "The page you are looking for could not be found.",
    keywords: "404, not found, error",
  },
};

/**
 * Get metadata for a specific route
 * Falls back to home page metadata if route not found
 */
export function getPageMetadata(pathname: string): PageMetadata {
  return PAGE_METADATA[pathname] || PAGE_METADATA["/"];
}
