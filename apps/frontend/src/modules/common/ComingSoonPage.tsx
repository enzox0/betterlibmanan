
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function ComingSoonPage({ title = 'Coming Soon', subtitle = 'This page is under construction. Check back soon!' }: { title?: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mx-auto flex items-center justify-center max-w-7xl min-h-[80dvh] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="text-center">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-yellow-300/10">
              <svg className="h-12 w-12 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mb-10 max-w-2xl mx-auto text-lg leading-relaxed text-neutral-200 sm:text-xl">
              {subtitle}
            </p>

            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-100">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

ComingSoonPage.displayName = 'ComingSoonPage';

export default ComingSoonPage;

