import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "@/modules/landing/components/ui/UserAuthModal";

export function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showLangModal, setShowLangModal] = useState(false);
  const [isInHero, setIsInHero] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
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

  const navItems = [
    { name: "Home", path: "/" },
    {
      name: "Services",
      path: "/services",
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
    { name: "Government", path: "/government" },
    { name: "Statistics", path: "/statistics" },
    {
      name: "Legislative",
      path: "/legislative",
      hasDropdown: true,
      dropdownItems: [
        { name: "Ordinance Framework", path: "/legislative/ordinances" },
        { name: "Resolution Framework", path: "/legislative/resolutions" },
      ],
    },
    { name: "Transparency", path: "/transparency" },
    { name: "Contact", path: "/contact" },
    {
      name: "Others",
      path: "/others",
      hasDropdown: true,
      dropdownOnly: true,
      dropdownItems: [
        { name: "Tourism", path: "/tourism" },
        { name: "Install App", path: "/install" },
        { name: "About", path: "/about" },
      ],
    },
  ];

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
                    {item.hasDropdown && activeDropdown === item.name && (
                      <div
                        className="absolute top-full left-0 mt-0 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 pt-2"
                        onMouseEnter={() => handleDropdownMouseEnter(item.name)}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.path}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
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
                    <div className="w-7 h-7 rounded-full bg-blue-800 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {currentUser.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {currentUser.displayName}
                    </span>
                    <FaChevronDown
                      className={`text-[10px] text-gray-400 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {currentUser.displayName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          @{currentUser.username}
                        </p>
                      </div>
                      <Link
                        to="/community"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <FaUser size={12} />
                        My Community
                      </Link>
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
                    </div>
                  )}
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
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 pt-4 pb-4 overflow-y-auto max-h-[calc(100dvh-80px)]">
              <nav className="flex flex-col gap-1 mb-4">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => toggleDropdown(item.name)}
                          className="w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors text-base py-2 flex items-center justify-between"
                        >
                          {item.name}
                          <FaChevronDown
                            className={`text-xs transition-transform ${activeDropdown === item.name ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Mobile Dropdown */}
                        {activeDropdown === item.name && item.dropdownItems && (
                          <div className="pl-4 mt-2 flex flex-col gap-2">
                            {item.dropdownItems.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.name}
                                to={dropdownItem.path}
                                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm py-1"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setActiveDropdown(null);
                                }}
                              >
                                {dropdownItem.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-base py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
              <div className="flex items-center gap-2 flex-wrap">
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
              </div>

              {/* Mobile user auth */}
              <div className="pt-3 mt-3 border-t border-gray-100">
                {isAuthenticated && currentUser ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2.5 px-1 py-2">
                      <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {currentUser.displayName.slice(0, 2).toUpperCase()}
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
                      to="/community"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <FaUser size={12} />
                      My Community
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
              </div>
            </div>
          )}
        </div>
      </header>

      {/* User auth modal — rendered outside header to avoid z-index conflicts */}
      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </>
  );
}
