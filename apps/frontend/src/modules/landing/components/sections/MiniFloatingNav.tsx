import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  /** Route to navigate to. If sectionId is set, we scroll instead when already on this route. */
  href: string;
  /** When provided, scrolls to this element id on the target page. */
  sectionId?: string;
}

const navItems: NavItem[] = [
  {
    icon: FaPen,
    label: "Freedom Wall",
    description: "Share your thoughts",
    id: "freedom-wall",
    href: "/freedom-wall",
  },
  {
    icon: FaTools,
    label: "Services",
    description: "Browse government services",
    id: "services",
    href: "/services",
  },
  {
    icon: FaUsers,
    label: "Community",
    description: "Connect with others",
    id: "community",
    href: "/community",
  },
  {
    icon: FaBookOpen,
    label: "About",
    description: "Learn about Libmanan",
    id: "about",
    href: "/about",
  },
];

interface VerticalNavProps {
  visible?: boolean;
}

export function MiniFloatingNav({ visible = true }: VerticalNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleClick = (item: NavItem) => {
    if (item.sectionId) {
      if (location.pathname === item.href) {
        document.getElementById(item.sectionId)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(item.href);
        setTimeout(() => {
          document.getElementById(item.sectionId!)?.scrollIntoView({ behavior: "smooth" });
        }, 400);
      }
    } else {
      navigate(item.href);
    }
  };

  return (
    <>
      {/* Desktop: left-side vertical nav */}
      <motion.nav
        className="fixed left-2 lg:left-6 inset-y-0 z-[100] hidden md:flex items-center pointer-events-none"
        initial={false}
        animate={{
          opacity: shouldShowNav ? 1 : 0,
          x: shouldShowNav ? 0 : -20,
        }}
        transition={
          shouldShowNav
            ? { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
        }
      >
        <div
          className="flex flex-col gap-2"
          style={{ pointerEvents: shouldShowNav ? "auto" : "none" }}
        >
          {navItems.map((item, index) => (
            <NavButton
              key={item.id}
              item={item}
              index={index}
              onClick={() => handleClick(item)}
            />
          ))}
        </div>
      </motion.nav>

      {/* Mobile / tablet: bottom dock */}
      {visible && (
        <nav className="fixed bottom-4 inset-x-0 z-[100] flex md:hidden justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-0.5 bg-white/90 backdrop-blur-md border border-neutral-200 rounded-xl px-2 py-1 shadow-lg shadow-black/10"
          >
            {navItems.map((item, index) => (
              <MobileNavButton
                key={item.id}
                item={item}
                index={index}
                onClick={() => handleClick(item)}
              />
            ))}
          </motion.div>
        </nav>
      )}
    </>
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

  // Half of the extra height added above and below the base 44px
  const extraPadding = useMemo(() => {
    const extraHeight = item.label.length * 5; // same as expandedHeight calculation
    return `${extraHeight / 2 + 2}px`; // 6px is base p-1.5
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
          className={cn(
            "bg-white border border-neutral-200 transition-colors overflow-hidden flex items-center justify-center rounded-lg",
            !isMobile ? "hover:bg-neutral-900" : ""
          )}
          animate={{
            paddingTop: expanded ? extraPadding : "6px",
            paddingBottom: expanded ? extraPadding : "6px",
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="px-1.5 flex flex-col items-center justify-center gap-1.5">
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

interface MobileNavButtonProps {
  item: NavItem;
  index: number;
  onClick?: () => void;
}

function MobileNavButton({ item, index, onClick }: MobileNavButtonProps) {
  const Icon = item.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors active:scale-95 active:bg-neutral-100"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <Icon size={13} className="text-neutral-500" />
    </motion.button>
  );
}
