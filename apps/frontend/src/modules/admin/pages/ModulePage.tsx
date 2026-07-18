import { Navigate, useParams } from "react-router-dom";
import { ModulePlaceholder } from "../components/placeholders/ModulePlaceholder";

const MODULE_NAMES: Record<string, string> = {
  services: "Services",
  government: "Government",
  statistics: "Statistics",
  legislative: "Legislative",
  transparency: "Transparency",
  contacts: "Contacts",
};

function slugToDisplayName(slug: string): string {
  if (slug in MODULE_NAMES) {
    return MODULE_NAMES[slug];
  }
  // Fallback: capitalise the first letter of the slug
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

export function ModulePage() {
  const { module } = useParams<{ module: string }>();

  // `home` slug and missing module param both redirect to the admin root
  if (!module || module === "home") {
    return <Navigate to="/admin" replace />;
  }

  const moduleName = slugToDisplayName(module);

  return <ModulePlaceholder moduleName={moduleName} />;
}
