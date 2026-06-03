import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { mockLegislativeData } from '../data/mockData';

export function LegislativePage() {
  const data = mockLegislativeData.main;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Sangguniang Bayan</p>
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Legislative Documents
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Ordinances and resolutions of the Sangguniang Bayan ng Libmanan
            </p>
          </div>
        </motion.div>
      </section>

      {/* Main Links */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to={data.ordinanceLink}
                className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ordinance Framework</h2>
                <p className="text-sm text-gray-600 mb-4">{data.ordinanceDescription}</p>
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <span>Browse Ordinances</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to={data.resolutionLink}
                className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">Resolution Framework</h2>
                <p className="text-sm text-gray-600 mb-4">{data.resolutionDescription}</p>
                <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                  <span>Browse Resolutions</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Process Flow</h2>
            <p className="text-gray-600">Flowchart for Legislative Proposal</p>
            <p className="text-sm text-gray-500">Step-by-step process for enacting ordinances and resolutions</p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Ordinances Steps */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-blue-600">For Ordinances</span>
                <span className="text-sm font-medium text-gray-500">{data.ordinanceSteps.length} Steps</span>
              </div>
              <div className="space-y-4">
                {data.ordinanceSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                        {step.step.toString().padStart(2, '0')}
                      </div>
                      {index < data.ordinanceSteps.length - 1 && <div className="w-0.5 h-12 bg-gray-300"></div>}
                    </div>
                    <div className="pb-10">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Resolutions Steps */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-semibold text-gray-700">For Resolutions</span>
                <span className="text-sm font-medium text-gray-500">{data.resolutionSteps.length} Steps</span>
              </div>
              <div className="space-y-4">
                {data.resolutionSteps.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
                        {step.step.toString().padStart(2, '0')}
                      </div>
                      {index < data.resolutionSteps.length - 1 && <div className="w-0.5 h-12 bg-gray-300"></div>}
                    </div>
                    <div className="pb-10">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-600">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">About</h2>
            <p className="text-gray-600">{data.about.title}</p>
            <p className="text-sm text-gray-500">{data.about.description}</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.about.points.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-gray-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-sm text-gray-600">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

LegislativePage.displayName = 'LegislativePage';

export default LegislativePage;
