import { useLocation } from "react-router-dom";
import { PageMetadata } from "./PageMetadata";
import { getPageMetadata } from "@/app/config/pageMetadata";

/**
 * Paths (or prefixes) that should never appear in search results.
 * Matches the same set as robots.txt Disallow rules.
 */
const NOINDEX_PREFIXES = [
  "/admin",
  "/profile",
  "/install",
  "/coming-soon",
  "/community/groups/", // individual group chat rooms
  "/community/discussions/", // individual discussion threads
];

function shouldNoIndex(pathname: string): boolean {
  return NOINDEX_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Automatically manages page metadata (title, description, Open Graph,
 * Twitter Cards, canonical URL, JSON-LD structured data, and robots
 * directives) based on the current route.
 *
 * Place this component once in a layout — it re-renders on every navigation
 * and keeps all <head> metadata in sync with the active route.
 */
export function AutoPageMetadata() {
  const location = useLocation();
  const metadata = getPageMetadata(location.pathname);
  const noIndex = shouldNoIndex(location.pathname);

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={metadata.keywords}
      canonicalUrl={
        metadata.canonicalPath
          ? `https://www.betterlibmanan.org${metadata.canonicalPath}`
          : undefined
      }
      structuredData={metadata.structuredData}
      noIndex={noIndex}
    />
  );
}
