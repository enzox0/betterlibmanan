import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaHome,
  FaBuilding,
  FaPhone,
  FaConciergeBell,
  FaGavel,
  FaEye,
  FaChartBar,
  FaUsers,
} from "react-icons/fa";
import { useUserStore } from "@/modules/admin/store/userStore";
import { getProxiedUrl } from "@/modules/landing/components/ui/SafeImage";

interface NavbarProps {
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function Navbar({
  authModalOpen,
  setAuthModalOpen,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLangModal, setShowLangModal] = useState(false);
  const [isInHero, setIsInHero] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Expand navbar to full width only when on the homepage and within the hero viewport
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (!isHomePage) {
      setIsInHero(false);
      return;
    }

    const heroThreshold = window.innerHeight * 0.75;

    const handleScroll = () => {
      setIsInHero(window.scrollY < heroThreshold);
    };

    // Set initial state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Navigation structured into categories by use
  interface NavItem {
    name: string;
    path: string;
    icon?: React.ReactNode;
    hasDropdown?: boolean;
    dropdownItems?: Array<{ name: string; path: string }>;
    dropdownOnly?: boolean;
  }

  interface NavSection {
    title: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: "Main",
      items: [
        { name: "Home", path: "/", icon: <FaHome size={16} /> },
        {
          name: "Government",
          path: "/government",
          icon: <FaBuilding size={16} />,
        },
        { name: "Contact", path: "/contact", icon: <FaPhone size={16} /> },
      ],
    },
    {
      title: "Services & Information",
      items: [
        {
          name: "Services",
          path: "/services",
          icon: <FaConciergeBell size={16} />,
          hasDropdown: true,
          dropdownItems: [
            { name: "Certificates", path: "/services/certificates" },
            { name: "Business", path: "/services/business" },
            { name: "Tax Payments", path: "/services/tax-payments" },
            { name: "Social Services", path: "/services/social-services" },
            { name: "Health", path: "/services/health" },
            { name: "Agriculture", path: "/services/agriculture" },
            { name: "Infrastructure", path: "/services/infrastructure" },
            { name: "Education", path: "/services/education" },
            { name: "Public Safety", path: "/services/public-safety" },
            { name: "Environment", path: "/services/environment" },
          ],
        },
        {
          name: "Legislative",
          path: "/legislative",
          icon: <FaGavel size={16} />,
          hasDropdown: true,
          dropdownItems: [
            { name: "Ordinance Framework", path: "/legislative/ordinances" },
            { name: "Resolution Framework", path: "/legislative/resolutions" },
          ],
        },
        {
          name: "Transparency",
          path: "/transparency",
          icon: <FaEye size={16} />,
        },
        {
          name: "Statistics",
          path: "/statistics",
          icon: <FaChartBar size={16} />,
        },
      ],
    },
    {
      title: "More",
      items: [
        {
          name: "More",
          path: "/more",
          hasDropdown: true,
          dropdownOnly: true,
          dropdownItems: [
            { name: "Tourism", path: "/tourism" },
            { name: "About", path: "/about" },
            { name: "Install App", path: "/install" },
          ],
        },
      ],
    },
  ];

  // Flattened for desktop navigation (no section titles needed)
  const navItems = navSections.flatMap((section) => section.items);

  const languageButtons = [
    { code: "EN", active: true },
    { code: "FIL", active: false },
    { code: "BIK", active: false },
  ];

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDropdownMouseEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Language Unavailable Modal */}
      {showLangModal && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowLangModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-100 text-blue-800 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Feature Unavailable
            </h2>
            <p className="text-sm text-gray-500 text-center">
              This language option is not available right now. Please check back
              later.
            </p>
            <button
              onClick={() => setShowLangModal(false)}
              className="mt-2 px-6 py-2 bg-blue-800 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-[999999]">
        <div
          className="mx-auto px-4 sm:px-6 lg:px-8 transition-[max-width,padding] duration-500 ease-in-out"
          style={{
            maxWidth: isInHero ? "100%" : "80rem",
          }}
        >
          <div className="flex justify-between items-center py-4">
            {/* Logo + Nav — grouped so nav slides left with logo in hero mode */}
            <div className="flex items-center gap-4 xl:gap-6 min-w-0">
              <Link to="/" className="flex items-center shrink-0">
                <img
                  src="/betterlibmanan-extended-logo.png"
                  alt="Better Libmanan Logo"
                  className="h-12 sm:h-16"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
                {navItems.map((item) => (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() =>
                      item.hasDropdown && handleDropdownMouseEnter(item.name)
                    }
                    onMouseLeave={() =>
                      item.hasDropdown && handleDropdownMouseLeave()
                    }
                  >
                    {item.hasDropdown ? (
                      item.dropdownOnly ? (
                        <span
                          onMouseEnter={() =>
                            handleDropdownMouseEnter(item.name)
                          }
                          className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-1 cursor-default select-none"
                        >
                          {item.name}
                          <FaChevronDown
                            className={`text-xs transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                          />
                        </span>
                      ) : (
                        <Link
                          to={item.path}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                          }}
                          onMouseEnter={() =>
                            handleDropdownMouseEnter(item.name)
                          }
                          className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-1 cursor-pointer"
                        >
                          {item.name}
                          <FaChevronDown
                            className={`text-xs transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                          />
                        </Link>
                      )
                    ) : (
                      <Link
                        to={item.path}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm"
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {item.hasDropdown && activeDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute top-full left-0 mt-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 pt-2"
                          onMouseEnter={() =>
                            handleDropdownMouseEnter(item.name)
                          }
                          onMouseLeave={handleDropdownMouseLeave}
                        >
                          {item.dropdownItems?.map((dropdownItem, i) => (
                            <motion.div
                              key={dropdownItem.name}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                duration: 0.2,
                                ease: "easeOut",
                                delay: i * 0.03,
                              }}
                            >
                              <Link
                                to={dropdownItem.path}
                                className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {dropdownItem.name}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>
            </div>
            {/* end logo+nav group */}

            {/* Desktop right-side: language + user auth */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language buttons */}
              {languageButtons.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => !lang.active && setShowLangModal(true)}
                  className={`px-3 py-1 rounded-lg border-2 font-medium text-sm transition-colors ${
                    lang.active
                      ? "bg-blue-800 text-white border-blue-800"
                      : "bg-white text-blue-800 border-blue-800 hover:bg-blue-50"
                  }`}
                >
                  {lang.code}
                </button>
              ))}

              {/* User auth */}
              {isAuthenticated && currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-white text-[11px] font-bold shrink-0 overflow-hidden">
                      {currentUser.avatarUrl ? (
                        <img
                          src={getProxiedUrl(currentUser.avatarUrl)}
                          alt={currentUser.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentUser.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {currentUser.displayName}
                    </span>
                    <FaChevronDown
                      className={`text-[10px] text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50"
                      >
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            delay: 0.03,
                          }}
                          className="px-4 py-2.5 border-b border-gray-100"
                        >
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {currentUser.displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            @{currentUser.username}
                          </p>
                        </motion.div>
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            delay: 0.06,
                          }}
                        >
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FaUser size={12} />
                            My Profile
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            delay: 0.09,
                          }}
                        >
                          <Link
                            to="/community"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            <FaUsers size={12} />
                            Community
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeOut",
                            delay: 0.12,
                          }}
                        >
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <FaSignOutAlt size={12} />
                            Sign Out
                          </button>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white text-sm font-semibold transition-colors shadow-sm"
                >
                  <FaUser size={11} />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden flex items-center justify-center text-gray-700 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="h-6 w-6" />
                ) : (
                  <FaBars className="h-6 w-6" />
                )}
              </motion.div>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="lg:hidden border-t border-gray-100 pt-0 overflow-hidden"
              >
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  exit={{ y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 0.05,
                  }}
                  className="overflow-y-auto max-h-[calc(100dvh-80px)] pb-4"
                >
                  {/* NAVIGATION Label */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-800 to-blue-700 px-4 py-3 mb-4"
                  >
                    <p className="text-sm font-semibold text-white uppercase tracking-wider">
                      NAVIGATION
                    </p>
                  </motion.div>

                  <nav className="flex flex-col gap-4 mb-4 px-4">
                    {navSections.map((section, sectionIndex) => (
                      <motion.div
                        key={section.title}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: "easeOut",
                          delay: 0.15 + sectionIndex * 0.05,
                        }}
                        className={
                          sectionIndex > 0
                            ? "pt-4 border-t border-gray-200"
                            : ""
                        }
                      >
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                          {section.title}
                        </p>
                        <div className="flex flex-col gap-2">
                          {section.items.map((item, itemIndex) => (
                            <motion.div
                              key={item.name}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                ease: "easeOut",
                                delay:
                                  0.2 + sectionIndex * 0.05 + itemIndex * 0.03,
                              }}
                            >
                              {item.hasDropdown ? (
                                <>
                                  <button
                                    onClick={() => toggleDropdown(item.name)}
                                    className="w-full text-left text-gray-800 hover:text-blue-700 font-semibold transition-colors text-base py-2.5 flex items-center justify-between bg-gray-50 hover:bg-blue-50 rounded-lg px-3 gap-3"
                                  >
                                    <span className="flex items-center gap-3">
                                      {item.icon}
                                      {item.name}
                                    </span>
                                    <FaChevronDown
                                      className={`text-xs transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                                    />
                                  </button>

                                  {/* Mobile Dropdown */}
                                  <AnimatePresence>
                                    {activeDropdown === item.name &&
                                      item.dropdownItems && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{
                                            height: "auto",
                                            opacity: 1,
                                          }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{
                                            duration: 0.25,
                                            ease: "easeOut",
                                          }}
                                          className="overflow-hidden"
                                        >
                                          <div className="pl-4 mt-3 flex flex-col gap-1">
                                            {item.dropdownItems.map(
                                              (dropdownItem, i) => (
                                                <motion.div
                                                  key={dropdownItem.name}
                                                  initial={{
                                                    x: -10,
                                                    opacity: 0,
                                                  }}
                                                  animate={{ x: 0, opacity: 1 }}
                                                  transition={{
                                                    duration: 0.2,
                                                    ease: "easeOut",
                                                    delay: i * 0.03,
                                                  }}
                                                >
                                                  <Link
                                                    to={dropdownItem.path}
                                                    className="text-gray-700 hover:text-blue-700 font-medium transition-colors text-sm py-2 pl-2 border-l-2 border-blue-500"
                                                    onClick={() => {
                                                      setIsMobileMenuOpen(
                                                        false,
                                                      );
                                                      setActiveDropdown(null);
                                                    }}
                                                  >
                                                    {dropdownItem.name}
                                                  </Link>
                                                </motion.div>
                                              ),
                                            )}
                                          </div>
                                        </motion.div>
                                      )}
                                  </AnimatePresence>
                                </>
                              ) : (
                                <Link
                                  to={item.path}
                                  className="text-gray-800 hover:text-blue-700 font-semibold transition-colors text-base py-2.5 bg-gray-50 hover:bg-blue-50 rounded-lg px-3 flex items-center gap-3"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  {item.icon}
                                  {item.name}
                                </Link>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </nav>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.35 }}
                    className="flex items-center gap-2 flex-wrap px-4"
                  >
                    {languageButtons.map((lang, i) => (
                      <motion.button
                        key={lang.code}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          ease: "easeOut",
                          delay: 0.4 + i * 0.05,
                        }}
                        onClick={() => !lang.active && setShowLangModal(true)}
                        className={`px-3 py-1 rounded-lg border-2 font-medium text-sm transition-colors ${
                          lang.active
                            ? "bg-blue-800 text-white border-blue-800"
                            : "bg-white text-blue-800 border-blue-800 hover:bg-blue-50"
                        }`}
                      >
                        {lang.code}
                      </motion.button>
                    ))}
                  </motion.div>

                  {/* Mobile user auth */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: 0.45 }}
                    className="pt-3 mt-3 border-t border-gray-100 px-4"
                  >
                    {isAuthenticated && currentUser ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5 px-1 py-2">
                          <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                            {currentUser.avatarUrl ? (
                              <img
                                src={getProxiedUrl(currentUser.avatarUrl)}
                                alt={currentUser.displayName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              currentUser.displayName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {currentUser.displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              @{currentUser.username}
                            </p>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <FaUser size={12} />
                          My Profile
                        </Link>
                        <Link
                          to="/community"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                        >
                          <FaUsers size={12} />
                          Community
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center gap-2 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FaSignOutAlt size={12} />
                          Sign Out
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                      >
                        <FaUser size={12} />
                        Sign In / Create Account
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
