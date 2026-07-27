import { useEffect, useState } from "react";

const LOGO_FALLBACK = "/logo.svg";

export const R2_DNS_CONFIG = {
  cloudflare: {
    preconnect: "https://pub.r2.dev",
    dnsPrefetch: "https://pub.r2.dev",
  },

  google: {
    preconnect: "https://maps.googleapis.com",
    dnsPrefetch: "https://maps.googleapis.com",
  },
} as const;

// Resolved at build time. Strip trailing slash and lowercase for comparison.
const R2_CUSTOM_BASE =
  (import.meta.env.VITE_R2_PUBLIC_BASE_URL as string | undefined)
    ?.replace(/\/+$/, "")
    .toLowerCase() ?? "";

/**
 * Returns true for any URL that should be served through the backend
 * image-proxy. We proxy:
 *
 *  1. Any *.r2.dev URL  — native Cloudflare R2 public domain
 *  2. Any URL whose hostname matches VITE_R2_PUBLIC_BASE_URL  — custom R2 domain
 *  3. Any other absolute https:// URL that is NOT the current app origin
 *     and NOT a well-known public CDN we trust to load directly (Google
 *     Fonts, Google APIs, etc.).
 *
 * Rule 3 is the safety net that keeps images working across dev / staging /
 * production even when VITE_R2_PUBLIC_BASE_URL is unset or points to a
 * different domain than what the backend actually stored.
 */
const PASSTHROUGH_HOSTNAMES = new Set([
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "maps.googleapis.com",
  "maps.gstatic.com",
]);

const shouldProxy = (url: string): boolean => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Relative paths, data URIs, blob URLs — don't proxy
    return false;
  }

  // Only proxy http/https
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;

  const { hostname } = parsed;

  // Always proxy native R2 domains
  if (hostname.endsWith(".r2.dev")) return true;

  // Always proxy the configured custom R2 domain
  if (R2_CUSTOM_BASE) {
    try {
      if (hostname === new URL(R2_CUSTOM_BASE).hostname) return true;
    } catch {
      // malformed VITE_R2_PUBLIC_BASE_URL — fall through
    }
  }

  // Skip well-known public CDNs that don't need proxying
  if (PASSTHROUGH_HOSTNAMES.has(hostname)) return false;

  // Skip same-origin URLs (relative absolute paths like http://localhost:3000/logo.svg)
  if (typeof window !== "undefined" && hostname === window.location.hostname) {
    return false;
  }

  // Any other external absolute URL is treated as an uploaded asset and proxied.
  // This is the catch-all that covers custom R2 domains not declared in env vars.
  return true;
};

export const getProxiedUrl = (url: string): string => {
  if (!shouldProxy(url)) return url;

  const apiUrl = (
    (import.meta.env.VITE_API_URL as string | undefined) || "/api"
  ).replace(/\/+$/, "");
  return `${apiUrl}/properties/image-proxy?src=${encodeURIComponent(url)}`;
};

interface SafeImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackClassName?: string;
  containerClassName?: string;
}

export default function SafeImage({
  src,
  alt = "",
  className = "",
  fallbackSrc = LOGO_FALLBACK,
  fallbackClassName = "object-contain p-1.5 opacity-50 dark:opacity-40 grayscale brightness-75",
  containerClassName = "",
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const hasValidSrc = src && typeof src === "string" && src.trim().length > 0;
  const showFallback = !hasValidSrc || hasError;

  if (showFallback) {
    return (
      <div
        className={`flex items-center justify-center bg-muted-bg/80 overflow-hidden ${containerClassName || className}`}
      >
        <img
          src={fallbackSrc}
          alt="Fallback"
          className={`w-full h-full max-w-[80%] max-h-[80%] ${fallbackClassName}`}
          loading="lazy"
          decoding="async"
          {...({ fetchpriority: "high" } as any)}
        />
      </div>
    );
  }

  return (
    <img
      src={getProxiedUrl(src!)}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
