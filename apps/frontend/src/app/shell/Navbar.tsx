import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

export function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { 
      name: 'Services', 
      path: '/services', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Certificates', path: '/services/certificates' },
        { name: 'Business', path: '/services/business' },
        { name: 'Tax Payments', path: '/services/tax-payments' },
        { name: 'Social Services', path: '/services/social-services' },
        { name: 'Health', path: '/services/health' },
        { name: 'Agriculture', path: '/services/agriculture' },
        { name: 'Infrastructure', path: '/services/infrastructure' },
        { name: 'Education', path: '/services/education' },
        { name: 'Public Safety', path: '/services/public-safety' },
        { name: 'Environment', path: '/services/environment' }
      ]
    },
    { name: 'Government', path: '/government' },
    { name: 'Statistics', path: '/statistics' },
    { 
      name: 'Legislative', 
      path: '/legislative', 
      hasDropdown: true,
      dropdownItems: [
        { name: 'Ordinance Framework', path: '/legislative/ordinances' },
        { name: 'Resolution Framework', path: '/legislative/resolutions' }
      ]
    },
    { name: 'Transparency', path: '/transparency' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const languageButtons = [
    { code: 'EN', active: true },
    { code: 'FIL', active: false },
    { code: 'BIK', active: false }
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
    <header className="bg-white shadow-sm sticky top-0 z-[999999]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/betterlibmanan-extended-logo.png"
                alt="Better Libmanan Logo"
                className="h-12 sm:h-16"
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && handleDropdownMouseEnter(item.name)}
                onMouseLeave={() => item.hasDropdown && handleDropdownMouseLeave()}
              >
                {item.hasDropdown ? (
                  <Link
                    to={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    onMouseEnter={() => handleDropdownMouseEnter(item.name)}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-1 cursor-pointer"
                  >
                    {item.name}
                    <FaChevronDown className={`text-xs transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                  </Link>
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
          
          {/* Desktop Language Buttons */}
          <div className="hidden lg:flex items-center gap-2">
            {languageButtons.map((lang) => (
              <button
                key={lang.code}
                className={`px-3 py-1 rounded-lg border-2 font-medium text-sm transition-colors ${
                  lang.active
                    ? 'bg-blue-800 text-white border-blue-800'
                    : 'bg-white text-blue-800 border-blue-800 hover:bg-blue-50'
                }`}
              >
                {lang.code}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex items-center justify-center text-gray-700 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
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
                        <FaChevronDown className={`text-xs transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
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
            <div className="flex items-center gap-2">
              {languageButtons.map((lang) => (
                <button
                  key={lang.code}
                  className={`px-3 py-1 rounded-lg border-2 font-medium text-sm transition-colors ${
                    lang.active
                      ? 'bg-blue-800 text-white border-blue-800'
                      : 'bg-white text-blue-800 border-blue-800 hover:bg-blue-50'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
