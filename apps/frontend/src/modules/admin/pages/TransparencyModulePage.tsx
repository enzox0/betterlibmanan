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
  LuTriangleAlert,
  LuUpload,
  LuFileJson,
  LuInfo,
} from "react-icons/lu";
import { useTransparencyStore } from "../store/transparencyStore";
import { useAdminStore } from "../store/adminStore";
import type {
  DpwhProjectRecord,
  FinancialReportRecord,
  FinancialReportPayload,
  BulkImportResult,
} from "../services/transparency.api";

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

type TransparencyTab = "projects" | "infrastructure" | "budget";

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

// ─── Slide Panel ──────────────────────────────────────────────────────────────

interface SlidePanelProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  onClose: () => void;
  returnFocusRef?: React.RefObject<HTMLButtonElement>;
  formId: string;
  submitLabel: string;
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
        <div className={`h-1 bg-gradient-to-r ${accentColor} shrink-0`} />
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
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {children}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
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
        />
        <motion.div
          className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <LuTrash2 className="h-5 w-5 text-red-600" />
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

// ─── Project Form ─────────────────────────────────────────────────────────────

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

function recordToForm(p: DpwhProjectRecord): ProjectFormState {
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

// ─── Project Form Panel ───────────────────────────────────────────────────────

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

// ─── Upload JSON Dialog ───────────────────────────────────────────────────────

type UploadStep =
  "idle" | "parsing" | "preview" | "importing" | "done" | "error";

interface ParsedProject {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  province: string;
  region: string;
  contractor: string;
  startDate: string;
  completionDate: string | null;
  infraYear: string;
  programName: string;
  sourceOfFunds: string;
}

function UploadJsonDialog({
  onClose,
  accessToken,
}: {
  onClose: () => void;
  accessToken: string;
}) {
  const store = useTransparencyStore();
  const [step, setStep] = useState<UploadStep>("idle");
  const [parsed, setParsed] = useState<ParsedProject[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [parseError, setParseError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function parseJson(text: string, name: string) {
    setStep("parsing");
    setParseError("");
    try {
      const json = JSON.parse(text);
      // Accept: DPWH envelope {data:{data:[...]}} or {data:[...]} or plain [...]
      let items: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.data?.data)
            ? json.data.data
            : null;

      if (!items)
        throw new Error(
          "Could not find a projects array. Expected `data.data`, `data`, or a root array.",
        );
      if (items.length === 0)
        throw new Error("The JSON file contains no projects.");

      const mapped: ParsedProject[] = items.map((item: any, idx: number) => {
        if (!item.contractId)
          throw new Error(`Item at index ${idx} is missing "contractId".`);
        return {
          contractId: String(item.contractId).trim(),
          description: String(item.description ?? "").trim(),
          category: String(item.category ?? "").trim(),
          status: String(item.status ?? "").trim(),
          budget: Number(item.budget) || 0,
          amountPaid: Number(item.amountPaid) || 0,
          progress: Math.min(100, Math.max(0, Number(item.progress) || 0)),
          province: String(item.location?.province ?? "CAMARINES SUR").trim(),
          region: String(item.location?.region ?? "Region V").trim(),
          contractor: String(item.contractor ?? "").trim(),
          startDate: String(item.startDate ?? "").trim(),
          completionDate: item.completionDate
            ? String(item.completionDate).trim()
            : null,
          infraYear: String(item.infraYear ?? "").trim(),
          programName: String(item.programName ?? "").trim(),
          sourceOfFunds: String(item.sourceOfFunds ?? "").trim(),
        };
      });

      setParsed(mapped);
      setFileName(name);
      setStep("preview");
    } catch (err: any) {
      setParseError(err.message ?? "Invalid JSON file.");
      setStep("error");
    }
  }

  function handleFile(file: File) {
    if (!file.name.endsWith(".json")) {
      setParseError("Only .json files are supported.");
      setStep("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => parseJson(e.target?.result as string, file.name);
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleImport() {
    setStep("importing");
    try {
      const res = await store.bulkImport(
        { data: { data: parsed } },
        accessToken,
      );
      setResult(res);
      setStep("done");
    } catch (err: any) {
      setParseError(err?.message ?? "Import failed.");
      setStep("error");
    }
  }

  function reset() {
    setStep("idle");
    setParsed([]);
    setFileName("");
    setResult(null);
    setParseError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const fmtM = (n: number) =>
    n >= 1_000_000
      ? `₱${(n / 1_000_000).toFixed(2)}M`
      : new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
          minimumFractionDigits: 0,
        }).format(n);

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 !mt-0"
        aria-modal="true"
        role="dialog"
        aria-labelledby="upload-dialog-title"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: EASE }}
          onClick={step === "importing" ? undefined : onClose}
        />
        <motion.div
          className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-800 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80 shrink-0">
            <div>
              <h2
                id="upload-dialog-title"
                className="text-base font-bold text-gray-900 flex items-center gap-2"
              >
                <LuFileJson className="h-4 w-4 text-blue-600" /> Bulk Import
                from JSON
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Upload a DPWH API JSON file to import multiple projects at once
              </p>
            </div>
            {step !== "importing" && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <LuX className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* ── idle / error: drop zone ── */}
            {(step === "idle" || step === "error") && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 py-12 ${
                    dragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40"
                  }`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${dragging ? "bg-blue-100" : "bg-white border border-gray-200"}`}
                  >
                    <LuUpload
                      className={`h-6 w-6 ${dragging ? "text-blue-600" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      {dragging
                        ? "Drop to upload"
                        : "Drop JSON file here, or click to browse"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Accepts DPWH API format:{" "}
                      <code className="font-mono bg-gray-100 px-1 rounded">
                        data.data[]
                      </code>{" "}
                      or plain array
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>

                {/* Error message */}
                {step === "error" && parseError && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <LuTriangleAlert className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">
                        Parse Error
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        {parseError}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      <LuX className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Format hint */}
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
                  <LuInfo className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                  <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">Supported JSON formats</p>
                    <p>
                      • Full DPWH API response:{" "}
                      <code className="font-mono bg-blue-100 px-1 rounded">
                        {'{ "data": { "data": [...] } }'}
                      </code>
                    </p>
                    <p>
                      • Simplified:{" "}
                      <code className="font-mono bg-blue-100 px-1 rounded">
                        {'{ "data": [...] }'}
                      </code>{" "}
                      or a plain{" "}
                      <code className="font-mono bg-blue-100 px-1 rounded">
                        {"[...]"}
                      </code>
                    </p>
                    <p>
                      • Duplicate contract IDs will be{" "}
                      <span className="font-semibold">skipped</span> — existing
                      records are not overwritten.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── parsing spinner ── */}
            {step === "parsing" && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <LuRefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm font-semibold text-gray-600">
                  Parsing file…
                </p>
              </div>
            )}

            {/* ── preview ── */}
            {step === "preview" && (
              <div className="space-y-4">
                {/* Summary banner */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <LuCircleCheckBig className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">
                      Parsed <span className="font-black">{parsed.length}</span>{" "}
                      project{parsed.length !== 1 ? "s" : ""} from{" "}
                      <span className="font-mono text-green-700">
                        {fileName}
                      </span>
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">
                      Review below, then click "Import All" to save. Duplicates
                      will be skipped automatically.
                    </p>
                  </div>
                </div>

                {/* Preview table */}
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-gray-900 text-white">
                          <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap">
                            Contract ID
                          </th>
                          <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap">
                            Category
                          </th>
                          <th className="px-3 py-2.5 text-left font-semibold uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider whitespace-nowrap">
                            Budget
                          </th>
                          <th className="px-3 py-2.5 text-right font-semibold uppercase tracking-wider whitespace-nowrap">
                            Year
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parsed.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 font-mono text-gray-500 whitespace-nowrap">
                              {p.contractId}
                            </td>
                            <td className="px-3 py-2 max-w-[260px]">
                              <p className="line-clamp-2 text-gray-800 leading-snug">
                                {p.description}
                              </p>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-600">
                              {p.category}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                  p.status === "Completed"
                                    ? "bg-neutral-900 text-white"
                                    : p.status === "On-Going"
                                      ? "bg-blue-600 text-white"
                                      : "bg-neutral-200 text-neutral-700"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-blue-600 whitespace-nowrap">
                              {fmtM(p.budget)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-500 whitespace-nowrap">
                              {p.infraYear}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── importing spinner ── */}
            {step === "importing" && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <LuRefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm font-semibold text-gray-600">
                  Importing {parsed.length} projects…
                </p>
                <p className="text-xs text-gray-400">
                  Please wait, do not close this dialog.
                </p>
              </div>
            )}

            {/* ── done ── */}
            {step === "done" && result && (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <LuCircleCheckBig className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      Import Complete
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Your projects have been saved to the database.
                    </p>
                  </div>
                </div>

                {/* Result summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-black text-green-700">
                      {result.inserted}
                    </p>
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      Inserted
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-black text-amber-700">
                      {result.skipped}
                    </p>
                    <p className="text-xs font-semibold text-amber-600 mt-1">
                      Skipped (duplicate)
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-2xl font-black text-red-700">
                      {result.errors.length}
                    </p>
                    <p className="text-xs font-semibold text-red-600 mt-1">
                      Errors
                    </p>
                  </div>
                </div>

                {/* Error details */}
                {result.errors.length > 0 && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-bold text-red-700 mb-2">
                      Failed entries:
                    </p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {result.errors.map((e, i) => (
                        <div
                          key={i}
                          className="text-xs text-red-600 flex gap-2"
                        >
                          <span className="font-mono font-semibold shrink-0">
                            {e.contractId}
                          </span>
                          <span className="text-red-500">{e.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-gray-100 bg-gray-50/80 px-6 py-4 flex items-center justify-between gap-3">
            <div className="text-xs text-gray-400">
              {step === "preview" && `${parsed.length} rows ready to import`}
              {step === "done" &&
                result &&
                `${result.inserted} inserted · ${result.skipped} skipped`}
            </div>
            <div className="flex items-center gap-2">
              {(step === "idle" || step === "error") && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
              {step === "preview" && (
                <>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Choose different file
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                  >
                    <LuUpload className="h-4 w-4" /> Import All ({parsed.length}
                    )
                  </button>
                </>
              )}
              {step === "done" && (
                <>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    Import another file
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-all"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Projects Panel ───────────────────────────────────────────────────────────

function ProjectsPanel() {
  const store = useTransparencyStore();
  const accessToken = useAdminStore((s) => s.accessToken) ?? "";

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<DpwhProjectRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DpwhProjectRecord | null>(
    null,
  );
  const [showUpload, setShowUpload] = useState(false);
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

  function openEdit(p: DpwhProjectRecord) {
    setForm(recordToForm(p));
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
    const e = validateForm(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      contractId: form.contractId.trim(),
      description: form.description.trim(),
      category: form.category,
      status: form.status,
      budget: parseFloat(form.budget) || 0,
      amountPaid: parseFloat(form.amountPaid) || 0,
      progress: Math.min(100, Math.max(0, parseInt(form.progress) || 0)),
      province: form.province.trim(),
      region: form.region.trim(),
      contractor: form.contractor.trim(),
      startDate: form.startDate,
      completionDate: form.completionDate.trim() || null,
      infraYear: form.infraYear.trim(),
      programName: form.programName.trim(),
      sourceOfFunds: form.sourceOfFunds.trim(),
    };

    try {
      if (panelMode === "create") {
        await store.createProject(payload, accessToken);
      } else if (editTarget) {
        await store.updateProject(editTarget.id, payload, accessToken);
        markSaved(editTarget.id);
      }
      closePanel();
    } catch {
      // error is set in store
    }
  }

  const filtered = store.projects.filter((p) => {
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
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <div className="space-y-6">
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
                className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all whitespace-nowrap"
            >
              <LuUpload className="h-4 w-4" /> Upload JSON
            </button>
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
                    key={p.id}
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
                              {savedIds.has(p.id) && (
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
                              p.id,
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
              store.deleteProject(deleteTarget.id, accessToken).catch(() => {})
            }
          />
        )}
      </AnimatePresence>

      {showUpload && (
        <UploadJsonDialog
          accessToken={accessToken}
          onClose={() => {
            setShowUpload(false);
            store.fetchProjects({ limit: 200 }).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

// ─── Infrastructure Panel (mirrors the public card view, admin-manageable) ────

function InfrastructurePanel() {
  const store = useTransparencyStore();
  const projects = store.projects;

  // Group by infraYear descending
  const byYear = projects.reduce<Record<string, typeof projects>>((acc, p) => {
    const yr = p.infraYear || "Unknown";
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(p);
    return acc;
  }, {});

  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 mt-0.5">
          <span className="text-[10px] font-bold text-blue-700">i</span>
        </div>
        <p className="text-xs text-blue-700 leading-relaxed">
          This view mirrors the <strong>Infrastructure Investments</strong>{" "}
          panel on the public Transparency page. Projects are sourced from the{" "}
          <strong>DPWH Projects</strong> tab above. To add or edit entries, use
          that tab.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          No projects yet. Add projects in the DPWH Projects tab.
        </div>
      ) : (
        <div className="space-y-3">
          {years.map((yr) => (
            <div key={yr}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                {yr}
              </p>
              <div className="space-y-2">
                {byYear[yr].map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-bold text-white bg-gray-900 px-2 py-0.5 rounded">
                        {p.infraYear}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide px-2 py-0.5 border border-gray-200 rounded">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {p.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.location.province}, {p.location.region}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">
                          Contractor
                        </p>
                        <p className="text-xs font-medium text-gray-700">
                          {p.contractor || "TBD"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">
                          Contract Cost
                        </p>
                        <p className="text-xs font-bold text-blue-700">
                          {new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                            minimumFractionDigits: 0,
                          }).format(p.budget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">
                          Status
                        </p>
                        <p className="text-xs font-semibold text-gray-700">
                          {p.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Budget Panel ─────────────────────────────────────────────────────────────

interface ReportFormState {
  fiscalYear: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  totalIncome: string;
  totalExpenditures: string;
  netOperatingIncome: string;
  fundBalance: string;
  reportDate: string;
  // JSON strings for array fields
  incomeSources: string;
  expenditureAllocations: string;
}

const emptyReportForm = (): ReportFormState => ({
  fiscalYear: new Date().getFullYear().toString(),
  quarter: "Q1",
  totalIncome: "",
  totalExpenditures: "",
  netOperatingIncome: "",
  fundBalance: "",
  reportDate: "",
  incomeSources: JSON.stringify(
    [
      { source: "Local Taxes", amount: 0, percentage: 0 },
      { source: "National Revenue Allotment", amount: 0, percentage: 0 },
    ],
    null,
    2,
  ),
  expenditureAllocations: JSON.stringify(
    [
      { category: "Personnel Services", amount: 0, percentage: 0 },
      { category: "MOOE", amount: 0, percentage: 0 },
      { category: "Capital Outlay", amount: 0, percentage: 0 },
    ],
    null,
    2,
  ),
});

function reportToForm(r: FinancialReportRecord): ReportFormState {
  return {
    fiscalYear: r.fiscalYear,
    quarter: r.quarter,
    totalIncome: r.totalIncome.toString(),
    totalExpenditures: r.totalExpenditures.toString(),
    netOperatingIncome: r.netOperatingIncome.toString(),
    fundBalance: r.fundBalance.toString(),
    reportDate: r.reportDate,
    incomeSources: JSON.stringify(r.incomeSources, null, 2),
    expenditureAllocations: JSON.stringify(r.expenditureAllocations, null, 2),
  };
}

function BudgetPanel() {
  const store = useTransparencyStore();
  const accessToken = useAdminStore((s) => s.accessToken) ?? "";
  const reports = store.financialReports;

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<FinancialReportRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<FinancialReportRecord | null>(null);
  const [form, setForm] = useState<ReportFormState>(emptyReportForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const addBtnRef = useRef<HTMLButtonElement>(null);

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
    setForm(emptyReportForm());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(r: FinancialReportRecord) {
    setForm(reportToForm(r));
    setErrors({});
    setEditTarget(r);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function validateReport(f: ReportFormState): Record<string, string> {
    const e: Record<string, string> = {};
    if (!f.fiscalYear.trim()) e.fiscalYear = "Fiscal year is required.";
    if (!f.totalIncome || isNaN(parseFloat(f.totalIncome)))
      e.totalIncome = "Valid total income required.";
    if (!f.totalExpenditures || isNaN(parseFloat(f.totalExpenditures)))
      e.totalExpenditures = "Valid total expenditures required.";
    if (!f.fundBalance || isNaN(parseFloat(f.fundBalance)))
      e.fundBalance = "Valid fund balance required.";
    try {
      JSON.parse(f.incomeSources);
    } catch {
      e.incomeSources = "Must be valid JSON array.";
    }
    try {
      JSON.parse(f.expenditureAllocations);
    } catch {
      e.expenditureAllocations = "Must be valid JSON array.";
    }
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateReport(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload: FinancialReportPayload = {
      fiscalYear: form.fiscalYear.trim(),
      quarter: form.quarter,
      totalIncome: parseFloat(form.totalIncome) || 0,
      totalExpenditures: parseFloat(form.totalExpenditures) || 0,
      netOperatingIncome: parseFloat(form.netOperatingIncome) || 0,
      fundBalance: parseFloat(form.fundBalance) || 0,
      reportDate: form.reportDate.trim(),
      incomeSources: JSON.parse(form.incomeSources),
      expenditureAllocations: JSON.parse(form.expenditureAllocations),
    };

    try {
      if (panelMode === "create") {
        await store.createFinancialReport(payload, accessToken);
      } else if (editTarget) {
        await store.updateFinancialReport(editTarget.id, payload, accessToken);
        markSaved(editTarget.id);
      }
      closePanel();
    } catch {
      /* error in store */
    }
  }

  const QUARTER_LABELS: Record<string, string> = {
    Q1: "Jan – Mar",
    Q2: "Apr – Jun",
    Q3: "Jul – Sep",
    Q4: "Oct – Dec",
  };

  return (
    <div className="space-y-6">
      <SectionCard
        title="Financial Reports"
        description="Quarterly budget and financial transparency data for the public page"
        action={
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Report
          </button>
        }
      >
        {reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No financial reports yet. Add one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reports.map((r) => (
              <motion.div
                key={r.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-6 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white bg-gray-900 px-2.5 py-0.5 rounded-lg">
                      {r.fiscalYear}
                    </span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      {r.quarter} · {QUARTER_LABELS[r.quarter]}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(r.id) && (
                        <motion.span
                          className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                        >
                          <LuCheck className="h-2.5 w-2.5" /> Saved
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-xs">
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                        Income
                      </p>
                      <p className="font-bold text-gray-800">
                        ₱{(r.totalIncome / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                        Expenditures
                      </p>
                      <p className="font-bold text-gray-800">
                        ₱{(r.totalExpenditures / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                        Net Operating
                      </p>
                      <p className="font-bold text-gray-800">
                        ₱{(r.netOperatingIncome / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase tracking-wide text-[10px]">
                        Fund Balance
                      </p>
                      <p className="font-bold text-gray-800">
                        ₱{(r.fundBalance / 1_000_000).toFixed(2)}M
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Financial Report"
                : "Edit Financial Report"
            }
            subtitle="Quarterly budget data for the public Budget & Finance page"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="report-form"
            submitLabel={panelMode === "create" ? "Add Report" : "Save Changes"}
          >
            <form
              id="report-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fiscal Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2025"
                    value={form.fiscalYear}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fiscalYear: e.target.value }))
                    }
                    className={errors.fiscalYear ? inputError : inputNormal}
                  />
                  {errors.fiscalYear && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fiscalYear}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Quarter <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.quarter}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        quarter: e.target.value as "Q1" | "Q2" | "Q3" | "Q4",
                      }))
                    }
                    className={inputNormal}
                  >
                    {(["Q1", "Q2", "Q3", "Q4"] as const).map((q) => (
                      <option key={q} value={q}>
                        {q} · {QUARTER_LABELS[q]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Total Income (₱) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.totalIncome}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, totalIncome: e.target.value }))
                    }
                    className={errors.totalIncome ? inputError : inputNormal}
                  />
                  {errors.totalIncome && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalIncome}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Total Expenditures (₱){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.totalExpenditures}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        totalExpenditures: e.target.value,
                      }))
                    }
                    className={
                      errors.totalExpenditures ? inputError : inputNormal
                    }
                  />
                  {errors.totalExpenditures && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.totalExpenditures}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Net Operating Income (₱)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.netOperatingIncome}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        netOperatingIncome: e.target.value,
                      }))
                    }
                    className={inputNormal}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Fund Balance End (₱) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.fundBalance}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fundBalance: e.target.value }))
                    }
                    className={errors.fundBalance ? inputError : inputNormal}
                  />
                  {errors.fundBalance && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fundBalance}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Report Date
                </label>
                <input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, reportDate: e.target.value }))
                  }
                  className={inputNormal}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Income Sources (JSON array)
                </label>
                <textarea
                  rows={5}
                  value={form.incomeSources}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, incomeSources: e.target.value }))
                  }
                  className={`${errors.incomeSources ? inputError : inputNormal} resize-none font-mono text-xs`}
                  placeholder='[{"source":"Local Taxes","amount":0,"percentage":0}]'
                />
                {errors.incomeSources && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.incomeSources}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expenditure Allocations (JSON array)
                </label>
                <textarea
                  rows={5}
                  value={form.expenditureAllocations}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      expenditureAllocations: e.target.value,
                    }))
                  }
                  className={`${errors.expenditureAllocations ? inputError : inputNormal} resize-none font-mono text-xs`}
                  placeholder='[{"category":"Personnel Services","amount":0,"percentage":0}]'
                />
                {errors.expenditureAllocations && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.expenditureAllocations}
                  </p>
                )}
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={`${deleteTarget.fiscalYear} ${deleteTarget.quarter}`}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              store
                .deleteFinancialReport(deleteTarget.id, accessToken)
                .catch(() => {})
            }
          />
        )}
      </AnimatePresence>
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
  const store = useTransparencyStore();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TransparencyTab>("projects");

  useEffect(() => {
    store.fetchProjects({ limit: 200 }).catch((err: any) => {
      setGlobalError(err?.message ?? "Failed to load projects.");
    });
    store.fetchFinancialReports().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projects = store.projects;

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

  const TABS: {
    key: TransparencyTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "projects",
      label: "DPWH Projects",
      icon: <LuConstruction className="h-3.5 w-3.5" />,
      count: projects.length,
    },
    {
      key: "infrastructure",
      label: "Infrastructure Investments",
      icon: <LuBuilding2 className="h-3.5 w-3.5" />,
    },
    {
      key: "budget",
      label: "Budget & Finance",
      icon: <LuBanknote className="h-3.5 w-3.5" />,
      count: store.financialReports.length,
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Transparency Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage DPWH projects, infrastructure investments, and budget
            reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(store.isLoading || store.isReportsLoading) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <LuRefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              store.fetchProjects({ limit: 200 }).catch(() => {});
              store.fetchFinancialReports().catch(() => {});
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          >
            <LuRefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Error banner */}
      {(globalError || store.error) && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <LuTriangleAlert className="h-4 w-4 shrink-0 text-red-500" />
          <span>{globalError ?? store.error}</span>
          <button
            type="button"
            onClick={() => {
              setGlobalError(null);
              store.clearError();
            }}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>
      )}

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
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav className="flex min-w-max px-4 pt-3 gap-1" role="tablist">
            {TABS.map(({ key, label, icon, count }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
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
                  {count !== undefined && (
                    <span
                      className={[
                        "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px]",
                        isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500",
                      ].join(" ")}
                    >
                      {count}
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
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {activeTab === "projects" && <ProjectsPanel />}
              {activeTab === "infrastructure" && <InfrastructurePanel />}
              {activeTab === "budget" && <BudgetPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

TransparencyModulePage.displayName = "TransparencyModulePage";
export default TransparencyModulePage;
