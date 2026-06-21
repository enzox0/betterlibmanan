import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTimes,
  FaRoad,
  FaWater,
  FaBuilding,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHardHat,
  FaChartLine,
  FaExternalLinkAlt,
  FaStream,
  FaTh,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
} from "react-icons/fa";
import React from "react";
import CountUp from "@/shared/ui/CountUp";
import { Project, ProjectSummary, fetchProjects } from "../api";
import { ListRowSkeleton, Pagination } from "@/shared/ui";

// ── Constants ─────────────────────────────────────────────────────────────────

const DOT_BG = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

const ITEMS_PER_PAGE = 20;

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Roads: FaRoad,
  Bridges: FaStream,
  "Flood Control and Drainage": FaWater,
  "Buildings and Facilities": FaBuilding,
};

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Completed: { pill: "bg-neutral-900 text-white", dot: "bg-neutral-900" },
  "On-Going": { pill: "bg-blue-600 text-white", dot: "bg-blue-600" },
  "Not Started": {
    pill: "bg-neutral-200 text-neutral-700",
    dot: "bg-neutral-400",
  },
  "For Procurement": {
    pill: "bg-neutral-500 text-white",
    dot: "bg-neutral-500",
  },
};
const DEFAULT_STATUS = {
  pill: "bg-neutral-200 text-neutral-700",
  dot: "bg-neutral-400",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(n);

const formatDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat] ?? FaBuilding;
const getStatusStyle = (s: string) => STATUS_STYLES[s] ?? DEFAULT_STATUS;

// ── Sub-components ────────────────────────────────────────────────────────────

/** Slim horizontal progress bar */
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="mt-3 pt-3 border-t border-neutral-100">
      <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
        <span>Progress</span>
        <span className="font-bold text-gray-700">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-blue-600"
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/** Pill badge */
function StatusPill({ status }: { status: string }) {
  const s = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.pill}`}
    >
      {status}
    </span>
  );
}

/** Grid card */
function GridCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const Icon = getCategoryIcon(project.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:border-neutral-300 hover:shadow-md hover:-translate-y-0.5"
    >
      {/* left accent stripe */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-400 to-neutral-700" />

      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 transition-colors">
            <Icon className="text-sm" />
          </div>
          <StatusPill status={project.status} />
        </div>

        {/* title */}
        <h3 className="line-clamp-3 text-sm font-bold text-gray-900 leading-snug mb-3">
          {project.description}
        </h3>

        {/* key info */}
        <div className="space-y-1.5 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="shrink-0 text-gray-400" />
            <span className="font-semibold text-gray-800 truncate">
              {formatCurrency(project.budget)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaHardHat className="shrink-0 text-gray-400" />
            <span className="truncate">
              {project.contractor.split("(")[0].trim()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="shrink-0 text-gray-400" />
            <span>{formatDate(project.startDate)}</span>
          </div>
        </div>

        {/* progress */}
        {project.progress > 0 && <ProgressBar pct={project.progress} />}

        {/* footer */}
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-mono">
            {project.contractId}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 group-hover:text-gray-800 transition-colors">
            Details
            <svg
              className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** List row */
function ListRow({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const Icon = getCategoryIcon(project.category);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      className="group relative cursor-pointer flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
    >
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-neutral-400 to-neutral-700" />

      <div className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 transition-colors">
        <Icon className="text-sm" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <StatusPill status={project.status} />
          {project.progress > 0 && (
            <span className="text-[11px] font-bold text-gray-600">
              {project.progress}%
            </span>
          )}
        </div>
        <p className="text-sm font-bold text-gray-900 leading-snug mb-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FaMoneyBillWave className="text-gray-400" />
            {formatCurrency(project.budget)}
          </span>
          <span className="flex items-center gap-1">
            <FaHardHat className="text-gray-400" />
            {project.contractor.split("(")[0].trim()}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-400" />
            {formatDate(project.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <FaMapMarkerAlt className="text-gray-400" />
            {project.location.province}
          </span>
        </div>
        {project.progress > 0 && (
          <div className="mt-2 h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-600"
              initial={{ width: 0 }}
              whileInView={{ width: `${project.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center self-center">
        <svg
          className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </motion.div>
  );
}

/** Project detail modal */
function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const Icon = getCategoryIcon(project.category);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88vh] rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* header */}
        <div className="flex-shrink-0 relative overflow-hidden bg-gray-900 px-6 pt-6 pb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={DOT_BG}
          />

          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
          >
            <FaTimes size={14} />
          </button>

          <div className="relative flex items-start gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
              <Icon className="text-sm" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <StatusPill status={project.status} />
                <span className="text-[11px] text-gray-400 font-mono">
                  {project.contractId}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white leading-snug sm:text-base">
                {project.description}
              </h2>
            </div>
          </div>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* progress */}
          {project.progress > 0 && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">
                  Project Progress
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {project.progress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* financials */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FaMoneyBillWave,
                label: "Total Budget",
                amount: project.budget,
              },
              {
                icon: FaChartLine,
                label: "Amount Paid",
                amount: project.amountPaid,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                  <item.icon size={12} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <p className="text-base font-bold text-gray-900">
                  ₱
                  <CountUp
                    from={0}
                    to={item.amount}
                    duration={1.2}
                    delay={0.1}
                    separator=","
                  />
                </p>
              </div>
            ))}
          </div>

          {/* details grid */}
          <div className="space-y-2.5">
            <DetailRow
              icon={FaHardHat}
              label="Contractor"
              value={project.contractor}
            />
            <DetailRow
              icon={FaMapMarkerAlt}
              label="Location"
              value={`${project.location.province}, ${project.location.region}`}
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <DetailRow
                icon={FaCalendarAlt}
                label="Start Date"
                value={formatDate(project.startDate)}
              />
              <DetailRow
                icon={FaCheckCircle}
                label="Completion"
                value={formatDate(project.completionDate)}
              />
            </div>
            <DetailRow
              icon={FaBuilding}
              label="Category"
              value={project.category}
            />
            <DetailRow
              icon={FaMoneyBillWave}
              label="Program"
              value={project.programName}
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <DetailRow
                icon={FaStream}
                label="Source of Funds"
                value={project.sourceOfFunds}
              />
              <DetailRow
                icon={FaClock}
                label="Infrastructure Year"
                value={project.infraYear}
              />
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex-shrink-0 border-t border-neutral-100 px-5 py-3 flex items-center justify-between">
          <a
            href="https://www.dpwh.gov.ph/dpwh/transparency"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            DPWH Transparency Portal <FaExternalLinkAlt size={9} />
          </a>
          <button
            onClick={onClose}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        <Icon size={11} />
        <span className="text-[11px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function TransparencyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<ProjectSummary>({
    totalProjects: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    totalBudget: 0,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchProjects({
        page: 1,
        limit: 100,
        search: "Libmanan",
        region: "Region V",
        province: "CAMARINES SUR",
      });
      setProjects(res.data.data);
      setSummary(res.data.summary);
    } catch {
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const statuses = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.status))),
  ];

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.description.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q)) &&
      (category === "All" || p.category === category) &&
      (status === "All" || p.status === status)
    );
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);

  const summaryCards = [
    {
      label: "Total Projects",
      value: filtered.length,
      icon: FaBuilding,
      accent: "text-gray-700",
    },
    {
      label: "Completed",
      value: filtered.filter((p) => p.status === "Completed").length,
      icon: FaCheckCircle,
      accent: "text-gray-700",
    },
    {
      label: "On-Going",
      value: filtered.filter((p) => p.status === "On-Going").length,
      icon: FaSpinner,
      accent: "text-blue-600",
    },
    {
      label: "Total Budget",
      value: null,
      budget: filtered.reduce((s, p) => s + p.budget, 0),
      icon: FaMoneyBillWave,
      accent: "text-gray-700",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
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
              DPWH Projects
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto">
              Track infrastructure projects in Libmanan, Camarines Sur
            </p>
          </div>

          {/* hero search */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl backdrop-blur-sm bg-white/10 border border-white/10 pointer-events-none" />
              <FaSearch
                size={13}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <input
                type="text"
                placeholder="Search projects or contractors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="relative z-10 w-full pl-11 pr-10 py-3.5 rounded-xl bg-transparent border border-transparent text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 transition-all"
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
                  >
                    <FaTimes size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* hero KPIs */}
          <div className="mt-8 flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { label: "Total Projects", value: summary.totalProjects },
              { label: "Completed", value: summary.completed },
              { label: "On-Going", value: summary.ongoing },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">
                  <CountUp from={0} to={s.value} duration={1.5} delay={0.3} />
                </p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card, i) => {
              const CardIcon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-400 to-neutral-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        {card.label}
                      </p>
                      {card.value !== null ? (
                        <p className={`text-2xl font-bold ${card.accent}`}>
                          <CountUp
                            from={0}
                            to={card.value}
                            duration={1.2}
                            delay={0.2 + i * 0.08}
                          />
                        </p>
                      ) : (
                        <p className="text-base font-bold text-gray-900">
                          ₱
                          <CountUp
                            from={0}
                            to={card.budget!}
                            duration={1.4}
                            delay={0.2 + i * 0.08}
                            separator=","
                          />
                        </p>
                      )}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100">
                      <CardIcon className={`text-base ${card.accent}`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Filters toolbar ───────────────────────────────────────────── */}
      <section className="bg-white border-y border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <FaFilter
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-8 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <FaClock
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none rounded-xl border border-neutral-200 bg-white py-2 pl-8 pr-7 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              {(category !== "All" || status !== "All") && (
                <button
                  onClick={() => {
                    setCategory("All");
                    setStatus("All");
                  }}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FaTimes size={9} /> Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {start + 1}–{Math.min(start + ITEMS_PER_PAGE, filtered.length)}{" "}
                of {filtered.length}
              </span>
              {/* view toggle */}
              <div className="flex rounded-xl border border-neutral-200 overflow-hidden">
                {(["grid", "list"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
                      view === v
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-gray-600 hover:bg-neutral-50"
                    }`}
                  >
                    {v === "grid" ? <FaTh size={11} /> : <FaList size={11} />}
                    <span className="hidden sm:inline capitalize">{v}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div
              className={
                view === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              }
            >
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <ListRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-100">
                <svg
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">
                Something went wrong
              </p>
              <p className="text-sm text-gray-500 mb-5">{error}</p>
              <button
                onClick={load}
                className="rounded-xl border border-neutral-200 bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-neutral-300">
                <FaSearch size={12} className="text-neutral-400" />
              </div>
              <p className="text-sm font-semibold text-neutral-700 mb-1">
                No projects found
              </p>
              <p className="text-xs text-neutral-400">
                Try adjusting your filters or search term.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setStatus("All");
                }}
                className="mt-3 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${view}-${page}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={
                  view === "grid"
                    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                    : "space-y-3"
                }
              >
                {visible.map((project) =>
                  view === "grid" ? (
                    <GridCard
                      key={project.contractId}
                      project={project}
                      onClick={() => setSelected(project)}
                    />
                  ) : (
                    <ListRow
                      key={project.contractId}
                      project={project}
                      onClick={() => setSelected(project)}
                    />
                  ),
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Pagination ──────────────────────────────────────────── */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-10 bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={filtered.length}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {/* source attribution */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
                  i
                </span>
                Data source:
                <a
                  href="https://www.dpwh.gov.ph/dpwh/transparency"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-800 hover:text-gray-900 inline-flex items-center gap-1 transition-colors"
                >
                  DPWH Transparency Portal <FaExternalLinkAlt size={9} />
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

TransparencyPage.displayName = "TransparencyPage";
export default TransparencyPage;
