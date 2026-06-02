import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services', hasDropdown: true },
    { name: 'Government', path: '/government' },
    { name: 'Statistics', path: '/statistics' },
    { name: 'Legislative', path: '/legislative', hasDropdown: true },
    { name: 'Transparency', path: '/transparency' },
    { name: 'Contact', path: '/contact' }
  ];

  const languageButtons = [
    { code: 'EN', active: true },
    { code: 'FIL', active: false },
    { code: 'BIK', active: false }
  ];

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
              <Link
                key={item.name}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-base lg:text-lg flex items-center gap-1"
              >
                {item.name}
                {item.hasDropdown && <span className="text-xs">▼</span>}
              </Link>
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
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors text-lg py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
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
