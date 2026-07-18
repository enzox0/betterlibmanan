import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

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

export function AccessibilityPage() {
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
            Accessibility
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-gray-300 text-center lg:text-left leading-relaxed">
            Our commitment to making BetterLibmanan.org accessible to everyone.
          </p>
        </motion.div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm mb-4">
                <FaCheckCircle size={14} />
                <span className="font-semibold">
                  WCAG 2.1 Level AA Conformant
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Our Commitment
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                BetterLibmanan is committed to ensuring digital accessibility
                for people with disabilities. We are continually improving the
                user experience for everyone and applying the relevant
                accessibility standards.
              </p>
            </motion.div>

            <motion.div {...fadeUpDelay(0.05)}>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Accessibility Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Keyboard Navigation
                  </h3>
                  <p className="text-sm text-neutral-600">
                    All functionality available using only a keyboard.
                  </p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Screen Reader Support
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Compatible with JAWS, NVDA, and VoiceOver.
                  </p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Text Alternatives
                  </h3>
                  <p className="text-sm text-neutral-600">
                    All images have descriptive alt text.
                  </p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Color Contrast
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Meets WCAG AA contrast requirements.
                  </p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Responsive Design
                  </h3>
                  <p className="text-sm text-neutral-600">
                    Works on all devices and screen sizes.
                  </p>
                </div>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    No Time Limits
                  </h3>
                  <p className="text-sm text-neutral-600">
                    No time limits on reading or interacting.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUpDelay(0.1)}>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Known Limitations
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle
                    size={16}
                    className="text-amber-600 mt-1 shrink-0"
                  />
                  <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
                    <li>
                      Some PDF documents may not be fully accessible to screen
                      readers
                    </li>
                    <li>
                      Some third-party embedded content may have accessibility
                      issues
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeUpDelay(0.15)}>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Alternative Access
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-4">
                If you encounter difficulty accessing any information, contact
                us:
              </p>
              <a
                href="mailto:volunteers@betterlibmanan.org"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <FaEnvelope size={16} />
                volunteers@betterlibmanan.org
              </a>
            </motion.div>

            <motion.div {...fadeUpDelay(0.2)}>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Technical Specifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "TypeScript",
                  "Vite",
                  "Tailwind CSS",
                  "React Router",
                  "Zustand",
                  "Framer Motion",
                  "PWA",
                  "ARIA",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUpDelay(0.25)}>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                Our Promise
              </h2>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
                BetterLibmanan is committed to ensuring that our digital
                services are accessible to all citizens, regardless of ability.
                We view accessibility not as a feature, but as a fundamental
                right.
              </p>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed italic">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

AccessibilityPage.displayName = "AccessibilityPage";

export default AccessibilityPage;
