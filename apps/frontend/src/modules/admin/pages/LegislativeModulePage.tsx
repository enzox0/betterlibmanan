import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  LuX,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuScroll,
  LuScale,
  LuListOrdered,
  LuInfo,
  LuCheck,
  LuGripVertical,
  LuExternalLink,
  LuTag,
  LuCalendar,
  LuHash,
} from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProcessStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

interface LegislativeDocument {
  id: string;
  number: string;
  title: string;
  sessionDate: string;
}

interface AboutPoint {
  id: string;
  title: string;
  description: string;
}

type LegTab =
  | "ordinances"
  | "resolutions"
  | "ord-process"
  | "res-process"
  | "about";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_ORD_DOCS: LegislativeDocument[] = [
  {
    id: "ord-001",
    number: "2025-05-11",
    title:
      "An Ordinance Creating the Film Development Council of the Municipality of Libmanan, Camarines Sur, Providing for Its Powers and Functions, and for Other Purposes",
    sessionDate: "April 21, 2025",
  },
  {
    id: "ord-002",
    number: "2025-04-11",
    title:
      "An Ordinance Prohibiting the Entry of Nuisance Contraband Inside the Libmanan District Jail in the Municipality of Libmanan, Camarines Sur, and Providing Penalties for Violation Thereof",
    sessionDate: "April 21, 2025",
  },
  {
    id: "ord-003",
    number: "2025-03-11",
    title:
      "An Ordinance Creating the Libmanan Municipal Housing Board, Defining Its Powers and Functions, and for Other Purposes",
    sessionDate: "March 3, 2025",
  },
  {
    id: "ord-004",
    number: "2025-02-11",
    title:
      "An Ordinance Requiring All Households in the Municipality of Libmanan, Camarines Sur to Comply with Zero Open Defecation (ZOD), Providing for Its Guidelines and Penalties for Violation and Appropriating Funds Therefor",
    sessionDate: "February 25, 2025",
  },
  {
    id: "ord-005",
    number: "2025-01-11",
    title:
      "An Ordinance Revising the Gender and Development Code of the Municipality of Libmanan, Camarines Sur and for Other Purposes, Subject to All Laws and Existing Rules and Regulations",
    sessionDate: "February 25, 2025",
  },
];

const INITIAL_RES_DOCS: LegislativeDocument[] = [
  {
    id: "res-001",
    number: "248-2025-11",
    title:
      "A Resolution Authorizing Municipal Mayor to Sign the Application Forms for the Building Permit for the Installation of Solar Poles Project",
    sessionDate: "June 23, 2025",
  },
  {
    id: "res-002",
    number: "247-2025-11",
    title:
      "A Resolution Adopting Republic Act No. 8976, Otherwise Known as the Food Fortification Law, as Part of the Local Nutrition Program Implementation",
    sessionDate: "June 23, 2025",
  },
  {
    id: "res-003",
    number: "246-2025-11",
    title:
      "A Resolution Adopting Republic Act No. 8172, Otherwise Known as the Act of Salt Iodization Nationwide (ASIN)",
    sessionDate: "June 23, 2025",
  },
  {
    id: "res-004",
    number: "245-2025-11",
    title:
      "A Resolution Adopting Republic Act No. 10028, Otherwise Known as the Expanded Breastfeeding Promotion Act of 2009",
    sessionDate: "June 23, 2025",
  },
  {
    id: "res-005",
    number: "244-2025-11",
    title:
      "A Resolution Adopting Executive Order No. 51, Otherwise Known as the National Code of Marketing of Breastmilk Substitute",
    sessionDate: "June 23, 2025",
  },
];

const INITIAL_ORD_CATEGORIES = [
  "Revenue & Taxation",
  "Business & Trade",
  "Public Safety",
  "Environment",
  "Traffic & Transportation",
  "Zoning & Land Use",
];
const INITIAL_RES_TYPES = [
  "Commendation",
  "Request/Appeal",
  "Support/Endorsement",
  "Condolence",
  "Authorization",
  "Appropriation",
];

const INITIAL_ORD_STEPS: ProcessStep[] = [
  {
    id: "os-01",
    step: 1,
    title: "File Proposed Ordinance",
    description:
      "Submit the proposed ordinance to the Sangguniang Bayan for consideration",
  },
  {
    id: "os-02",
    step: 2,
    title: "First Reading / Referral to Committee",
    description:
      "Initial reading and assignment to the relevant committee for review",
  },
  {
    id: "os-03",
    step: 3,
    title: "Public Hearing / Committee Action",
    description:
      "Committee conducts public hearing and deliberates on the proposed ordinance",
  },
  {
    id: "os-04",
    step: 4,
    title: "Committee Report",
    description:
      "Committee submits findings and recommendations to the Sangguniang Bayan",
  },
  {
    id: "os-05",
    step: 5,
    title: "Second Reading",
    description: "Detailed discussion and debate on the proposed ordinance",
  },
  {
    id: "os-06",
    step: 6,
    title: "Third and Final Reading",
    description:
      "Final voting on the proposed ordinance by the Sangguniang Bayan",
  },
  {
    id: "os-07",
    step: 7,
    title: "10-Day Mayor's Approval",
    description:
      "Mayor reviews and approves the enacted ordinance within 10 days",
  },
  {
    id: "os-08",
    step: 8,
    title: "3-Day Submission to SP",
    description:
      "Submit approved ordinance to Sangguniang Panlalawigan for review within 3 days",
  },
  {
    id: "os-09",
    step: 9,
    title: "SP Review Period",
    description:
      "60-day review for appropriation ordinances; 30-day review for others",
  },
  {
    id: "os-10",
    step: 10,
    title: "Posting / Publication",
    description: "Public posting and publication of the approved ordinance",
  },
  {
    id: "os-11",
    step: 11,
    title: "Implementation",
    description:
      "Ordinance takes effect and is enforced within the municipality",
  },
];

const INITIAL_RES_STEPS: ProcessStep[] = [
  {
    id: "rs-01",
    step: 1,
    title: "File Proposed Resolution",
    description: "Submit the proposed resolution to the Sangguniang Bayan",
  },
  {
    id: "rs-02",
    step: 2,
    title: "Inclusion in Session Agenda",
    description:
      "Resolution is scheduled for inclusion in the Sangguniang Bayan session",
  },
  {
    id: "rs-03",
    step: 3,
    title: "Committee Meeting / Approval",
    description: "Committee reviews and approves the proposed resolution",
  },
  {
    id: "rs-04",
    step: 4,
    title: "Final Draft Printing",
    description:
      "Legislative staff prepares and prints the final draft of the resolution",
  },
  {
    id: "rs-05",
    step: 5,
    title: "Official Signing",
    description:
      "Secretary to the Sanggunian and Presiding Officer sign the resolution",
  },
  {
    id: "rs-06",
    step: 6,
    title: "Posting / Transmittal",
    description:
      "Resolution is posted publicly and transmitted to concerned parties",
  },
];

const INITIAL_ABOUT_POINTS: AboutPoint[] = [
  {
    id: "ap-01",
    title: "Ordinances",
    description:
      "Local laws with permanent and general application that require compliance from residents and businesses within the municipality.",
  },
  {
    id: "ap-02",
    title: "Resolutions",
    description:
      "Expressions of the legislative body's will or opinion on specific matters, often used for commendations, requests, or policy positions.",
  },
  {
    id: "ap-03",
    title: "Public Participation",
    description:
      "Citizens can attend Sangguniang Bayan sessions and participate in public hearings for proposed ordinances.",
  },
  {
    id: "ap-04",
    title: "Transparency",
    description:
      "All enacted ordinances and resolutions are made available to the public as part of our commitment to open governance.",
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

const LEG_TABS: { key: LegTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "ordinances",
    label: "Ordinances",
    icon: <LuScroll className="h-3.5 w-3.5" />,
  },
  {
    key: "resolutions",
    label: "Resolutions",
    icon: <LuScale className="h-3.5 w-3.5" />,
  },
  {
    key: "ord-process",
    label: "Ord. Process",
    icon: <LuListOrdered className="h-3.5 w-3.5" />,
  },
  {
    key: "res-process",
    label: "Res. Process",
    icon: <LuListOrdered className="h-3.5 w-3.5" />,
  },
  {
    key: "about",
    label: "About Points",
    icon: <LuInfo className="h-3.5 w-3.5" />,
  },
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
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl !mt-0"
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
        aria-labelledby="leg-del-title"
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
                  id="leg-del-title"
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

// ─── Tags Editor (categories / types) ────────────────────────────────────────

function TagsEditor({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function commit() {
    const v = input.trim();
    if (v && !tags.includes(v)) {
      onAdd(v);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
          >
            {t}
            <button
              type="button"
              onClick={() => onRemove(t)}
              aria-label={`Remove ${t}`}
              className="text-neutral-400 hover:text-red-500 transition-colors"
            >
              <LuX className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          className={inputNormal}
          placeholder={placeholder ?? "Type and press Enter…"}
        />
        <button
          type="button"
          onClick={commit}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <LuPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Documents Panel (shared for ordinances & resolutions) ───────────────────

function DocumentsPanel({
  variant,
  docs,
  setDocs,
  tags,
  setTags,
  externalLink,
  setExternalLink,
  description,
  setDescription,
}: {
  variant: "ordinance" | "resolution";
  docs: LegislativeDocument[];
  setDocs: React.Dispatch<React.SetStateAction<LegislativeDocument[]>>;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  externalLink: string;
  setExternalLink: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}) {
  const isOrd = variant === "ordinance";
  const accent = isOrd ? "blue" : "neutral";
  const accentGradient = isOrd
    ? "from-blue-600 to-blue-800"
    : "from-neutral-700 to-neutral-900";
  const accentBtn = isOrd
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    : "bg-neutral-800 hover:bg-neutral-900 focus:ring-neutral-600";
  const tagColorClass = isOrd
    ? "bg-blue-50 text-blue-700"
    : "bg-neutral-100 text-neutral-600";

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<LegislativeDocument | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<LegislativeDocument | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
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
    setNumber("");
    setTitle("");
    setSessionDate("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(doc: LegislativeDocument) {
    setNumber(doc.number);
    setTitle(doc.title);
    setSessionDate(doc.sessionDate);
    setErrors({});
    setEditTarget(doc);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!number.trim()) e.number = "Document number is required.";
    if (!title.trim()) e.title = "Title is required.";
    if (!sessionDate.trim()) e.sessionDate = "Session date is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      setDocs((p) => [
        ...p,
        {
          id: `${variant}-${crypto.randomUUID().slice(0, 8)}`,
          number: number.trim(),
          title: title.trim(),
          sessionDate: sessionDate.trim(),
        },
      ]);
    } else if (editTarget) {
      setDocs((p) =>
        p.map((d) =>
          d.id === editTarget.id
            ? {
                ...d,
                number: number.trim(),
                title: title.trim(),
                sessionDate: sessionDate.trim(),
              }
            : d,
        ),
      );
      markSaved(editTarget.id);
    }
    closePanel();
  }

  const filtered = docs.filter(
    (d) =>
      search.trim() === "" ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.number.toLowerCase().includes(search.toLowerCase()),
  );

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;
  const label = isOrd ? "Ordinance" : "Resolution";

  return (
    <div className="space-y-6">
      {/* Framework settings card */}
      <SectionCard
        title={`${label} Framework Settings`}
        description={`Description and ${isOrd ? "categories" : "types"} shown on the public page`}
      >
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Public Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputNormal} resize-none`}
              placeholder={`Describe the ${label.toLowerCase()} framework…`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <LuTag className="h-3.5 w-3.5 text-gray-400" />
              {isOrd ? "Categories" : "Types"}
            </label>
            <TagsEditor
              tags={tags}
              onAdd={(t) => setTags((p) => [...p, t])}
              onRemove={(t) => setTags((p) => p.filter((x) => x !== t))}
              placeholder={isOrd ? "e.g. Public Safety" : "e.g. Commendation"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <LuExternalLink className="h-3.5 w-3.5 text-gray-400" />
              Official Portal Link
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className={inputNormal}
              placeholder="https://sangguniangbayan.libmanan.gov.ph/"
            />
          </div>
          {/* Preview pills */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Preview
            </p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tagColorClass}`}
                >
                  {t}
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-xs text-gray-300">No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Documents card */}
      <SectionCard
        title={`${label} Documents`}
        description={`Recent ${label.toLowerCase()}s displayed on the public page`}
        action={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={`Search ${label.toLowerCase()}s`}
                className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
              />
            </div>
            <button
              ref={addBtnRef}
              type="button"
              onClick={openCreate}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all whitespace-nowrap ${accentBtn}`}
            >
              <LuPlus className="h-4 w-4" /> Add {label}
            </button>
          </div>
        }
      >
        {/* Mobile search */}
        <div className="px-6 pt-4 sm:hidden">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No {label.toLowerCase()}s yet. Add one above.
            </p>
          )}
          <AnimatePresence>
            {filtered.map((doc) => (
              <motion.div
                key={doc.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${isOrd ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-neutral-100 border-neutral-200 text-neutral-600"}`}
                >
                  {isOrd ? (
                    <LuScroll className="h-4 w-4" />
                  ) : (
                    <LuScale className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${isOrd ? "bg-blue-50 text-blue-600" : "bg-neutral-100 text-neutral-600"}`}
                    >
                      #{doc.number}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <LuCalendar className="h-3 w-3" /> {doc.sessionDate}
                    </span>
                    <AnimatePresence>
                      {savedIds.has(doc.id) && (
                        <motion.span
                          key="saved"
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
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {doc.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <button
                    ref={
                      getEditRef(doc.id) as React.RefObject<HTMLButtonElement>
                    }
                    type="button"
                    onClick={() => openEdit(doc)}
                    aria-label={`Edit ${doc.number}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(doc)}
                    aria-label={`Remove ${doc.number}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SectionCard>

      {/* Slide panel */}
      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? `Add ${label}` : `Edit ${label}`}
            subtitle={`Displayed in the Recent Documents section`}
            accentColor={accentGradient}
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="doc-form"
            submitLabel={
              panelMode === "create" ? `Add ${label}` : "Save Changes"
            }
            submitColorClass={accentBtn}
          >
            <form
              id="doc-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="doc-number"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuHash className="h-3.5 w-3.5 text-gray-400" />
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="doc-number"
                  type="text"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    setErrors((p) => ({ ...p, number: "" }));
                  }}
                  className={errors.number ? inputError : inputNormal}
                  placeholder={isOrd ? "e.g. 2025-06-11" : "e.g. 249-2025-11"}
                />
                <FieldError id="doc-number-err" msg={errors.number} />
              </div>
              <div>
                <label
                  htmlFor="doc-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Title <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="doc-title"
                  rows={4}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className={`${errors.title ? inputError : inputNormal} resize-none`}
                  placeholder={`An ${label} …`}
                />
                <FieldError id="doc-title-err" msg={errors.title} />
              </div>
              <div>
                <label
                  htmlFor="doc-date"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuCalendar className="h-3.5 w-3.5 text-gray-400" />
                  Session Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="doc-date"
                  type="text"
                  value={sessionDate}
                  onChange={(e) => {
                    setSessionDate(e.target.value);
                    setErrors((p) => ({ ...p, sessionDate: "" }));
                  }}
                  className={errors.sessionDate ? inputError : inputNormal}
                  placeholder="e.g. June 23, 2025"
                />
                <FieldError id="doc-date-err" msg={errors.sessionDate} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={`#${deleteTarget.number}`}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setDocs((p) => p.filter((d) => d.id !== deleteTarget.id))
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Process Steps Panel ──────────────────────────────────────────────────────

function ProcessStepsPanel({
  variant,
  steps,
  setSteps,
}: {
  variant: "ordinance" | "resolution";
  steps: ProcessStep[];
  setSteps: React.Dispatch<React.SetStateAction<ProcessStep[]>>;
}) {
  const isOrd = variant === "ordinance";
  const accentGradient = isOrd
    ? "from-blue-600 to-blue-800"
    : "from-neutral-700 to-neutral-900";
  const accentBtn = isOrd
    ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
    : "bg-neutral-800 hover:bg-neutral-900 focus:ring-neutral-600";
  const dotClass = isOrd
    ? "bg-blue-600 text-white ring-4 ring-blue-100"
    : "bg-neutral-900 text-white ring-4 ring-neutral-100";

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ProcessStep | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessStep | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [stepTitle, setStepTitle] = useState("");
  const [stepDesc, setStepDesc] = useState("");
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
    setStepTitle("");
    setStepDesc("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(s: ProcessStep) {
    setStepTitle(s.title);
    setStepDesc(s.description);
    setErrors({});
    setEditTarget(s);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!stepTitle.trim()) e.title = "Step title is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      const nextStep = steps.length + 1;
      setSteps((p) => [
        ...p,
        {
          id: `${variant}-step-${crypto.randomUUID().slice(0, 8)}`,
          step: nextStep,
          title: stepTitle.trim(),
          description: stepDesc.trim(),
        },
      ]);
    } else if (editTarget) {
      setSteps((p) =>
        p.map((s) =>
          s.id === editTarget.id
            ? { ...s, title: stepTitle.trim(), description: stepDesc.trim() }
            : s,
        ),
      );
      markSaved(editTarget.id);
    }
    closePanel();
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setSteps((p) => {
      const arr = [...p];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr.map((s, i) => ({ ...s, step: i + 1 }));
    });
  }

  function moveDown(index: number) {
    if (index === steps.length - 1) return;
    setSteps((p) => {
      const arr = [...p];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr.map((s, i) => ({ ...s, step: i + 1 }));
    });
  }

  const label = isOrd ? "Ordinance" : "Resolution";
  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <SectionCard
      title={`${label} Process Steps`}
      description={`Manage the step-by-step ${label.toLowerCase()} enactment flow shown on the public page`}
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${accentBtn}`}
        >
          <LuPlus className="h-4 w-4" /> Add Step
        </button>
      }
    >
      <div className="divide-y divide-gray-50">
        {steps.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            No steps yet. Add one above.
          </p>
        )}
        <AnimatePresence>
          {steps.map((s, idx) => (
            <motion.div
              key={s.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6 group hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Step number dot */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${dotClass}`}
                >
                  {String(s.step).padStart(2, "0")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">
                      {s.title}
                    </p>
                    <AnimatePresence>
                      {savedIds.has(s.id) && (
                        <motion.span
                          key="saved"
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
                  {s.description && (
                    <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                      {s.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:shrink-0 sm:ml-auto">
                <div className="flex flex-col gap-0.5 mr-1">
                  <button
                    type="button"
                    onClick={() => moveUp(idx)}
                    disabled={idx === 0}
                    aria-label="Move step up"
                    className="rounded p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <LuGripVertical className="h-3.5 w-3.5 rotate-180 scale-y-50" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(idx)}
                    disabled={idx === steps.length - 1}
                    aria-label="Move step down"
                    className="rounded p-1 text-gray-300 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <LuGripVertical className="h-3.5 w-3.5 scale-y-50" />
                  </button>
                </div>
                <button
                  ref={getEditRef(s.id) as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={() => openEdit(s)}
                  aria-label={`Edit step ${s.step}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                >
                  <LuPencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(s)}
                  aria-label={`Remove step ${s.step}`}
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
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add Process Step" : "Edit Process Step"
            }
            subtitle={`${label} enactment flow · Step ${panelMode === "create" ? steps.length + 1 : editTarget?.step}`}
            accentColor={accentGradient}
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="step-form"
            submitLabel={panelMode === "create" ? "Add Step" : "Save Changes"}
            submitColorClass={accentBtn}
          >
            <form
              id="step-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="step-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Step Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="step-title"
                  type="text"
                  value={stepTitle}
                  onChange={(e) => {
                    setStepTitle(e.target.value);
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className={errors.title ? inputError : inputNormal}
                  placeholder="e.g. First Reading / Referral to Committee"
                />
                <FieldError id="step-title-err" msg={errors.title} />
              </div>
              <div>
                <label
                  htmlFor="step-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="step-desc"
                  rows={3}
                  value={stepDesc}
                  onChange={(e) => setStepDesc(e.target.value)}
                  className={`${inputNormal} resize-none`}
                  placeholder="Briefly describe what happens in this step…"
                />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={`Step ${deleteTarget.step}: ${deleteTarget.title}`}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              setSteps((p) =>
                p
                  .filter((s) => s.id !== deleteTarget.id)
                  .map((s, i) => ({ ...s, step: i + 1 })),
              );
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── About Points Panel ───────────────────────────────────────────────────────

function AboutPointsPanel({
  points,
  setPoints,
}: {
  points: AboutPoint[];
  setPoints: React.Dispatch<React.SetStateAction<AboutPoint[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<AboutPoint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AboutPoint | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [ptTitle, setPtTitle] = useState("");
  const [ptDesc, setPtDesc] = useState("");
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
    setPtTitle("");
    setPtDesc("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(pt: AboutPoint) {
    setPtTitle(pt.title);
    setPtDesc(pt.description);
    setErrors({});
    setEditTarget(pt);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!ptTitle.trim()) e.title = "Title is required.";
    if (!ptDesc.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      setPoints((p) => [
        ...p,
        {
          id: `ap-${crypto.randomUUID().slice(0, 8)}`,
          title: ptTitle.trim(),
          description: ptDesc.trim(),
        },
      ]);
    } else if (editTarget) {
      setPoints((p) =>
        p.map((pt) =>
          pt.id === editTarget.id
            ? { ...pt, title: ptTitle.trim(), description: ptDesc.trim() }
            : pt,
        ),
      );
      markSaved(editTarget.id);
    }
    closePanel();
  }

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <SectionCard
      title="About / Info Points"
      description="The four informational cards shown in the 'Understanding Local Legislation' section"
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <LuPlus className="h-4 w-4" /> Add Point
        </button>
      }
    >
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        {points.length === 0 && (
          <p className="col-span-2 py-6 text-center text-sm text-gray-400">
            No about points yet. Add one above.
          </p>
        )}
        <AnimatePresence>
          {points.map((pt) => (
            <motion.div
              key={pt.id}
              variants={rowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative rounded-xl border border-gray-100 bg-gray-50/50 p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                    <LuInfo className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {pt.title}
                  </h4>
                </div>
                <AnimatePresence>
                  {savedIds.has(pt.id) && (
                    <motion.span
                      key="saved"
                      className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600 ring-1 ring-green-200"
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
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                {pt.description}
              </p>
              <div className="flex items-center gap-2">
                <button
                  ref={getEditRef(pt.id) as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={() => openEdit(pt)}
                  aria-label={`Edit ${pt.title}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                >
                  <LuPencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(pt)}
                  aria-label={`Remove ${pt.title}`}
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
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add About Point" : "Edit About Point"
            }
            subtitle="Shown in the 'Understanding Local Legislation' section"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="about-form"
            submitLabel={panelMode === "create" ? "Add Point" : "Save Changes"}
          >
            <form
              id="about-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="pt-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="pt-title"
                  type="text"
                  value={ptTitle}
                  onChange={(e) => {
                    setPtTitle(e.target.value);
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className={errors.title ? inputError : inputNormal}
                  placeholder="e.g. Transparency"
                />
                <FieldError id="pt-title-err" msg={errors.title} />
              </div>
              <div>
                <label
                  htmlFor="pt-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pt-desc"
                  rows={4}
                  value={ptDesc}
                  onChange={(e) => {
                    setPtDesc(e.target.value);
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  className={`${errors.description ? inputError : inputNormal} resize-none`}
                  placeholder="Briefly describe this point for the public…"
                />
                <FieldError id="pt-desc-err" msg={errors.description} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setPoints((p) => p.filter((pt) => pt.id !== deleteTarget.id))
            }
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export function LegislativeModulePage() {
  const [activeTab, setActiveTab] = useState<LegTab>("ordinances");

  // Ordinance state
  const [ordDocs, setOrdDocs] =
    useState<LegislativeDocument[]>(INITIAL_ORD_DOCS);
  const [ordCategories, setOrdCategories] = useState<string[]>(
    INITIAL_ORD_CATEGORIES,
  );
  const [ordExternalLink, setOrdExternalLink] = useState(
    "https://sangguniangbayan.libmanan.gov.ph/",
  );
  const [ordDescription, setOrdDescription] = useState(
    "Municipal ordinances enacted by the Sangguniang Bayan — local laws that govern the municipality and its residents.",
  );

  // Resolution state
  const [resDocs, setResDocs] =
    useState<LegislativeDocument[]>(INITIAL_RES_DOCS);
  const [resTypes, setResTypes] = useState<string[]>(INITIAL_RES_TYPES);
  const [resExternalLink, setResExternalLink] = useState(
    "https://sangguniangbayan.libmanan.gov.ph/",
  );
  const [resDescription, setResDescription] = useState(
    "Resolutions passed by the Sangguniang Bayan expressing the will or opinion of the legislative body on various matters.",
  );

  // Process steps state
  const [ordSteps, setOrdSteps] = useState<ProcessStep[]>(INITIAL_ORD_STEPS);
  const [resSteps, setResSteps] = useState<ProcessStep[]>(INITIAL_RES_STEPS);

  // About points state
  const [aboutPoints, setAboutPoints] =
    useState<AboutPoint[]>(INITIAL_ABOUT_POINTS);

  const tabCounts: Record<LegTab, number> = {
    ordinances: ordDocs.length,
    resolutions: resDocs.length,
    "ord-process": ordSteps.length,
    "res-process": resSteps.length,
    about: aboutPoints.length,
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
          Legislative Management
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage ordinances, resolutions, process steps, and about content
          displayed on the public Legislative page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Ordinances"
          value={ordDocs.length}
          color="bg-blue-50"
          icon={<LuScroll className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="Resolutions"
          value={resDocs.length}
          color="bg-indigo-50"
          icon={<LuScale className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          label="Ord. Process Steps"
          value={ordSteps.length}
          color="bg-gray-100"
          icon={<LuListOrdered className="h-5 w-5 text-gray-600" />}
        />
        <SummaryCard
          label="Res. Process Steps"
          value={resSteps.length}
          color="bg-emerald-50"
          icon={<LuListOrdered className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Legislative sections"
          >
            {LEG_TABS.map(({ key, label, icon }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`leg-tabpanel-${key}`}
                  id={`leg-tab-${key}`}
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
          id={`leg-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`leg-tab-${activeTab}`}
          className="p-4 sm:p-5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
            >
              {activeTab === "ordinances" && (
                <DocumentsPanel
                  variant="ordinance"
                  docs={ordDocs}
                  setDocs={setOrdDocs}
                  tags={ordCategories}
                  setTags={setOrdCategories}
                  externalLink={ordExternalLink}
                  setExternalLink={setOrdExternalLink}
                  description={ordDescription}
                  setDescription={setOrdDescription}
                />
              )}
              {activeTab === "resolutions" && (
                <DocumentsPanel
                  variant="resolution"
                  docs={resDocs}
                  setDocs={setResDocs}
                  tags={resTypes}
                  setTags={setResTypes}
                  externalLink={resExternalLink}
                  setExternalLink={setResExternalLink}
                  description={resDescription}
                  setDescription={setResDescription}
                />
              )}
              {activeTab === "ord-process" && (
                <ProcessStepsPanel
                  variant="ordinance"
                  steps={ordSteps}
                  setSteps={setOrdSteps}
                />
              )}
              {activeTab === "res-process" && (
                <ProcessStepsPanel
                  variant="resolution"
                  steps={resSteps}
                  setSteps={setResSteps}
                />
              )}
              {activeTab === "about" && (
                <AboutPointsPanel
                  points={aboutPoints}
                  setPoints={setAboutPoints}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

LegislativeModulePage.displayName = "LegislativeModulePage";

export default LegislativeModulePage;
