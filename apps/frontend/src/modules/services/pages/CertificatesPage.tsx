import { motion } from 'framer-motion';
import { mockServicesData } from '../data/mockData';

export function CertificatesPage() {
  const category = mockServicesData.categories.find(c => c.slug === 'certificates');

  if (!category) return null;

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
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {category.title}
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              {category.description}
            </p>
          </div>
        </motion.div>
      </section>

      {/* Services List */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {category.services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]"
              >
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  {service.title}
                </h3>
                <p className="mb-6 text-sm text-gray-600">
                  {service.description}
                </p>

                {service.requirements && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Requirements
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {service.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-gray-600">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {service.steps && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Steps
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      {service.steps.map((step, i) => (
                        <li key={i} className="text-sm text-gray-600">{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                  {service.fee && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee:</span>
                      <span className="text-sm font-medium text-gray-900">{service.fee}</span>
                    </div>
                  )}
                  {service.processingTime && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Processing:</span>
                      <span className="text-sm font-medium text-gray-900">{service.processingTime}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

CertificatesPage.displayName = 'CertificatesPage';

export default CertificatesPage;
