import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

interface BackToTopButtonProps {
  isMobileMenuOpen?: boolean;
}

export function BackToTopButton({
  isMobileMenuOpen = false,
}: BackToTopButtonProps) {
  if (isMobileMenuOpen) return null;
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999999] transition-all duration-300 transform ${
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-0 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        className="bg-blue-600 hover:bg-blue-700 text-white w-11 h-11 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        aria-label="Back to top"
      >
        <FaArrowUp size={16} />
      </button>
    </div>
  );
}
