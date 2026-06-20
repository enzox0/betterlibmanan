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
  LuConstruction,
  LuBuilding2,
  LuDroplets,
  LuCalendar,
  LuMapPin,
  LuBanknote,
  LuHardHat,
  LuTag,
  LuTrendingUp,
  LuRefreshCw,
  LuFilter,
  LuHash,
  LuArrowUpDown,
  LuCircleDashed,
  LuCircleCheckBig,
  LuLoader,
  LuClock,
} from "react-icons/lu";
import type { Project } from "@/modules/transparency/types/types";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    contractId: "20CN0074",
    description:
      "Construction of Road along Poblacion Area, Libmanan, Camarines Sur",
    category: "Roads",
    status: "Completed",
    budget: 4850000,
    amountPaid: 4850000,
    progress: 100,
    location: { province: "CAMARINES SUR", region: "Region V" },
    contractor: "ABC Construction Corp (2024)",
    startDate: "2024-01-15",
    completionDate: "2024-06-30",
    infraYear: "2024",
    programName: "Local Infrastructure Program",
    sourceOfFunds: "General Appropriations Act",
  },
  {
    contractId: "20CN0075",
    description: "Flood Control Structure along Libmanan River, Phase II",
    category: "Flood Control and Drainage",
    status: "On-Going",
    budget: 12500000,
    amountPaid: 7800000,
    progress: 62,
    location: { province: "CAMARINES SUR", region: "Region V" },
    contractor: "XYZ Builders Inc (2024)",
    startDate: "2024-03-01",
    completionDate: null,
    infraYear: "2024",
    programName: "Flood Mitigation Program",
    sourceOfFunds: "DPWH Central Office",
  },
  {
    contractId: "20CN0076",
    description: "Construction of Multi-Purpose Building at Barangay Hall Site",
    category: "Buildings and Facilities",
    status: "Not Started",
    budget: 3200000,
    amountPaid: 0,
    progress: 0,
    location: { province: "CAMARINES SUR", region: "Region V" },
    contractor: "LMN Enterprises (2024)",
    startDate: "2024-09-01",
    completionDate: null,
    infraYear: "2024",
    programName: "Barangay Facilities Program",
    sourceOfFunds: "Local Government Unit",
  },
  {
    contractId: "20CN0077",
    description: "Repair and Improvement of Bridge along Provincial Road",
    category: "Bridges",
    status: "For Procurement",
    budget: 8750000,
    amountPaid: 0,
    progress: 0,
    location: { province: "CAMARINES SUR", region: "Region V" },
    contractor: "TBD",
    startDate: "2025-01-01",
    completionDate: null,
    infraYear: "2025",
    programName: "Bridge Improvement Program",
    sourceOfFunds: "General Appropriations Act",
  },
  {
    contractId: "20CN0078",
    description:
      "Drainage Canal Construction along National Highway, Libmanan Proper",
    category: "Flood Control and Drainage",
    status: "On-Going",
    budget: 5600000,
    amountPaid: 2100000,
    progress: 38,
    location: { province: "CAMARINES SUR", region: "Region V" },
    contractor: "DEF Construction (2024)",
    startDate: "2024-05-15",
    completionDate: null,
    infraYear: "2024",
    programName: "Drainage Improvement Program",
    sourceOfFunds: "DPWH Regional Office V",
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

const CATEGORIES = [
  "Roads",
  "Bridges",
  "Flood Control and Drainage",
  "Buildings and Facilities",
];
const STATUSES = ["Completed", "On-Going", "Not Started", "For Procurement"];
const PROGRAMS = [
  "Local Infrastructure Program",
  "Flood Mitigation Program",
  "Bridge Improvement Program",
  "Barangay Facilities Program",
  "Drainage Improvement Program",
];
const FUNDS = [
  "General Appropriations Act",
  "DPWH Central Office",
  "DPWH Regional Office V",
  "Local Government Unit",
];

type TransparencyTab = "projects" | "settings";

const TRANSPARENCY_TABS: {
  key: TransparencyTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "projects",
    label: "Projects",
    icon: <LuConstruction className="h-3.5 w-3.5" />,
  },
  {
    key: "settings",
    label: "Page Settings",
    icon: <LuFilter className="h-3.5 w-3.5" />,
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Roads: <LuConstruction className="h-4 w-4" />,
  Bridges: <LuArrowUpDown className="h-4 w-4" />,
  "Flood Control and Drainage": <LuDroplets className="h-4 w-4" />,
  "Buildings and Facilities": <LuBuilding2 className="h-4 w-4" />,
};

const STATUS_STYLES: Record<string, { pill: string; icon: React.ReactNode }> = {
  Completed: {
    pill: "bg-neutral-900 text-white",
    icon: <LuCircleCheckBig className="h-3.5 w-3.5 text-neutral-900" />,
  },
  "On-Going": {
    pill: "bg-blue-600 text-white",
    icon: <LuLoader className="h-3.5 w-3.5 text-blue-600" />,
  },
  "Not Started": {
    pill: "bg-neutral-200 text-neutral-700",
    icon: <LuCircleDashed className="h-3.5 w-3.5 text-neutral-400" />,
  },
  "For Procurement": {
    pill: "bg-neutral-500 text-white",
    icon: <LuClock className="h-3.5 w-3.5 text-neutral-500" />,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Shared Components ────────────────────────────────────────────────────────

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
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? {
    pill: "bg-neutral-200 text-neutral-700",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.pill}`}
    >
      {status}
    </span>
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
        aria-labelledby="tr-del-title"
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
                  id="tr-del-title"
                  className="text-sm font-bold text-gray-900"
                >
                  Remove Project
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

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function MiniProgressBar({ pct }: { pct: number }) {
  const color =
    pct === 100 ? "bg-neutral-900" : pct >= 50 ? "bg-blue-600" : "bg-blue-400";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-gray-600 w-7 text-right">
        {pct}%
      </span>
    </div>
  );
}

// ─── Project Form (shared create/edit) ───────────────────────────────────────

interface ProjectFormState {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: string;
  amountPaid: string;
  progress: string;
  province: string;
  region: string;
  contractor: string;
  startDate: string;
  completionDate: string;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
}

const emptyForm = (): ProjectFormState => ({
  contractId: "",
  description: "",
  category: CATEGORIES[0],
  status: STATUSES[0],
  budget: "",
  amountPaid: "",
  progress: "0",
  province: "CAMARINES SUR",
  region: "Region V",
  contractor: "",
  startDate: "",
  completionDate: "",
  infraYear: new Date().getFullYear().toString(),
  programName: PROGRAMS[0],
  sourceOfFunds: FUNDS[0],
});

function projectToForm(p: Project): ProjectFormState {
  return {
    contractId: p.contractId,
    description: p.description,
    category: p.category,
    status: p.status,
    budget: p.budget.toString(),
    amountPaid: p.amountPaid.toString(),
    progress: p.progress.toString(),
    province: p.location.province,
    region: p.location.region,
    contractor: p.contractor,
    startDate: p.startDate,
    completionDate: p.completionDate ?? "",
    infraYear: p.infraYear,
    programName: p.programName,
    sourceOfFunds: p.sourceOfFunds,
  };
}

function formToProject(f: ProjectFormState): Project {
  return {
    contractId: f.contractId.trim(),
    description: f.description.trim(),
    category: f.category,
    status: f.status,
    budget: parseFloat(f.budget) || 0,
    amountPaid: parseFloat(f.amountPaid) || 0,
    progress: Math.min(100, Math.max(0, parseInt(f.progress) || 0)),
    location: { province: f.province.trim(), region: f.region.trim() },
    contractor: f.contractor.trim(),
    startDate: f.startDate,
    completionDate: f.completionDate.trim() || null,
    infraYear: f.infraYear.trim(),
    programName: f.programName.trim(),
    sourceOfFunds: f.sourceOfFunds.trim(),
  };
}

function validateForm(f: ProjectFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.contractId.trim()) e.contractId = "Contract ID is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  if (!f.contractor.trim()) e.contractor = "Contractor is required.";
  if (!f.budget.trim() || isNaN(parseFloat(f.budget)))
    e.budget = "Valid budget amount is required.";
  if (!f.startDate) e.startDate = "Start date is required.";
  return e;
}

// ─── Project Slide Panel Form ─────────────────────────────────────────────────

function ProjectFormPanel({
  mode,
  form,
  errors,
  onChange,
  onClose,
  onSubmit,
  returnFocusRef,
}: {
  mode: "create" | "edit";
  form: ProjectFormState;
  errors: Record<string, string>;
  onChange: (patch: Partial<ProjectFormState>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
}) {
  const field = (key: keyof ProjectFormState) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange({ [key]: e.target.value }),
    className: errors[key] ? inputError : inputNormal,
  });

  return (
    <SlidePanel
      title={mode === "create" ? "Add Project" : "Edit Project"}
      subtitle="Displayed on the public Transparency page"
      accentColor="from-blue-600 to-blue-800"
      onClose={onClose}
      returnFocusRef={returnFocusRef}
      formId="project-form"
      submitLabel={mode === "create" ? "Add Project" : "Save Changes"}
    >
      <form
        id="project-form"
        onSubmit={onSubmit}
        noValidate
        className="space-y-5"
      >
        {/* Contract ID */}
        <div>
          <label
            htmlFor="pr-contractId"
            className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
          >
            <LuHash className="h-3.5 w-3.5 text-gray-400" /> Contract ID{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="pr-contractId"
            type="text"
            placeholder="e.g. 20CN0074"
            {...field("contractId")}
          />
          <FieldError id="pr-contractId-err" msg={errors.contractId} />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="pr-description"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="pr-description"
            rows={3}
            placeholder="Full project description…"
            value={form.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className={`${errors.description ? inputError : inputNormal} resize-none`}
          />
          <FieldError id="pr-description-err" msg={errors.description} />
        </div>

        {/* Category + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pr-category"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <LuTag className="h-3.5 w-3.5 text-gray-400" /> Category
            </label>
            <select
              id="pr-category"
              {...field("category")}
              className={inputNormal}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="pr-status"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Status
            </label>
            <select id="pr-status" {...field("status")} className={inputNormal}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Budget + Amount Paid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pr-budget"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <LuBanknote className="h-3.5 w-3.5 text-gray-400" /> Budget (₱){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="pr-budget"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...field("budget")}
            />
            <FieldError id="pr-budget-err" msg={errors.budget} />
          </div>
          <div>
            <label
              htmlFor="pr-amountPaid"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <LuTrendingUp className="h-3.5 w-3.5 text-gray-400" /> Amount Paid
              (₱)
            </label>
            <input
              id="pr-amountPaid"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              {...field("amountPaid")}
            />
          </div>
        </div>

        {/* Progress */}
        <div>
          <label
            htmlFor="pr-progress"
            className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
          >
            <LuTrendingUp className="h-3.5 w-3.5 text-gray-400" /> Progress (%)
          </label>
          <div className="flex items-center gap-3">
            <input
              id="pr-progress"
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={(e) => onChange({ progress: e.target.value })}
              className="flex-1 accent-blue-600"
            />
            <span className="text-sm font-bold text-gray-800 w-10 text-right">
              {form.progress}%
            </span>
          </div>
        </div>

        {/* Contractor */}
        <div>
          <label
            htmlFor="pr-contractor"
            className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
          >
            <LuHardHat className="h-3.5 w-3.5 text-gray-400" /> Contractor{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="pr-contractor"
            type="text"
            placeholder="Company name (Year)"
            {...field("contractor")}
          />
          <FieldError id="pr-contractor-err" msg={errors.contractor} />
        </div>

        {/* Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pr-province"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <LuMapPin className="h-3.5 w-3.5 text-gray-400" /> Province
            </label>
            <input
              id="pr-province"
              type="text"
              placeholder="CAMARINES SUR"
              {...field("province")}
            />
          </div>
          <div>
            <label
              htmlFor="pr-region"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Region
            </label>
            <input
              id="pr-region"
              type="text"
              placeholder="Region V"
              {...field("region")}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pr-startDate"
              className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
            >
              <LuCalendar className="h-3.5 w-3.5 text-gray-400" /> Start Date{" "}
              <span className="text-red-500">*</span>
            </label>
            <input id="pr-startDate" type="date" {...field("startDate")} />
            <FieldError id="pr-startDate-err" msg={errors.startDate} />
          </div>
          <div>
            <label
              htmlFor="pr-completionDate"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Completion Date
            </label>
            <input
              id="pr-completionDate"
              type="date"
              {...field("completionDate")}
            />
          </div>
        </div>

        {/* Program + Source of Funds */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="pr-programName"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Program Name
            </label>
            <select
              id="pr-programName"
              {...field("programName")}
              className={inputNormal}
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="pr-sourceOfFunds"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Source of Funds
            </label>
            <select
              id="pr-sourceOfFunds"
              {...field("sourceOfFunds")}
              className={inputNormal}
            >
              {FUNDS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Infra Year */}
        <div>
          <label
            htmlFor="pr-infraYear"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Infrastructure Year
          </label>
          <input
            id="pr-infraYear"
            type="text"
            placeholder="e.g. 2024"
            {...field("infraYear")}
          />
        </div>
      </form>
    </SlidePanel>
  );
}

// ─── Projects Panel ───────────────────────────────────────────────────────────

function ProjectsPanel({
  projects,
  setProjects,
}: {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [form, setForm] = useState<ProjectFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

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
    setForm(emptyForm());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(p: Project) {
    setForm(projectToForm(p));
    setErrors({});
    setEditTarget(p);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateForm(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const project = formToProject(form);

    if (panelMode === "create") {
      setProjects((prev) => [project, ...prev]);
    } else if (editTarget) {
      setProjects((prev) =>
        prev.map((p) => (p.contractId === editTarget.contractId ? project : p)),
      );
      markSaved(project.contractId);
    }
    closePanel();
  }

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.description.toLowerCase().includes(q) ||
      p.contractId.toLowerCase().includes(q) ||
      p.contractor.toLowerCase().includes(q);
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.contractId)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  // Summary stats
  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "Completed").length,
    ongoing: projects.filter((p) => p.status === "On-Going").length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
  };

  return (
    <div className="space-y-6">
      {/* Projects table card */}
      <SectionCard
        title="DPWH Projects"
        description="Manage projects displayed on the public Transparency page"
        action={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search projects"
                className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
              />
            </div>
            <button
              ref={addBtnRef}
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
            >
              <LuPlus className="h-4 w-4" /> Add Project
            </button>
          </div>
        }
      >
        {/* Filter bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2 items-center">
          <div className="sm:hidden relative w-full mb-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <LuFilter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-6 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white py-1.5 pl-2.5 pr-6 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {(filterCategory !== "All" || filterStatus !== "All" || search) && (
            <button
              type="button"
              onClick={() => {
                setFilterCategory("All");
                setFilterStatus("All");
                setSearch("");
              }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
            >
              <LuX className="h-3 w-3" /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Budget
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Progress
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
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
              <AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      No projects found.{" "}
                      {search ||
                      filterCategory !== "All" ||
                      filterStatus !== "All"
                        ? "Try adjusting filters."
                        : "Add one above."}
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <motion.tr
                    key={p.contractId}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-4 py-3 max-w-[280px]">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                          {CATEGORY_ICONS[p.category] ?? (
                            <LuBuilding2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                            {p.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-mono text-gray-400">
                              {p.contractId}
                            </span>
                            <AnimatePresence>
                              {savedIds.has(p.contractId) && (
                                <motion.span
                                  className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600 ring-1 ring-green-200"
                                  initial={{ opacity: 0, scale: 0.85 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.85 }}
                                  transition={{ duration: 0.2, ease: EASE }}
                                >
                                  <LuCheck className="h-2.5 w-2.5" /> Saved
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        {CATEGORY_ICONS[p.category] ?? (
                          <LuBuilding2 className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">{p.category}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-xs font-bold text-gray-800">
                          {formatCurrency(p.budget)}
                        </p>
                        {p.amountPaid > 0 && (
                          <p className="text-[10px] text-gray-400">
                            Paid: {formatCurrency(p.amountPaid)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <MiniProgressBar pct={p.progress} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          ref={
                            getEditRef(
                              p.contractId,
                            ) as React.RefObject<HTMLButtonElement>
                          }
                          type="button"
                          onClick={() => openEdit(p)}
                          aria-label={`Edit ${p.contractId}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                        >
                          <LuPencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          aria-label={`Remove ${p.contractId}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        >
                          <LuTrash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      </SectionCard>

      <AnimatePresence>
        {panelMode && (
          <ProjectFormPanel
            mode={panelMode}
            form={form}
            errors={errors}
            onChange={(patch) => {
              setForm((f) => ({ ...f, ...patch }));
              setErrors((e) => {
                const n = { ...e };
                Object.keys(patch).forEach((k) => delete n[k]);
                return n;
              });
            }}
            onClose={closePanel}
            onSubmit={handleSubmit}
            returnFocusRef={returnFocusRef}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.contractId}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setProjects((p) =>
                p.filter((pr) => pr.contractId !== deleteTarget.contractId),
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page Settings Panel ──────────────────────────────────────────────────────

interface PageSettings {
  heroTitle: string;
  heroSubtitle: string;
  filterSearch: string;
  filterRegion: string;
  filterProvince: string;
  itemsPerPage: string;
  defaultView: "grid" | "list";
}

function PageSettingsPanel() {
  const [settings, setSettings] = useState<PageSettings>({
    heroTitle: "DPWH Projects",
    heroSubtitle: "Track infrastructure projects in Libmanan, Camarines Sur",
    filterSearch: "Libmanan",
    filterRegion: "Region V",
    filterProvince: "CAMARINES SUR",
    itemsPerPage: "20",
    defaultView: "grid",
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const s = (key: keyof PageSettings) => ({
    value: settings[key],
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => setSettings((prev) => ({ ...prev, [key]: e.target.value })),
    className: inputNormal,
  });

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave}>
        <SectionCard
          title="Hero Section"
          description="Title and subtitle displayed at the top of the transparency page"
          action={
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {saved && (
                  <motion.span
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: EASE }}
                  >
                    <LuCheck className="h-3 w-3" /> Saved
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <LuCheck className="h-4 w-4" /> Save Settings
              </button>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="ps-heroTitle"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Hero Title
              </label>
              <input
                id="ps-heroTitle"
                type="text"
                placeholder="DPWH Projects"
                {...s("heroTitle")}
              />
            </div>
            <div>
              <label
                htmlFor="ps-heroSubtitle"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Hero Subtitle
              </label>
              <input
                id="ps-heroSubtitle"
                type="text"
                placeholder="Track infrastructure projects…"
                {...s("heroSubtitle")}
              />
            </div>
          </div>
        </SectionCard>

        <div className="mt-6">
          <SectionCard
            title="Data Source Filters"
            description="Default query parameters sent to the DPWH API proxy"
          >
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="ps-filterSearch"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuSearch className="h-3.5 w-3.5 text-gray-400" /> Search
                  Keyword
                </label>
                <input
                  id="ps-filterSearch"
                  type="text"
                  placeholder="Libmanan"
                  {...s("filterSearch")}
                />
              </div>
              <div>
                <label
                  htmlFor="ps-filterRegion"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuMapPin className="h-3.5 w-3.5 text-gray-400" /> Region
                </label>
                <input
                  id="ps-filterRegion"
                  type="text"
                  placeholder="Region V"
                  {...s("filterRegion")}
                />
              </div>
              <div>
                <label
                  htmlFor="ps-filterProvince"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Province
                </label>
                <input
                  id="ps-filterProvince"
                  type="text"
                  placeholder="CAMARINES SUR"
                  {...s("filterProvince")}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6">
          <SectionCard
            title="Display Preferences"
            description="Controls the default display options for the public-facing page"
          >
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="ps-itemsPerPage"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Items Per Page
                </label>
                <select
                  id="ps-itemsPerPage"
                  {...s("itemsPerPage")}
                  className={inputNormal}
                >
                  {["10", "20", "50", "100"].map((v) => (
                    <option key={v} value={v}>
                      {v} items
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="ps-defaultView"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Default View
                </label>
                <select
                  id="ps-defaultView"
                  value={settings.defaultView}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      defaultView: e.target.value as "grid" | "list",
                    }))
                  }
                  className={inputNormal}
                >
                  <option value="grid">Grid</option>
                  <option value="list">List</option>
                </select>
              </div>
            </div>
          </SectionCard>
        </div>
      </form>

      {/* Info banner */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 mt-0.5">
          <span className="text-[10px] font-bold text-blue-700">i</span>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed">
          Project data is fetched live from the{" "}
          <strong>DPWH Transparency Portal</strong> via the backend proxy. The
          "Data Source Filters" above control which results are returned. Use
          the <strong>Projects tab</strong> to manually add or override
          individual entries for display.
        </p>
      </div>
    </div>
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 truncate">
          {label}
        </p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TransparencyModulePage() {
  const [activeTab, setActiveTab] = useState<TransparencyTab>("projects");
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const tabCounts: Record<TransparencyTab, number> = {
    projects: projects.length,
    settings: 0,
  };

  const stats = {
    total: projects.length,
    completed: projects.filter((p) => p.status === "Completed").length,
    ongoing: projects.filter((p) => p.status === "On-Going").length,
    totalBudget: new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(projects.reduce((s, p) => s + p.budget, 0)),
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
          Transparency Management
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage DPWH infrastructure projects and page settings displayed on the
          public Transparency page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Total Projects"
          value={stats.total}
          color="bg-blue-50"
          icon={<LuConstruction className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="Completed"
          value={stats.completed}
          color="bg-gray-100"
          icon={<LuCircleCheckBig className="h-5 w-5 text-gray-600" />}
        />
        <SummaryCard
          label="On-Going"
          value={stats.ongoing}
          color="bg-indigo-50"
          icon={<LuLoader className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          label="Total Budget"
          value={stats.totalBudget}
          color="bg-emerald-50"
          icon={<LuBanknote className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Transparency sections"
          >
            {TRANSPARENCY_TABS.map(({ key, label, icon }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tr-tabpanel-${key}`}
                  id={`tr-tab-${key}`}
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
                  {key === "projects" && (
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
                  )}
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
          id={`tr-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tr-tab-${activeTab}`}
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
              {activeTab === "projects" && (
                <ProjectsPanel projects={projects} setProjects={setProjects} />
              )}
              {activeTab === "settings" && <PageSettingsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

TransparencyModulePage.displayName = "TransparencyModulePage";
export default TransparencyModulePage;
