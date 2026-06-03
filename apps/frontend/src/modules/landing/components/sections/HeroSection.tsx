import { motion } from 'framer-motion';
import heroBg from '../../../assets/image/hero-bg.png';

export function HeroSection() {
  return (
    <section 
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/50 to-transparent lg:bg-gradient-to-r"></div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative z-10 mx-auto flex items-center max-w-7xl min-h-[70vh] sm:min-h-[80vh] px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="mb-6 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-neutral-900">
                Welcome to <span className="text-yellow-300">Better</span><span className="text-blue-700">Libmanan</span>.org
              </h1>
              <p className="mb-8 max-w-2xl text-base sm:text-lg lg:text-xl leading-relaxed text-neutral-600">
                Access government services, information, and resources for the people of Libmanan,
                Camarines Sur.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button className="rounded-xl bg-neutral-900 px-4 sm:px-5 py-1.5 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-neutral-800">
                  Browse Services
                </button>
                <button className="rounded-xl border border-neutral-900 px-4 sm:px-5 py-1.5 text-sm sm:text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white">
                  Contact Us
                </button>
              </div>
            </div>

            <div className="relative w-full max-w-md mx-auto lg:max-w-none">
              <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <svg className="h-5 w-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    />
                  </svg>
                  <span className="text-xl sm:text-2xl font-bold text-neutral-900">Find a Service</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g., birth certificate, business permit"
                    className="h-10 sm:h-12 w-full flex-1 rounded-xl border border-neutral-200 px-4 sm:px-5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
                  />
                  <button className="flex h-9 sm:h-10 w-full sm:w-10 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors hover:bg-neutral-800">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm text-neutral-500">Popular:</span>
                  <span className="rounded-full bg-neutral-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-800">
                    Birth Certificate
                  </span>
                  <span className="rounded-full bg-neutral-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-800">
                    Business Permit
                  </span>
                  <span className="rounded-full bg-neutral-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-neutral-800">
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
