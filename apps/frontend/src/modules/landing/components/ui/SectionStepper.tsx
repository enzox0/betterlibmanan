import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface StepperSection {
  id: string;
  label: string;
}

interface SectionStepperProps {
  sections: StepperSection[];
}

export function SectionStepper({ sections }: SectionStepperProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    // Only show the stepper after the user scrolls a bit
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Clean up any previous observers
    observersRef.current.forEach((obs) => obs.disconnect());
    observersRef.current = [];

    const ratios = new Array(sections.length).fill(0);

    sections.forEach((section, index) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          ratios[index] = entry.intersectionRatio;
          // The section with the highest visible ratio is "active"
          const maxRatio = Math.max(...ratios);
          if (maxRatio > 0) {
            setActiveIndex(ratios.indexOf(maxRatio));
          }
        },
        { threshold: Array.from({ length: 21 }, (_, i) => i * 0.05) },
      );

      observer.observe(el);
      observersRef.current.push(observer);
    });

    return () => observersRef.current.forEach((obs) => obs.disconnect());
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Page sections"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-4 top-[40dvh] z-50 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
        >
          {sections.map((section, index) => {
            const isActive = index === activeIndex;
            const isHovered = index === hoveredIndex;

            return (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`Go to ${section.label}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-2"
              >
                {/* Label — slides in on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="rounded-md bg-gray-900/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Dot */}
                <motion.span
                  animate={{
                    scale: isActive ? 1 : isHovered ? 0.85 : 0.7,
                    backgroundColor: isActive
                      ? "#2563eb" // blue-600
                      : isHovered
                        ? "#6b7280" // gray-500
                        : "#d1d5db", // gray-300
                    boxShadow: isActive
                      ? "0 0 0 2px #fff, 0 0 0 4px #2563eb"
                      : "0 0 0 2px transparent, 0 0 0 4px transparent",
                  }}
                  transition={{ duration: 0.2 }}
                  className="block h-2.5 w-2.5 rounded-full"
                />
              </button>
            );
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

SectionStepper.displayName = "SectionStepper";

export default SectionStepper;
