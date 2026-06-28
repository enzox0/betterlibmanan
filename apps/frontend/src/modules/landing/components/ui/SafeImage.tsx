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

const R2_CUSTOM_BASE =
  (import.meta.env.VITE_R2_PUBLIC_BASE_URL as string | undefined)
    ?.replace(/\/+$/, "")
    .toLowerCase() ?? "";

const isR2Url = (url: string): boolean => {
  try {
    const { hostname } = new URL(url);

    if (hostname.endsWith(".r2.dev")) return true;

    if (R2_CUSTOM_BASE) {
      const customHost = new URL(R2_CUSTOM_BASE).hostname;
      if (hostname === customHost) return true;
    }

    return false;
  } catch {
    return false;
  }
};

export const getProxiedUrl = (url: string): string => {
  if (!isR2Url(url)) return url;

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
