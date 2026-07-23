import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navSections = [
  {
    title: "Main Navigation",
    links: [
      { name: "Home", path: "/" },
      { name: "About BetterLibmanan", path: "/about" },
      { name: "Government Officials", path: "/government" },
      { name: "Statistics & Data", path: "/statistics" },
      { name: "Transparency Portal", path: "/transparency" },
      { name: "Contact LGU Libmanan", path: "/contact" },
    ],
  },
  {
    title: "Government Services",
    links: [
      { name: "Services Overview", path: "/services" },
      { name: "Official Certificates", path: "/services/certificates" },
      { name: "Business Permits", path: "/services/business" },
      { name: "Tax Payments", path: "/services/tax-payments" },
      { name: "Social Welfare Services", path: "/services/social-services" },
      { name: "Public Health Services", path: "/services/health" },
      { name: "Agriculture Programs", path: "/services/agriculture" },
      {
        name: "Infrastructure & Public Works",
        path: "/services/infrastructure",
      },
      { name: "Education Services", path: "/services/education" },
      { name: "Public Safety & MDRRMO", path: "/services/public-safety" },
      {
        name: "Environment & Natural Resources",
        path: "/services/environment",
      },
    ],
  },
  {
    title: "Legislation",
    links: [
      { name: "Sangguniang Bayan Overview", path: "/legislative" },
      { name: "Municipal Ordinances", path: "/legislative/ordinances" },
      { name: "Resolutions", path: "/legislative/resolutions" },
    ],
  },
  {
    title: "News & Community",
    links: [
      { name: "Latest Updates & News", path: "/latest-updates" },
      { name: "Community Hub", path: "/community" },
      { name: "Peer Groups", path: "/community/groups" },
      { name: "Discussions", path: "/community/discussions" },
      { name: "Freedom Wall", path: "/freedom-wall" },
      { name: "Libmanan Quiz", path: "/quiz" },
    ],
  },
  {
    title: "Tourism & Culture",
    links: [{ name: "Tourism — Libmanan, Camarines Sur", path: "/tourism" }],
  },
  {
    title: "Legal & Policies",
    links: [
      { name: "Citizen's Charter", path: "/charter" },
      { name: "Frequently Asked Questions", path: "/faq" },
      { name: "Terms of Use", path: "/terms" },
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Accessibility Statement", path: "/accessibility" },
      { name: "Install BetterLibmanan App", path: "/install" },
    ],
  },
];

export function SitemapPage() {
  return (
    <section className="relative overflow-hidden bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mx-auto max-w-7xl min-h-[80dvh] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <header className="max-w-3xl mb-12">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Sitemap
            </h1>
            <p className="text-base leading-relaxed text-neutral-500 sm:text-lg">
              Complete directory of all pages and resources on
              BetterLibmanan.org — the official digital portal for Libmanan,
              Camarines Sur.
            </p>
          </header>

          <nav aria-label="Site map">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {navSections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-base text-neutral-600 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span
                            className="text-neutral-300 text-xs"
                            aria-hidden="true"
                          >
                            ›
                          </span>
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </nav>

          {/* XML Sitemap link for power users */}
          <div className="mt-16 pt-8 border-t border-neutral-100">
            <p className="text-sm text-neutral-400">
              Looking for the machine-readable sitemap?{" "}
              <a
                href="/sitemap.xml"
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener"
              >
                View sitemap.xml
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

SitemapPage.displayName = "SitemapPage";

export default SitemapPage;
