import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import React from "react";
import {
  LuX,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuCheck,
  LuChartBar,
  LuTrendingUp,
  LuUsers,
  LuBanknote,
  LuMapPin,
  LuPercent,
  LuStar,
  LuInfo,
  LuRefreshCw,
  LuLoader,
  LuTriangleAlert,
} from "react-icons/lu";
import { useStatisticsStore } from "../store/statisticsStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import type {
  MunicipalStatRecord,
  FinanceStatRecord,
  FinanceCompositionRecord,
  PopulationPointRecord,
  BarangayRecord,
  EconomyIndicatorRecord,
  EconomySectorRecord,
  PovertyEntryRecord,
  CompetitivenessItemRecord,
} from "../services/statistics.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MunicipalStat {
  id: string;
  value: string;
  label: string;
  subLabel: string;
}

interface FinanceStat {
  id: string;
  label: string;
  value: string;
  subValue: string;
}

interface FinanceCompositionItem {
  id: string;
  label: string;
  percentage: number;
  color: string;
}

interface PopulationPoint {
  id: string;
  year: number;
  pop: number;
}

interface BarangayEntry {
  id: string;
  rank: number;
  name: string;
  population: number;
}

interface EconomyIndicator {
  id: string;
  label: string;
  value: string;
  subLabel: string;
}

interface EconomySector {
  id: string;
  name: string;
  percentage: number;
}

interface PovertyEntry {
  id: string;
  year: number;
  rate: number;
  confidenceInterval: string;
  change: number;
  status: "improved" | "worsened" | "stable";
}

interface CompetitivenessItem {
  id: string;
  category: string;
  score: number;
  change: number;
  changeLabel: string;
}

type StatsTab =
  | "overview"
  | "finance"
  | "population"
  | "barangays"
  | "economy"
  | "poverty"
  | "competitiveness";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MUNICIPAL_STATS: MunicipalStat[] = [
  {
    id: "ms-01",
    value: "113,254",
    label: "Population",
    subLabel: "2024 PSA Census",
  },
  {
    id: "ms-02",
    value: "75",
    label: "Barangays",
    subLabel: "Administrative Units",
  },
  {
    id: "ms-03",
    value: "342.82",
    label: "Land Area (km²)",
    subLabel: "Largest municipality in CamSur by pop.",
  },
  {
    id: "ms-04",
    value: "1st",
    label: "Income Class",
    subLabel: "1st Class Municipality",
  },
];

const INITIAL_FINANCE_STATS: FinanceStat[] = [
  {
    id: "fs-01",
    label: "Total Revenue",
    value: "₱440.3M",
    subValue: "₱440,300,000 (2024 SRE)",
  },
  {
    id: "fs-02",
    label: "Total Assets",
    value: "₱1,241M",
    subValue: "Municipal asset base",
  },
  {
    id: "fs-03",
    label: "Total Expenditure",
    value: "₱449.6M",
    subValue: "FY 2024 municipal spending",
  },
];

const INITIAL_FINANCE_COMPOSITION: FinanceCompositionItem[] = [
  {
    id: "fc-01",
    label: "IRA / National Transfer",
    percentage: 62,
    color: "bg-blue-600",
  },
  {
    id: "fc-02",
    label: "Locally-Sourced Revenue",
    percentage: 38,
    color: "bg-gray-700",
  },
];

const INITIAL_POPULATION_HISTORY: PopulationPoint[] = [
  { id: "ph-01", year: 1990, pop: 77565 },
  { id: "ph-02", year: 1995, pop: 85337 },
  { id: "ph-03", year: 2000, pop: 88476 },
  { id: "ph-04", year: 2007, pop: 92839 },
  { id: "ph-05", year: 2010, pop: 100002 },
  { id: "ph-06", year: 2015, pop: 108716 },
  { id: "ph-07", year: 2020, pop: 112994 },
  { id: "ph-08", year: 2024, pop: 113254 },
];

const INITIAL_BARANGAYS: BarangayEntry[] = [
  { id: "brgy-01", rank: 1, name: "San Isidro", population: 4000 },
  { id: "brgy-02", rank: 2, name: "Bahao", population: 3589 },
  { id: "brgy-03", rank: 3, name: "Mambulo Viejo", population: 2506 },
  { id: "brgy-04", rank: 4, name: "Bagacay", population: 1964 },
  { id: "brgy-05", rank: 5, name: "Bagadion", population: 1811 },
  { id: "brgy-06", rank: 6, name: "Sibujo", population: 1796 },
  { id: "brgy-07", rank: 7, name: "Awayan", population: 1567 },
  { id: "brgy-08", rank: 8, name: "San Pablo", population: 1569 },
  { id: "brgy-09", rank: 9, name: "San Vicente", population: 1604 },
  { id: "brgy-10", rank: 10, name: "Bagumbayan", population: 1873 },
  { id: "brgy-11", rank: 11, name: "Busak", population: 1726 },
  { id: "brgy-12", rank: 12, name: "Calabnigan", population: 1396 },
  { id: "brgy-13", rank: 13, name: "Ibid", population: 1508 },
  { id: "brgy-14", rank: 14, name: "Mambayawas", population: 1463 },
  { id: "brgy-15", rank: 15, name: "San Juan", population: 1420 },
  { id: "brgy-16", rank: 16, name: "Udoc", population: 1303 },
  { id: "brgy-17", rank: 17, name: "Umalo", population: 1189 },
  { id: "brgy-18", rank: 18, name: "Begajo Sur", population: 1100 },
  { id: "brgy-19", rank: 19, name: "Mambulo Nuevo", population: 3200 },
  { id: "brgy-20", rank: 20, name: "Mancawayan", population: 1050 },
  { id: "brgy-21", rank: 21, name: "Bigajo Norte", population: 2130 },
  { id: "brgy-22", rank: 22, name: "Bigajo Sur", population: 1800 },
  { id: "brgy-23", rank: 23, name: "Aslong", population: 891 },
  { id: "brgy-24", rank: 24, name: "Bagamelon", population: 979 },
  { id: "brgy-25", rank: 25, name: "Mambalite", population: 799 },
  { id: "brgy-26", rank: 26, name: "Mabini", population: 647 },
  { id: "brgy-27", rank: 27, name: "Libod I", population: 588 },
  { id: "brgy-28", rank: 28, name: "Candami", population: 456 },
  { id: "brgy-29", rank: 29, name: "Cuyapi", population: 336 },
  { id: "brgy-30", rank: 30, name: "Potot", population: 1130 },
  { id: "brgy-31", rank: 31, name: "Rongos", population: 1020 },
  { id: "brgy-32", rank: 32, name: "Salvacion", population: 1240 },
  { id: "brgy-33", rank: 33, name: "Planza", population: 980 },
  { id: "brgy-34", rank: 34, name: "Puro-Batia", population: 1340 },
  { id: "brgy-35", rank: 35, name: "Poblacion", population: 2850 },
  { id: "brgy-36", rank: 36, name: "Palangon", population: 890 },
  { id: "brgy-37", rank: 37, name: "Palong", population: 760 },
  { id: "brgy-38", rank: 38, name: "Patag", population: 870 },
  { id: "brgy-39", rank: 39, name: "Pag-Oring Nuevo", population: 1150 },
  { id: "brgy-40", rank: 40, name: "Pag-Oring Viejo", population: 950 },
  { id: "brgy-41", rank: 41, name: "Padlos", population: 1060 },
  { id: "brgy-42", rank: 42, name: "Mantalisay", population: 1100 },
  { id: "brgy-43", rank: 43, name: "Mandacanan", population: 740 },
  { id: "brgy-44", rank: 44, name: "Malansad Nuevo", population: 1490 },
  { id: "brgy-45", rank: 45, name: "Malansad Viejo", population: 1210 },
  { id: "brgy-46", rank: 46, name: "Malbogon", population: 680 },
  { id: "brgy-47", rank: 47, name: "Malinao", population: 1380 },
  { id: "brgy-48", rank: 48, name: "Inalahan", population: 860 },
  { id: "brgy-49", rank: 49, name: "Handong", population: 930 },
  { id: "brgy-50", rank: 50, name: "Labao", population: 1080 },
];

const INITIAL_BARANGAYS_EXTRA: BarangayEntry[] = [
  { id: "brgy-51", rank: 51, name: "Libod II", population: 510 },
  { id: "brgy-52", rank: 52, name: "Loba-loba", population: 820 },
  { id: "brgy-53", rank: 53, name: "Concepcion", population: 1170 },
  { id: "brgy-54", rank: 54, name: "Danawan", population: 770 },
  { id: "brgy-55", rank: 55, name: "Duang Niog", population: 1320 },
  { id: "brgy-56", rank: 56, name: "Cawawyan", population: 920 },
  { id: "brgy-57", rank: 57, name: "Cambalidio", population: 1040 },
  { id: "brgy-58", rank: 58, name: "Camambugan", population: 1200 },
  { id: "brgy-59", rank: 59, name: "Candato", population: 650 },
  { id: "brgy-60", rank: 60, name: "Caima", population: 1270 },
  { id: "brgy-61", rank: 61, name: "Beguito Nuevo", population: 1310 },
  { id: "brgy-62", rank: 62, name: "Beguito Viejo", population: 1180 },
  { id: "brgy-63", rank: 63, name: "Bikal", population: 1440 },
  { id: "brgy-64", rank: 64, name: "Sigamot", population: 2200 },
  { id: "brgy-65", rank: 65, name: "Station-Church Site", population: 1090 },
  { id: "brgy-66", rank: 66, name: "Taban-Fundado", population: 760 },
  { id: "brgy-67", rank: 67, name: "Tampuhan", population: 930 },
  { id: "brgy-68", rank: 68, name: "Tanag", population: 1160 },
  { id: "brgy-69", rank: 69, name: "Tarum", population: 850 },
  { id: "brgy-70", rank: 70, name: "Tinalmud Nuevo", population: 1020 },
  { id: "brgy-71", rank: 71, name: "Tinalmud Viejo", population: 890 },
  { id: "brgy-72", rank: 72, name: "Tinanquihan", population: 680 },
  { id: "brgy-73", rank: 73, name: "Uson", population: 1100 },
  { id: "brgy-74", rank: 74, name: "Villasocorro", population: 960 },
  { id: "brgy-75", rank: 75, name: "Villadima (Sta. Cruz)", population: 810 },
];

const INITIAL_ECONOMY_INDICATORS: EconomyIndicator[] = [
  {
    id: "ei-01",
    label: "Agricultural Area",
    value: "13,940 ha",
    subLabel: "Flat-land rice & corn production",
  },
  {
    id: "ei-02",
    label: "Mountainous Land",
    value: "19,239 ha",
    subLabel: "Upland forests & highland barangays",
  },
  {
    id: "ei-03",
    label: "Registered Voters",
    value: "72,704",
    subLabel: "2025 elections electorate",
  },
];

const INITIAL_ECONOMY_SECTORS: EconomySector[] = [
  { id: "es-01", name: "Agriculture (Rice, Corn, Root Crops)", percentage: 55 },
  { id: "es-02", name: "Trade & Commerce", percentage: 25 },
  { id: "es-03", name: "Services & Utilities", percentage: 15 },
  { id: "es-04", name: "Industry & Manufacturing", percentage: 5 },
];

const INITIAL_POVERTY: PovertyEntry[] = [
  {
    id: "pv-01",
    year: 2018,
    rate: 29.53,
    confidenceInterval: "24.8% – 34.2%",
    change: -8.47,
    status: "improved",
  },
  {
    id: "pv-02",
    year: 2021,
    rate: 40.72,
    confidenceInterval: "35.6% – 45.8%",
    change: 11.19,
    status: "worsened",
  },
];

const INITIAL_COMPETITIVENESS: CompetitivenessItem[] = [
  {
    id: "ci-01",
    category: "Economic Dynamism",
    score: 0.85,
    change: 10,
    changeLabel: "+10%",
  },
  {
    id: "ci-02",
    category: "Government Efficiency",
    score: 1.2,
    change: -5,
    changeLabel: "-5%",
  },
  {
    id: "ci-03",
    category: "Infrastructure",
    score: 0.72,
    change: 18,
    changeLabel: "+18%",
  },
  {
    id: "ci-04",
    category: "Resiliency",
    score: 1.05,
    change: 3,
    changeLabel: "+3%",
  },
  {
    id: "ci-05",
    category: "Innovation",
    score: 0.58,
    change: 22,
    changeLabel: "+22%",
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const slideVariants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: EASE } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18, ease: EASE } },
};

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
const inputError = `${inputBase} border-red-300 bg-red-50`;

const STATS_TABS: { key: StatsTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <LuChartBar className="h-3.5 w-3.5" />,
  },
  {
    key: "finance",
    label: "Finance",
    icon: <LuBanknote className="h-3.5 w-3.5" />,
  },
  {
    key: "population",
    label: "Population",
    icon: <LuTrendingUp className="h-3.5 w-3.5" />,
  },
  {
    key: "barangays",
    label: "Barangays",
    icon: <LuMapPin className="h-3.5 w-3.5" />,
  },
  {
    key: "economy",
    label: "Economy",
    icon: <LuUsers className="h-3.5 w-3.5" />,
  },
  {
    key: "poverty",
    label: "Poverty",
    icon: <LuPercent className="h-3.5 w-3.5" />,
  },
  {
    key: "competitiveness",
    label: "Competitiveness",
    icon: <LuStar className="h-3.5 w-3.5" />,
  },
];

const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-600" },
  { label: "Indigo", value: "bg-indigo-600" },
  { label: "Gray", value: "bg-gray-700" },
  { label: "Green", value: "bg-green-600" },
  { label: "Red", value: "bg-red-600" },
  { label: "Amber", value: "bg-amber-500" },
];

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  );
}

function SectionCard({
  title,
  description,
  action,
  children,
  hint,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          {hint && (
            <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
              <LuInfo className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">{hint}</p>
            </div>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ onAdd, label }: { onAdd?: () => void; label: string }) {
  return (
    <div className="py-14 text-center">
      <LuChartBar className="mx-auto h-8 w-8 text-gray-200 mb-3" />
      <p className="text-sm font-semibold text-gray-400">No {label} yet</p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
        >
          <LuPlus className="h-3.5 w-3.5" /> Add one
        </button>
      )}
    </div>
  );
}

// ─── Slide Panel ──────────────────────────────────────────────────────────────

interface SlidePanelProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
  formId: string;
  submitLabel: string;
  submitColorClass?: string;
  children: React.ReactNode;
}

function SlidePanel({
  title,
  subtitle,
  accentColor = "from-blue-600 to-blue-800",
  onClose,
  returnFocusRef,
  formId,
  submitLabel,
  submitColorClass = "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  children,
}: SlidePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => returnFocusRef?.current?.focus(), 0);
  }, [onClose, returnFocusRef]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="sp-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.35, ease: EASE }}
        className="fixed inset-0 z-40 bg-black/40 !mt-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <motion.aside
        key="sp-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: EASE }}
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl !mt-0"
      >
        <div
          className={`h-1 bg-gradient-to-r ${accentColor} shrink-0`}
          aria-hidden="true"
        />
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label="Close panel"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
          >
            <LuX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {children}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${submitColorClass}`}
          >
            {submitLabel}
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  label,
  onClose,
  onConfirm,
}: {
  label: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 !mt-0"
        aria-modal="true"
        role="dialog"
        aria-labelledby="stat-del-title"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: EASE }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div
            className="h-1 bg-gradient-to-r from-red-500 to-red-600"
            aria-hidden="true"
          />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <LuTrash2 className="h-5 w-5 text-red-600" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="stat-del-title"
                  className="text-sm font-bold text-gray-900"
                >
                  Remove Entry
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Remove{" "}
                  <span className="font-semibold text-gray-800">{label}</span>?
                  This cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Overview Panel ───────────────────────────────────────────────────────────

function OverviewPanel({
  stats,
  token,
  onCreate,
  onUpdate,
  onDelete,
}: {
  stats: MunicipalStatRecord[];
  token: string;
  onCreate: (
    p: { value: string; label: string; subLabel: string; order: number },
    token: string,
  ) => Promise<MunicipalStatRecord>;
  onUpdate: (
    id: string,
    p: { value: string; label: string; subLabel: string; order: number },
    token: string,
  ) => Promise<MunicipalStatRecord>;
  onDelete: (id: string, token: string) => Promise<void>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<MunicipalStatRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<MunicipalStatRecord | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");
  const [subLabel, setSubLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }
  function markSaved(id: string) {
    setSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openCreate() {
    setValue("");
    setLabel("");
    setSubLabel("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(s: MunicipalStatRecord) {
    setValue(s.value);
    setLabel(s.label);
    setSubLabel(s.subLabel);
    setErrors({});
    setEditTarget(s);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!value.trim()) e.value = "Value is required.";
    if (!label.trim()) e.label = "Label is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      if (panelMode === "create") {
        await onCreate(
          {
            value: value.trim(),
            label: label.trim(),
            subLabel: subLabel.trim(),
            order: 0,
          },
          token,
        );
      } else if (editTarget) {
        await onUpdate(
          editTarget._id,
          {
            value: value.trim(),
            label: label.trim(),
            subLabel: subLabel.trim(),
            order: editTarget.order,
          },
          token,
        );
        markSaved(editTarget._id);
      }
      closePanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget._id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <SectionCard
      title="Hero Stats Strip"
      description="Key figures shown in the Statistics page hero section"
      hint="These appear as the headline numbers in the dark hero banner at the top of the Statistics page."
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
        >
          <LuPlus className="h-4 w-4" /> Add Stat
        </button>
      }
    >
      <div className="divide-y divide-gray-50">
        {stats.length === 0 && <EmptyState onAdd={openCreate} label="stats" />}
        <AnimatePresence>
          {stats.map((s) => (
            <motion.div
              key={s._id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50">
                  <LuChartBar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-gray-900">
                      {s.value}
                    </p>
                    <span className="text-xs font-semibold text-gray-600">
                      {s.label}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(s._id) && (
                        <motion.span
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2, ease: EASE }}
                        >
                          <LuCheck className="h-3 w-3" /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{s.subLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                <button
                  ref={getEditRef(s._id) as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={() => openEdit(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                  aria-label={`Edit ${s.label}`}
                >
                  <LuPencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  aria-label={`Remove ${s.label}`}
                >
                  <LuTrash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Stat" : "Edit Stat"}
            subtitle="Displayed in the Statistics page hero"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="mstat-form"
            submitLabel={panelMode === "create" ? "Add Stat" : "Save Changes"}
          >
            <form
              id="mstat-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="mstat-value"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Display Value <span className="text-red-500">*</span>
                </label>
                <input
                  id="mstat-value"
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setErrors((p) => ({ ...p, value: "" }));
                  }}
                  className={errors.value ? inputError : inputNormal}
                  placeholder="e.g. 113,254 or 1st or 342.82"
                />
                <FieldError id="mstat-value-err" msg={errors.value} />
              </div>
              <div>
                <label
                  htmlFor="mstat-label"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Label <span className="text-red-500">*</span>
                </label>
                <input
                  id="mstat-label"
                  type="text"
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
                    setErrors((p) => ({ ...p, label: "" }));
                  }}
                  className={errors.label ? inputError : inputNormal}
                  placeholder="e.g. Population"
                />
                <FieldError id="mstat-label-err" msg={errors.label} />
              </div>
              <div>
                <label
                  htmlFor="mstat-subLabel"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Sub-label
                </label>
                <input
                  id="mstat-subLabel"
                  type="text"
                  value={subLabel}
                  onChange={(e) => setSubLabel(e.target.value)}
                  className={inputNormal}
                  placeholder="e.g. 2024 PSA Census"
                />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.label}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              onDelete(deleteTarget._id, token).catch(() => {});
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Finance Panel ────────────────────────────────────────────────────────────

function FinancePanel({
  stats,
  composition,
  token,
  onCreateStat,
  onUpdateStat,
  onDeleteStat,
  onCreateComp,
  onUpdateComp,
  onDeleteComp,
}: {
  stats: FinanceStatRecord[];
  composition: FinanceCompositionRecord[];
  token: string;
  onCreateStat: (
    p: { label: string; value: string; subValue: string; order: number },
    token: string,
  ) => Promise<FinanceStatRecord>;
  onUpdateStat: (
    id: string,
    p: { label: string; value: string; subValue: string; order: number },
    token: string,
  ) => Promise<FinanceStatRecord>;
  onDeleteStat: (id: string, token: string) => Promise<void>;
  onCreateComp: (
    p: { label: string; percentage: number; color: string; order: number },
    token: string,
  ) => Promise<FinanceCompositionRecord>;
  onUpdateComp: (
    id: string,
    p: { label: string; percentage: number; color: string; order: number },
    token: string,
  ) => Promise<FinanceCompositionRecord>;
  onDeleteComp: (id: string, token: string) => Promise<void>;
}) {
  // ── Finance Stats ──
  const [statPanel, setStatPanel] = useState<null | "create" | "edit">(null);
  const [statTarget, setStatTarget] = useState<FinanceStatRecord | null>(null);
  const [statDeleteTarget, setStatDeleteTarget] =
    useState<FinanceStatRecord | null>(null);
  const [statSavedIds, setStatSavedIds] = useState<Set<string>>(new Set());
  const [statSubmitting, setStatSubmitting] = useState(false);
  const addStatRef = useRef<HTMLButtonElement>(null);
  const [fLabel, setFLabel] = useState("");
  const [fValue, setFValue] = useState("");
  const [fSubValue, setFSubValue] = useState("");
  const [statErrors, setStatErrors] = useState<Record<string, string>>({});

  function markStatSaved(id: string) {
    setStatSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setStatSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openStatCreate() {
    setFLabel("");
    setFValue("");
    setFSubValue("");
    setStatErrors({});
    setStatTarget(null);
    setStatPanel("create");
  }
  function openStatEdit(s: FinanceStatRecord) {
    setFLabel(s.label);
    setFValue(s.value);
    setFSubValue(s.subValue);
    setStatErrors({});
    setStatTarget(s);
    setStatPanel("edit");
  }
  function closeStatPanel() {
    setStatPanel(null);
    setStatTarget(null);
  }
  async function handleStatSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!fLabel.trim()) e.fLabel = "Label is required.";
    if (!fValue.trim()) e.fValue = "Value is required.";
    if (Object.keys(e).length) {
      setStatErrors(e);
      return;
    }
    setStatSubmitting(true);
    try {
      if (statPanel === "create") {
        await onCreateStat(
          {
            label: fLabel.trim(),
            value: fValue.trim(),
            subValue: fSubValue.trim(),
            order: 0,
          },
          token,
        );
      } else if (statTarget) {
        await onUpdateStat(
          statTarget._id,
          {
            label: fLabel.trim(),
            value: fValue.trim(),
            subValue: fSubValue.trim(),
            order: statTarget.order,
          },
          token,
        );
        markStatSaved(statTarget._id);
      }
      closeStatPanel();
    } catch {
      // errors surfaced via store
    } finally {
      setStatSubmitting(false);
    }
  }

  // ── Composition ──
  const [compPanel, setCompPanel] = useState<null | "create" | "edit">(null);
  const [compTarget, setCompTarget] = useState<FinanceCompositionRecord | null>(
    null,
  );
  const [compDeleteTarget, setCompDeleteTarget] =
    useState<FinanceCompositionRecord | null>(null);
  const [compSubmitting, setCompSubmitting] = useState(false);
  const addCompRef = useRef<HTMLButtonElement>(null);
  const [cLabel, setCLabel] = useState("");
  const [cPct, setCPct] = useState("50");
  const [cColor, setCColor] = useState("bg-blue-600");
  const [compErrors, setCompErrors] = useState<Record<string, string>>({});

  function openCompCreate() {
    setCLabel("");
    setCPct("50");
    setCColor("bg-blue-600");
    setCompErrors({});
    setCompTarget(null);
    setCompPanel("create");
  }
  function openCompEdit(c: FinanceCompositionRecord) {
    setCLabel(c.label);
    setCPct(c.percentage.toString());
    setCColor(c.color);
    setCompErrors({});
    setCompTarget(c);
    setCompPanel("edit");
  }
  function closeCompPanel() {
    setCompPanel(null);
    setCompTarget(null);
  }
  async function handleCompSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!cLabel.trim()) e.cLabel = "Label is required.";
    if (!cPct.trim() || isNaN(Number(cPct)))
      e.cPct = "Valid percentage required.";
    if (Object.keys(e).length) {
      setCompErrors(e);
      return;
    }
    setCompSubmitting(true);
    try {
      if (compPanel === "create") {
        await onCreateComp(
          {
            label: cLabel.trim(),
            percentage: Math.min(100, Math.max(0, Number(cPct))),
            color: cColor,
            order: 0,
          },
          token,
        );
      } else if (compTarget) {
        await onUpdateComp(
          compTarget._id,
          {
            label: cLabel.trim(),
            percentage: Math.min(100, Math.max(0, Number(cPct))),
            color: cColor,
            order: compTarget.order,
          },
          token,
        );
      }
      closeCompPanel();
    } catch {
      // errors surfaced via store
    } finally {
      setCompSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Finance Stats */}
      <SectionCard
        title="Finance Stats"
        description="Revenue, assets, and expenditure cards"
        hint="Shown as the three metric cards in the Finance section of the Statistics page."
        action={
          <button
            ref={addStatRef}
            type="button"
            onClick={openStatCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Stat
          </button>
        }
      >
        <div className="divide-y divide-gray-50">
          {stats.length === 0 && (
            <EmptyState onAdd={openStatCreate} label="finance stats" />
          )}
          <AnimatePresence>
            {stats.map((s) => (
              <motion.div
                key={s._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-green-100 bg-green-50">
                    <LuBanknote className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-base font-bold text-gray-900">
                        {s.value}
                      </p>
                      <AnimatePresence>
                        {statSavedIds.has(s._id) && (
                          <motion.span
                            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.2, ease: EASE }}
                          >
                            <LuCheck className="h-3 w-3" /> Saved
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      {s.label}
                    </p>
                    <p className="text-xs text-gray-400">{s.subValue}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => openStatEdit(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatDeleteTarget(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {statPanel && (
            <SlidePanel
              title={
                statPanel === "create"
                  ? "Add Finance Stat"
                  : "Edit Finance Stat"
              }
              subtitle="Displayed in the Finance section"
              accentColor="from-green-600 to-green-800"
              onClose={closeStatPanel}
              returnFocusRef={addStatRef}
              formId="fstat-form"
              submitLabel={statPanel === "create" ? "Add Stat" : "Save Changes"}
              submitColorClass="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
              <form
                id="fstat-form"
                onSubmit={handleStatSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="fs-label"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fs-label"
                    type="text"
                    value={fLabel}
                    onChange={(e) => {
                      setFLabel(e.target.value);
                      setStatErrors((p) => ({ ...p, fLabel: "" }));
                    }}
                    className={statErrors.fLabel ? inputError : inputNormal}
                    placeholder="e.g. Total Revenue"
                  />
                  <FieldError id="fs-label-err" msg={statErrors.fLabel} />
                </div>
                <div>
                  <label
                    htmlFor="fs-value"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fs-value"
                    type="text"
                    value={fValue}
                    onChange={(e) => {
                      setFValue(e.target.value);
                      setStatErrors((p) => ({ ...p, fValue: "" }));
                    }}
                    className={statErrors.fValue ? inputError : inputNormal}
                    placeholder="e.g. ₱440.3M"
                  />
                  <FieldError id="fs-value-err" msg={statErrors.fValue} />
                </div>
                <div>
                  <label
                    htmlFor="fs-subValue"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Sub-value / Note
                  </label>
                  <input
                    id="fs-subValue"
                    type="text"
                    value={fSubValue}
                    onChange={(e) => setFSubValue(e.target.value)}
                    className={inputNormal}
                    placeholder="e.g. ₱440,300,000 (2024 SRE)"
                  />
                </div>
              </form>
            </SlidePanel>
          )}
          {statDeleteTarget && (
            <DeleteConfirmDialog
              label={statDeleteTarget.label}
              onClose={() => setStatDeleteTarget(null)}
              onConfirm={() => {
                onDeleteStat(statDeleteTarget._id, token).catch(() => {});
                setStatDeleteTarget(null);
              }}
            />
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Income Composition */}
      <SectionCard
        title="Income Composition"
        description="Donut chart segments for the income composition widget"
        action={
          <button
            ref={addCompRef}
            type="button"
            onClick={openCompCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Segment
          </button>
        }
      >
        <div className="divide-y divide-gray-50">
          {composition.length === 0 && (
            <EmptyState onAdd={openCompCreate} label="segments" />
          )}
          <AnimatePresence>
            {composition.map((c) => (
              <motion.div
                key={c._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-4 w-4 rounded-full shrink-0 ${c.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {c.label}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[160px]">
                        <div
                          className={`h-full rounded-full ${c.color}`}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-600">
                        {c.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => openCompEdit(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompDeleteTarget(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {compPanel && (
            <SlidePanel
              title={
                compPanel === "create"
                  ? "Add Composition Segment"
                  : "Edit Segment"
              }
              subtitle="Displayed in the income donut chart"
              accentColor="from-blue-600 to-blue-800"
              onClose={closeCompPanel}
              returnFocusRef={addCompRef}
              formId="comp-form"
              submitLabel={
                compPanel === "create" ? "Add Segment" : "Save Changes"
              }
            >
              <form
                id="comp-form"
                onSubmit={handleCompSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="comp-label"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="comp-label"
                    type="text"
                    value={cLabel}
                    onChange={(e) => {
                      setCLabel(e.target.value);
                      setCompErrors((p) => ({ ...p, cLabel: "" }));
                    }}
                    className={compErrors.cLabel ? inputError : inputNormal}
                    placeholder="e.g. IRA / National Transfer"
                  />
                  <FieldError id="comp-label-err" msg={compErrors.cLabel} />
                </div>
                <div>
                  <label
                    htmlFor="comp-pct"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Percentage (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="comp-pct"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={cPct}
                      onChange={(e) => setCPct(e.target.value)}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-sm font-bold text-gray-800 w-10 text-right">
                      {cPct}%
                    </span>
                  </div>
                  <FieldError id="comp-pct-err" msg={compErrors.cPct} />
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCColor(opt.value)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${cColor === opt.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full ${opt.value}`}
                        />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </SlidePanel>
          )}
          {compDeleteTarget && (
            <DeleteConfirmDialog
              label={compDeleteTarget.label}
              onClose={() => setCompDeleteTarget(null)}
              onConfirm={() => {
                onDeleteComp(compDeleteTarget._id, token).catch(() => {});
                setCompDeleteTarget(null);
              }}
            />
          )}
        </AnimatePresence>
      </SectionCard>
    </div>
  );
}

// ─── Population Panel ─────────────────────────────────────────────────────────

function PopulationPanel({
  points,
  token,
  onCreate,
  onUpdate,
  onDelete,
}: {
  points: PopulationPointRecord[];
  token: string;
  onCreate: (
    p: { year: number; pop: number },
    token: string,
  ) => Promise<PopulationPointRecord>;
  onUpdate: (
    id: string,
    p: { year: number; pop: number },
    token: string,
  ) => Promise<PopulationPointRecord>;
  onDelete: (id: string, token: string) => Promise<void>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<PopulationPointRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<PopulationPointRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [pYear, setPYear] = useState("");
  const [pPop, setPPop] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function markSaved(id: string) {
    setSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openCreate() {
    setPYear("");
    setPPop("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(p: PopulationPointRecord) {
    setPYear(p.year.toString());
    setPPop(p.pop.toString());
    setErrors({});
    setEditTarget(p);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!pYear.trim() || isNaN(Number(pYear)))
      e.pYear = "Valid year is required.";
    if (!pPop.trim() || isNaN(Number(pPop)))
      e.pPop = "Valid population is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      if (panelMode === "create") {
        await onCreate({ year: Number(pYear), pop: Number(pPop) }, token);
      } else if (editTarget) {
        await onUpdate(
          editTarget._id,
          { year: Number(pYear), pop: Number(pPop) },
          token,
        );
        markSaved(editTarget._id);
      }
      closePanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Population History"
      description="Data points for the area sparkline chart"
      hint="Each row represents a census year. The public page renders these as an area chart."
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
        >
          <LuPlus className="h-4 w-4" /> Add Data Point
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Population
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Trend
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-gray-50"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            {points.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState onAdd={openCreate} label="data points" />
                </td>
              </tr>
            )}
            <AnimatePresence>
              {points.map((p, idx) => {
                const prev = idx > 0 ? points[idx - 1] : null;
                const growth = prev
                  ? (((p.pop - prev.pop) / prev.pop) * 100).toFixed(1)
                  : null;
                return (
                  <motion.tr
                    key={p._id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {savedIds.has(p._id) && (
                            <motion.span
                              className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 ring-1 ring-green-200"
                              initial={{ opacity: 0, scale: 0.85 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.85 }}
                              transition={{ duration: 0.2 }}
                            >
                              <LuCheck className="h-2.5 w-2.5" /> Saved
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span className="font-bold text-gray-900">
                          {p.year}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-semibold text-gray-700 tabular-nums">
                      {p.pop.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      {growth !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${Number(growth) >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
                        >
                          {Number(growth) >= 0 ? "▲" : "▼"}{" "}
                          {Math.abs(Number(growth))}%
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">Baseline</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          <LuPencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                          <LuTrash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add Data Point" : "Edit Data Point"
            }
            subtitle="Population census data point"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="pop-form"
            submitLabel={
              panelMode === "create" ? "Add Data Point" : "Save Changes"
            }
          >
            <form
              id="pop-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="pop-year"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Census Year <span className="text-red-500">*</span>
                </label>
                <input
                  id="pop-year"
                  type="number"
                  min="1900"
                  max="2100"
                  value={pYear}
                  onChange={(e) => {
                    setPYear(e.target.value);
                    setErrors((p) => ({ ...p, pYear: "" }));
                  }}
                  className={errors.pYear ? inputError : inputNormal}
                  placeholder="e.g. 2020"
                />
                <FieldError id="pop-year-err" msg={errors.pYear} />
              </div>
              <div>
                <label
                  htmlFor="pop-pop"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Population Count <span className="text-red-500">*</span>
                </label>
                <input
                  id="pop-pop"
                  type="number"
                  min="0"
                  value={pPop}
                  onChange={(e) => {
                    setPPop(e.target.value);
                    setErrors((p) => ({ ...p, pPop: "" }));
                  }}
                  className={errors.pPop ? inputError : inputNormal}
                  placeholder="e.g. 112994"
                />
                <FieldError id="pop-pop-err" msg={errors.pPop} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={`${deleteTarget.year} (${deleteTarget.pop.toLocaleString()})`}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              onDelete(deleteTarget._id, token).catch(() => {});
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Barangays Panel ──────────────────────────────────────────────────────────

function BarangaysPanel({
  barangays,
  token,
  onCreate,
  onUpdate,
  onDelete,
}: {
  barangays: BarangayRecord[];
  token: string;
  onCreate: (
    p: { name: string; population: number },
    token: string,
  ) => Promise<BarangayRecord[]>;
  onUpdate: (
    id: string,
    p: { name: string; population: number },
    token: string,
  ) => Promise<BarangayRecord[]>;
  onDelete: (id: string, token: string) => Promise<void>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<BarangayRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BarangayRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [bName, setBName] = useState("");
  const [bPop, setBPop] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function markSaved(id: string) {
    setSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openCreate() {
    setBName("");
    setBPop("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(b: BarangayRecord) {
    setBName(b.name);
    setBPop(b.population.toString());
    setErrors({});
    setEditTarget(b);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!bName.trim()) e.bName = "Name is required.";
    if (!bPop.trim() || isNaN(Number(bPop)))
      e.bPop = "Valid population is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSubmitting(true);
    try {
      if (panelMode === "create") {
        await onCreate({ name: bName.trim(), population: Number(bPop) }, token);
      } else if (editTarget) {
        const updated = await onUpdate(
          editTarget._id,
          { name: bName.trim(), population: Number(bPop) },
          token,
        );
        const fresh = updated.find((b) => b._id === editTarget._id);
        if (fresh) markSaved(fresh._id);
      }
      closePanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = barangays.filter(
    (b) =>
      search.trim() === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()),
  );

  const maxPop = Math.max(...barangays.map((b) => b.population), 1);

  return (
    <SectionCard
      title="Barangay Population"
      description="All 75 barangays — ranks are auto-calculated by population"
      hint="Ranks are automatically recalculated whenever a barangay's population is updated or a barangay is added/removed."
      action={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search barangay…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
            />
          </div>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Barangay
          </button>
        </div>
      }
    >
      {/* Mobile search */}
      <div className="px-6 pt-4 pb-0 sm:hidden">
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search barangay…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-50">
        <span className="text-xs text-gray-400">
          {filtered.length} of {barangays.length} barangays
        </span>
      </div>
      <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">
            No barangays matched your search.
          </div>
        )}
        <AnimatePresence>
          {filtered.map((b) => (
            <motion.div
              key={b._id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 transition-colors"
            >
              <span className="w-8 shrink-0 text-center text-[11px] font-bold text-gray-400">
                #{b.rank}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {b.name}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(b._id) && (
                        <motion.span
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 ring-1 ring-green-200"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                        >
                          <LuCheck className="h-2.5 w-2.5" /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0 ml-2 tabular-nums">
                    {b.population.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(b.population / maxPop) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <LuPencil className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(b)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Barangay" : "Edit Barangay"}
            subtitle="Rank is auto-calculated from population"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="brgy-form"
            submitLabel={
              panelMode === "create" ? "Add Barangay" : "Save Changes"
            }
          >
            <form
              id="brgy-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="brgy-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Barangay Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="brgy-name"
                  type="text"
                  value={bName}
                  onChange={(e) => {
                    setBName(e.target.value);
                    setErrors((p) => ({ ...p, bName: "" }));
                  }}
                  className={errors.bName ? inputError : inputNormal}
                  placeholder="e.g. San Isidro"
                />
                <FieldError id="brgy-name-err" msg={errors.bName} />
              </div>
              <div>
                <label
                  htmlFor="brgy-pop"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Population (2020 Census){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="brgy-pop"
                  type="number"
                  min="0"
                  value={bPop}
                  onChange={(e) => {
                    setBPop(e.target.value);
                    setErrors((p) => ({ ...p, bPop: "" }));
                  }}
                  className={errors.bPop ? inputError : inputNormal}
                  placeholder="e.g. 4000"
                />
                <FieldError id="brgy-pop-err" msg={errors.bPop} />
                <p className="mt-1 text-xs text-gray-400">
                  Population rank is recalculated automatically after save.
                </p>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              onDelete(deleteTarget._id, token).catch(() => {});
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Economy Panel ────────────────────────────────────────────────────────────

function EconomyPanel({
  indicators,
  sectors,
  token,
  onCreateIndicator,
  onUpdateIndicator,
  onDeleteIndicator,
  onCreateSector,
  onUpdateSector,
  onDeleteSector,
}: {
  indicators: EconomyIndicatorRecord[];
  sectors: EconomySectorRecord[];
  token: string;
  onCreateIndicator: (
    p: { label: string; value: string; subLabel: string; order: number },
    token: string,
  ) => Promise<EconomyIndicatorRecord>;
  onUpdateIndicator: (
    id: string,
    p: { label: string; value: string; subLabel: string; order: number },
    token: string,
  ) => Promise<EconomyIndicatorRecord>;
  onDeleteIndicator: (id: string, token: string) => Promise<void>;
  onCreateSector: (
    p: { name: string; percentage: number; order: number },
    token: string,
  ) => Promise<EconomySectorRecord>;
  onUpdateSector: (
    id: string,
    p: { name: string; percentage: number; order: number },
    token: string,
  ) => Promise<EconomySectorRecord>;
  onDeleteSector: (id: string, token: string) => Promise<void>;
}) {
  // Indicators
  const [indPanel, setIndPanel] = useState<null | "create" | "edit">(null);
  const [indTarget, setIndTarget] = useState<EconomyIndicatorRecord | null>(
    null,
  );
  const [indDelete, setIndDelete] = useState<EconomyIndicatorRecord | null>(
    null,
  );
  const [indSaved, setIndSaved] = useState<Set<string>>(new Set());
  const [indSubmitting, setIndSubmitting] = useState(false);
  const addIndRef = useRef<HTMLButtonElement>(null);
  const [iLabel, setILabel] = useState("");
  const [iValue, setIValue] = useState("");
  const [iSub, setISub] = useState("");
  const [iErrors, setIErrors] = useState<Record<string, string>>({});

  function markIndSaved(id: string) {
    setIndSaved((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setIndSaved((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openIndCreate() {
    setILabel("");
    setIValue("");
    setISub("");
    setIErrors({});
    setIndTarget(null);
    setIndPanel("create");
  }
  function openIndEdit(i: EconomyIndicatorRecord) {
    setILabel(i.label);
    setIValue(i.value);
    setISub(i.subLabel);
    setIErrors({});
    setIndTarget(i);
    setIndPanel("edit");
  }
  function closeIndPanel() {
    setIndPanel(null);
    setIndTarget(null);
  }
  async function handleIndSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!iLabel.trim()) e.iLabel = "Label is required.";
    if (!iValue.trim()) e.iValue = "Value is required.";
    if (Object.keys(e).length) {
      setIErrors(e);
      return;
    }
    setIndSubmitting(true);
    try {
      if (indPanel === "create") {
        await onCreateIndicator(
          {
            label: iLabel.trim(),
            value: iValue.trim(),
            subLabel: iSub.trim(),
            order: 0,
          },
          token,
        );
      } else if (indTarget) {
        await onUpdateIndicator(
          indTarget._id,
          {
            label: iLabel.trim(),
            value: iValue.trim(),
            subLabel: iSub.trim(),
            order: indTarget.order,
          },
          token,
        );
        markIndSaved(indTarget._id);
      }
      closeIndPanel();
    } catch {
      // errors surfaced via store
    } finally {
      setIndSubmitting(false);
    }
  }

  // Sectors
  const [secPanel, setSecPanel] = useState<null | "create" | "edit">(null);
  const [secTarget, setSecTarget] = useState<EconomySectorRecord | null>(null);
  const [secDelete, setSecDelete] = useState<EconomySectorRecord | null>(null);
  const [secSubmitting, setSecSubmitting] = useState(false);
  const addSecRef = useRef<HTMLButtonElement>(null);
  const [sName, setSName] = useState("");
  const [sPct, setSPct] = useState("10");
  const [sErrors, setSErrors] = useState<Record<string, string>>({});

  function openSecCreate() {
    setSName("");
    setSPct("10");
    setSErrors({});
    setSecTarget(null);
    setSecPanel("create");
  }
  function openSecEdit(s: EconomySectorRecord) {
    setSName(s.name);
    setSPct(s.percentage.toString());
    setSErrors({});
    setSecTarget(s);
    setSecPanel("edit");
  }
  function closeSecPanel() {
    setSecPanel(null);
    setSecTarget(null);
  }
  async function handleSecSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!sName.trim()) e.sName = "Name is required.";
    if (!sPct.trim() || isNaN(Number(sPct)))
      e.sPct = "Valid percentage required.";
    if (Object.keys(e).length) {
      setSErrors(e);
      return;
    }
    setSecSubmitting(true);
    try {
      if (secPanel === "create") {
        await onCreateSector(
          {
            name: sName.trim(),
            percentage: Math.min(100, Math.max(0, Number(sPct))),
            order: 0,
          },
          token,
        );
      } else if (secTarget) {
        await onUpdateSector(
          secTarget._id,
          {
            name: sName.trim(),
            percentage: Math.min(100, Math.max(0, Number(sPct))),
            order: secTarget.order,
          },
          token,
        );
      }
      closeSecPanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSecSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Indicators */}
      <SectionCard
        title="Economy Indicators"
        description="Key figures shown alongside the donut rings in the Economy section"
        action={
          <button
            ref={addIndRef}
            type="button"
            onClick={openIndCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Indicator
          </button>
        }
      >
        <div className="divide-y divide-gray-50">
          {indicators.length === 0 && (
            <EmptyState onAdd={openIndCreate} label="indicators" />
          )}
          <AnimatePresence>
            {indicators.map((ind) => (
              <motion.div
                key={ind._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50">
                    <LuUsers className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">
                        {ind.value}
                      </p>
                      <AnimatePresence>
                        {indSaved.has(ind._id) && (
                          <motion.span
                            className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.2, ease: EASE }}
                          >
                            <LuCheck className="h-3 w-3" /> Saved
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      {ind.label}
                    </p>
                    <p className="text-xs text-gray-400">{ind.subLabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => openIndEdit(ind)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndDelete(ind)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {indPanel && (
            <SlidePanel
              title={indPanel === "create" ? "Add Indicator" : "Edit Indicator"}
              subtitle="Displayed in the Economy section"
              accentColor="from-amber-500 to-amber-700"
              onClose={closeIndPanel}
              returnFocusRef={addIndRef}
              formId="ind-form"
              submitLabel={
                indPanel === "create" ? "Add Indicator" : "Save Changes"
              }
              submitColorClass="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
            >
              <form
                id="ind-form"
                onSubmit={handleIndSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="ind-label"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ind-label"
                    type="text"
                    value={iLabel}
                    onChange={(e) => {
                      setILabel(e.target.value);
                      setIErrors((p) => ({ ...p, iLabel: "" }));
                    }}
                    className={iErrors.iLabel ? inputError : inputNormal}
                    placeholder="e.g. Agricultural Area"
                  />
                  <FieldError id="ind-label-err" msg={iErrors.iLabel} />
                </div>
                <div>
                  <label
                    htmlFor="ind-value"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="ind-value"
                    type="text"
                    value={iValue}
                    onChange={(e) => {
                      setIValue(e.target.value);
                      setIErrors((p) => ({ ...p, iValue: "" }));
                    }}
                    className={iErrors.iValue ? inputError : inputNormal}
                    placeholder="e.g. 13,940 ha"
                  />
                  <FieldError id="ind-value-err" msg={iErrors.iValue} />
                </div>
                <div>
                  <label
                    htmlFor="ind-sub"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Sub-label
                  </label>
                  <input
                    id="ind-sub"
                    type="text"
                    value={iSub}
                    onChange={(e) => setISub(e.target.value)}
                    className={inputNormal}
                    placeholder="e.g. Flat-land rice & corn production"
                  />
                </div>
              </form>
            </SlidePanel>
          )}
          {indDelete && (
            <DeleteConfirmDialog
              label={indDelete.label}
              onClose={() => setIndDelete(null)}
              onConfirm={() => {
                onDeleteIndicator(indDelete._id, token).catch(() => {});
                setIndDelete(null);
              }}
            />
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Sectors */}
      <SectionCard
        title="Economic Sectors"
        description="Horizontal bar chart segments for the Economic Sectors widget"
        action={
          <button
            ref={addSecRef}
            type="button"
            onClick={openSecCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Sector
          </button>
        }
      >
        <div className="divide-y divide-gray-50">
          {sectors.length === 0 && (
            <EmptyState onAdd={openSecCreate} label="sectors" />
          )}
          <AnimatePresence>
            {sectors.map((s) => (
              <motion.div
                key={s._id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {s.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900 ml-3 shrink-0">
                      {s.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => openSecEdit(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setSecDelete(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {secPanel && (
            <SlidePanel
              title={secPanel === "create" ? "Add Sector" : "Edit Sector"}
              subtitle="Displayed in the Economy section bar chart"
              accentColor="from-blue-600 to-blue-800"
              onClose={closeSecPanel}
              returnFocusRef={addSecRef}
              formId="sec-form"
              submitLabel={
                secPanel === "create" ? "Add Sector" : "Save Changes"
              }
            >
              <form
                id="sec-form"
                onSubmit={handleSecSubmit}
                noValidate
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="sec-name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Sector Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="sec-name"
                    type="text"
                    value={sName}
                    onChange={(e) => {
                      setSName(e.target.value);
                      setSErrors((p) => ({ ...p, sName: "" }));
                    }}
                    className={sErrors.sName ? inputError : inputNormal}
                    placeholder="e.g. Agriculture (Rice, Corn)"
                  />
                  <FieldError id="sec-name-err" msg={sErrors.sName} />
                </div>
                <div>
                  <label
                    htmlFor="sec-pct"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Share (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      id="sec-pct"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={sPct}
                      onChange={(e) => setSPct(e.target.value)}
                      className="flex-1 accent-blue-600"
                    />
                    <span className="text-sm font-bold text-gray-800 w-10 text-right">
                      {sPct}%
                    </span>
                  </div>
                  <FieldError id="sec-pct-err" msg={sErrors.sPct} />
                </div>
              </form>
            </SlidePanel>
          )}
          {secDelete && (
            <DeleteConfirmDialog
              label={secDelete.name}
              onClose={() => setSecDelete(null)}
              onConfirm={() => {
                onDeleteSector(secDelete._id, token).catch(() => {});
                setSecDelete(null);
              }}
            />
          )}
        </AnimatePresence>
      </SectionCard>
    </div>
  );
}

// ─── Poverty Panel ────────────────────────────────────────────────────────────

function PovertyPanel({
  entries,
  token,
  onCreate,
  onUpdate,
  onDelete,
}: {
  entries: PovertyEntryRecord[];
  token: string;
  onCreate: (
    p: {
      year: number;
      rate: number;
      confidenceInterval: string;
      change: number;
      status: "improved" | "worsened" | "stable";
    },
    token: string,
  ) => Promise<PovertyEntryRecord>;
  onUpdate: (
    id: string,
    p: {
      year: number;
      rate: number;
      confidenceInterval: string;
      change: number;
      status: "improved" | "worsened" | "stable";
    },
    token: string,
  ) => Promise<PovertyEntryRecord>;
  onDelete: (id: string, token: string) => Promise<void>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<PovertyEntryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PovertyEntryRecord | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [pYear, setPYear] = useState("");
  const [pRate, setPRate] = useState("");
  const [pCI, setPCI] = useState("");
  const [pChange, setPChange] = useState("0");
  const [pStatus, setPStatus] = useState<"improved" | "worsened" | "stable">(
    "stable",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function markSaved(id: string) {
    setSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openCreate() {
    setPYear("");
    setPRate("");
    setPCI("");
    setPChange("0");
    setPStatus("stable");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(e: PovertyEntryRecord) {
    setPYear(e.year.toString());
    setPRate(e.rate.toString());
    setPCI(e.confidenceInterval);
    setPChange(e.change.toString());
    setPStatus(e.status);
    setErrors({});
    setEditTarget(e);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!pYear.trim() || isNaN(Number(pYear)))
      e.pYear = "Valid year is required.";
    if (!pRate.trim() || isNaN(Number(pRate)))
      e.pRate = "Valid rate is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const payload = {
      year: Number(pYear),
      rate: parseFloat(pRate),
      confidenceInterval: pCI.trim(),
      change: parseFloat(pChange) || 0,
      status: pStatus,
    };
    setSubmitting(true);
    try {
      if (panelMode === "create") {
        await onCreate(payload, token);
      } else if (editTarget) {
        await onUpdate(editTarget._id, payload, token);
        markSaved(editTarget._id);
      }
      closePanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Poverty Statistics"
      description="PSA poverty incidence estimates by year"
      hint="These cards appear in the Poverty section. Status color coding: improved = green, worsened = red."
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
        >
          <LuPlus className="h-4 w-4" /> Add Year
        </button>
      }
    >
      <div className="divide-y divide-gray-50">
        {entries.length === 0 && (
          <EmptyState onAdd={openCreate} label="poverty entries" />
        )}
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry._id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${entry.status === "improved" ? "border-green-100 bg-green-50" : entry.status === "worsened" ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"}`}
                >
                  <LuPercent
                    className={`h-4 w-4 ${entry.status === "improved" ? "text-green-600" : entry.status === "worsened" ? "text-red-600" : "text-gray-400"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-gray-900">
                      {entry.year}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${entry.status === "improved" ? "bg-green-50 text-green-700" : entry.status === "worsened" ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}
                    >
                      {entry.status}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(entry._id) && (
                        <motion.span
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2, ease: EASE }}
                        >
                          <LuCheck className="h-3 w-3" /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">
                    {entry.rate}% incidence
                    {entry.change !== 0 && (
                      <span
                        className={`ml-2 text-xs ${entry.change < 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {entry.change > 0 ? "▲" : "▼"} {Math.abs(entry.change)}%
                        from prior
                      </span>
                    )}
                  </p>
                  {entry.confidenceInterval && (
                    <p className="text-xs text-gray-400">
                      90% CI: {entry.confidenceInterval}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => openEdit(entry)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <LuPencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(entry)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LuTrash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Poverty Entry"
                : "Edit Poverty Entry"
            }
            subtitle="PSA city and municipal level estimate"
            accentColor="from-gray-700 to-gray-900"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="pov-form"
            submitLabel={panelMode === "create" ? "Add Entry" : "Save Changes"}
            submitColorClass="bg-gray-800 hover:bg-gray-900 focus:ring-gray-700"
          >
            <form
              id="pov-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pov-year"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pov-year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={pYear}
                    onChange={(e) => {
                      setPYear(e.target.value);
                      setErrors((p) => ({ ...p, pYear: "" }));
                    }}
                    className={errors.pYear ? inputError : inputNormal}
                    placeholder="e.g. 2021"
                  />
                  <FieldError id="pov-year-err" msg={errors.pYear} />
                </div>
                <div>
                  <label
                    htmlFor="pov-rate"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Poverty Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pov-rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={pRate}
                    onChange={(e) => {
                      setPRate(e.target.value);
                      setErrors((p) => ({ ...p, pRate: "" }));
                    }}
                    className={errors.pRate ? inputError : inputNormal}
                    placeholder="e.g. 40.72"
                  />
                  <FieldError id="pov-rate-err" msg={errors.pRate} />
                </div>
              </div>
              <div>
                <label
                  htmlFor="pov-ci"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  90% Confidence Interval
                </label>
                <input
                  id="pov-ci"
                  type="text"
                  value={pCI}
                  onChange={(e) => setPCI(e.target.value)}
                  className={inputNormal}
                  placeholder="e.g. 35.6% – 45.8%"
                />
              </div>
              <div>
                <label
                  htmlFor="pov-change"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Change from Prior Period (%)
                </label>
                <input
                  id="pov-change"
                  type="number"
                  step="0.01"
                  value={pChange}
                  onChange={(e) => setPChange(e.target.value)}
                  className={inputNormal}
                  placeholder="e.g. 11.19 or -8.47"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Positive = worsened, negative = improved. Use 0 if first data
                  point.
                </p>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </p>
                <div className="flex gap-2">
                  {(["improved", "worsened", "stable"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPStatus(s)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-all ${pStatus === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={`${deleteTarget.year} (${deleteTarget.rate}%)`}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              onDelete(deleteTarget._id, token).catch(() => {});
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Competitiveness Panel ────────────────────────────────────────────────────

function CompetitivenessPanel({
  items,
  token,
  onCreate,
  onUpdate,
  onDelete,
}: {
  items: CompetitivenessItemRecord[];
  token: string;
  onCreate: (
    p: {
      category: string;
      score: number;
      change: number;
      changeLabel: string;
      order: number;
    },
    token: string,
  ) => Promise<CompetitivenessItemRecord>;
  onUpdate: (
    id: string,
    p: {
      category: string;
      score: number;
      change: number;
      changeLabel: string;
      order: number;
    },
    token: string,
  ) => Promise<CompetitivenessItemRecord>;
  onDelete: (id: string, token: string) => Promise<void>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] =
    useState<CompetitivenessItemRecord | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<CompetitivenessItemRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const [cCat, setCCat] = useState("");
  const [cScore, setCScore] = useState("");
  const [cChange, setCChange] = useState("0");
  const [cLabel, setCLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function markSaved(id: string) {
    setSavedIds((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setSavedIds((p) => {
          const n = new Set(p);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }
  function openCreate() {
    setCCat("");
    setCScore("");
    setCChange("0");
    setCLabel("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(i: CompetitivenessItemRecord) {
    setCCat(i.category);
    setCScore(i.score.toString());
    setCChange(i.change.toString());
    setCLabel(i.changeLabel);
    setErrors({});
    setEditTarget(i);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!cCat.trim()) e.cCat = "Category is required.";
    if (!cScore.trim() || isNaN(Number(cScore)))
      e.cScore = "Valid score is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const changeNum = parseFloat(cChange) || 0;
    const payload = {
      category: cCat.trim(),
      score: parseFloat(cScore),
      change: changeNum,
      changeLabel:
        cLabel.trim() || (changeNum >= 0 ? `+${cChange}%` : `${cChange}%`),
      order: editTarget?.order ?? 0,
    };
    setSubmitting(true);
    try {
      if (panelMode === "create") {
        await onCreate(payload, token);
      } else if (editTarget) {
        await onUpdate(editTarget._id, payload, token);
        markSaved(editTarget._id);
      }
      closePanel();
    } catch {
      // errors surfaced via store
    } finally {
      setSubmitting(false);
    }
  }

  const maxScore = 2.0;

  return (
    <SectionCard
      title="CMCI Pillar Scores"
      description="Cities and Municipalities Competitiveness Index pillars (0–2 scale)"
      hint="Scores are on the CMCI 0–2 index scale. These feed both the radar chart and the score cards on the public page."
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
        >
          <LuPlus className="h-4 w-4" /> Add Pillar
        </button>
      }
    >
      <div className="divide-y divide-gray-50">
        {items.length === 0 && (
          <EmptyState onAdd={openCreate} label="pillars" />
        )}
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item._id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50">
                  <LuStar className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-900">
                      {item.category}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${item.change > 0 ? "bg-green-50 text-green-700" : item.change < 0 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"}`}
                    >
                      {item.changeLabel}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(item._id) && (
                        <motion.span
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2, ease: EASE }}
                        >
                          <LuCheck className="h-3 w-3" /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[200px]">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${(item.score / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600">
                      {item.score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  <LuPencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  <LuTrash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add CMCI Pillar" : "Edit CMCI Pillar"
            }
            subtitle="Displayed in the Competitiveness section"
            accentColor="from-indigo-600 to-indigo-800"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="cmci-form"
            submitLabel={panelMode === "create" ? "Add Pillar" : "Save Changes"}
            submitColorClass="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          >
            <form
              id="cmci-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="cmci-cat"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Pillar / Category <span className="text-red-500">*</span>
                </label>
                <input
                  id="cmci-cat"
                  type="text"
                  value={cCat}
                  onChange={(e) => {
                    setCCat(e.target.value);
                    setErrors((p) => ({ ...p, cCat: "" }));
                  }}
                  className={errors.cCat ? inputError : inputNormal}
                  placeholder="e.g. Economic Dynamism"
                />
                <FieldError id="cmci-cat-err" msg={errors.cCat} />
              </div>
              <div>
                <label
                  htmlFor="cmci-score"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Score (0 – 2 scale) <span className="text-red-500">*</span>
                </label>
                <input
                  id="cmci-score"
                  type="number"
                  min="0"
                  max="2"
                  step="0.01"
                  value={cScore}
                  onChange={(e) => {
                    setCScore(e.target.value);
                    setErrors((p) => ({ ...p, cScore: "" }));
                  }}
                  className={errors.cScore ? inputError : inputNormal}
                  placeholder="e.g. 0.85"
                />
                <FieldError id="cmci-score-err" msg={errors.cScore} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cmci-change"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Change (%)
                  </label>
                  <input
                    id="cmci-change"
                    type="number"
                    step="0.1"
                    value={cChange}
                    onChange={(e) => setCChange(e.target.value)}
                    className={inputNormal}
                    placeholder="e.g. 10 or -5"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Positive = improvement.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="cmci-label"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Change Label
                  </label>
                  <input
                    id="cmci-label"
                    type="text"
                    value={cLabel}
                    onChange={(e) => setCLabel(e.target.value)}
                    className={inputNormal}
                    placeholder="e.g. +10%"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Leave blank to auto-generate.
                  </p>
                </div>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.category}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              onDelete(deleteTarget._id, token).catch(() => {});
              setDeleteTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
        <p className="mt-0.5 text-xs font-medium text-gray-400">{label}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function StatisticsModulePage() {
  const [activeTab, setActiveTab] = useState<StatsTab>("overview");

  const {
    municipalStats,
    financeStats,
    financeComposition,
    populationHistory,
    barangays,
    economyIndicators,
    economySectors,
    povertyEntries,
    competitivenessItems,
    isLoading,
    error,
    clearError,
    fetchAll,
    createMunicipalStat,
    updateMunicipalStat,
    deleteMunicipalStat,
    createFinanceStat,
    updateFinanceStat,
    deleteFinanceStat,
    createFinanceCompositionItem,
    updateFinanceCompositionItem,
    deleteFinanceCompositionItem,
    createPopulationPoint,
    updatePopulationPoint,
    deletePopulationPoint,
    createBarangay,
    updateBarangay,
    deleteBarangay,
    createEconomyIndicator,
    updateEconomyIndicator,
    deleteEconomyIndicator,
    createEconomySector,
    updateEconomySector,
    deleteEconomySector,
    createPovertyEntry,
    updatePovertyEntry,
    deletePovertyEntry,
    createCompetitivenessItem,
    updateCompetitivenessItem,
    deleteCompetitivenessItem,
  } = useStatisticsStore();

  const accessToken = useAdminStore((s) => s.accessToken);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll().catch(() => {
      toast("Failed to load statistics data.", "error");
    });
  }, []);

  // Surface store errors as toasts
  useEffect(() => {
    if (error) {
      toast(error, "error");
      clearError();
    }
  }, [error]);

  const tabCounts: Record<StatsTab, number> = {
    overview: municipalStats.length,
    finance: financeStats.length + financeComposition.length,
    population: populationHistory.length,
    barangays: barangays.length,
    economy: economyIndicators.length + economySectors.length,
    poverty: povertyEntries.length,
    competitiveness: competitivenessItems.length,
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Statistics Management
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage data displayed on the public Statistics page for Libmanan,
          Camarines Sur.
        </p>
      </div>

      {/* Loading / error banner */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <LuLoader className="h-4 w-4 animate-spin shrink-0" />
          Loading statistics data…
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <SummaryCard
          label="Hero Stats"
          value={municipalStats.length}
          color="bg-blue-50"
          icon={<LuChartBar className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="Finance Items"
          value={financeStats.length + financeComposition.length}
          color="bg-green-50"
          icon={<LuBanknote className="h-5 w-5 text-green-600" />}
        />
        <SummaryCard
          label="Pop. Points"
          value={populationHistory.length}
          color="bg-sky-50"
          icon={<LuTrendingUp className="h-5 w-5 text-sky-600" />}
        />
        <SummaryCard
          label="Barangays"
          value={barangays.length}
          color="bg-indigo-50"
          icon={<LuMapPin className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          label="Economy Items"
          value={economyIndicators.length + economySectors.length}
          color="bg-amber-50"
          icon={<LuUsers className="h-5 w-5 text-amber-600" />}
        />
        <SummaryCard
          label="Poverty Years"
          value={povertyEntries.length}
          color="bg-gray-100"
          icon={<LuPercent className="h-5 w-5 text-gray-600" />}
        />
        <SummaryCard
          label="CMCI Pillars"
          value={competitivenessItems.length}
          color="bg-violet-50"
          icon={<LuStar className="h-5 w-5 text-violet-600" />}
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Statistics sections"
          >
            {STATS_TABS.map(({ key, label, icon }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`stats-tabpanel-${key}`}
                  id={`stats-tab-${key}`}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={[
                    "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                    isActive
                      ? "text-blue-600 bg-blue-50/60"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {icon}
                  {label}
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px]",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    {tabCounts[key]}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab panel content */}
        <div
          key={activeTab}
          id={`stats-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`stats-tab-${activeTab}`}
          className="p-5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {activeTab === "overview" && (
                <OverviewPanel
                  stats={municipalStats}
                  token={accessToken ?? ""}
                  onCreate={createMunicipalStat}
                  onUpdate={updateMunicipalStat}
                  onDelete={deleteMunicipalStat}
                />
              )}
              {activeTab === "finance" && (
                <FinancePanel
                  stats={financeStats}
                  composition={financeComposition}
                  token={accessToken ?? ""}
                  onCreateStat={createFinanceStat}
                  onUpdateStat={updateFinanceStat}
                  onDeleteStat={deleteFinanceStat}
                  onCreateComp={createFinanceCompositionItem}
                  onUpdateComp={updateFinanceCompositionItem}
                  onDeleteComp={deleteFinanceCompositionItem}
                />
              )}
              {activeTab === "population" && (
                <PopulationPanel
                  points={populationHistory}
                  token={accessToken ?? ""}
                  onCreate={createPopulationPoint}
                  onUpdate={updatePopulationPoint}
                  onDelete={deletePopulationPoint}
                />
              )}
              {activeTab === "barangays" && (
                <BarangaysPanel
                  barangays={barangays}
                  token={accessToken ?? ""}
                  onCreate={createBarangay}
                  onUpdate={updateBarangay}
                  onDelete={deleteBarangay}
                />
              )}
              {activeTab === "economy" && (
                <EconomyPanel
                  indicators={economyIndicators}
                  sectors={economySectors}
                  token={accessToken ?? ""}
                  onCreateIndicator={createEconomyIndicator}
                  onUpdateIndicator={updateEconomyIndicator}
                  onDeleteIndicator={deleteEconomyIndicator}
                  onCreateSector={createEconomySector}
                  onUpdateSector={updateEconomySector}
                  onDeleteSector={deleteEconomySector}
                />
              )}
              {activeTab === "poverty" && (
                <PovertyPanel
                  entries={povertyEntries}
                  token={accessToken ?? ""}
                  onCreate={createPovertyEntry}
                  onUpdate={updatePovertyEntry}
                  onDelete={deletePovertyEntry}
                />
              )}
              {activeTab === "competitiveness" && (
                <CompetitivenessPanel
                  items={competitivenessItems}
                  token={accessToken ?? ""}
                  onCreate={createCompetitivenessItem}
                  onUpdate={updateCompetitivenessItem}
                  onDelete={deleteCompetitivenessItem}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

StatisticsModulePage.displayName = "StatisticsModulePage";

export default StatisticsModulePage;
