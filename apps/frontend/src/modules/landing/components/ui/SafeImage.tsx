import { useEffect, useState } from "react";

const LOGO_FALLBACK = "/logo.svg";

// Detect Cloudflare R2 URLs (e.g., *.r2.dev)
const isR2Url = (url: string) => {
  try {
    const u = new URL(url);
    return u.hostname.endsWith(".r2.dev");
  } catch {
    return false;
  }
};

// Rewrite R2 URL to use our backend proxy
export const getProxiedUrl = (url: string) => {
  if (!isR2Url(url)) return url;

  const apiUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
  return `${apiUrl}/properties/image-proxy?src=${encodeURIComponent(url)}`;
};

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackClassName?: string;
  containerClassName?: string;
}

/**
 * Renders an image with a fallback when:
 * - No image URL is provided (src is null, undefined, or empty)
 * - Image fails to load (404, network error, etc.)
 */
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
      <div className={`flex items-center justify-center bg-muted-bg/80 overflow-hidden ${containerClassName || className}`}>
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

  return <img src={getProxiedUrl(src!)} alt={alt} className={className} onError={() => setHasError(true)} {...props} />;
}
