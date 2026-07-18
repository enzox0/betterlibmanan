import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="relative overflow-hidden bg-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mx-auto flex items-center justify-center max-w-7xl min-h-[80dvh] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="text-center">
            <div className="mx-auto mb-6">
              <h1 className="text-7xl font-black text-yellow-300 sm:text-8xl">
                404
              </h1>
            </div>

            <h2 className="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
              Page Not Found
            </h2>
            <p className="mb-8 max-w-2xl mx-auto text-base leading-relaxed text-neutral-200 sm:text-lg">
              The page you're looking for doesn't exist or has been moved.
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

NotFoundPage.displayName = "NotFoundPage";

export default NotFoundPage;
