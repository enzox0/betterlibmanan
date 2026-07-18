import { motion } from "framer-motion";
import { FaEnvelope, FaListUl, FaShieldAlt } from "react-icons/fa";

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
  { id: "legal-basis", label: "Legal Basis for Processing" },
  { id: "information-collect", label: "Information We Collect" },
  { id: "how-use-information", label: "How We Use Your Information" },
  { id: "cookies-analytics", label: "Cookies and Analytics" },
  { id: "data-sharing", label: "Data Sharing and Disclosure" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights Under the Data Privacy Act" },
  { id: "exercising-rights", label: "Exercising Your Rights" },
  { id: "children-privacy", label: "Children's Privacy" },
  { id: "third-party-links", label: "Third-Party Links" },
  { id: "policy-changes", label: "Changes to This Privacy Policy" },
  { id: "contact-us", label: "Contact Us" },
];

export function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 text-center lg:text-left leading-relaxed">
            Learn how we collect, use, and protect your information on
            BetterLibmanan.org.
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
                  BetterLibmanan.org ("we," "us," or "our") is committed to
                  protecting your privacy and ensuring the security of your
                  personal information. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when
                  you visit our website.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  This policy is designed to comply with the Data Privacy Act of
                  2012 (Republic Act No. 10173) of the Philippines and its
                  Implementing Rules and Regulations (IRR).
                </p>
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                  <FaShieldAlt size={14} />
                  <span className="font-medium">
                    We are committed to transparency and data minimization — we
                    only collect what is necessary.
                  </span>
                </div>
              </motion.div>

              <motion.div id="legal-basis" {...fadeUpDelay(0.05)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Legal Basis for Processing
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Under the Data Privacy Act of 2012, we process personal
                  information based on the following lawful criteria:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    <strong>Consent:</strong> When you voluntarily provide
                    information through contact forms or email communications
                  </li>
                  <li>
                    <strong>Legitimate Interest:</strong> To improve our
                    website, ensure security, and provide better civic services
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> When required by
                    Philippine law or government authorities
                  </li>
                  <li>
                    <strong>Public Interest:</strong> To promote transparency
                    and civic engagement in local governance
                  </li>
                </ul>
              </motion.div>

              <motion.div id="information-collect" {...fadeUpDelay(0.1)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Information We Collect
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We collect minimal information necessary to operate this civic
                  platform effectively:
                </p>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Information You Provide Voluntarily
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>
                    Email address (when you contact us or submit feedback)
                  </li>
                  <li>Name (if provided in correspondence)</li>
                  <li>Message content and inquiries</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>IP address (anonymized where possible)</li>
                  <li>Browser type and version</li>
                  <li>Device type and operating system</li>
                  <li>Pages visited and time spent on pages</li>
                  <li>Referring website or source</li>
                  <li>General geographic location (country/region level)</li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  We do not collect sensitive personal information such as
                  government-issued ID numbers, financial information, health
                  records, or biometric data through this website.
                </p>
              </motion.div>

              <motion.div id="how-use-information" {...fadeUpDelay(0.15)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  How We Use Your Information
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>To respond to your inquiries and feedback</li>
                  <li>To improve website functionality and user experience</li>
                  <li>To analyze website traffic and usage patterns</li>
                  <li>To ensure website security and prevent abuse</li>
                  <li>To comply with legal obligations</li>
                  <li>To maintain and improve civic services information</li>
                </ul>
              </motion.div>

              <motion.div id="cookies-analytics" {...fadeUpDelay(0.2)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Cookies and Analytics
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your
                  browsing experience:
                </p>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Types of Cookies We Use
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    website functionality (e.g., language preferences)
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    visitors interact with our website
                  </li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Google Analytics
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We use Google Analytics to collect anonymized data about
                  website usage. Google Analytics uses cookies to collect
                  information such as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>Number of visitors and page views</li>
                  <li>Traffic sources and user flow</li>
                  <li>Device and browser information</li>
                  <li>Geographic location (country/city level)</li>
                </ul>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  Managing Cookies
                </h3>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>You can disable cookies through your browser settings</li>
                  <li>
                    You can opt out of Google Analytics by installing the Google
                    Analytics Opt-out Browser Add-on
                  </li>
                  <li>
                    Disabling cookies may affect some website functionality
                  </li>
                </ul>
              </motion.div>

              <motion.div id="data-sharing" {...fadeUpDelay(0.25)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Data Sharing and Disclosure
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share information only in the following
                  circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    <strong>Service Providers:</strong> With trusted third-party
                    services (e.g., web hosting, analytics) that assist in
                    operating our website, subject to confidentiality agreements
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law,
                    court order, or government authority under Philippine
                    jurisdiction
                  </li>
                  <li>
                    <strong>Protection of Rights:</strong> To protect the
                    rights, property, or safety of BetterLibmanan.org, our
                    users, or the public
                  </li>
                  <li>
                    <strong>Consent:</strong> With your explicit consent for any
                    other purpose
                  </li>
                </ul>
              </motion.div>

              <motion.div id="data-security" {...fadeUpDelay(0.3)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Data Security
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures
                  to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4 mb-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure hosting infrastructure</li>
                  <li>Regular security assessments</li>
                  <li>Access controls and authentication</li>
                  <li>Regular software updates and patches</li>
                </ul>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  While we strive to protect your information, no method of
                  transmission over the Internet or electronic storage is 100%
                  secure. We cannot guarantee absolute security but are
                  committed to maintaining industry-standard protections.
                </p>
              </motion.div>

              <motion.div id="data-retention" {...fadeUpDelay(0.35)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Data Retention
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We retain personal information only for as long as necessary
                  to fulfill the purposes outlined in this policy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    <strong>Contact Information:</strong> Retained for the
                    duration needed to respond to inquiries, then deleted within
                    1 year of last contact
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> Aggregated and anonymized
                    data may be retained indefinitely for statistical purposes
                  </li>
                  <li>
                    <strong>Server Logs:</strong> Automatically deleted after 90
                    days
                  </li>
                </ul>
              </motion.div>

              <motion.div id="your-rights" {...fadeUpDelay(0.4)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Your Rights Under the Data Privacy Act
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Under the Data Privacy Act of 2012, you have the following
                  rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    <strong>Right to Be Informed:</strong> To be informed of the
                    collection and processing of your personal data
                  </li>
                  <li>
                    <strong>Right to Access:</strong> To request access to your
                    personal data held by us
                  </li>
                  <li>
                    <strong>Right to Object:</strong> To object to the
                    processing of your personal data
                  </li>
                  <li>
                    <strong>Right to Erasure or Blocking:</strong> To request
                    deletion or blocking of your personal data
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> To request
                    correction of inaccurate or incomplete personal data
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> To obtain your
                    personal data in a structured, commonly used format
                  </li>
                  <li>
                    <strong>Right to File a Complaint:</strong> To file a
                    complaint with the National Privacy Commission (NPC)
                  </li>
                  <li>
                    <strong>Right to Damages:</strong> To be indemnified for
                    damages sustained due to inaccurate, incomplete, outdated,
                    false, unlawfully obtained, or unauthorized use of personal
                    data
                  </li>
                </ul>
              </motion.div>

              <motion.div id="exercising-rights" {...fadeUpDelay(0.45)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Exercising Your Rights
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  To exercise any of these rights, please contact us at{" "}
                  <a
                    href="mailto:volunteers@betterlibmanan.org"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    volunteers@betterlibmanan.org
                  </a>
                  . We will respond to your request within 30 days as required
                  by law.
                </p>
              </motion.div>

              <motion.div id="children-privacy" {...fadeUpDelay(0.5)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Children's Privacy
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  BetterLibmanan.org is a general audience website providing
                  civic information. We do not knowingly collect personal
                  information from children under 18 years of age without
                  parental consent.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  If you are a parent or guardian and believe your child has
                  provided us with personal information, please contact us
                  immediately at{" "}
                  <a
                    href="mailto:volunteers@betterlibmanan.org"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    volunteers@betterlibmanan.org
                  </a>
                  , and we will take steps to delete such information.
                </p>
              </motion.div>

              <motion.div id="third-party-links" {...fadeUpDelay(0.55)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Third-Party Links
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  Our website may contain links to external websites, including
                  official government portals and other resources. We are not
                  responsible for the privacy practices or content of these
                  third-party sites.
                </p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  We encourage you to review the privacy policies of any
                  external websites you visit through links on our platform.
                </p>
              </motion.div>

              <motion.div id="policy-changes" {...fadeUpDelay(0.6)}>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                  Changes to This Privacy Policy
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, legal requirements, or for other
                  operational reasons. When we make changes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-neutral-600 leading-relaxed ml-4">
                  <li>
                    The "Last Updated" date at the bottom of this page will be
                    revised
                  </li>
                  <li>Material changes may be announced on our website</li>
                  <li>
                    Your continued use of the website after changes constitutes
                    acceptance of the updated policy
                  </li>
                </ul>
              </motion.div>

              <motion.div id="contact-us" {...fadeUpDelay(0.7)}>
                <hr className="border-neutral-200 mb-10" />
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 inline-block border-b-4 border-blue-800 pb-1">
                  Contact Us
                </h2>
                <p className="text-sm sm:text-base text-neutral-800 leading-relaxed mb-6">
                  If you have questions about this Privacy Policy, wish to
                  exercise your data privacy rights, or have concerns about how
                  your information is handled, please contact us:
                </p>
                <a
                  href="mailto:volunteers@betterlibmanan.org"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors mb-6"
                >
                  <FaEnvelope size={16} />
                  volunteers@betterlibmanan.org
                </a>

                <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                  National Privacy Commission
                </h3>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                  You may also file a complaint with the National Privacy
                  Commission if you believe your data privacy rights have been
                  violated:
                </p>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-sm">
                  <p className="font-semibold text-neutral-700 mb-1">
                    National Privacy Commission
                  </p>
                  <p className="text-neutral-600 mb-1">
                    3rd Floor, Core G, GSIS Headquarters Building
                  </p>
                  <p className="text-neutral-600 mb-1">
                    Financial Center, Pasay City 1308
                  </p>
                  <p className="text-neutral-600">
                    Website:{" "}
                    <a
                      href="https://www.privacy.gov.ph"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      www.privacy.gov.ph
                    </a>
                  </p>
                </div>

                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mt-6 italic">
                  Last Updated:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

PrivacyPolicyPage.displayName = "PrivacyPolicyPage";

export default PrivacyPolicyPage;
