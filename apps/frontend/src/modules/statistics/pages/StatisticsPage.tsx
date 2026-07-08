import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaMoneyBillWave,
  FaChartLine,
  FaExternalLinkAlt,
} from "react-icons/fa";
import {
  fetchPublicStatistics,
  type PublicStatisticsBundle,
} from "../api/statistics.public.api";
import CountUp from "@/shared/ui/CountUp";

// ── Helpers ───────────────────────────────────────────────────────────────────

function RadarChart({
  data,
}: {
  data: { category: string; score: number; change: number }[];
}) {
  const cx = 120,
    cy = 120,
    r = 90,
    levels = 4,
    n = data.length,
    maxScore = 1.5;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });
  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const fr = (r * (l + 1)) / levels;
    return Array.from({ length: n }, (_, i) => point(i, fr))
      .map((p) => `${p.x},${p.y}`)
      .join(" ");
  });
  const dataPolygon = data
    .map((d, i) => point(i, (Math.min(d.score, maxScore) / maxScore) * r))
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-xs mx-auto">
      {gridPolygons.map((pts, l) => (
        <polygon
          key={l}
          points={pts}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const outer = point(i, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points={dataPolygon}
        fill="rgba(37,99,235,0.15)"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const p = point(i, (Math.min(d.score, maxScore) / maxScore) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563eb" />;
      })}
      {data.map((d, i) => {
        const p = point(i, r + 16);
        const anchor = p.x < cx - 4 ? "end" : p.x > cx + 4 ? "start" : "middle";
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-gray-600"
            fontSize="9"
            fontWeight="600"
          >
            {d.category.split(" ")[0]}
          </text>
        );
      })}
    </svg>
  );
}

function DonutRing({
  pct,
  color = "#2563eb",
  size = 80,
  stroke = 10,
  label,
}: {
  pct: number;
  color?: string;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        variants={{
          hidden: { strokeDashoffset: circ },
          visible: {
            strokeDashoffset: circ - dash,
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
          },
        }}
      />
      {label && (
        <motion.text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="700"
          fill="#111827"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.4, delay: 0.6 } },
          }}
        >
          {label}
        </motion.text>
      )}
    </motion.svg>
  );
}

function AreaSparkline({
  points,
}: {
  points: { year: number; pop: number }[];
}) {
  const W = 560,
    H = 120,
    pad = { l: 36, r: 16, t: 10, b: 28 };
  const minP = Math.min(...points.map((p) => p.pop));
  const maxP = Math.max(...points.map((p) => p.pop));
  const xs = points.map(
    (_, i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r),
  );
  const ys = points.map(
    (p) => pad.t + ((maxP - p.pop) / (maxP - minP)) * (H - pad.t - pad.b),
  );
  const linePath = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`)
    .join(" ");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H - pad.b} L${xs[0]},${H - pad.b} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path
        d={linePath}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={p.year}>
          <circle cx={xs[i]} cy={ys[i]} r="3.5" fill="#2563eb" />
          <text
            x={xs[i]}
            y={H - pad.b + 12}
            textAnchor="middle"
            fontSize="8"
            fill="#6b7280"
          >
            {p.year}
          </text>
          <text
            x={xs[i]}
            y={ys[i] - 8}
            textAnchor="middle"
            fontSize="7.5"
            fill="#374151"
            fontWeight="600"
          >
            {(p.pop / 1000).toFixed(0)}k
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const DOT_BG = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

// ── Empty State ───────────────────────────────────────────────────────────────

function SectionEmpty({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-neutral-200 bg-[#f0f4fb] py-14 px-6 flex flex-col items-center text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white mb-4">
        <svg
          className="h-5 w-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 8v1m0 3v4" />
        </svg>
      </div>
      <p className="text-sm font-bold text-gray-800 mb-1">
        No {label} available yet
      </p>
      <p className="text-xs text-gray-500 max-w-xs">
        This section doesn&apos;t have any data yet. Would you like to
        contribute or add information?
      </p>
      <a
        href="/admin"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path strokeLinecap="round" d="M12 8v8m-4-4h8" />
        </svg>
        Add Information
      </a>
    </motion.div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <section className="relative bg-gray-900 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="text-center">
          <div className="h-10 w-64 rounded-lg bg-gray-700 animate-pulse mx-auto mb-4" />
          <div className="h-4 w-80 rounded bg-gray-700 animate-pulse mx-auto" />
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-24 rounded bg-gray-700 animate-pulse mx-auto mb-2" />
              <div className="h-3 w-20 rounded bg-gray-700 animate-pulse mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function StatisticsPage() {
  const [bundle, setBundle] = useState<PublicStatisticsBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchPublicStatistics()
      .then(setBundle)
      .catch((err) =>
        setFetchError(err?.message ?? "Failed to load statistics."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  // Derived state - compute these regardless of loading/error state to follow Rules of Hooks
  const sortedBrgy = useMemo(() => {
    if (!bundle) return [];
    return [...bundle.barangays].sort((a, b) => a.rank - b.rank);
  }, [bundle]);

  const maxBrgyPop = useMemo(() => {
    return sortedBrgy.length > 0 ? sortedBrgy[0].population : 1;
  }, [sortedBrgy]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? sortedBrgy.filter((b) => b.name.toLowerCase().includes(q))
      : sortedBrgy;
    return sortAsc ? [...base].reverse() : base;
  }, [sortedBrgy, search, sortAsc]);

  const visible = useMemo(() => {
    if (showAll || search.trim()) return filtered;
    return filtered.slice(0, PAGE_SIZE);
  }, [filtered, showAll, search]);

  if (isLoading) return <HeroSkeleton />;
  if (fetchError || !bundle) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          {fetchError ?? "Statistics data unavailable."}
        </p>
      </div>
    );
  }

  const municipal = bundle.municipal;
  const financeStats = bundle.financeStats;
  const financeComposition = bundle.financeComposition;
  const populationHistory = bundle.populationHistory;
  const economyIndicators = bundle.economyIndicators;
  const economySectors = bundle.economySectors;
  const poverty = bundle.poverty;
  const competitiveness = bundle.competitiveness;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={DOT_BG}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              Municipal Statistics
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Data and statistics about Libmanan, Camarines Sur
            </p>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
            {municipal.length === 0 ? (
              <p className="text-sm text-gray-500">No stats available yet.</p>
            ) : (
              municipal.map((stat) => {
                const strVal = String(stat.value);
                const numeric = parseFloat(strVal.replace(/[^0-9.]/g, ""));
                const isOrdinal = /^(1st|2nd|3rd|\d+th)$/i.test(strVal);
                const isNumeric = !isNaN(numeric) && !isOrdinal;
                return (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-white">
                      {isNumeric ? (
                        <>
                          {strVal.startsWith("₱") && "₱"}
                          <CountUp
                            from={0}
                            to={numeric}
                            separator=","
                            duration={1.8}
                            delay={0.2}
                          />
                          {/[a-zA-Z²³]/.test(strVal) &&
                            !strVal.startsWith("₱") && (
                              <span>
                                {" "}
                                {strVal.replace(/[0-9,. ]/g, "").trim()}
                              </span>
                            )}
                        </>
                      ) : (
                        strVal
                      )}
                    </p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Finance ──────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-6"
          >
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              <FaMoneyBillWave size={10} /> Finance
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Municipal Income
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Financial standing for fiscal year 2023–2024
            </p>
          </motion.div>
          {financeStats.length === 0 && financeComposition.length === 0 ? (
            <SectionEmpty label="finance data" />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0 }}
                  className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 shadow-sm"
                >
                  <p className="flex items-center gap-1.5 text-xs font-medium text-blue-200 mb-3">
                    <FaChartLine size={11} />{" "}
                    {financeStats[0]?.label ?? "Annual Income"}
                  </p>
                  <p className="text-3xl font-black leading-none">
                    {financeStats[0]?.value ?? "—"}
                  </p>
                  <p className="text-xs text-blue-200 mt-2">
                    {financeStats[0]?.subValue ?? ""}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.07 }}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
                    <FaMoneyBillWave size={11} />{" "}
                    {financeStats[1]?.label ?? "IRA Share"}
                  </p>
                  <p className="text-3xl font-black text-gray-900 leading-none">
                    {financeStats[1]?.value ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {financeStats[1]?.subValue ?? ""}
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.14 }}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
                    <FaChartLine size={11} />{" "}
                    {financeStats[2]?.label ?? "IRA Dependency"}
                  </p>
                  <p className="text-3xl font-black text-gray-900 leading-none">
                    {financeStats[2]?.value ?? "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {financeStats[2]?.subValue ?? ""}
                  </p>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.21 }}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <p className="text-xs font-bold text-gray-700 mb-4">
                  Income Composition
                </p>
                <div className="w-full h-10 rounded-lg overflow-hidden flex">
                  {financeComposition.map((item) => (
                    <div
                      key={item._id}
                      className={`flex items-center justify-center px-4 ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      <span className="text-xs font-bold text-white truncate">
                        {item.label.split(" ")[0]} {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-6 mt-4 justify-center">
                  {financeComposition.map((item) => (
                    <div key={item._id} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${item.color}`} />
                      <span className="text-xs text-gray-600 font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://blgf.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Bureau of Local Government Finance (BLGF) — 2023 SRE Data{" "}
                <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Population Trend ─────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Growth
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Population Trends
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Historical growth from 1990 to 2024
            </p>
          </motion.div>
          {populationHistory.length === 0 ? (
            <SectionEmpty label="population data" />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              {(() => {
                const baseline = populationHistory[0].pop;
                const latest =
                  populationHistory[populationHistory.length - 1].pop;
                const growthPct =
                  baseline > 0 ? ((latest - baseline) / baseline) * 100 : 0;
                return (
                  <>
                    <div className="flex flex-wrap gap-8 mb-6">
                      {[
                        {
                          label: `${populationHistory[0].year} Baseline`,
                          value: baseline,
                          prefix: "",
                          suffix: "",
                          color: "text-gray-700",
                        },
                        {
                          label: `${populationHistory[populationHistory.length - 1].year} Population`,
                          value: latest,
                          prefix: "",
                          suffix: "",
                          color: "text-gray-900",
                        },
                        {
                          label: "Total Growth",
                          value: parseFloat(growthPct.toFixed(1)),
                          prefix: "+",
                          suffix: "%",
                          color: "text-blue-600",
                        },
                      ].map((kpi) => (
                        <div key={kpi.label}>
                          <p className={`text-2xl font-bold ${kpi.color}`}>
                            {kpi.prefix}
                            <CountUp
                              from={0}
                              to={kpi.value}
                              separator=","
                              duration={1.8}
                              delay={0.1}
                            />
                            {kpi.suffix}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {kpi.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <AreaSparkline
                      points={populationHistory.map((p) => ({
                        year: p.year,
                        pop: p.pop,
                      }))}
                    />
                  </>
                );
              })()}
            </motion.div>
          )}
          <p className="text-[11px] text-gray-400 mt-3 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://psa.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Philippine Statistics Authority (PSA){" "}
                <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Barangay Distribution ────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Distribution
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Population by Barangay
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              2024 Census of Population — all 75 barangays of Libmanan
            </p>
          </motion.div>
          {sortedBrgy.length === 0 ? (
            <SectionEmpty label="barangay population data" />
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-xs w-full">
                  <FaSearch
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Search barangay…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-neutral-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                  <AnimatePresence>
                    {search && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes size={10} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {filtered.length} barangay{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-neutral-50 transition-colors"
                  >
                    {sortAsc ? (
                      <FaSortAmountUp size={11} />
                    ) : (
                      <FaSortAmountDown size={11} />
                    )}
                    {sortAsc ? "Least populated" : "Most populated"}
                  </button>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
              >
                {filtered.length > 0 ? (
                  <div className="divide-y divide-neutral-100">
                    {visible.map((brgy, i) => (
                      <motion.div
                        key={brgy.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(i * 0.015, 0.4),
                        }}
                        className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors"
                      >
                        <span className="w-8 shrink-0 text-center text-[11px] font-bold text-gray-400">
                          #{brgy.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1.5">
                            <span className="text-sm font-semibold text-gray-800 truncate">
                              {brgy.name}
                            </span>
                            <span className="text-xs font-medium text-gray-500 ml-3 shrink-0 tabular-nums">
                              {brgy.population.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-blue-600"
                              initial={{ width: 0 }}
                              whileInView={{
                                width: `${(brgy.population / maxBrgyPop) * 100}%`,
                              }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.7,
                                ease: "easeOut",
                                delay: Math.min(i * 0.01, 0.3),
                              }}
                            />
                          </div>
                        </div>
                        <span className="w-12 shrink-0 text-right text-[11px] text-gray-400 tabular-nums">
                          {((brgy.population / 112994) * 100).toFixed(2)}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <FaSearch
                      size={14}
                      className="mx-auto mb-3 text-neutral-300"
                    />
                    <p className="text-sm font-semibold text-neutral-500">
                      No barangay matched
                    </p>
                    <button
                      onClick={() => setSearch("")}
                      className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </motion.div>
              {!search.trim() && filtered.length > PAGE_SIZE && (
                <div className="mt-4 flex justify-center">
                  <motion.button
                    onClick={() => setShowAll((v) => !v)}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
                  >
                    {showAll ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                        Show less
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                        View more
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-gray-500">
                          +{filtered.length - PAGE_SIZE}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://psa.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Philippine Statistics Authority (PSA) — 2020 Census; PhilAtlas
                barangay profiles <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Economy ──────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Economy
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Economic Indicators
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Key economic data and business statistics
            </p>
          </motion.div>
          {economyIndicators.length === 0 && economySectors.length === 0 ? (
            <SectionEmpty label="economic data" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="lg:col-span-2 grid gap-4">
                {economyIndicators.map((stat, i) => (
                  <motion.div
                    key={stat._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex items-center gap-4"
                  >
                    <div className="shrink-0">
                      <DonutRing
                        pct={
                          stat.label === "Registered Voters"
                            ? 64
                            : stat.label === "Agricultural Area"
                              ? 41
                              : 56
                        }
                        size={52}
                        stroke={7}
                      />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium text-gray-600">
                        {stat.label}
                      </p>
                      {stat.subLabel && (
                        <p className="text-[11px] text-green-600 mt-0.5">
                          {stat.subLabel}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-bold text-gray-900 mb-5">
                  Economic Sectors
                </p>
                <div className="space-y-5">
                  {economySectors.map((sector, i) => (
                    <div key={sector._id}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700">
                          {sector.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {sector.percentage}%
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-blue-600"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${sector.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.8,
                            delay: i * 0.1,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://blgf.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Bureau of Local Government Finance (BLGF) - 2023{" "}
                <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Poverty ──────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Poverty
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Poverty Statistics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              2021 City and Municipal Level Poverty Estimates
            </p>
          </motion.div>
          {poverty.length === 0 ? (
            <SectionEmpty label="poverty statistics" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {poverty.map((entry, i) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-600 to-neutral-900" />
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {entry.year}
                      </p>
                      <p className="text-4xl font-bold text-gray-900 mt-1">
                        <CountUp
                          from={0}
                          to={entry.rate}
                          duration={1.8}
                          delay={0.1}
                        />
                        %
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        90% CI: {entry.confidenceInterval}
                      </p>
                    </div>
                    <DonutRing
                      pct={entry.rate}
                      color={
                        entry.status === "improved" ? "#16a34a" : "#dc2626"
                      }
                      size={72}
                      stroke={9}
                      label={`${entry.rate}%`}
                    />
                  </div>
                  {entry.change !== 0 ? (
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${entry.change < 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                    >
                      {entry.change < 0 ? "▼" : "▲"}{" "}
                      <CountUp
                        from={0}
                        to={Math.abs(entry.change)}
                        duration={1.5}
                        delay={0.2}
                      />
                      % from prior period
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600">
                      — Stable
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://psa.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Philippine Statistics Authority (PSA) — 2021 Poverty Estimates{" "}
                <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>

      {/* ── Competitiveness ──────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Competitiveness
            </p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Libmanan Competitive Index
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Cities and Municipalities Competitiveness Index (CMCI) — 2016–2024
            </p>
          </motion.div>
          {competitiveness.length === 0 ? (
            <SectionEmpty label="competitiveness data" />
          ) : (
            <div className="grid gap-6 lg:grid-cols-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col items-center"
              >
                <p className="text-sm font-bold text-gray-900 mb-4 self-start">
                  Pillar Scores
                </p>
                <RadarChart
                  data={competitiveness.map((c) => ({
                    category: c.category,
                    score: c.score,
                    change: c.change,
                  }))}
                />
              </motion.div>
              <div className="lg:col-span-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {competitiveness.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="shrink-0 w-12 text-right">
                      <p className="text-lg font-bold text-gray-900">
                        <CountUp
                          from={0}
                          to={item.score}
                          duration={1.6}
                          delay={i * 0.07}
                        />
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.category}
                      </p>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-blue-600"
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(item.score / 1.5) * 100}%`,
                          }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.7,
                            delay: i * 0.07,
                            ease: "easeOut",
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${item.change > 0 ? "bg-green-50 text-green-700" : item.change < 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}
                    >
                      {item.changeLabel}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          <p className="text-[11px] text-gray-400 mt-4 text-center">
            <span className="inline-flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold text-gray-500">
                i
              </span>
              Source:
              <a
                href="https://cmci.dti.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                DTI Cities and Municipalities Competitiveness Index (CMCI){" "}
                <FaExternalLinkAlt size={8} />
              </a>
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}

StatisticsPage.displayName = "StatisticsPage";

export default StatisticsPage;
