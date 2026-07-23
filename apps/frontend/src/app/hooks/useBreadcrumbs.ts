import { useLocation } from "react-router-dom";
import type { BreadcrumbItem } from "@/app/components/BreadcrumbJsonLd";

const BASE_URL = "https://www.betterlibmanan.org";

/** Human-readable labels for known path segments. */
const SEGMENT_LABELS: Record<string, string> = {
  services: "Services",
  legislative: "Legislative",
  ordinances: "Ordinances",
  resolutions: "Resolutions",
  government: "Government",
  transparency: "Transparency",
  statistics: "Statistics",
  tourism: "Tourism",
  community: "Community",
  groups: "Peer Groups",
  discussions: "Discussions",
  contact: "Contact",
  about: "About",
  "freedom-wall": "Freedom Wall",
  quiz: "Libmanan Quiz",
  "latest-updates": "Latest Updates",
  faq: "FAQ",
  charter: "Citizen's Charter",
  terms: "Terms of Use",
  privacy: "Privacy Policy",
  accessibility: "Accessibility",
  sitemap: "Sitemap",
  install: "Install App",
  certificates: "Certificates",
  business: "Business Permits",
  "tax-payments": "Tax Payments",
  "social-services": "Social Services",
  health: "Health Services",
  agriculture: "Agriculture",
  infrastructure: "Infrastructure",
  education: "Education",
  "public-safety": "Public Safety",
  environment: "Environment",
};

/**
 * Returns an array of breadcrumb items derived from the current URL path.
 * Always includes a "Home" entry as the first item.
 * Dynamic ID segments (UUIDs, numbers) are shown as "Detail".
 *
 * @example
 * // On /services/health → [Home, Services, Health Services]
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const { pathname } = useLocation();

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const items: BreadcrumbItem[] = [{ name: "Home", url: `${BASE_URL}/` }];

  segments.forEach((seg, idx) => {
    const url = `${BASE_URL}/${segments.slice(0, idx + 1).join("/")}`;
    // If the segment looks like an ID (UUID or numeric), label it generically
    const isId = /^[0-9a-f-]{8,}$|^\d+$/.test(seg);
    const name = isId ? "Detail" : (SEGMENT_LABELS[seg] ?? capitalize(seg));
    items.push({ name, url });
  });

  return items;
}

function capitalize(str: string): string {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
