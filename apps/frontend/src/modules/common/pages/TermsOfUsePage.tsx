import { motion } from "framer-motion";
import { FaHeart, FaEnvelope, FaListUl } from "react-icons/fa";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
};

const fadeUpDelay = (delay: number) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay },
});

const tableOfContents = [
  { id: "introduction", label: "Introduction" },
  { id: "acceptance-of-terms", label: "Acceptance of Terms" },
  {
    id: "public-domain-content",
    label: "Public Domain Content and Volunteer Operation",
  },
  { id: "as-is-disclaimer", label: '"As Is" Disclaimer' },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  {
    id: "user-responsibilities",
    label: "User Responsibilities and Research Guidelines",
  },
  { id: "no-professional-advice", label: "No Professional Advice" },
  { id: "source-links", label: "Source Links and External References" },
  { id: "website-availability", label: "Website Availability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "modifications", label: "Modifications" },
  { id: "governing-law", label: "Governing Law" },
  { id: "severability", label: "Severability" },
  { id: "content-concerns", label: "Content Concerns and Takedown Requests" },
  { id: "contact-us", label: "Contact Us" },
];

export function TermsOfUsePage() {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white">
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white text-center lg:text-left leading-tight">
            Terms of Use
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 text-center lg:text-left leading-relaxed">
            Please read these terms carefully before using BetterLibmanan.org.
          </p>
        </motion.div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 lg:gap-12">
            {/* Sidebar - Contents */}
            <div className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-[15dvh]">
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200">
                    <FaListUl size={14} className="text-neutral-600" />
                    <h3 className="text-sm font-bold text-neutral-900">
                      Contents
                    </h3>
                  </div>
                  <nav className="space-y-1">
                    {tableOfContents.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleScroll(item.id)}
                        className="w-full text-left text-xs text-neutral-500 hover:text-blue-600 transition-colors py-2 px-2 rounded hover:bg-blue-50"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl space-y-12">
              <motion.div id="introduction" {...fadeUp}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Introduction
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  BetterLibmanan.org is a civic platform dedicated to empowering
                  the people of Libmanan by providing transparent access to the
                  services, programs, and public funds of LGU Libmanan.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  While volunteers make every effort to secure
                  BetterLibmanan.org from online threats and keep information
                  accurate, no system can be guaranteed to be perfectly secure,
                  error-free, or completely up-to-date at all times.
                </p>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                  <FaHeart size={14} />
                  <span className="font-medium">
                    This platform is provided free of charge as a public
                    service.
                  </span>
                </div>
              </motion.div>

              <motion.div id="acceptance-of-terms" {...fadeUpDelay(0.05)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  By accessing and using this website, you acknowledge and agree
                  to be bound by these terms and conditions. Your continued use
                  of the site signifies your ongoing acceptance of this
                  agreement.
                </p>
              </motion.div>

              <motion.div id="public-domain-content" {...fadeUpDelay(0.1)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Public Domain Content and Volunteer Operation
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  This website and its content are provided as a public domain
                  resource and are operated entirely by volunteers. All
                  information, data, documents, and materials on this website
                  are in the public domain unless otherwise stated.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Public domain content may be freely used, copied, distributed,
                  and modified without permission or attribution, although
                  attribution to BetterLibmanan.org and LGU Libmanan is
                  encouraged as a civic courtesy.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  As a volunteer-run initiative, this website does not replace
                  official government channels. Residents and stakeholders are
                  encouraged to conduct their own independent research and
                  verification of all information found here and to consult
                  official LGU Libmanan offices and government agencies when
                  making important decisions.
                </p>
              </motion.div>

              <motion.div id="as-is-disclaimer" {...fadeUpDelay(0.15)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  "As Is" Disclaimer
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  All information on this website is provided "AS IS" without
                  warranty of any kind, whether express or implied. This
                  includes, but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>Warranties of merchantability</li>
                  <li>Fitness for a particular purpose</li>
                  <li>Non-infringement of intellectual property rights</li>
                  <li>Accuracy, completeness, or reliability of information</li>
                  <li>
                    Freedom from errors, viruses, or other harmful components
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-4">
                  Users should treat all content as informational and not as a
                  substitute for official records or professional advice.
                </p>
              </motion.div>

              <motion.div id="limitation-of-liability" {...fadeUpDelay(0.2)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  To the fullest extent permitted by law, the website operators,
                  volunteers, contributors, and any affiliated civic partners
                  shall not be liable for any direct, indirect, incidental,
                  special, consequential, or punitive damages arising from or
                  related to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    Your use of or reliance on this website or its content
                  </li>
                  <li>Any errors, omissions, or outdated information</li>
                  <li>
                    Any interruption, suspension, or cessation of website
                    availability
                  </li>
                  <li>
                    Any bugs, viruses, or other harmful components transmitted
                    through the site
                  </li>
                  <li>
                    Any loss, corruption, or disclosure of data or information
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-4">
                  This limitation applies regardless of the form of action or
                  legal theory, including contract, tort, negligence, or strict
                  liability.
                </p>
              </motion.div>

              <motion.div id="user-responsibilities" {...fadeUpDelay(0.25)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  User Responsibilities and Research Guidelines
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Users share responsibility for promoting informed and
                  responsible civic engagement. By using this website, you are
                  solely responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>
                    Independently verifying all information obtained from this
                    website
                  </li>
                  <li>
                    Reviewing and visiting original source links and references
                    provided
                  </li>
                  <li>
                    Cross-checking information with multiple reliable and
                    official sources before making decisions
                  </li>
                  <li>
                    Determining whether the information is suitable for your
                    intended use
                  </li>
                  <li>
                    Complying with all applicable laws, regulations, and local
                    ordinances
                  </li>
                  <li>
                    Accepting any consequences that may arise from your use of
                    the website and its content
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  You are strongly encouraged to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    Use the source links and references on each page to access
                    primary documents and official records
                  </li>
                  <li>
                    Conduct additional research beyond what is presented on this
                    website
                  </li>
                  <li>
                    Consult official government websites, offices, and agencies
                    for the most current information
                  </li>
                  <li>
                    Verify dates, figures, and other details through multiple
                    reputable sources
                  </li>
                </ul>
              </motion.div>

              <motion.div id="no-professional-advice" {...fadeUpDelay(0.3)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  No Professional Advice
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  The information on this website is provided for educational,
                  informational, and civic transparency purposes only. It does
                  not constitute legal, medical, financial, or any other form of
                  professional advice.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-4">
                  Users should consult qualified professionals or appropriate
                  government offices for advice specific to their circumstances.
                </p>
              </motion.div>

              <motion.div id="source-links" {...fadeUpDelay(0.35)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Source Links and External References
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  This website may provide links to official sources, government
                  documents, and other authoritative materials to support civic
                  awareness and transparency. Users are encouraged to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>Click through and review all source links provided</li>
                  <li>
                    Access primary documents and official publications
                    referenced
                  </li>
                  <li>
                    Verify information directly from original and official
                    sources
                  </li>
                  <li>
                    Check for updates, amendments, or corrections to referenced
                    materials
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  The continued availability, accuracy, and reliability of
                  external links cannot be guaranteed. Links may change or
                  become unavailable without notice, and users should always
                  confirm information through official channels.
                </p>
              </motion.div>

              <motion.div id="website-availability" {...fadeUpDelay(0.4)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Website Availability
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Although volunteers aim to keep the website accessible and
                  functional, BetterLibmanan.org cannot guarantee that the
                  website will be:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>Available or accessible at all times</li>
                  <li>Error-free or uninterrupted</li>
                  <li>
                    Free from technical problems, vulnerabilities, or
                    disruptions
                  </li>
                  <li>
                    Fully compatible with all devices, browsers, or assistive
                    technologies
                  </li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-4">
                  Users are encouraged to report technical issues and broken
                  links so volunteers can address them as resources allow.
                </p>
              </motion.div>

              <motion.div id="indemnification" {...fadeUpDelay(0.45)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Indemnification
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  By using this website, you agree to indemnify and hold
                  harmless the website operators, volunteers, contributors, and
                  affiliated civic partners from any claims, damages, losses,
                  liabilities, or expenses (including reasonable legal fees)
                  arising from your use of the website or your violation of
                  these terms.
                </p>
              </motion.div>

              <motion.div id="modifications" {...fadeUpDelay(0.5)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Modifications
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  These terms may be updated or modified from time to time to
                  reflect legal requirements, policy changes, or improvements to
                  civic services. Changes may be made without prior notice. Your
                  continued use of the website after any changes are posted
                  constitutes your acceptance of the updated terms.
                </p>
              </motion.div>

              <motion.div id="governing-law" {...fadeUpDelay(0.55)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Governing Law
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  These terms are governed by and construed in accordance with
                  the laws of the Republic of the Philippines, without regard to
                  any conflict of law principles. Any disputes arising in
                  connection with these terms or your use of the website shall
                  be subject to the jurisdiction of the appropriate courts in
                  the Philippines.
                </p>
              </motion.div>

              <motion.div id="severability" {...fadeUpDelay(0.6)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Severability
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  If any provision of these terms is found to be invalid,
                  unlawful, or unenforceable, that provision shall be applied to
                  the greatest extent permitted by law, and the remaining
                  provisions shall remain in full force and effect.
                </p>
              </motion.div>

              <motion.div id="content-concerns" {...fadeUpDelay(0.65)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Content Concerns and Takedown Requests
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  BetterLibmanan.org values accuracy, public safety, and respect
                  for rights. Despite good-faith efforts, some content may
                  become outdated, incomplete, or raise legitimate concerns.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  If you believe that any content on this website is:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>Factually incorrect or misleading</li>
                  <li>Potentially harmful or dangerous</li>
                  <li>In violation of applicable laws or regulations</li>
                  <li>
                    Containing personal information that should not be public
                  </li>
                  <li>Infringing upon legitimate rights or interests</li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Please contact us at:{" "}
                  <a
                    href="mailto:volunteers@betterlibmanan.org"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    volunteers@betterlibmanan.org
                  </a>
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  When reaching out, kindly include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>The specific URL or page location</li>
                  <li>A clear description of your concern</li>
                  <li>
                    Supporting documentation or evidence, where applicable
                  </li>
                  <li>Your contact information for follow-up</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Our Response Process
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    Legitimate concerns will be reviewed in good faith by
                    volunteers.
                  </li>
                  <li>
                    Response times may vary due to the volunteer nature of this
                    initiative.
                  </li>
                  <li>
                    Content may be removed, corrected, updated, or accompanied
                    by additional disclaimers as appropriate.
                  </li>
                  <li>
                    Editorial decisions about content rest with the website
                    team, guided by public interest and civic responsibility.
                  </li>
                  <li>
                    Knowingly false, malicious, or frivolous complaints may
                    result in restricted communication with our volunteers.
                  </li>
                </ul>
              </motion.div>

              <motion.div id="contact-us" {...fadeUpDelay(0.7)}>
                <hr className="border-neutral-200 mb-10" />
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 inline-block border-b-4 border-blue-800 pb-1">
                  Contact Us
                </h2>
                <p className="text-sm sm:text-base text-neutral-800 leading-relaxed mb-6">
                  If you have questions about these Terms of Use, feedback on
                  civic information, or content-related concerns, please contact
                  us:
                </p>
                <a
                  href="mailto:volunteers@betterlibmanan.org"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mb-6"
                >
                  <FaEnvelope size={16} />
                  volunteers@betterlibmanan.org
                </a>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  BetterLibmanan.org provides public domain information to
                  support civic engagement, transparency, and informed
                  participation in local governance.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

TermsOfUsePage.displayName = "TermsOfUsePage";

export default TermsOfUsePage;
