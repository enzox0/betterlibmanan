import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { mockStatisticsData } from '../data/mockData';
import CountUp from '@/shared/ui/CountUp';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** SVG radar / spider chart for competitiveness */
function RadarChart({
  data,
}: {
  data: { category: string; score: number; change: number }[];
}) {
  const cx = 120;
  const cy = 120;
  const r = 90;
  const levels = 4;
  const n = data.length;
  const maxScore = 1.5;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const fr = (r * (l + 1)) / levels;
    return Array.from({ length: n }, (_, i) => point(i, fr))
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  });

  const dataPolygon = data
    .map((d, i) => point(i, (Math.min(d.score, maxScore) / maxScore) * r))
    .map(p => `${p.x},${p.y}`)
    .join(' ');

  return (
    <svg viewBox="0 0 240 240" className="w-full max-w-xs mx-auto">
      {/* grid rings */}
      {gridPolygons.map((pts, l) => (
        <polygon key={l} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {/* axis lines */}
      {Array.from({ length: n }, (_, i) => {
        const outer = point(i, r);
        return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {/* data polygon */}
      <polygon points={dataPolygon} fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
      {/* dots */}
      {data.map((d, i) => {
        const p = point(i, (Math.min(d.score, maxScore) / maxScore) * r);
        return <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563eb" />;
      })}
      {/* labels */}
      {data.map((d, i) => {
        const p = point(i, r + 16);
        const anchor = p.x < cx - 4 ? 'end' : p.x > cx + 4 ? 'start' : 'middle';
        return (
          <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle"
            className="fill-gray-600" fontSize="9" fontWeight="600">
            {d.category.split(' ')[0]}
          </text>
        );
      })}
    </svg>
  );
}

/** SVG donut / ring for a single percentage */
function DonutRing({
  pct,
  color = '#2563eb',
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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
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
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontWeight="700" fill="#111827"
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

/** SVG area sparkline for population growth */
function AreaSparkline({ points }: { points: { year: number; pop: number }[] }) {
  const W = 560;
  const H = 120;
  const pad = { l: 36, r: 16, t: 10, b: 28 };
  const minP = Math.min(...points.map(p => p.pop));
  const maxP = Math.max(...points.map(p => p.pop));
  const xs = points.map((_, i) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r));
  const ys = points.map(p =>
    pad.t + ((maxP - p.pop) / (maxP - minP)) * (H - pad.t - pad.b),
  );
  const linePath = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
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
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={p.year}>
          <circle cx={xs[i]} cy={ys[i]} r="3.5" fill="#2563eb" />
          <text x={xs[i]} y={H - pad.b + 12} textAnchor="middle" fontSize="8" fill="#6b7280">{p.year}</text>
          <text x={xs[i]} y={ys[i] - 8} textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600">
            {(p.pop / 1000).toFixed(0)}k
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Horizontal bar for a single barangay row */
function BrgyBar({ name, population, max, rank }: { name: string; population: number; max: number; rank: number }) {
  const pct = Math.round((population / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-right text-xs font-bold text-gray-400">#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-gray-800 truncate">{name}</span>
          <span className="text-xs text-gray-500 ml-2 shrink-0">{population.toLocaleString()}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-600"
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

// ── BrgySection (searchable, sortable, full 75 barangays) ────────────────────

const PAGE_SIZE = 20;

function BrgySection({
  data,
  maxPop,
}: {
  data: { rank: number; name: string; population: number }[];
  maxPop: number;
}) {
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q ? data.filter(b => b.name.toLowerCase().includes(q)) : data;
    return sortAsc ? [...base].reverse() : base;
  }, [data, search, sortAsc]);

  // Reset "show all" whenever filter/sort changes
  const visible = useMemo(() => {
    if (showAll || search.trim()) return filtered;
    return filtered.slice(0, PAGE_SIZE);
  }, [filtered, showAll, search]);

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Distribution</p>
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Population by Barangay</h2>
          <p className="text-sm text-gray-500 mt-1">
            2020 Census of Population — all 75 barangays of Libmanan
          </p>
        </motion.div>

        {/* toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-xs w-full">
            <FaSearch size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search barangay…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-neutral-200 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{filtered.length} barangay{filtered.length !== 1 ? 's' : ''}</span>
            <button
              onClick={() => setSortAsc(v => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-neutral-50 transition-colors"
            >
              {sortAsc ? <FaSortAmountUp size={11} /> : <FaSortAmountDown size={11} />}
              {sortAsc ? 'Least populated' : 'Most populated'}
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
                  transition={{ duration: 0.3, delay: Math.min(i * 0.015, 0.4) }}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 transition-colors"
                >
                  {/* rank badge */}
                  <span className="w-8 shrink-0 text-center text-[11px] font-bold text-gray-400">
                    #{brgy.rank}
                  </span>
                  {/* name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-semibold text-gray-800 truncate">{brgy.name}</span>
                      <span className="text-xs font-medium text-gray-500 ml-3 shrink-0 tabular-nums">
                        {brgy.population.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(brgy.population / maxPop) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: 'easeOut', delay: Math.min(i * 0.01, 0.3) }}
                      />
                    </div>
                  </div>
                  {/* % share */}
                  <span className="w-12 shrink-0 text-right text-[11px] text-gray-400 tabular-nums">
                    {((brgy.population / 112994) * 100).toFixed(2)}%
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <FaSearch size={14} className="mx-auto mb-3 text-neutral-300" />
              <p className="text-sm font-semibold text-neutral-500">No barangay matched</p>
              <button onClick={() => setSearch('')} className="mt-2 text-xs text-blue-600 hover:underline">
                Clear search
              </button>
            </div>
          )}
        </motion.div>

        {/* View more / Show less — only shown when not actively searching */}
        {!search.trim() && filtered.length > PAGE_SIZE && (
          <div className="mt-4 flex justify-center">
            <motion.button
              onClick={() => setShowAll(v => !v)}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200"
            >
              {showAll ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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

        <p className="text-[11px] text-gray-400 mt-4">
          Source: Philippine Statistics Authority (PSA) — 2020 Census; PhilAtlas barangay profiles
        </p>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

const DOT_BG = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
  backgroundSize: '28px 28px',
};

// PSA Census series — Source: Wikipedia / PSA
const populationHistory = [
  { year: 1990, pop: 77565  },
  { year: 1995, pop: 85337  },
  { year: 2000, pop: 88476  },
  { year: 2007, pop: 92839  },
  { year: 2010, pop: 100002 },
  { year: 2015, pop: 108716 },
  { year: 2020, pop: 112994 },
  { year: 2024, pop: 113254 },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function StatisticsPage() {
  const data = mockStatisticsData;
  const maxBrgyPop = Math.max(...data.barangayPopulation.map(b => b.population));
  const sortedBrgy = [...data.barangayPopulation].sort((a, b) => b.population - a.population)
    .map((b, i) => ({ ...b, rank: i + 1 }));

  return (
    <div className="min-h-screen bg-neutral-100">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={DOT_BG} />

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

          {/* quick stats strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 sm:gap-12">
            {data.municipal.map(stat => {
              const strVal = String(stat.value);
              const numeric = parseFloat(strVal.replace(/[^0-9.]/g, ''));
              const isOrdinal = /^(1st|2nd|3rd|\d+th)$/i.test(strVal);
              const isNumeric = !isNaN(numeric) && !isOrdinal;
              return (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {isNumeric ? (
                      <>
                        {strVal.startsWith('₱') && '₱'}
                        <CountUp
                          from={0}
                          to={numeric}
                          separator=","
                          duration={1.8}
                          delay={0.2}
                        />
                        {/[a-zA-Z²³]/.test(strVal) && !strVal.startsWith('₱') && (
                          <span> {strVal.replace(/[0-9,. ]/g, '').trim()}</span>
                        )}
                      </>
                    ) : (
                      strVal
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ── Finance ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Finance</p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">{data.finance.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{data.finance.subtitle}</p>
          </motion.div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Stats cards */}
            <div className="lg:col-span-2 grid gap-4 sm:grid-cols-3">
              {data.finance.stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-blue-700" />
                  <p className="text-xs font-semibold text-gray-500 mb-3">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  {stat.subValue && <p className="text-[11px] text-gray-400 mt-1">{stat.subValue}</p>}
                </motion.div>
              ))}
            </div>

            {/* Donut composition */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center gap-4"
            >
              <p className="text-xs font-semibold text-gray-700 self-start">Income Composition</p>
              <DonutRing pct={data.finance.composition[0].percentage} size={110} stroke={14} label={`${data.finance.composition[0].percentage}%`} />
              <div className="flex flex-wrap justify-center gap-3">
                {data.finance.composition.map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-xs text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">Source: {data.finance.source}</p>
        </div>
      </section>

      {/* ── Population Trend ──────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Growth</p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Population Trends</h2>
            <p className="text-sm text-gray-500 mt-1">Historical growth from 1990 to 2024</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap gap-8 mb-6">
              {[
                { label: '1990 Baseline',   value: 77565,  prefix: '',  suffix: '',     decimals: 0, color: 'text-gray-700' },
                { label: '2024 Population', value: 113254, prefix: '',  suffix: '',     decimals: 0, color: 'text-gray-900' },
                { label: 'Total Growth',    value: 46.1,   prefix: '+', suffix: '%',    decimals: 1, color: 'text-blue-600' },
              ].map(kpi => (
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
                  <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                </div>
              ))}
            </div>
            <AreaSparkline points={populationHistory} />
          </motion.div>

          <p className="text-[11px] text-gray-400 mt-3">Source: Philippine Statistics Authority (PSA)</p>
        </div>
      </section>

      {/* ── Barangay Distribution ─────────────────────────────────────── */}
      <BrgySection data={sortedBrgy} maxPop={maxBrgyPop} />

      {/* ── Economy ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Economy</p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Economic Indicators</h2>
            <p className="text-sm text-gray-500 mt-1">Key economic data and business statistics</p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Indicator cards — 3 cols on lg */}
            <div className="lg:col-span-2 grid gap-4">
              {data.economy.indicators.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm flex items-center gap-4"
                >
                  <div className="shrink-0">
                    <DonutRing
                      pct={
                        stat.label === 'Registered Voters' ? 64
                        : stat.label === 'Agricultural Area' ? 41
                        : 56
                      }
                      size={52} stroke={7}
                    />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    {stat.subLabel && <p className="text-[11px] text-green-600 mt-0.5">{stat.subLabel}</p>}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sectors — horizontal bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-bold text-gray-900 mb-5">Economic Sectors</p>
              <div className="space-y-5">
                {data.economy.sectors.map((sector, i) => (
                  <div key={sector.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700">{sector.name}</span>
                      <span className="text-sm font-bold text-gray-900">{sector.percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${sector.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">Source: {data.economy.source}</p>
        </div>
      </section>

      {/* ── Poverty ───────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Poverty</p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Poverty Statistics</h2>
            <p className="text-sm text-gray-500 mt-1">2021 City and Municipal Level Poverty Estimates</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {data.poverty.map((poverty, i) => (
              <motion.div
                key={poverty.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-600 to-neutral-900" />
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{poverty.year}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-1">
                      <CountUp from={0} to={poverty.rate} duration={1.8} delay={0.1} />%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">90% CI: {poverty.confidenceInterval}</p>
                  </div>
                  <DonutRing pct={poverty.rate} color={poverty.status === 'improved' ? '#16a34a' : '#dc2626'} size={72} stroke={9} label={`${poverty.rate}%`} />
                </div>
                {poverty.change !== 0 && (
                  <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    poverty.change < 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {poverty.change < 0 ? '▼' : '▲'}{' '}
                    <CountUp from={0} to={Math.abs(poverty.change)} duration={1.5} delay={0.2} />% from prior period
                  </div>
                )}
                {poverty.change === 0 && (
                  <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-gray-50 text-gray-600">
                    — Stable
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <p className="text-[11px] text-gray-400 mt-4">Source: Philippine Statistics Authority (PSA) — 2021 Poverty Estimates</p>
        </div>
      </section>

      {/* ── Competitiveness ───────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Competitiveness</p>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Libmanan Competitive Index</h2>
            <p className="text-sm text-gray-500 mt-1">
              Cities and Municipalities Competitiveness Index (CMCI) — 2016–2024
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col items-center"
            >
              <p className="text-sm font-bold text-gray-900 mb-4 self-start">Pillar Scores</p>
              <RadarChart data={data.competitiveness.overview} />
            </motion.div>

            {/* Score cards */}
            <div className="lg:col-span-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {data.competitiveness.overview.map((item, i) => (
                <motion.div
                  key={item.category}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="shrink-0 w-12 text-right">
                    <p className="text-lg font-bold text-gray-900">
                      <CountUp from={0} to={item.score} duration={1.6} delay={i * 0.07} />
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.category}</p>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-blue-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.score / 1.5) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    item.change > 0 ? 'bg-green-50 text-green-700' :
                    item.change < 0 ? 'bg-red-50 text-red-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {item.changeLabel}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-4">Source: {data.competitiveness.source}</p>
        </div>
      </section>

    </div>
  );
}

StatisticsPage.displayName = 'StatisticsPage';

export default StatisticsPage;
