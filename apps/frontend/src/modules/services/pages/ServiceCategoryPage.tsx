import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaMoneyBillWave, FaListUl, FaChevronRight } from 'react-icons/fa';
import { mockServicesData } from '../data/mockData';
import type { ServiceItem } from '../types/types';
import { IconType } from 'react-icons';

interface ServiceCategoryPageProps {
  slug: string;
}

// ── Service Card ─────────────────────────────────────────────────────────────

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const hasDetails = service.requirements || service.steps;

  return (
    <motion.div
      id={`service-${service.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Card header */}
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-neutral-900 leading-snug">
              {service.title}
            </h3>
            <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Fee + time badges */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {service.fee && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-700">
                <FaMoneyBillWave size={10} className="text-neutral-500" />
                {service.fee}
              </span>
            )}
            {service.processingTime && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                <FaClock size={10} />
                {service.processingTime}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Requirements + Steps — two-col at sm+ */}
      {hasDetails && (
        <div className="border-t border-neutral-100 px-6 py-5 grid gap-6 sm:grid-cols-2 bg-neutral-50/60">
          {service.requirements && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                <FaListUl size={9} />
                Requirements
              </p>
              <ul className="space-y-2">
                {service.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
                    <FaCheckCircle
                      size={13}
                      className="mt-0.5 shrink-0 text-neutral-400"
                    />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.steps && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                <FaChevronRight size={9} />
                How to Apply
              </p>
              <ol className="space-y-2.5">
                {service.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-neutral-700 leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function ServiceCategoryPage({ slug }: ServiceCategoryPageProps) {
  const category = mockServicesData.categories.find(c => c.slug === slug);

  if (!category) return null;

  const Icon: IconType = category.icon;

  return (
    <div className="min-h-screen bg-neutral-100">

      {/* ── Hero ── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16"
        >
          {/* Back link */}
          <Link
            to="/services"
            className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            <FaArrowLeft size={10} />
            All Services
          </Link>

          <div className="flex items-center gap-4 sm:gap-5">
            {/* Icon */}
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
              <Icon size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl leading-tight">
                {category.title}
              </h1>
              <p className="mt-1 text-sm text-gray-400 sm:text-base max-w-xl">
                {category.description}
              </p>
            </div>
          </div>

          {/* Service count pill */}
          <div className="mt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
              {category.services.length} {category.services.length === 1 ? 'Service' : 'Services'} Available
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── Content ── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 items-start">

            {/* ── Sticky Sidebar (desktop) ── */}
            <aside className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-28">
              <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                    On this page
                  </p>
                </div>
                <nav className="p-2">
                  {category.services.map((service, index) => (
                    <a
                      key={service.id}
                      href={`#service-${service.id}`}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-bold text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                        {index + 1}
                      </span>
                      <span className="font-medium leading-snug">{service.title}</span>
                    </a>
                  ))}
                </nav>

                {/* Back to all */}
                <div className="px-3 pb-3">
                  <Link
                    to="/services"
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all"
                  >
                    <FaArrowLeft size={9} />
                    Back to All Services
                  </Link>
                </div>
              </div>
            </aside>

            {/* ── Main service cards ── */}
            <div className="flex-1 min-w-0 space-y-5">
              {category.services.map((service, index) => (
                <ServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

ServiceCategoryPage.displayName = 'ServiceCategoryPage';

export default ServiceCategoryPage;
