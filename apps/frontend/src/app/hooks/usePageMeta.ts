import { useEffect } from "react";
import type { StructuredDataObject } from "@/app/config/pageMetadata";

const BASE_URL = "https://www.betterlibmanan.org";
const SITE_SUFFIX = " | BetterLibmanan";
const STRUCTURED_DATA_ATTR = "data-page-structured";

interface UsePageMetaOptions {
  /** Raw page title — " | BetterLibmanan" is appended automatically. */
  title: string;
  description?: string;
  keywords?: string;
  /** Absolute canonical URL. Defaults to the current window.location. */
  canonicalUrl?: string;
  /** Open Graph image URL. */
  ogImage?: string;
  /** Additional JSON-LD schemas to inject (replaces any existing page-level ones). */
  structuredData?: StructuredDataObject[];
}

/**
 * Imperatively overrides page metadata for dynamic pages where the title /
 * description come from API data (e.g. community group detail, discussion
 * detail, or a specific news article).
 *
 * Cleans up and restores the previous title on unmount so navigating away
 * doesn't leave stale metadata.
 *
 * @example
 * // Inside GroupDetailPage, once group data is loaded:
 * usePageMeta({
 *   title: `${group.name} — Libmanan Community`,
 *   description: group.description,
 *   keywords: `${group.name}, Libmanan community, Camarines Sur`,
 * });
 */
export function usePageMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  structuredData,
}: UsePageMetaOptions): void {
  useEffect(() => {
    if (!title) return;

    const fullTitle =
      title.includes("BetterLibmanan") || title.includes("|")
        ? title
        : `${title}${SITE_SUFFIX}`;

    const prevTitle = document.title;
    document.title = fullTitle;

    const canonical = canonicalUrl ?? `${BASE_URL}${window.location.pathname}`;

    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);
    setCanonical(canonical);
    setMeta("property", "og:url", canonical);
    setMeta("name", "twitter:url", canonical);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    if (keywords) {
      setMeta("name", "keywords", keywords);
    }

    if (ogImage) {
      setMeta("property", "og:image", ogImage);
      setMeta("name", "twitter:image", ogImage);
    }

    // Structured data
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

    return () => {
      document.title = prevTitle;
    };
  }, [title, description, keywords, canonicalUrl, ogImage, structuredData]);
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
