import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaScroll,
  FaBalanceScale,
  FaUsers,
  FaLock,
  FaExternalLinkAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { LuInfo, LuCirclePlus } from "react-icons/lu";
import {
  fetchLegislativeSettings,
  fetchOrdinances,
  fetchResolutions,
  fetchProcessSteps,
  fetchAboutPoints,
  type PublicLegislativeSettings,
  type PublicLegislativeDoc,
  type PublicProcessStep,
  type PublicAboutPoint,
} from "../api/legislative.public.api";

const ABOUT_ICONS = [FaScroll, FaBalanceScale, FaUsers, FaLock];

const ORDINANCE_LINK = "/legislative/ordinances";

function NoDataNudge({ context }: { context: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
        <LuInfo className="h-6 w-6 text-blue-500" />
      </div>
      <p className="text-sm font-semibold text-blue-800 mb-1">
        No {context} available yet
      </p>
      <p className="text-xs text-blue-600 max-w-xs mx-auto leading-relaxed mb-4">
        This section doesn't have any data yet. Would you like to contribute or
        add information?
      </p>
      <Link
        to="/admin/register"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      >
        <LuCirclePlus className="h-3.5 w-3.5" />
        Add Information
      </Link>
    </motion.div>
  );
}
const RESOLUTION_LINK = "/legislative/resolutions";

/** Vertical stepper used for both process columns */
function ProcessStepper({
  steps,
  accent,
}: {
  steps: PublicProcessStep[];
  accent: "blue" | "neutral";
}) {
  const dotBase =
    accent === "blue"
      ? "bg-blue-600 text-white ring-4 ring-blue-100"
      : "bg-neutral-900 text-white ring-4 ring-neutral-100";
  const lineColor = accent === "blue" ? "bg-blue-100" : "bg-neutral-200";

  return (
    <ol className="space-y-0">
      {steps.map((s, index) => {
        const isLast = index === steps.length - 1;
        return (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, x: accent === "blue" ? -16 : 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dotBase}`}
              >
                {String(s.fields.step).padStart(2, "0")}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[2.5rem] ${lineColor}`} />
              )}
            </div>
            <div className="pb-6">
              <h4 className="text-sm font-semibold text-gray-900 leading-snug">
                {s.fields.title}
              </h4>
              <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                {s.fields.description}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

/** Skeleton shimmer rows for loading state */
function StepSkeleton({ count }: { count: number }) {
  return (
    <ol className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex gap-4 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="h-2.5 w-full rounded bg-gray-100" />
          </div>
        </li>
      ))}
    </ol>
  );
}

function DocSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex gap-3 rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div className="h-3.5 w-3.5 rounded-full bg-gray-200 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-1/3 rounded bg-gray-200" />
            <div className="h-2.5 w-full rounded bg-gray-100" />
            <div className="h-2.5 w-4/5 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LegislativePage() {
  const [settings, setSettings] = useState<PublicLegislativeSettings | null>(
    null,
  );
  const [ordinances, setOrdinances] = useState<PublicLegislativeDoc[]>([]);
  const [resolutions, setResolutions] = useState<PublicLegislativeDoc[]>([]);
  const [ordSteps, setOrdSteps] = useState<PublicProcessStep[]>([]);
  const [resSteps, setResSteps] = useState<PublicProcessStep[]>([]);
  const [aboutPoints, setAboutPoints] = useState<PublicAboutPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchLegislativeSettings(),
      fetchOrdinances(),
      fetchResolutions(),
      fetchProcessSteps("ordinance"),
      fetchProcessSteps("resolution"),
      fetchAboutPoints(),
    ])
      .then(([s, ords, ress, oSteps, rSteps, about]) => {
        if (cancelled) return;
        setSettings(s);
        setOrdinances(ords);
        setResolutions(ress);
        setOrdSteps(oSteps);
        setResSteps(rSteps);
        setAboutPoints(about);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
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
              Ordinances and resolutions of the Sangguniang Bayan ng Libmanan,
              Camarines Sur.
            </p>
          </div>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { label: "Ordinances", value: ordinances.length + "+" },
              { label: "Resolutions", value: resolutions.length + "+" },
              { label: "Process Steps (Ord.)", value: ordSteps.length },
              { label: "Process Steps (Res.)", value: resSteps.length },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Document Type Cards ──────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Browse Documents
            </h2>
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
                    {ordinances.length} recent
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Ordinance Framework
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {settings?.ordinanceDescription ?? "—"}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(settings?.ordinanceCategories ?? []).map((cat) => (
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
                    to={ORDINANCE_LINK}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Browse Ordinances
                    <FaArrowRight size={11} />
                  </Link>
                  {settings?.ordinanceExternalLink && (
                    <>
                      <span className="text-neutral-200">|</span>
                      <a
                        href={settings.ordinanceExternalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Official portal
                        <FaExternalLinkAlt size={9} />
                      </a>
                    </>
                  )}
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
                    {resolutions.length} recent
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Resolution Framework
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {settings?.resolutionDescription ?? "—"}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {(settings?.resolutionTypes ?? []).map((type) => (
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
                    to={RESOLUTION_LINK}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors"
                  >
                    Browse Resolutions
                    <FaArrowRight size={11} />
                  </Link>
                  {settings?.resolutionExternalLink && (
                    <>
                      <span className="text-neutral-200">|</span>
                      <a
                        href={settings.resolutionExternalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        Official portal
                        <FaExternalLinkAlt size={9} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Recent Documents Preview ─────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Recent Documents
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Latest enacted ordinances and passed resolutions
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Ordinances */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Ordinances
                  </h3>
                </div>
                <Link
                  to={ORDINANCE_LINK}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>
              {loading ? (
                <DocSkeleton count={3} />
              ) : ordinances.length === 0 ? (
                <NoDataNudge context="ordinances" />
              ) : (
                <div className="space-y-2">
                  {ordinances.slice(0, 5).map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                    >
                      <FaCheckCircle
                        className="mt-0.5 shrink-0 text-blue-500"
                        size={14}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-blue-600">
                            #{doc.fields.number}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {doc.fields.sessionDate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                          {doc.fields.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Resolutions */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-700" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Resolutions
                  </h3>
                </div>
                <Link
                  to={RESOLUTION_LINK}
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  View all →
                </Link>
              </div>
              {loading ? (
                <DocSkeleton count={3} />
              ) : resolutions.length === 0 ? (
                <NoDataNudge context="resolutions" />
              ) : (
                <div className="space-y-2">
                  {resolutions.slice(0, 5).map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: 12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
                    >
                      <FaCheckCircle
                        className="mt-0.5 shrink-0 text-neutral-400"
                        size={14}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-neutral-600">
                            #{doc.fields.number}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {doc.fields.sessionDate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                          {doc.fields.title}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Process Flow ─────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Legislative Process
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Step-by-step flow for enacting ordinances and passing resolutions
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Ordinances
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ordSteps.length}-step enactment process
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                  {ordSteps.length} steps
                </span>
              </div>
              {loading ? (
                <StepSkeleton count={5} />
              ) : ordSteps.length === 0 ? (
                <NoDataNudge context="ordinance process steps" />
              ) : (
                <ProcessStepper steps={ordSteps} accent="blue" />
              )}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Resolutions
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {resSteps.length}-step approval process
                  </p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600">
                  {resSteps.length} steps
                </span>
              </div>
              {loading ? (
                <StepSkeleton count={4} />
              ) : resSteps.length === 0 ? (
                <NoDataNudge context="resolution process steps" />
              ) : (
                <ProcessStepper steps={resSteps} accent="neutral" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {settings?.aboutTitle ?? "Understanding Local Legislation"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {settings?.aboutDescription ??
                "Learn about the legislative process of the Sangguniang Bayan"}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-200" />
                  <div className="h-3 w-2/3 rounded bg-gray-200" />
                  <div className="h-2.5 w-full rounded bg-gray-100" />
                  <div className="h-2.5 w-4/5 rounded bg-gray-100" />
                </div>
              ))
            ) : aboutPoints.length === 0 ? (
              <div className="sm:col-span-2 lg:col-span-4">
                <NoDataNudge context="about points" />
              </div>
            ) : (
              aboutPoints.map((point, index) => {
                const Icon = ABOUT_ICONS[index] ?? FaScroll;
                return (
                  <motion.div
                    key={point.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="group rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                      <Icon size={15} />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">
                      {point.fields.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {point.fields.description}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

LegislativePage.displayName = "LegislativePage";

export default LegislativePage;
