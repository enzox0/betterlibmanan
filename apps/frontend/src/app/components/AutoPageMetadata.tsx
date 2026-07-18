import { useLocation } from "react-router-dom";
import { PageMetadata } from "./PageMetadata";
import { getPageMetadata } from "@/app/config/pageMetadata";

/**
 * Automatically manages page metadata based on the current route
 * Place this component once in your app (e.g., in Layout or App)
 * @example
 * <AutoPageMetadata />
 */
export function AutoPageMetadata() {
  const location = useLocation();
  const metadata = getPageMetadata(location.pathname);

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={metadata.keywords}
    />
  );
}
