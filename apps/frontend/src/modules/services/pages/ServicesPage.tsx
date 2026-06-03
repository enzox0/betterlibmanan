import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { mockServicesData } from '../data/mockData';

// Flatten all services for easy search
const allServices = mockServicesData.categories.flatMap(category => 
  category.services.map(service => ({
    ...service,
    categoryTitle: category.title,
    categorySlug: category.slug
  }))
);

export function ServicesPage() {
  const { categories, lifeEvents } = mockServicesData;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allServices.filter(
      service => 
        service.title.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

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
              Municipal Services
            </h1>
            <p className="mt-3 text-sm text-gray-300 sm:text-base">
              Explore all available municipal services and find what you need
            </p>
          </div>
        </motion.div>
      </section>

      {/* Search and Content */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search for services (e.g., birth certificate, business permit)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              />
              <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </motion.div>

          {/* Search Results */}
          {searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-6">
                {filteredServices.length > 0 ? `Found ${filteredServices.length} service(s)` : 'No services found'}
              </h2>
              {filteredServices.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Link
                        to={`/services/${service.categorySlug}`}
                        className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg"
                      >
                        <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-2">
                          {service.categoryTitle}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Browse by Life Event */}
          {!searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Browse by Life Event</h2>
                <p className="text-gray-600">Find services based on what's happening in your life</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {lifeEvents.map((event, index) => {
                  const Icon = event.icon;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          // For demo, scroll to categories section
                          const element = document.getElementById('categories');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.02]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Icon className="text-lg" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 text-left">
                          {event.title}
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Service Categories */}
          {!searchQuery.trim() && (
            <div id="categories">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-2">Service Categories</h2>
                <p className="text-gray-600">Explore all available municipal services and find what you need</p>
              </motion.div>

              <div className="grid gap-6 sm:grid-cols-2">
                {categories.map((category, index) => {
                  const Icon = category.icon;
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link
                        to={`/services/${category.slug}`}
                        className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:scale-[1.01]"
                      >
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                          <Icon className="text-2xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {category.description}
                          </p>
                          <div className="flex items-center text-sm font-medium text-blue-600">
                            View services
                            <svg
                              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

ServicesPage.displayName = 'ServicesPage';

export default ServicesPage;
