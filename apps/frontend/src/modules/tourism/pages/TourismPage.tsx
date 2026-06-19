import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaLeaf,
  FaWater,
  FaMountain,
  FaChurch,
  FaCamera,
  FaUtensils,
  FaBed,
  FaChevronDown,
  FaChevronRight,
  FaStar,
  FaCompass,
} from 'react-icons/fa';
import { touristSpots, travelTips, foodSpots, categories } from '../data/tourismData';

export function TourismPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredSpots =
    activeCategory === 'all'
      ? touristSpots
      : touristSpots.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-blue-600/10 to-transparent" />

        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 sm:pt-20 sm:pb-24"
        >
          <h1 className="text-center text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
            Explore the Natural &amp;<br className="hidden sm:block" /> Cultural Wonders
          </h1>
          <p className="mt-4 text-center text-sm text-gray-400 sm:text-base max-w-xl mx-auto leading-relaxed">
            From lush river landscapes to centuries-old heritage sites, Libmanan,
            Camarines Sur offers experiences waiting to be discovered.
          </p>

          {/* Quick stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-14">
            {[
              { label: 'Tourist Spots', value: `${touristSpots.length}+` },
              { label: 'Local Delicacies', value: `${foodSpots.length}+` },
              { label: 'Best Months', value: 'Nov – Apr' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Category Filter ───────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-neutral-200 sticky top-[var(--navbar-h,96px)] z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar py-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={[
                    'flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  ].join(' ')}
                >
                  <Icon className="text-xs" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Tourist Spots Grid ────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
              {activeCategory === 'all'
                ? 'All Tourist Spots'
                : categories.find((c) => c.id === activeCategory)?.label}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              {filteredSpots.length} destination{filteredSpots.length !== 1 ? 's' : ''} to explore
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredSpots.map((spot, index) => {
                const CategoryIcon = spot.categoryIcon;
                return (
                  <motion.div
                    key={spot.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-neutral-300"
                  >
                    {/* Color band / image placeholder */}
                    <div className={`h-44 flex items-end p-4 relative overflow-hidden ${spot.bgColor}`}>
                      {/* Category badge */}
                      <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-wider">
                        <CategoryIcon className="text-[9px]" />
                        {spot.categoryLabel}
                      </span>

                      {/* Rating */}
                      {spot.rating && (
                        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-yellow-300 text-xs font-bold">
                          <FaStar className="text-[9px]" />
                          {spot.rating}
                        </span>
                      )}

                      {/* Large icon as visual anchor */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                        <CategoryIcon className="text-[120px] text-white" />
                      </div>

                      <h3 className="relative text-lg font-bold text-white leading-snug drop-shadow">
                        {spot.name}
                      </h3>
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      <div className="flex items-start gap-2 mb-3">
                        <FaMapMarkerAlt className="text-neutral-400 mt-0.5 shrink-0 text-xs" />
                        <span className="text-xs text-neutral-500">{spot.location}</span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{spot.description}</p>

                      {/* Tags */}
                      {spot.tags && spot.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {spot.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-[11px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Entry fee */}
                      {spot.entryFee && (
                        <div className="mt-4 pt-3 border-t border-neutral-100">
                          <span className="text-xs text-neutral-500">
                            <span className="font-medium text-neutral-700">Entry:</span>{' '}
                            {spot.entryFee}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── Local Food Spots ──────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Local Food &amp; Delicacies
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Taste the authentic flavors of Libmanan
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <FaUtensils className="text-[10px]" /> {foodSpots.length} recommendations
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {foodSpots.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 border border-orange-100 text-orange-500">
                  <FaUtensils className="text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{food.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">
                    {food.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Travel Tips / FAQ ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-neutral-50 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Left — travel tips */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl mb-6">
                Traveler's Tips
              </h2>
              <div className="space-y-4">
                {travelTips.map((tip, index) => {
                  const Icon = tip.icon;
                  return (
                    <motion.div
                      key={tip.id}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.07 }}
                      className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                        <Icon className="text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{tip.title}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right — FAQ accordion */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.07 }}
                    className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                      className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
                    >
                      <span className="text-sm font-semibold text-neutral-800">
                        {faq.question}
                      </span>
                      <FaChevronDown
                        className={`text-xs text-neutral-400 shrink-0 transition-transform duration-200 ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Accommodation CTA ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-gray-900 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Plan Your Stay
            </h2>
            <p className="mt-3 text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              Contact the Municipal Tourism Office for accommodation
              recommendations, guided tours, and travel assistance.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-neutral-900 px-6 py-3 text-sm font-semibold hover:bg-neutral-100 transition-colors"
              >
                Contact Tourism Office
                <FaChevronRight className="text-xs" />
              </a>
              <a
                href="/government"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 text-white px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                View Government Offices
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ── FAQ data (local to the page) ───────────────────────────────────────────── */
const faqs = [
  {
    id: 1,
    question: 'What is the best time to visit Libmanan?',
    answer:
      'The best time to visit is during the dry season from November to April. This period offers cooler temperatures and clear skies, ideal for outdoor activities and river trips.',
  },
  {
    id: 2,
    question: 'How do I get to Libmanan?',
    answer:
      'Libmanan is accessible by bus or van from Naga City, roughly a 30–45 minute drive via the Maharlika Highway. From Manila, take a bus to Naga City then connect to Libmanan.',
  },
  {
    id: 3,
    question: 'Are there entrance fees for tourist spots?',
    answer:
      'Some natural attractions may have minimal entrance or environmental fees to support conservation. Heritage sites and public areas are generally free to visit.',
  },
  {
    id: 4,
    question: 'Is Libmanan safe for tourists?',
    answer:
      'Yes, Libmanan is generally safe for visitors. As with any travel, take normal precautions with your belongings and follow local guidelines when exploring natural areas.',
  },
  {
    id: 5,
    question: 'Can I hire a local guide?',
    answer:
      'Local guides can be arranged through the Municipal Tourism Office or by coordinating with the barangay offices near major attractions. It is highly recommended for river and nature tours.',
  },
];

TourismPage.displayName = 'TourismPage';
export default TourismPage;
