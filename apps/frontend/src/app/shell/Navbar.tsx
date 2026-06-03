import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
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

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
              >
                {item.hasDropdown ? (
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-base lg:text-lg flex items-center gap-1"
                  >
                    {item.name}
                    <FaChevronDown className={`text-xs transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-base lg:text-lg"
                  >
                    {item.name}
                  </Link>
                )}
                
                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        to={dropdownItem.path}
                        className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
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
          <div className="hidden md:flex items-center gap-2">
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
            className="md:hidden flex items-center justify-center text-gray-700 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col gap-3 mb-4">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className="w-full text-left text-gray-700 hover:text-blue-600 font-medium transition-colors text-lg py-2 flex items-center justify-between"
                      >
                        {item.name}
                        <FaChevronDown className={`text-sm transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* Mobile Dropdown */}
                      {activeDropdown === item.name && item.dropdownItems && (
                        <div className="pl-4 mt-2 flex flex-col gap-2">
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.path}
                              className="text-gray-600 hover:text-blue-600 font-medium transition-colors py-1"
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
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-lg py-2"
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
