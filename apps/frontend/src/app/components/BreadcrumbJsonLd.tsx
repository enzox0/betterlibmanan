import { useEffect } from "react";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

const ATTR = "data-breadcrumb-ld";

/**
 * Injects a BreadcrumbList JSON-LD script into <head> for the current page.
 * Automatically cleans up on unmount.
 *
 * @example
 * <BreadcrumbJsonLd items={[
 *   { name: "Home", url: "https://www.betterlibmanan.org/" },
 *   { name: "Services", url: "https://www.betterlibmanan.org/services" },
 *   { name: "Health", url: "https://www.betterlibmanan.org/services/health" },
 * ]} />
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  useEffect(() => {
    // Clean up any previous breadcrumb script
    document.querySelectorAll(`script[${ATTR}]`).forEach((el) => el.remove());

    if (items.length < 2) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute(ATTR, "true");
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      document.querySelectorAll(`script[${ATTR}]`).forEach((el) => el.remove());
    };
  }, [items]);

  return null;
}
