import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../store/adminStore";

export function useAdminShortcut(): void {
  const navigate = useNavigate();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!(event.shiftKey && event.key === "A")) return;

      const active = document.activeElement;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (active.getAttribute("contenteditable") === "true") return;
      }

      if (isAuthenticated) {
        navigate("/admin");
      } else {
        navigate("/admin/login");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthenticated, navigate]);
}
