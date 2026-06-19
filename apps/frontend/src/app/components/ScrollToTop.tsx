import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls the window to the top whenever the route pathname changes.
 * Uses smooth scrolling so the transition feels intentional rather than jarring.
 * Place this once inside <BrowserRouter> so it covers every route.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
