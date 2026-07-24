import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { StructuredDataObject } from "@/app/config/pageMetadata";

interface PageMetadataProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player";
  canonicalUrl?: string;
  /** Array of JSON-LD structured data objects to inject into <head>. */
  structuredData?: StructuredDataObject[];
  /** Set true when title already includes the site name / separator. */
  isCustomTitle?: boolean;
  /** Prevent search engines from indexing this page. */
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  "BetterLibmanan is the official digital transparency portal for the Municipality of Libmanan, Camarines Sur, Philippines. Access government services, public records, legislation, and community resources.";
const DEFAULT_KEYWORDS =
  "Libmanan, BetterLibmanan, LGU Libmanan, Camarines Sur, municipal services, government portal, transparency, Bicol";
const BASE_URL = "https://www.betterlibmanan.org";
const DEFAULT_OG_IMAGE = `${BASE_URL}/betterlibmanan-extended-logo.png`;
const STRUCTURED_DATA_ATTR = "data-page-structured";

/**
 * Manages all SEO metadata for a page: <title>, meta tags, Open Graph,
 * Twitter Cards, canonical URL, and JSON-LD structured data.
 *
 * @example
 * <PageMetadata
 *   title="Services"
 *   description="Explore Libmanan government services"
 *   structuredData={[{ "@context": "https://schema.org", "@type": "WebPage" }]}
 * />
 */
export function PageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  canonicalUrl,
  structuredData,
  isCustomTitle = false,
  noIndex = false,
}: PageMetadataProps) {
  const location = useLocation();

  const hasNameOrSep = title.includes("BetterLibmanan") || title.includes("|");
  const fullTitle =
    isCustomTitle || hasNameOrSep ? title : `${title} | BetterLibmanan`;

  const fullCanonicalUrl = canonicalUrl || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // ── Document title ───────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Primary meta ─────────────────────────────────────────────────────
    setMeta("name", "description", description);
    setMeta("name", "keywords", keywords);
    setMeta(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    // ── Open Graph ───────────────────────────────────────────────────────
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", fullCanonicalUrl);
    setMeta("property", "og:site_name", "BetterLibmanan");
    setMeta("property", "og:locale", "en_PH");

    // ── Twitter Card ─────────────────────────────────────────────────────
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage);
    setMeta("name", "twitter:card", twitterCard);
    setMeta("name", "twitter:url", fullCanonicalUrl);

    // ── Canonical URL ────────────────────────────────────────────────────
    setCanonical(fullCanonicalUrl);

    // ── Structured data ──────────────────────────────────────────────────
    // Remove any previously injected per-page JSON-LD scripts
    document
      .querySelectorAll(
        `script[type="application/ld+json"][${STRUCTURED_DATA_ATTR}]`,
      )
      .forEach((el) => el.remove());

    if (structuredData?.length) {
      structuredData.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute(STRUCTURED_DATA_ATTR, "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [
    fullTitle,
    description,
    keywords,
    ogImage,
    ogType,
    twitterCard,
    fullCanonicalUrl,
    structuredData,
    noIndex,
  ]);

  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function setMeta(
  attr: "name" | "property",
  value: string,
  content: string,
): void {
  let el = document.querySelector(
    `meta[${attr}="${value}"]`,
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(url: string): void {
  let link = document.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = url;
}
