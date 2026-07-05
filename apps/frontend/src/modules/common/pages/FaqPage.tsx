import { motion } from "framer-motion";
import { FaEnvelope, FaPlus, FaMinus, FaGithub } from "react-icons/fa";
import { useState } from "react";

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
        question: "What are the office hours of the Municipal Hall?",
        answer:
          "The Municipal Hall of Libmanan is open from Monday to Friday, 8:00 AM to 5:00 PM, except on public holidays.",
      },
      {
        question: "How can I contact a specific municipal office?",
        answer:
          "You can find contact information for each municipal office on our Contact Us page, or you can call our main hotline during office hours.",
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
          "PSA (Philippine Statistics Authority) certificates are national-level documents, while local civil registrar certificates are issued by the municipal government.",
      },
    ],
  },
  {
    category: "Technical Questions",
    questions: [
      {
        question:
          "I found a broken link or error on this website. How do I report it?",
        answer:
          "Please report any issues to volunteers@betterlibmanan.org. Include the page URL and a description of the problem.",
      },
      {
        question: "Is this website mobile-friendly?",
        answer:
          "Yes! BetterLibmanan.org is fully responsive and works on all devices, including smartphones and tablets.",
      },
    ],
  },
  {
    category: "About the Developer",
    questions: [
      {
        question: "Who developed BetterLibmanan?",
        answer: (
          <>
            BetterLibmanan is a volunteer-driven initiative to improve access to
            municipal services and information for the people of Libmanan,
            Camarines Sur.
            <div className="mt-4">
              <a
                href="https://github.com/enzox0/betterlibmanan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaGithub size={16} />
                View GitHub Repository
              </a>
            </div>
          </>
        ),
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
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-neutral-800 text-sm sm:text-base">
          {question}
        </h3>
        <span className="text-neutral-500">
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
            Find answers to common questions about BetterLibmanan.org and
            municipal services.
          </p>
        </motion.div>
      </section>

      <section className="py-16 bg-white">
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
                If you didn't find the answer you were looking for, please don't
                hesitate to contact us. We're here to help!
              </p>
              <a
                href="mailto:volunteers@betterlibmanan.org"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaEnvelope size={16} />
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
