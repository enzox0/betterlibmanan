import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen, FaTools, FaUsers, FaBookOpen } from "react-icons/fa";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  icon: any;
  label: string;
  description: string;
  id: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    icon: FaPen,
    label: "Freedom Wall",
    description: "Share your thoughts",
    id: "freedom-wall",
    href: "/",
  },
  {
    icon: FaTools,
    label: "Services",
    description: "Browse government services",
    id: "services",
    href: "/",
  },
  {
    icon: FaUsers,
    label: "Community",
    description: "Connect with others",
    id: "community",
    href: "/",
  },
  {
    icon: FaBookOpen,
    label: "About",
    description: "Learn about Libmanan",
    id: "about",
    href: "/",
  },
];

interface VerticalNavProps {
  visible?: boolean;
}

export function MiniFloatingNav({ visible = true }: VerticalNavProps) {
  const navigate = useNavigate();
  const [showByTimeout, setShowByTimeout] = useState(true);
  const [isCursorOnLeftSide, setIsCursorOnLeftSide] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowByTimeout(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setIsCursorOnLeftSide(event.clientX <= 90);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const shouldShowNav = visible && (showByTimeout || isCursorOnLeftSide);

  const handleClick = (href: string) => {
    navigate(href);
  };

  return (
    <motion.nav
      className="fixed left-2 md:left-6 top-[45%] -translate-y-1/2 z-[100]"
      initial={false}
      animate={{
        opacity: shouldShowNav ? 1 : 0,
        x: shouldShowNav ? 0 : -20,
        pointerEvents: shouldShowNav ? "auto" : "none",
      }}
      transition={
        shouldShowNav
          ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
      }
    >
      <div className="flex flex-col gap-2">
        {navItems.map((item, index) => (
          <NavButton
            key={item.id}
            item={item}
            index={index}
            onClick={() => handleClick(item.href)}
          />
        ))}
      </div>
    </motion.nav>
  );
}

interface NavButtonProps {
  item: NavItem;
  index: number;
  onClick?: () => void;
}

function NavButton({ item, index, onClick }: NavButtonProps) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.pageX, y: e.pageY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const expanded = isMobile ? false : isHovered;

  // Calculate height based on label length (approx 16px per character + padding)
  const expandedHeight = useMemo(() => {
    const baseHeight = 60;
    const charHeight = 12;
    return `${baseHeight + item.label.length * charHeight}px`;
  }, [item.label.length]);

  return (
    <>
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        onClick={onClick}
        className="relative group"
      >
        <motion.div
          layout
          className={cn(
            "bg-white border border-neutral-200 transition-colors overflow-hidden flex items-center justify-center rounded-xl",
            !isMobile ? "hover:bg-neutral-900" : ""
          )}
          style={{ transformOrigin: "center" }}
          animate={{
            height: expanded ? expandedHeight : "44px",
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="p-1.5 flex flex-col items-center justify-center gap-1.5">
            <motion.div
              animate={{ scale: expanded ? 1.15 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon
                size={14}
                className={cn(
                  expanded ? "text-white" : "text-neutral-700",
                  !isMobile ? "group-hover:scale-110" : "",
                  "transition-transform"
                )}
              />
            </motion.div>

            {!isMobile && (
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      expanded ? "text-white" : "text-neutral-700",
                      "text-sm font-medium whitespace-nowrap"
                    )}
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      letterSpacing: "1px",
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="fixed pointer-events-none z-[999999]"
            style={{
              left: mousePos.x + 10,
              top: mousePos.y + 10,
            }}
          >
            <div className="bg-neutral-900 text-white px-2 py-1.5 shadow-lg whitespace-nowrap text-xs font-medium rounded-lg border border-neutral-700">
              {item.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
