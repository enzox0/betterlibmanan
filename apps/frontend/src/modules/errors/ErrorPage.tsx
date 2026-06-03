
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function ErrorPage({ statusCode = 500, title = 'Something Went Wrong', subtitle = 'An unexpected error occurred. Please try again later.' }: { statusCode?: number; title?: string; subtitle?: string }) {
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
              <h1 className="text-7xl font-black text-yellow-300 sm:text-8xl">{statusCode}</h1>
            </div>

            <h2 className="mb-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mb-8 max-w-2xl mx-auto text-base leading-relaxed text-neutral-200 sm:text-lg">
              {subtitle}
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-2.5 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Page
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-neutral-900"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

ErrorPage.displayName = 'ErrorPage';

export default ErrorPage;

