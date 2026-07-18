import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
