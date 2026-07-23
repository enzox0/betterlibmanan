import { motion } from "framer-motion";
import { FaEnvelope, FaPlus, FaMinus, FaGithub } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

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

const faqData = [
  {
    category: "General Questions",
    questions: [
      {
        question: "What is BetterLibmanan?",
        answer:
          "BetterLibmanan is the official digital transparency portal for the Municipality of Libmanan, Camarines Sur, Philippines. It is a volunteer-driven civic technology initiative that provides residents with open access to government services, public records, legislation, statistics, and community resources — completely free of charge.",
      },
      {
        question: "What are the office hours of the Libmanan Municipal Hall?",
        answer:
          "The Municipal Hall of Libmanan is open Monday to Friday, 8:00 AM to 5:00 PM, excluding public holidays. For urgent concerns outside office hours, visit the Contact page for emergency hotlines.",
      },
      {
        question: "Where is Libmanan, Camarines Sur located?",
        answer:
          "Libmanan is a first-class municipality in the province of Camarines Sur, Bicol Region (Region V), Philippines. It is approximately 30–45 minutes from Naga City via the Maharlika Highway. Geographically, it sits at approximately 13.70°N, 123.06°E.",
      },
      {
        question: "How can I contact a specific municipal office in Libmanan?",
        answer:
          "You can find contact information for each municipal office on our Contact page. The page lists office phone numbers, email addresses, and physical locations within the Libmanan Municipal Hall compound.",
      },
    ],
  },
  {
    category: "Government Services",
    questions: [
      {
        question: "How do I request an official certificate from LGU Libmanan?",
        answer:
          "You can browse the types of available certificates and their requirements through the Services › Certificates section of BetterLibmanan. Common certificates include barangay clearance, certificate of residency, certificate of indigency, and certificate of good moral character. Visit the Libmanan Municipal Hall's Civil Registrar or MSWD office for processing.",
      },
      {
        question: "How do I apply for a business permit in Libmanan?",
        answer:
          "Business permit applications for Libmanan are processed at the Municipal Business Permit and Licensing Office (BPLO). Requirements typically include a barangay business clearance, DTI or SEC registration, fire safety inspection certificate, and proof of location. Visit Services › Business on BetterLibmanan for the full list of requirements.",
      },
      {
        question: "How do I pay my real property tax (RPT) in Libmanan?",
        answer:
          "Real property tax (RPT) for properties in Libmanan is payable at the Municipal Treasurer's Office. January payments may qualify for early payment discounts. Visit Services › Tax Payments on BetterLibmanan for deadlines and procedures.",
      },
      {
        question: "What social welfare programs are available in Libmanan?",
        answer:
          "LGU Libmanan, through the Municipal Social Welfare and Development Office (MSWDO), provides programs including Pantawid Pamilyang Pilipino Program (4Ps) assistance, PWD benefits, senior citizen benefits, solo parent assistance, and emergency financial assistance. See Services › Social Services for details.",
      },
      {
        question: "What health services does LGU Libmanan offer?",
        answer:
          "The Rural Health Unit (RHU) of Libmanan offers maternal and child healthcare, vaccination programs, family planning, tuberculosis (TB) treatment, and health monitoring services. Barangay Health Centers (BHCs) provide frontline services across all barangays.",
      },
    ],
  },
  {
    category: "Legislation & Transparency",
    questions: [
      {
        question: "Where can I find municipal ordinances and resolutions?",
        answer: (
          <>
            All enacted ordinances and resolutions of the Sangguniang Bayan of
            Libmanan are available in the{" "}
            <Link to="/legislative" className="text-blue-600 hover:underline">
              Legislative section
            </Link>{" "}
            of BetterLibmanan. You can browse and search the full text of local
            laws and official decisions.
          </>
        ),
      },
      {
        question:
          "How can I access the LGU Libmanan budget and financial reports?",
        answer: (
          <>
            Public budget documents, financial statements, and transparency
            reports are available in the{" "}
            <Link to="/transparency" className="text-blue-600 hover:underline">
              Transparency Portal
            </Link>
            . This is in compliance with the Full Disclosure Policy (FDP) of the
            Department of Interior and Local Government (DILG).
          </>
        ),
      },
      {
        question: "What is the Citizen's Charter?",
        answer:
          "The Citizen's Charter is a document required by the Anti-Red Tape Authority (ARTA) that details all services offered by LGU Libmanan, including step-by-step procedures, requirements, fees, and processing times. It ensures transparency and accountability in public service delivery.",
      },
    ],
  },
  {
    category: "Certificates & Documents",
    questions: [
      {
        question:
          "What is the difference between PSA and local civil registrar certificates?",
        answer:
          "PSA (Philippine Statistics Authority) certificates — such as birth, marriage, and death certificates — are national-level documents with legal validity nationwide. Local civil registrar certificates are issued by the Municipal Civil Registrar of Libmanan and are often required for local government transactions. For PSA documents, visit serbilis.psa.gov.ph or a local PSA outlet.",
      },
      {
        question: "How do I get a barangay clearance in Libmanan?",
        answer:
          "Barangay clearances are issued by the barangay hall of your place of residence in Libmanan. Requirements typically include a valid ID and a minimal processing fee. Barangay halls are open during regular government office hours.",
      },
    ],
  },
  {
    category: "Technical Questions",
    questions: [
      {
        question: "Is BetterLibmanan an official government website?",
        answer:
          "BetterLibmanan is a civic technology portal built and maintained by volunteer developers to improve access to public information for the people of Libmanan. While it presents official public data, it is not operated directly by the LGU Libmanan IT department. For official government announcements, also follow the LGU Libmanan Facebook page.",
      },
      {
        question: "Is this website mobile-friendly?",
        answer:
          "Yes! BetterLibmanan.org is a fully responsive Progressive Web App (PWA). It works on all devices including smartphones, tablets, and desktops. You can also install it on your home screen for quick access — visit the Install App page for instructions.",
      },
      {
        question:
          "I found a broken link or error on this website. How do I report it?",
        answer:
          "Please report any issues to volunteers@betterlibmanan.org or open an issue on our GitHub repository. Include the page URL and a description of the problem. We appreciate every report!",
      },
    ],
  },
  {
    category: "About the Project",
    questions: [
      {
        question: "Who developed BetterLibmanan?",
        answer: (
          <>
            BetterLibmanan is a volunteer-driven civic technology initiative
            built to improve transparency and access to municipal services for
            the people of Libmanan, Camarines Sur. It is part of the{" "}
            <a
              href="https://bettergov.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              BetterGov.ph
            </a>{" "}
            network of open-government portals.
            <div className="mt-4">
              <a
                href="https://github.com/enzox0/betterlibmanan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaGithub size={16} />
                View on GitHub
              </a>
            </div>
          </>
        ),
      },
      {
        question: "How much does BetterLibmanan cost taxpayers?",
        answer:
          "BetterLibmanan costs the people of Libmanan exactly ₱0. It is funded, built, and maintained entirely by civic-minded volunteers with no government expenditure. This is the principle of civic technology — using technology to serve the public good without burdening the public budget.",
      },
    ],
  },
];

function FaqItem({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left gap-4"
        aria-expanded={isOpen}
      >
        <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">
          {question}
        </h3>
        <span className="text-neutral-500 shrink-0" aria-hidden="true">
          {isOpen ? <FaMinus size={14} /> : <FaPlus size={14} />}
        </span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mt-3"
        >
          <div className="text-sm text-neutral-600 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function FaqPage() {
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
            Frequently Asked Questions
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 text-center lg:text-left leading-relaxed">
            Answers to common questions about LGU Libmanan services,
            BetterLibmanan.org, and civic information for residents of Libmanan,
            Camarines Sur.
          </p>
        </motion.div>
      </section>

      <section
        className="py-16 bg-white"
        aria-label="Frequently asked questions"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {faqData.map((section, sectionIndex) => (
              <motion.div
                key={section.category}
                {...fadeUpDelay(sectionIndex * 0.05)}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6">
                  {section.category}
                </h2>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 sm:p-6">
                  {section.questions.map((faq, faqIndex) => (
                    <FaqItem
                      key={faqIndex}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </motion.div>
            ))}

            <motion.div
              {...fadeUpDelay(0.35)}
              className="bg-blue-50 border border-blue-200 rounded-lg p-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed mb-4">
                If you didn't find the answer you were looking for, please reach
                out to us. We're here to help the residents of Libmanan,
                Camarines Sur.
              </p>
              <a
                href="mailto:volunteers@betterlibmanan.org"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaEnvelope size={16} aria-hidden="true" />
                Contact Us
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

FaqPage.displayName = "FaqPage";

export default FaqPage;
