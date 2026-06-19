import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { FaSearch, FaTimes, FaArrowRight, FaThLarge } from 'react-icons/fa';
import { mockServicesData } from '../data/mockData';

// Flatten all services for easy search
const allServices = mockServicesData.categories.flatMap(category =>
  category.services.map(service => ({
    ...service,
    categoryTitle: category.title,
    categorySlug: category.slug,
    categoryIcon: category.icon,
  }))
);

export function ServicesPage() {
  const { categories, lifeEvents } = mockServicesData;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLifeEvent, setActiveLifeEvent] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return allServices.filter(
      service =>
        service.title.toLowerCase().includes(lowerQuery) ||
        service.description.toLowerCase().includes(lowerQuery) ||
        service.categoryTitle.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery]);

  const lifeEventServices = useMemo(() => {
    if (!activeLifeEvent) return [];
    const event = lifeEvents.find(e => e.id === activeLifeEvent);
    if (!event) return [];
    return allServices.filter(s => event.services.includes(s.id));
  }, [activeLifeEvent, lifeEvents]);

  const isFiltering = searchQuery.trim() || activeLifeEvent;
  const displayedServices = searchQuery.trim() ? filteredServices : lifeEventServices;

  const clearFilters = () => {
    setSearchQuery('');
    setActiveLifeEvent(null);
  };

  return (
    <div className="min-h-screen bg-neutral-100">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
            Find the Service<br className="hidden sm:block" /> You Need
          </h1>
          <p className="mt-3 text-center text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
            Explore all available municipal services for the people of Libmanan, Camarines Sur.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 pointer-events-none" />
              <FaSearch size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search services — e.g. birth certificate, business permit…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setActiveLifeEvent(null); }}
                className="relative z-10 w-full pl-11 pr-10 py-3.5 rounded-xl bg-transparent border border-transparent text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-all"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-6 flex justify-center gap-6 sm:gap-10">
            {[
              { label: 'Categories', value: categories.length },
              { label: 'Services', value: allServices.length },
              { label: 'Life Events', value: lifeEvents.length },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Search Results ── */}
          <AnimatePresence mode="wait">
            {isFiltering ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Results header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900">
                      {displayedServices.length > 0
                        ? `${displayedServices.length} service${displayedServices.length !== 1 ? 's' : ''} found`
                        : 'No services found'}
                    </h2>
                    {activeLifeEvent && !searchQuery && (
                      <p className="text-sm text-neutral-500 mt-0.5">
                        For: <span className="font-medium text-neutral-700">{lifeEvents.find(e => e.id === activeLifeEvent)?.title}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <FaTimes size={11} />
                    Clear filters
                  </button>
                </div>

                {displayedServices.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedServices.map((service, index) => {
                      const CategoryIcon = service.categoryIcon;
                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.04 }}
                        >
                          <Link
                            to={`/services/${service.categorySlug}`}
                            className="group flex flex-col h-full rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                                <CategoryIcon size={14} />
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
                                {service.categoryTitle}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-neutral-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                              {service.title}
                            </h3>
                            <p className="text-sm text-neutral-500 leading-relaxed flex-1">
                              {service.description}
                            </p>
                            {(service.fee || service.processingTime) && (
                              <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap gap-x-4 gap-y-1">
                                {service.fee && (
                                  <span className="text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700">Fee:</span> {service.fee}
                                  </span>
                                )}
                                {service.processingTime && (
                                  <span className="text-xs text-neutral-500">
                                    <span className="font-medium text-neutral-700">Processing:</span> {service.processingTime}
                                  </span>
                                )}
                              </div>
                            )}
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center mb-4">
                      <FaSearch size={14} className="text-neutral-400" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 mb-1">Nothing matched your search</p>
                    <p className="text-xs text-neutral-400">Try different keywords or browse categories below.</p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Browse all services
                    </button>
                  </div>
                )}
              </motion.div>

            ) : (
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >

                {/* ── Life Events ── */}
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">Browse by Life Event</h2>
                    <p className="mt-1 text-sm text-neutral-500">Find services based on what's happening in your life</p>
                  </div>

                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                    {lifeEvents.map((event, index) => {
                      const Icon = event.icon;
                      const isActive = activeLifeEvent === event.id;
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.4, delay: index * 0.04 }}
                        >
                          <button
                            onClick={() => setActiveLifeEvent(isActive ? null : event.id)}
                            className={[
                              'w-full flex flex-col items-center gap-2.5 rounded-xl border p-4 text-center transition-all duration-200',
                              isActive
                                ? 'border-neutral-900 bg-neutral-900 text-white shadow-lg shadow-neutral-400/20'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:shadow-sm',
                            ].join(' ')}
                          >
                            <div className={[
                              'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors',
                              isActive
                                ? 'border-white/10 bg-white/10 text-white'
                                : 'border-neutral-200 bg-neutral-100 text-neutral-600',
                            ].join(' ')}>
                              <Icon size={16} />
                            </div>
                            <span className={[
                              'text-xs font-semibold leading-snug',
                              isActive ? 'text-white' : 'text-neutral-800',
                            ].join(' ')}>
                              {event.title}
                            </span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Service Categories ── */}
                <div id="categories">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">Service Categories</h2>
                    <p className="mt-1 text-sm text-neutral-500">Explore all available municipal services</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {categories.map((category, index) => {
                      const Icon = category.icon;
                      return (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.45, delay: index * 0.06 }}
                        >
                          <Link
                            to={`/services/${category.slug}`}
                            className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                          >
                            {/* Icon */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                              <Icon size={18} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="text-base font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                                  {category.title}
                                </h3>
                                <span className="shrink-0 text-[11px] font-medium text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                                  {category.services.length} {category.services.length === 1 ? 'service' : 'services'}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                                {category.description}
                              </p>
                              <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600">
                                View services
                                <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1" />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

    </div>
  );
}

ServicesPage.displayName = 'ServicesPage';

export default ServicesPage;
