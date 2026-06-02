import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-neutral-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative mx-auto flex items-center max-w-7xl min-h-[80dvh] px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Welcome to <span className="text-yellow-300">Better</span><span className="text-blue-700">Libmanan</span>.org
              </h1>
              <p className="mb-10 max-w-2xl text-lg leading-relaxed text-neutral-200 sm:text-xl">
                Access government services, information, and resources for the people of Libmanan,
                Camarines Sur.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button className="rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-100">
                  Browse Services
                </button>
                <button className="rounded-xl border border-white px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-neutral-900">
                  Contact Us
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <svg className="h-5 w-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-neutral-900">Find a Service</span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    placeholder="e.g., birth certificate, business permit"
                    className="h-14 flex-1 rounded-xl border border-neutral-200 px-5 text-base text-neutral-700 outline-none placeholder:text-neutral-400"
                  />
                  <button className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-neutral-800">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-neutral-500">Popular:</span>
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800">
                    Birth Certificate
                  </span>
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800">
                    Business Permit
                  </span>
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-800">
                    Real Property Tax
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

HeroSection.displayName = 'HeroSection';

export default HeroSection;
