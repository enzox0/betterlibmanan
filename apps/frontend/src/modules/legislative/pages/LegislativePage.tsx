import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaScroll,
  FaBalanceScale,
  FaUsers,
  FaLock,
  FaExternalLinkAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { mockLegislativeData } from '../data/mockData';

const ABOUT_ICONS = [FaScroll, FaBalanceScale, FaUsers, FaLock];

/** Vertical stepper used for both process columns */
function ProcessStepper({
  steps,
  accent,
}: {
  steps: { step: number; title: string; description: string }[];
  accent: 'blue' | 'neutral';
}) {
  const dotBase =
    accent === 'blue'
      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
      : 'bg-neutral-900 text-white ring-4 ring-neutral-100';
  const lineColor = accent === 'blue' ? 'bg-blue-100' : 'bg-neutral-200';

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <motion.li
            key={step.step}
            initial={{ opacity: 0, x: accent === 'blue' ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="flex gap-4"
          >
            {/* Track */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dotBase}`}
              >
                {String(step.step).padStart(2, '0')}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 min-h-[2.5rem] ${lineColor}`} />}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? '' : ''}`}>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug">{step.title}</h4>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{step.description}</p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export function LegislativePage() {
  const data = mockLegislativeData.main;
  const ord = mockLegislativeData.ordinance;
  const res = mockLegislativeData.resolution;

  return (
    <div className="min-h-screen bg-neutral-100">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
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
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <div className="text-center">
            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 backdrop-blur-sm mb-4">
              Sangguniang Bayan ng Libmanan
            </span>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              Legislative Documents
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Ordinances and resolutions of the Sangguniang Bayan ng Libmanan, Camarines Sur.
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { label: 'Ordinances',  value: ord.documents.length + '+' },
              { label: 'Resolutions', value: res.documents.length + '+' },
              { label: 'Process Steps (Ord.)', value: data.ordinanceSteps.length },
              { label: 'Process Steps (Res.)', value: data.resolutionSteps.length },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Document Type Cards ───────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Browse Documents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Access the full library of enacted ordinances and resolutions
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Ordinances */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                    <FaScroll size={16} />
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                    {ord.documents.length} recent
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">Ordinance Framework</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {data.ordinanceDescription}
                </p>

                {/* Category pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {ord.categories.map(cat => (
                    <span
                      key={cat}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={data.ordinanceLink}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Browse Ordinances
                    <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-neutral-200">|</span>
                  <a
                    href={ord.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Official portal
                    <FaExternalLinkAlt size={9} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Resolutions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-lg"
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-600 to-neutral-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                    <FaBalanceScale size={16} />
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                    {res.documents.length} recent
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">Resolution Framework</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {data.resolutionDescription}
                </p>

                {/* Type pills */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {res.types.map(type => (
                    <span
                      key={type}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
                    >
                      {type}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={data.resolutionLink}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors"
                  >
                    Browse Resolutions
                    <FaArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <span className="text-neutral-200">|</span>
                  <a
                    href={res.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Official portal
                    <FaExternalLinkAlt size={9} />
                  </a>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Recent Documents Preview ──────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Recent Documents</h2>
            <p className="mt-1 text-sm text-gray-500">Latest enacted ordinances and passed resolutions</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Recent Ordinances */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">Ordinances</h3>
                </div>
                <Link
                  to={data.ordinanceLink}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {ord.documents.map((doc, index) => (
                  <motion.div
                    key={doc.number}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                  >
                    <FaCheckCircle className="mt-0.5 shrink-0 text-blue-500" size={14} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-blue-600">#{doc.number}</span>
                        <span className="text-[11px] text-gray-400">{doc.sessionDate}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                        {doc.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Resolutions */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-700" />
                  <h3 className="text-sm font-bold text-gray-900">Resolutions</h3>
                </div>
                <Link
                  to={data.resolutionLink}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {res.documents.map((doc, index) => (
                  <motion.div
                    key={doc.number}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                  >
                    <FaCheckCircle className="mt-0.5 shrink-0 text-neutral-400" size={14} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-neutral-600">#{doc.number}</span>
                        <span className="text-[11px] text-gray-400">{doc.sessionDate}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                        {doc.title}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Process Flow ──────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Legislative Process</h2>
            <p className="mt-1 text-sm text-gray-500">
              Step-by-step flow for enacting ordinances and passing resolutions
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Ordinances stepper */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Ordinances</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data.ordinanceSteps.length}-step enactment process
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  {data.ordinanceSteps.length} steps
                </span>
              </div>
              <ProcessStepper steps={data.ordinanceSteps} accent="blue" />
            </div>

            {/* Resolutions stepper */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Resolutions</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data.resolutionSteps.length}-step approval process
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                  {data.resolutionSteps.length} steps
                </span>
              </div>
              <ProcessStepper steps={data.resolutionSteps} accent="neutral" />
            </div>

          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{data.about.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{data.about.description}</p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.about.points.map((point, index) => {
              const Icon = ABOUT_ICONS[index] ?? FaScroll;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                    <Icon size={15} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{point.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{point.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}

LegislativePage.displayName = 'LegislativePage';

export default LegislativePage;
