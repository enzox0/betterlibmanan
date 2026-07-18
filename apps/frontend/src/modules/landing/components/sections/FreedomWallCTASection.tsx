import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { FaStickyNote } from "react-icons/fa";
import noteLottie from "@/assets/lottiefiles/note.lottie?url";

export function FreedomWallCTASection() {
  return (
    <section className="bg-gray-950 overflow-hidden">
      {/* Subtle dot grid background matching the FreedomWallSection aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-12">
          {/* Lottie illustration — 30% */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-40 sm:w-52 lg:w-[20%] shrink-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <DotLottieReact
              src={noteLottie}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>

          {/* Text + CTA — 70% */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
            className="text-center lg:text-left w-full lg:w-[80%]"
          >
            {/* Eyebrow */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5">
              <FaStickyNote
                className="text-blue-400"
                size={12}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                Freedom Wall
              </span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Share what's on <span className="text-blue-400">your mind</span>
            </h2>

            <p className="mt-4 text-base leading-relaxed text-gray-400 sm:text-lg">
              Leave an anonymous sticky note on our community Freedom Wall. Your
              thoughts, ideas, and stories matter — post one today.
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/freedom-wall"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all duration-150 hover:bg-blue-500 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
              >
                <FaStickyNote size={14} aria-hidden="true" />
                Post a Note
              </Link>

              <Link
                to="/freedom-wall"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-gray-200 transition-all duration-150 hover:bg-white/10 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
              >
                Browse the Wall
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Social proof hint */}
            <p className="mt-5 text-xs text-gray-600">
              100% anonymous · No account needed · Community moderated
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

FreedomWallCTASection.displayName = "FreedomWallCTASection";

export default FreedomWallCTASection;
