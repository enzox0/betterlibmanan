import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaLinkedin,
  FaDiscord,
  FaEnvelope,
  FaGithub,
} from "react-icons/fa";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1A1A1A] text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Link to="/">
                <img
                  src="/betterlibmanan.png"
                  alt="Better Libmanan Logo"
                  className="h-12 sm:h-16 hover:opacity-80 transition-opacity duration-300"
                />
              </Link>
            </div>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Empowering the people of Libmanan with transparent access to the
              services, programs, and public funds of LGU Libmanan.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61590902231040"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://discord.gg/invite/betterlibmanan"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <FaDiscord size={18} />
              </a>
              <a
                href="https://github.com/enzox0/betterlibmanan"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-500 font-semibold mb-4 uppercase text-xs sm:text-sm tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="hover:text-white transition-colors text-sm"
                >
                  Libmanan Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/sitemap"
                  className="hover:text-white transition-colors text-sm"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors text-sm"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/accessibility"
                  className="hover:text-white transition-colors text-sm"
                >
                  Accessibility
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-white transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-gray-500 font-semibold mb-4 uppercase text-xs sm:text-sm tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://data.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-sm"
                >
                  Open Data Philippines
                </a>
              </li>
              <li>
                <a
                  href="https://foi.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-sm"
                >
                  Freedom of Information
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/localgovernmentunitoflibmanan/"
                  className="hover:text-white transition-colors text-sm"
                >
                  LGU Libmanan Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://blgf.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors text-sm"
                >
                  BLGF Portal
                </a>
              </li>
              <li>
                <a
                  href="https://cmci.dti.gov.ph/"
                  className="hover:text-white transition-colors text-sm"
                >
                  CMCI DTI Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Right Section */}
          <div className="flex flex-col items-start">
            <div className="bg-emerald-900/40 text-emerald-300 px-4 py-2 rounded-lg text-xs sm:text-sm mb-4 flex items-center gap-2">
              <span>Cost to the People of Libmanan = </span>
              <span className="font-semibold text-emerald-400">₱0</span>
            </div>
            <div className="flex flex-col gap-3 mb-6 w-full">
              <a
                href="https://bettergov.ph/join-us"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:text-white transition-colors"
              >
                <FaEnvelope size={14} />
                <span>Volunteer with us</span>
              </a>
              <a
                href="https://github.com/enzox0/betterlibmanan"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:text-white transition-colors"
              >
                <FaGithub size={14} />
                <span>Contribute code with us</span>
              </a>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-1">
                <a
                  href="https://bettergov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-70 hover:opacity-100 transition-opacity duration-300"
                >
                  <img
                    src="/bettergov-logo.svg"
                    alt="Better Gov"
                    className="h-16 sm:h-20"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
            © {currentYear} BetterLibmanan.org | MIT | CC BY 4.0. All public
            information sourced from official government portals.
          </p>
          <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
            <span>Ver. 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
