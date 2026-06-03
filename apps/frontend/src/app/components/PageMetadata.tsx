import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageMetadataProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonicalUrl?: string;
}

const DEFAULT_DESCRIPTION = 
  'BetterLibmanan is a comprehensive, enterprise-grade library management system designed for modern libraries. Streamline cataloging, circulation, and patron management with our intuitive platform.';
const DEFAULT_KEYWORDS = 
  'library management, library system, cataloging software, circulation management, digital library, book management, library automation, patron management';
const BASE_URL = 'https://www.betterlibmanan.org';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * Component to manage page metadata including title, description, and Open Graph tags
 * @example
 * <PageMetadata 
 *   title="Services"
 *   description="Explore our comprehensive library services"
 * />
 */
export function PageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
}: PageMetadataProps) {
  const location = useLocation();
  
  // Check if title already contains "BetterLibmanan" or "|" (custom format)
  const isCustomTitle = title.includes('BetterLibmanan') || title.includes('|');
  const fullTitle = isCustomTitle ? title : `${title} | BetterLibmanan`;
  
  const fullCanonicalUrl = canonicalUrl || `${BASE_URL}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta tags
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);

    // Update Open Graph tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', ogImage);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', fullCanonicalUrl);

    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', ogImage);
    updateMetaTag('name', 'twitter:card', twitterCard);

    // Update canonical URL
    updateCanonicalLink(fullCanonicalUrl);
  }, [title, description, keywords, ogImage, ogType, twitterCard, fullTitle, fullCanonicalUrl]);

  return null;
}

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(
  attribute: 'name' | 'property',
  attributeValue: string,
  content: string
): void {
  let element = document.querySelector(
    `meta[${attribute}="${attributeValue}"]`
  ) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Helper function to update canonical link
 */
function updateCanonicalLink(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}
