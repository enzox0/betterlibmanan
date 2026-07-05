import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function SitemapPage() {
  const navSections = [
    {
      title: "Main Navigation",
      links: [
        { name: "Home", path: "/" },
        { name: "Government", path: "/government" },
        { name: "Statistics", path: "/statistics" },
        { name: "Transparency", path: "/transparency" },
        { name: "Contact", path: "/contact" },
      ],
    },
    {
      title: "Services",
      links: [
        { name: "Services Overview", path: "/services" },
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
      title: "Legislative",
      links: [
        { name: "Legislative Overview", path: "/legislative" },
        { name: "Ordinance Framework", path: "/legislative/ordinances" },
        { name: "Resolution Framework", path: "/legislative/resolutions" },
      ],
    },
    {
      title: "Community & Others",
      links: [
        { name: "Tourism", path: "/tourism" },
        { name: "About", path: "/about" },
        { name: "Install App", path: "/install" },
        { name: "Libmanan Quiz", path: "/quiz" },
        { name: "Community", path: "/community" },
      ],
    },
    {
      title: "Legal & Policies",
      links: [
        { name: "Citizen's Charter", path: "/charter" },
        { name: "Terms of Use", path: "/terms" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Accessibility", path: "/accessibility" },
        { name: "FAQ", path: "/faq" },
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mx-auto max-w-7xl min-h-[80dvh] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="max-w-3xl mb-12">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-neutral-900 sm:text-4xl lg:text-5xl">
              Sitemap
            </h1>
            <p className="text-base leading-relaxed text-neutral-500 sm:text-lg">
              Explore all the pages and resources available on
              BetterLibmanan.org.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {navSections.map((section, index) => (
              <div key={index}>
                <h2 className="text-xl font-bold text-neutral-900 mb-4">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.path}
                        className="text-base text-neutral-600 hover:text-blue-600 transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

SitemapPage.displayName = "SitemapPage";

export default SitemapPage;
