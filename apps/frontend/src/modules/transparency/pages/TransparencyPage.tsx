import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTimes,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHardHat,
  FaChartLine,
  FaExternalLinkAlt,
  FaStream,
  FaFilter,
} from "react-icons/fa";
import React from "react";
import CountUp from "@/shared/ui/CountUp";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: { province: string; region: string };
  contractor: string;
  startDate: string;
  completionDate: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
}

interface ProjectSummary {
  totalProjects: number;
  completed: number;
  ongoing: number;
  notStarted: number;
  totalBudget: number;
}

interface FinancialReport {
  id: string;
  fiscalYear: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  totalIncome: number;
  totalExpenditures: number;
  netOperatingIncome: number;
  fundBalance: number;
  incomeSources: Array<{ source: string; amount: number; percentage: number }>;
  expenditureAllocations: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  reportDate: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DOT_BG = {
  backgroundImage:
    "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};

const ITEMS_PER_PAGE = 25;

const CATEGORY_BADGES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  Roads: { label: "ROADS", bg: "bg-yellow-100", text: "text-yellow-800" },
  Bridges: { label: "BRIDGES", bg: "bg-purple-100", text: "text-purple-800" },
  "Flood Control and Drainage": {
    label: "FLOOD CONTROL",
    bg: "bg-blue-100",
    text: "text-blue-800",
  },
  "Buildings and Facilities": {
    label: "BUILDINGS",
    bg: "bg-green-100",
    text: "text-green-800",
  },
};

const STATUS_STYLES: Record<string, { pill: string }> = {
  Completed: { pill: "bg-green-100 text-green-800 border border-green-200" },
  "On-Going": { pill: "bg-blue-100 text-blue-800 border border-blue-200" },
  "Not Started": { pill: "bg-gray-100 text-gray-600 border border-gray-200" },
  "For Procurement": {
    pill: "bg-amber-100 text-amber-700 border border-amber-200",
  },
};

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

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

function getStatusStyle(s: string) {
  return (
    STATUS_STYLES[s] ?? {
      pill: "bg-gray-100 text-gray-600 border border-gray-200",
    }
  );
}

function getCategoryBadge(cat: string) {
  return (
    CATEGORY_BADGES[cat] ?? {
      label: cat.toUpperCase(),
      bg: "bg-gray-100",
      text: "text-gray-600",
    }
  );
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchLocalProjects(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ data: Project[]; summary: ProjectSummary; total: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);

  const res = await fetch(`${API_BASE}/api/transparency/projects?${query}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "API error");
  return {
    data: json.data.data,
    summary: json.data.summary,
    total: json.data.pagination.totalCount,
  };
}

async function fetchFinancialReports(): Promise<FinancialReport[]> {
  const res = await fetch(`${API_BASE}/api/transparency/financial-reports`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? "API error");
  return json.data;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Status badge pill */
function StatusBadge({ status }: { status: string }) {
  const s = getStatusStyle(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.pill}`}
    >
      {status}
    </span>
  );
}

/** Category chip */
function CategoryChip({ category }: { category: string }) {
  const b = getCategoryBadge(category);
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${b.bg} ${b.text}`}
    >
      {b.label}
    </span>
  );
}

/** Progress bar (compact, horizontal) */
function ProgressBar({ pct }: { pct: number }) {
  const color =
    pct === 100
      ? "bg-green-500"
      : pct >= 60
        ? "bg-blue-500"
        : pct >= 30
          ? "bg-amber-400"
          : "bg-blue-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-600 w-8 shrink-0 text-right">
        {pct}%
      </span>
    </div>
  );
}

/** Detail row for project modal */
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

// ── Project Detail Modal ──────────────────────────────────────────────────────

function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9999999] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
          <div className="relative pr-8">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <StatusBadge status={project.status} />
              <CategoryChip category={project.category} />
              <span className="text-[11px] text-gray-400 font-mono">
                {project.contractId}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white leading-snug sm:text-base">
              {project.description}
            </h2>
          </div>
        </div>

        {/* scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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

          <div className="space-y-2.5">
            <DetailRow
              icon={FaHardHat}
              label="Contractor"
              value={project.contractor || "N/A"}
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

        <div className="flex-shrink-0 border-t border-neutral-100 px-5 py-3 flex items-center justify-end">
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

// ── Table skeleton row ────────────────────────────────────────────────────────

function TableRowSkeleton() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      <td className="px-4 py-4">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 rounded bg-gray-200" />
          <div className="h-3 w-full max-w-xs rounded bg-gray-200" />
          <div className="h-2.5 w-32 rounded bg-gray-100" />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="h-2.5 w-24 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-2.5 w-28 rounded bg-gray-200" />
      </td>
      <td className="px-4 py-4">
        <div className="h-2 w-24 rounded-full bg-gray-200" />
      </td>
    </tr>
  );
}

// ── Pagination control ────────────────────────────────────────────────────────

function TablePagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 text-xs text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              p === page
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        Next
      </button>
    </div>
  );
}

// ── Infrastructure Investments Section ───────────────────────────────────────

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Roads: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  Bridges: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  "Flood Control and Drainage": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Buildings and Facilities": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
};
const DEFAULT_COL = {
  bg: "bg-gray-50",
  text: "text-gray-600",
  border: "border-gray-200",
};

function InfrastructureCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const col = CATEGORY_COLORS[project.category] ?? DEFAULT_COL;
  const catLabel =
    project.category === "Flood Control and Drainage"
      ? "Flood Control"
      : project.category;
  const fmtBudget = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(project.budget);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-neutral-400 to-neutral-700" />
      <div className="pl-5 pr-5 pt-5 pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-black">
            {project.infraYear || "—"}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold ${col.bg} ${col.text} ${col.border}`}
          >
            <span className="text-[9px]">≡</span> {catLabel}
          </span>
          {project.status === "Completed" && (
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[11px] font-semibold">
              Completed
            </span>
          )}
          {project.status === "On-Going" && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold">
              On-Going
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-gray-900 leading-snug mb-1.5">
          {project.description}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <FaMapMarkerAlt size={10} className="shrink-0 text-gray-400" />
          <span>
            {project.location.province}, {project.location.region}
          </span>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 grid grid-cols-3 divide-x divide-neutral-200">
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Type of Work
            </p>
            <p className="text-xs font-bold text-gray-800 leading-snug">
              {project.programName || project.category}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Contractor
            </p>
            <p className="text-xs font-bold text-gray-800 leading-snug">
              {project.contractor || "TBD"}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">
              Contract Cost
            </p>
            <p className="text-sm font-extrabold text-blue-600">{fmtBudget}</p>
          </div>
        </div>
        {project.status === "On-Going" && project.progress > 0 && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
              <span>Progress</span>
              <span className="font-bold text-gray-700">
                {project.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-blue-600"
                initial={{ width: 0 }}
                whileInView={{ width: `${project.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <a
            href="https://transparency.dpwh.gov.ph/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <FaExternalLinkAlt size={9} />
            Source: DPWH Transparency Portal
          </a>
        </div>
        {project.status === "Completed" && project.completionDate && (
          <span className="text-[11px] text-gray-500 font-mono">
            {formatDate(project.completionDate)}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function InfrastructureSection({ projects }: { projects: Project[] }) {
  const filtered = projects.filter(
    (p) => p.category === "Flood Control and Drainage",
  );
  if (filtered.length === 0) return null;
  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
            <FaBuilding size={10} /> Public Works
          </p>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl leading-tight">
            Flood Control and Drainage Projects
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Major flood control and drainage projects serving the community
          </p>
        </motion.div>
        <div className="space-y-4">
          {filtered.map((p, i) => (
            <InfrastructureCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Budget & Financial Section ────────────────────────────────────────────────

const DONUT_COLORS = [
  "#1d4ed8",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
];

function DonutChart({
  items,
  centerLabel,
}: {
  items: Array<{ label: string; percentage: number }>;
  centerLabel?: string;
}) {
  const size = 130;
  const stroke = 24;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const segments: React.ReactNode[] = [];
  let cum = 0;
  items.forEach((item, i) => {
    const dash = (item.percentage / 100) * circ;
    segments.push(
      <circle
        key={i}
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={DONUT_COLORS[i % DONUT_COLORS.length]}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-cum}
        strokeLinecap="butt"
      />,
    );
    cum += dash;
  });
  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={stroke}
        />
        {segments}
      </svg>
      {centerLabel && (
        <span
          className="absolute text-[9px] font-bold text-gray-400 uppercase tracking-wide"
          style={{ transform: "rotate(90deg)" }}
        >
          {centerLabel}
        </span>
      )}
    </div>
  );
}

const QUARTER_LABELS: Record<string, string> = {
  Q1: "Jan – Mar",
  Q2: "Apr – Jun",
  Q3: "Jul – Sep",
  Q4: "Oct – Dec",
};

const STAT_META = [
  { label: "Total Income", color: "bg-green-500", icon: "↓" },
  { label: "Total Expenditures", color: "bg-amber-500", icon: "↑" },
  { label: "Net Operating Income", color: "bg-blue-500", icon: "≈" },
  { label: "Fund Balance (End)", color: "bg-violet-500", icon: "⊟" },
];

function BudgetSection({ reports }: { reports: FinancialReport[] }) {
  const [activeYear, setActiveYear] = useState("");

  const byYear = reports.reduce<Record<string, FinancialReport[]>>((acc, r) => {
    if (!acc[r.fiscalYear]) acc[r.fiscalYear] = [];
    acc[r.fiscalYear].push(r);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  useEffect(() => {
    if (years.length > 0 && !activeYear) setActiveYear(years[0]);
  }, [years, activeYear]);

  if (reports.length === 0) return null;

  const yearReports = (byYear[activeYear] ?? []).sort((a, b) =>
    a.quarter.localeCompare(b.quarter),
  );
  // Get the latest quarterly report or sum all quarters for the year
  const report = yearReports[yearReports.length - 1];
  if (!report) return null;

  // Calculate total income, IRA share, local share
  const iraSource = report.incomeSources.find((s) =>
    s.source.toLowerCase().includes("ira"),
  );
  const localSources = report.incomeSources.filter(
    (s) => !s.source.toLowerCase().includes("ira"),
  );

  const totalIncome = report.totalIncome;
  const iraAmount = iraSource?.amount ?? totalIncome * 0.5945; // Default to 59.45% if not found
  const localAmount =
    localSources.reduce((sum, s) => sum + s.amount, 0) ?? totalIncome * 0.4055;
  const iraPercentage = iraSource?.percentage ?? 59.45;
  const localPercentage =
    localSources.reduce((sum, s) => sum + s.percentage, 0) ?? 40.55;

  return (
    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
            <FaMoneyBillWave size={10} /> Finance
          </p>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl leading-tight">
            Municipal Income
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Financial standing for fiscal year {report.fiscalYear}
          </p>
        </motion.div>

        {/* Fiscal year pills */}
        {years.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setActiveYear(yr)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeYear === yr
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "bg-white border border-neutral-200 text-gray-600 hover:bg-neutral-50"
                }`}
              >
                FY {yr}
              </button>
            ))}
          </div>
        )}

        {/* Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Annual Income card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0 }}
            className="rounded-xl border border-neutral-200 bg-gradient-to-br from-blue-900 to-blue-800 text-white p-6 shadow-sm"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-blue-200 mb-3">
              <FaChartLine size={11} /> Annual Income
            </p>
            <p className="text-3xl font-black leading-none">
              ₱{(totalIncome / 1_000_000).toFixed(2)} M
            </p>
            <p className="text-xs text-blue-200 mt-2">
              {new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 0,
              }).format(totalIncome)}
            </p>
          </motion.div>

          {/* IRA Share card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
              <FaMoneyBillWave size={11} /> IRA Share
            </p>
            <p className="text-3xl font-black text-gray-900 leading-none">
              ₱{(iraAmount / 1_000_000).toFixed(2)} M
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Internal Revenue Allotment
            </p>
          </motion.div>

          {/* IRA Dependency card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <p className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
              <FaChartLine size={11} /> IRA Dependency
            </p>
            <p className="text-3xl font-black text-gray-900 leading-none">
              {iraPercentage.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">National Tax Share</p>
          </motion.div>
        </div>

        {/* Income Composition */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.21 }}
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold text-gray-700 mb-4">
            Income Composition
          </p>

          {/* Progress bar */}
          <div className="w-full h-10 rounded-lg overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-end px-4"
              style={{ width: `${iraPercentage}%` }}
            >
              <span className="text-xs font-bold text-white">
                IRA {iraPercentage.toFixed(2)}%
              </span>
            </div>
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 flex items-center justify-start px-4"
              style={{ width: `${localPercentage}%` }}
            >
              <span className="text-xs font-bold text-white">
                Local {localPercentage.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-600" />
              <span className="text-xs text-gray-600 font-medium">
                Internal Revenue Allotment
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-xs text-gray-600 font-medium">
                Local Sources
              </span>
            </div>
          </div>
        </motion.div>

        {/* Source */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
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
              Bureau of Local Government Finance (BLGF){" "}
              <FaExternalLinkAlt size={8} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function TransparencyPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState<ProjectSummary>({
    totalProjects: 0,
    completed: 0,
    ongoing: 0,
    notStarted: 0,
    totalBudget: 0,
  });
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>(
    [],
  );

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchLocalProjects({ limit: 500 });
      setProjects(res.data);
      setSummary(res.summary);
    } catch {
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetchFinancialReports()
      .then(setFinancialReports)
      .catch(() => {});
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  const categories = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.category))),
  ];
  const statuses = [
    "All",
    ...Array.from(new Set(projects.map((p) => p.status))),
  ];

  const filtered = projects.filter((p) => {
    const q = debouncedSearch.toLowerCase();
    return (
      (p.description.toLowerCase().includes(q) ||
        p.contractor.toLowerCase().includes(q) ||
        p.contractId.toLowerCase().includes(q)) &&
      (category === "All" || p.category === category) &&
      (status === "All" || p.status === status)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const start = (page - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Budget & Financial Transparency ──────────────────────────── */}
      <BudgetSection reports={financialReports} />

      {/* ── DPWH Header ──────────────────────────────────────────────── */}
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-3">
              National Government Projects
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl leading-tight">
              DPWH Infrastructure Projects
            </h1>
            <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto">
              Implementing Agency: Camarines Sur District Engineering Office ·
              Libmanan, Camarines Sur
            </p>
          </motion.div>

          {/* KPIs */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {[
              { label: "Projects", value: summary.totalProjects },
              { label: "Completed", value: summary.completed },
              { label: "On-Going", value: summary.ongoing },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ₱
                {new Intl.NumberFormat("en-PH", {
                  maximumFractionDigits: 2,
                }).format(summary.totalBudget / 1_000_000_000)}
                B
              </p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mt-0.5">
                Total Investment
              </p>
            </div>
          </div>
          <div className="text-center mt-6">
            <a
              href="https://transparency.dpwh.gov.ph/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
            >
              Visit DPWH Transparency Portal <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <section className="bg-neutral-100 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                {categories.map((c) => {
                  const count =
                    c === "All"
                      ? filtered.length
                      : filtered.filter((p) => p.category === c).length;
                  return (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        category === c
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {c}
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          category === c
                            ? "bg-white/20 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* Status filter */}
              <div className="relative">
                <FaFilter
                  size={10}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-7 pr-6 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <FaSearch
                size={11}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search projects, contractors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes size={10} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Table meta row */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min(start + 1, filtered.length)}–
                  {Math.min(start + ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filtered.length}
                </span>{" "}
                projects
              </p>
              {debouncedSearch && (
                <p className="text-xs text-gray-400">
                  Results for "
                  <span className="font-semibold text-gray-700">
                    {debouncedSearch}
                  </span>
                  "
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider w-[40%]">
                      Contract Description
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider">
                      Contractor
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider">
                      Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <TableRowSkeleton key={i} />
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Something went wrong
                        </p>
                        <p className="text-xs text-gray-400 mb-4">{error}</p>
                        <button
                          onClick={load}
                          className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
                        >
                          Try Again
                        </button>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-gray-300">
                            <FaSearch size={12} className="text-gray-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-600">
                            No projects found
                          </p>
                          <p className="text-xs text-gray-400">
                            Try adjusting your filters or search term.
                          </p>
                          <button
                            onClick={() => {
                              setSearch("");
                              setCategory("All");
                              setStatus("All");
                            }}
                            className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {visible.map((p, idx) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          onClick={() => setSelected(p)}
                          className="cursor-pointer hover:bg-blue-50/40 transition-colors group"
                        >
                          {/* Description */}
                          <td className="px-4 py-3.5 max-w-xs">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-mono text-gray-400">
                                  {p.contractId}
                                </span>
                                <CategoryChip category={p.category} />
                              </div>
                              <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-800 transition-colors">
                                {p.description}
                              </p>
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <FaMapMarkerAlt size={8} />
                                <span>{p.location.province}</span>
                              </div>
                            </div>
                          </td>
                          {/* Contractor */}
                          <td className="px-4 py-3.5">
                            <p className="text-xs text-gray-700 leading-snug">
                              {p.contractor || "TBD"}
                            </p>
                          </td>
                          {/* Cost */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <p className="text-xs font-bold text-gray-900">
                              {formatCurrency(p.budget)}
                            </p>
                            {p.progress > 0 && <ProgressBar pct={p.progress} />}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3.5 text-center">
                            <StatusBadge status={p.status} />
                          </td>
                          {/* Completion date */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span className="text-xs text-gray-600">
                              {formatDate(p.completionDate)}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="border-t border-gray-100">
                <TablePagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>

          {/* Attribution */}
          {!loading && !error && filtered.length > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs text-gray-500 shadow-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white">
                  i
                </span>
                Source:
                <a
                  href="https://transparency.dpwh.gov.ph/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  DPWH Transparency Portal <FaExternalLinkAlt size={8} />
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

      {/* ── Infrastructure Investments ────────────────────────────────── */}
      <InfrastructureSection projects={projects} />
    </div>
  );
}

TransparencyPage.displayName = "TransparencyPage";
export default TransparencyPage;
