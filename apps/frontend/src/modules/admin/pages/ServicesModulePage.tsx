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
  LuTag,
  LuHash,
  LuClock,
  LuBanknote,
  LuCalendarDays,
  LuLink2,
  LuShuffle,
  LuFileText,
  LuLayoutGrid,
} from "react-icons/lu";
import type {
  ServiceCategory,
  ServiceItem,
  LifeEvent,
} from "@/modules/services/types/types";

// ─── Mock Data ────────────────────────────────────────────────────────────────

import {
  FaFileAlt,
  FaBriefcase,
  FaMoneyBill,
  FaUsers,
  FaHeartbeat,
  FaSeedling,
  FaRoad,
  FaGraduationCap,
  FaShieldAlt,
  FaLeaf,
  FaStore,
  FaHeart,
  FaSmile,
  FaWallet,
  FaIdCard,
  FaAccessibleIcon,
  FaHammer,
  FaQuestionCircle,
} from "react-icons/fa";

const INITIAL_CATEGORIES: ServiceCategory[] = [
  {
    id: "certificates",
    title: "Certificates",
    slug: "certificates",
    description:
      "Birth, marriage, death, and other civil registry certificates",
    icon: FaFileAlt,
    services: [
      {
        id: "birth-certificate",
        title: "Birth Certificate",
        description: "Get a certified copy of a birth certificate",
        fee: "Php 150",
        processingTime: "3-5 working days",
        requirements: ["Valid ID", "Proof of relationship"],
        steps: [
          "Visit Municipal Civil Registrar",
          "Fill out form",
          "Submit and pay",
          "Claim certificate",
        ],
        categorySlug: "certificates",
      },
      {
        id: "marriage-certificate",
        title: "Marriage Certificate",
        description: "Obtain a copy of a marriage certificate",
        fee: "Php 150",
        processingTime: "3-5 working days",
        requirements: ["Valid ID", "Proof of relationship"],
        steps: [
          "Visit Municipal Civil Registrar",
          "Fill out form",
          "Submit and pay",
          "Claim certificate",
        ],
        categorySlug: "certificates",
      },
      {
        id: "death-certificate",
        title: "Death Certificate",
        description: "Request a certified copy of a death certificate",
        fee: "Php 150",
        processingTime: "3-5 working days",
        requirements: ["Valid ID", "Proof of relationship"],
        steps: [
          "Visit Municipal Civil Registrar",
          "Fill out form",
          "Submit and pay",
          "Claim certificate",
        ],
        categorySlug: "certificates",
      },
    ],
  },
  {
    id: "business",
    title: "Business Permits",
    slug: "business",
    description: "New business permits, renewals, and closures",
    icon: FaBriefcase,
    services: [
      {
        id: "new-business-permit",
        title: "New Business Permit",
        description: "Apply for a new business permit",
        fee: "Varies by business type",
        processingTime: "5-7 working days",
        requirements: ["Barangay Clearance", "DTI Registration"],
        steps: [
          "Secure barangay clearance",
          "Register at DTI",
          "Submit to BPLO",
          "Pay fees",
          "Receive permit",
        ],
        categorySlug: "business",
      },
      {
        id: "business-permit-renewal",
        title: "Business Permit Renewal",
        description: "Renew your existing business permit",
        fee: "Varies by business type",
        processingTime: "2-3 working days",
        requirements: ["Previous business permit", "Barangay Clearance"],
        steps: [
          "Submit renewal application",
          "Pay fees",
          "Receive renewed permit",
        ],
        categorySlug: "business",
      },
    ],
  },
  {
    id: "tax-payments",
    title: "Tax Payments",
    slug: "tax-payments",
    description: "Property tax, business tax, and other municipal tax payments",
    icon: FaMoneyBill,
    services: [
      {
        id: "real-property-tax",
        title: "Real Property Tax",
        description: "Pay your real property tax",
        fee: "Based on property assessment",
        processingTime: "Same day",
        requirements: ["Tax Declaration", "Previous OR"],
        steps: [
          "Visit Treasurer's Office",
          "Present tax declaration",
          "Pay tax",
          "Get receipt",
        ],
        categorySlug: "tax-payments",
      },
      {
        id: "business-tax",
        title: "Business Tax",
        description: "Settle your annual business tax",
        fee: "Based on gross receipts",
        processingTime: "Same day",
        requirements: ["Business permit", "Previous OR"],
        steps: ["Submit declaration", "Pay tax", "Receive receipt"],
        categorySlug: "tax-payments",
      },
    ],
  },
  {
    id: "social-services",
    title: "Social Services",
    slug: "social-services",
    description: "Senior citizen, PWD, and other social welfare services",
    icon: FaUsers,
    services: [
      {
        id: "senior-citizen-id",
        title: "Senior Citizen ID",
        description: "Apply for a senior citizen identification card",
        fee: "Free",
        processingTime: "3-5 working days",
        requirements: [
          "Birth Certificate",
          "Barangay Clearance",
          "2 pcs 1x1 photo",
        ],
        steps: [
          "Visit MSWDO",
          "Submit requirements",
          "Fill out form",
          "Claim ID",
        ],
        categorySlug: "social-services",
      },
      {
        id: "pwd-id",
        title: "PWD ID",
        description: "Get a Person with Disability ID",
        fee: "Free",
        processingTime: "3-5 working days",
        requirements: [
          "Medical Certificate",
          "Barangay Clearance",
          "2 pcs 1x1 photo",
        ],
        steps: [
          "Visit MSWDO",
          "Submit requirements",
          "Fill out form",
          "Claim ID",
        ],
        categorySlug: "social-services",
      },
    ],
  },
  {
    id: "health",
    title: "Health Services",
    slug: "health",
    description: "Medical assistance, health programs, and hospital services",
    icon: FaHeartbeat,
    services: [
      {
        id: "medical-assistance",
        title: "Medical Assistance",
        description: "Apply for financial medical assistance",
        fee: "Subject to approval",
        processingTime: "5-7 working days",
        requirements: ["Medical Certificate", "Barangay Indigency", "Valid ID"],
        steps: [
          "Visit Municipal Health Office",
          "Submit requirements",
          "Wait for approval",
          "Claim assistance",
        ],
        categorySlug: "health",
      },
    ],
  },
  {
    id: "agriculture",
    title: "Agriculture",
    slug: "agriculture",
    description: "Agricultural programs, seeds, and farming assistance",
    icon: FaSeedling,
    services: [
      {
        id: "seed-distribution",
        title: "Seed Distribution",
        description: "Get quality seeds for your farm",
        fee: "Free (subject to availability)",
        processingTime: "Same day",
        requirements: ["Barangay Clearance", "Proof of farming"],
        steps: [
          "Visit Agriculture Office",
          "Submit requirements",
          "Receive seeds",
        ],
        categorySlug: "agriculture",
      },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    slug: "infrastructure",
    description: "Building permits, construction, and public works",
    icon: FaRoad,
    services: [
      {
        id: "building-permit",
        title: "Building Permit",
        description: "Apply for a building permit",
        fee: "Varies by project size",
        processingTime: "7-10 working days",
        requirements: ["Lot Plan", "Building Plan", "Barangay Clearance"],
        steps: [
          "Submit plans to Engineering Office",
          "Wait for evaluation",
          "Pay fees",
          "Claim permit",
        ],
        categorySlug: "infrastructure",
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    slug: "education",
    description: "Scholarships and educational assistance",
    icon: FaGraduationCap,
    services: [
      {
        id: "scholarship-programs",
        title: "Scholarship Programs",
        description: "Apply for municipal scholarship grants",
        fee: "Free",
        processingTime: "15-30 working days",
        requirements: [
          "Report Card",
          "Barangay Clearance",
          "Income Tax Return",
        ],
        steps: [
          "Check scholarship openings",
          "Submit application",
          "Wait for screening",
          "Receive result",
        ],
        categorySlug: "education",
      },
    ],
  },
  {
    id: "public-safety",
    title: "Public Safety",
    slug: "public-safety",
    description: "Police, fire, and emergency services",
    icon: FaShieldAlt,
    services: [
      {
        id: "police-clearance",
        title: "Police Clearance",
        description: "Request a police clearance certificate",
        fee: "Php 150",
        processingTime: "Same day",
        requirements: ["Valid ID", "Barangay Clearance"],
        steps: [
          "Visit PNP Station",
          "Submit requirements",
          "Photo and fingerprints",
          "Claim clearance",
        ],
        categorySlug: "public-safety",
      },
    ],
  },
  {
    id: "environment",
    title: "Environment",
    slug: "environment",
    description: "Environmental programs and permits",
    icon: FaLeaf,
    services: [
      {
        id: "environmental-clearance",
        title: "Environmental Clearance",
        description: "Secure an environmental clearance for your project",
        fee: "Varies by project",
        processingTime: "7-10 working days",
        requirements: [
          "Project Description",
          "Location Map",
          "Barangay Clearance",
        ],
        steps: [
          "Submit application",
          "Wait for site inspection",
          "Pay fees",
          "Claim clearance",
        ],
        categorySlug: "environment",
      },
    ],
  },
];

const INITIAL_LIFE_EVENTS: LifeEvent[] = [
  {
    id: "starting-business",
    title: "Starting a Business",
    icon: FaStore,
    services: [
      "new-business-permit",
      "business-permit-renewal",
      "business-tax",
      "environmental-clearance",
    ],
  },
  {
    id: "getting-married",
    title: "Getting Married",
    icon: FaHeart,
    services: ["marriage-certificate", "birth-certificate"],
  },
  {
    id: "having-baby",
    title: "Having a Baby",
    icon: FaSmile,
    services: ["birth-certificate", "medical-assistance"],
  },
  {
    id: "need-financial-help",
    title: "Need Financial Help",
    icon: FaWallet,
    services: ["medical-assistance", "senior-citizen-id", "pwd-id"],
  },
  {
    id: "senior-citizen",
    title: "Senior Citizen Services",
    icon: FaIdCard,
    services: ["senior-citizen-id", "birth-certificate"],
  },
  {
    id: "person-with-disability",
    title: "Person with Disability",
    icon: FaAccessibleIcon,
    services: ["pwd-id", "medical-assistance"],
  },
  {
    id: "building-home",
    title: "Building/Home Improvement",
    icon: FaHammer,
    services: [
      "building-permit",
      "environmental-clearance",
      "real-property-tax",
    ],
  },
  {
    id: "got-in-trouble",
    title: "Got in Trouble",
    icon: FaQuestionCircle,
    services: ["police-clearance"],
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

type ServicesTab = "categories" | "services" | "life-events";

const SERVICES_TABS: {
  key: ServicesTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "categories",
    label: "Categories",
    icon: <LuLayoutGrid className="h-3.5 w-3.5" />,
  },
  {
    key: "services",
    label: "Services",
    icon: <LuFileText className="h-3.5 w-3.5" />,
  },
  {
    key: "life-events",
    label: "Life Events",
    icon: <LuCalendarDays className="h-3.5 w-3.5" />,
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

function ListEditorField({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const v = input.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setInput("");
  }

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              aria-label={`Remove ${item}`}
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
              add();
            }
          }}
          className={inputNormal}
          placeholder={placeholder ?? "Type and press Enter…"}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <LuPlus className="h-4 w-4" />
        </button>
      </div>
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
        aria-labelledby="svc-del-title"
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
                  id="svc-del-title"
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

// ─── Categories Panel ─────────────────────────────────────────────────────────

interface CategoryFormState {
  id: string;
  title: string;
  slug: string;
  description: string;
}

const emptyCategory = (): CategoryFormState => ({
  id: "",
  title: "",
  slug: "",
  description: "",
});

function categoryToForm(c: ServiceCategory): CategoryFormState {
  return { id: c.id, title: c.title, slug: c.slug, description: c.description };
}

function validateCategory(f: CategoryFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Title is required.";
  if (!f.slug.trim()) e.slug = "Slug is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  return e;
}

function CategoriesPanel({
  categories,
  setCategories,
}: {
  categories: ServiceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ServiceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceCategory | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryFormState>(emptyCategory());
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
    setForm(emptyCategory());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: ServiceCategory) {
    setForm(categoryToForm(c));
    setErrors({});
    setEditTarget(c);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateCategory(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const id = form.id.trim() || autoSlug(form.title);

    if (panelMode === "create") {
      const newCat: ServiceCategory = {
        id,
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        icon: FaFileAlt,
        services: [],
      };
      setCategories((prev) => [...prev, newCat]);
    } else if (editTarget) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? {
                ...c,
                title: form.title.trim(),
                slug: form.slug.trim(),
                description: form.description.trim(),
              }
            : c,
        ),
      );
      markSaved(editTarget.id);
    }
    closePanel();
  }

  const filtered = categories.filter(
    (c) =>
      search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <SectionCard
      title="Service Categories"
      description="Top-level groupings displayed on the public Services page"
      action={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search categories"
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
            />
          </div>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Category
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
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            No categories found.
          </p>
        )}
        <AnimatePresence>
          {filtered.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">
                        {cat.title}
                      </p>
                      <span className="text-[10px] font-mono font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        /{cat.slug}
                      </span>
                      <AnimatePresence>
                        {savedIds.has(cat.id) && (
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
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                      {cat.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <span className="text-[11px] font-medium text-neutral-400 bg-neutral-100 rounded-full px-2 py-0.5">
                    {cat.services.length}{" "}
                    {cat.services.length === 1 ? "service" : "services"}
                  </span>
                  <button
                    ref={
                      getEditRef(cat.id) as React.RefObject<HTMLButtonElement>
                    }
                    type="button"
                    onClick={() => openEdit(cat)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                    aria-label={`Edit ${cat.title}`}
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                    aria-label={`Remove ${cat.title}`}
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Category" : "Edit Category"}
            subtitle="Displayed on the public Services page"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="cat-form"
            submitLabel={
              panelMode === "create" ? "Add Category" : "Save Changes"
            }
          >
            <form
              id="cat-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="cat-title"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cat-title"
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm((p) => ({ ...p, title: t, slug: autoSlug(t) }));
                      setErrors((p) => ({ ...p, title: "" }));
                    }}
                    className={errors.title ? inputError : inputNormal}
                    placeholder="e.g. Certificates"
                  />
                  <FieldError id="cat-title-err" msg={errors.title} />
                </div>
                <div>
                  <label
                    htmlFor="cat-slug"
                    className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <LuHash className="h-3.5 w-3.5 text-gray-400" /> Slug{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cat-slug"
                    type="text"
                    value={form.slug}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, slug: e.target.value }));
                      setErrors((p) => ({ ...p, slug: "" }));
                    }}
                    className={errors.slug ? inputError : inputNormal}
                    placeholder="e.g. certificates"
                  />
                  <FieldError id="cat-slug-err" msg={errors.slug} />
                </div>
              </div>
              <div>
                <label
                  htmlFor="cat-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cat-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, description: e.target.value }));
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  className={`${errors.description ? inputError : inputNormal} resize-none`}
                  placeholder="Short description of the category"
                />
                <FieldError id="cat-desc-err" msg={errors.description} />
              </div>
              <p className="text-xs text-gray-400">
                Note: Category icon is set via the codebase. Contact a developer
                to update it.
              </p>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setCategories((prev) =>
                prev.filter((c) => c.id !== deleteTarget.id),
              )
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Services Panel ───────────────────────────────────────────────────────────

interface ServiceFormState {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  fee: string;
  processingTime: string;
  link: string;
  requirements: string[];
  steps: string[];
}

const emptyService = (categories: ServiceCategory[]): ServiceFormState => ({
  id: "",
  title: "",
  description: "",
  categorySlug: categories[0]?.slug ?? "",
  fee: "",
  processingTime: "",
  link: "",
  requirements: [],
  steps: [],
});

function serviceToForm(s: ServiceItem): ServiceFormState {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    categorySlug: s.categorySlug ?? "",
    fee: s.fee ?? "",
    processingTime: s.processingTime ?? "",
    link: s.link ?? "",
    requirements: s.requirements ?? [],
    steps: s.steps ?? [],
  };
}

function validateService(f: ServiceFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Title is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  if (!f.categorySlug.trim()) e.categorySlug = "Category is required.";
  return e;
}

function ServicesPanel({
  categories,
  setCategories,
}: {
  categories: ServiceCategory[];
  setCategories: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
}) {
  const allServices: Array<ServiceItem & { categoryTitle: string }> =
    categories.flatMap((cat) =>
      cat.services.map((s) => ({ ...s, categoryTitle: cat.title })),
    );

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    (ServiceItem & { categoryTitle: string }) | null
  >(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [form, setForm] = useState<ServiceFormState>(emptyService(categories));
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
    setForm(emptyService(categories));
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(s: ServiceItem) {
    setForm(serviceToForm(s));
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
    const e = validateService(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const item: ServiceItem = {
      id:
        form.id.trim() ||
        form.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      title: form.title.trim(),
      description: form.description.trim(),
      categorySlug: form.categorySlug,
      fee: form.fee.trim() || undefined,
      processingTime: form.processingTime.trim() || undefined,
      link: form.link.trim() || undefined,
      requirements: form.requirements.filter(Boolean),
      steps: form.steps.filter(Boolean),
    };

    if (panelMode === "create") {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.slug === form.categorySlug
            ? { ...cat, services: [...cat.services, item] }
            : cat,
        ),
      );
    } else if (editTarget) {
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          services: cat.services
            .filter(
              (s) =>
                !(s.id === editTarget.id && cat.slug !== form.categorySlug),
            )
            .map((s) => (s.id === editTarget.id ? item : s))
            .concat(
              cat.slug === form.categorySlug &&
                editTarget.categorySlug !== form.categorySlug
                ? [item]
                : [],
            ),
        })),
      );
      markSaved(item.id);
    }
    closePanel();
  }

  const filtered = allServices.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search.trim() ||
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.categoryTitle.toLowerCase().includes(q);
    const matchCat =
      filterCategory === "All" || s.categoryTitle === filterCategory;
    return matchSearch && matchCat;
  });

  const returnFocusRef = (
    panelMode === "create"
      ? addBtnRef
      : editTarget
        ? getEditRef(editTarget.id)
        : addBtnRef
  ) as React.RefObject<HTMLButtonElement>;

  return (
    <SectionCard
      title="Individual Services"
      description="Manage all services displayed across every category"
      action={
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="hidden sm:block rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.title}>
                {c.title}
              </option>
            ))}
          </select>
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search services"
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-40"
            />
          </div>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Service
          </button>
        </div>
      }
    >
      {/* Mobile filters */}
      <div className="px-6 pt-4 sm:hidden space-y-2">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="All">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.title}>
              {c.title}
            </option>
          ))}
        </select>
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Service
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 hidden md:table-cell">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                Fee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                Processing
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
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
              {filtered.length === 0 ? (
                <motion.tr key="empty">
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    No services found.
                  </td>
                </motion.tr>
              ) : (
                filtered.map((s) => (
                  <motion.tr
                    key={s.id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
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
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {s.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        {s.categoryTitle}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <LuBanknote className="h-3.5 w-3.5 text-gray-400" />
                        {s.fee || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <LuClock className="h-3.5 w-3.5 text-gray-400" />
                        {s.processingTime || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          ref={
                            getEditRef(
                              s.id,
                            ) as React.RefObject<HTMLButtonElement>
                          }
                          type="button"
                          onClick={() => openEdit(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                          aria-label={`Edit ${s.title}`}
                        >
                          <LuPencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                          aria-label={`Remove ${s.title}`}
                        >
                          <LuTrash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Service" : "Edit Service"}
            subtitle="Displayed on the public Services page"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="svc-form"
            submitLabel={
              panelMode === "create" ? "Add Service" : "Save Changes"
            }
          >
            <form
              id="svc-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="svc-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="svc-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, title: e.target.value }));
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className={errors.title ? inputError : inputNormal}
                  placeholder="e.g. Birth Certificate"
                />
                <FieldError id="svc-title-err" msg={errors.title} />
              </div>
              <div>
                <label
                  htmlFor="svc-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="svc-desc"
                  rows={2}
                  value={form.description}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, description: e.target.value }));
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  className={`${errors.description ? inputError : inputNormal} resize-none`}
                  placeholder="Brief description of this service"
                />
                <FieldError id="svc-desc-err" msg={errors.description} />
              </div>
              <div>
                <label
                  htmlFor="svc-cat"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuTag className="h-3.5 w-3.5 text-gray-400" /> Category{" "}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  id="svc-cat"
                  value={form.categorySlug}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, categorySlug: e.target.value }));
                    setErrors((p) => ({ ...p, categorySlug: "" }));
                  }}
                  className={errors.categorySlug ? inputError : inputNormal}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <FieldError id="svc-cat-err" msg={errors.categorySlug} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="svc-fee"
                    className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <LuBanknote className="h-3.5 w-3.5 text-gray-400" /> Fee
                  </label>
                  <input
                    id="svc-fee"
                    type="text"
                    value={form.fee}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, fee: e.target.value }))
                    }
                    className={inputNormal}
                    placeholder="e.g. Php 150 or Free"
                  />
                </div>
                <div>
                  <label
                    htmlFor="svc-time"
                    className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <LuClock className="h-3.5 w-3.5 text-gray-400" /> Processing
                    Time
                  </label>
                  <input
                    id="svc-time"
                    type="text"
                    value={form.processingTime}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, processingTime: e.target.value }))
                    }
                    className={inputNormal}
                    placeholder="e.g. 3-5 working days"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="svc-link"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuLink2 className="h-3.5 w-3.5 text-gray-400" /> External
                  Link
                </label>
                <input
                  id="svc-link"
                  type="url"
                  value={form.link}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, link: e.target.value }))
                  }
                  className={inputNormal}
                  placeholder="https://…"
                />
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <ListEditorField
                  label="Requirements"
                  items={form.requirements}
                  onChange={(items) =>
                    setForm((p) => ({ ...p, requirements: items }))
                  }
                  placeholder="Add requirement and press Enter…"
                />
                <ListEditorField
                  label="Steps"
                  items={form.steps}
                  onChange={(items) => setForm((p) => ({ ...p, steps: items }))}
                  placeholder="Add step and press Enter…"
                />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              setCategories((prev) =>
                prev.map((cat) => ({
                  ...cat,
                  services: cat.services.filter(
                    (s) => s.id !== deleteTarget.id,
                  ),
                })),
              );
            }}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Life Events Panel ────────────────────────────────────────────────────────

interface LifeEventFormState {
  id: string;
  title: string;
  serviceIds: string[];
}

const emptyLifeEvent = (): LifeEventFormState => ({
  id: "",
  title: "",
  serviceIds: [],
});

function lifeEventToForm(e: LifeEvent): LifeEventFormState {
  return { id: e.id, title: e.title, serviceIds: e.services };
}

function validateLifeEvent(f: LifeEventFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Title is required.";
  return e;
}

function LifeEventsPanel({
  lifeEvents,
  setLifeEvents,
  categories,
}: {
  lifeEvents: LifeEvent[];
  setLifeEvents: React.Dispatch<React.SetStateAction<LifeEvent[]>>;
  categories: ServiceCategory[];
}) {
  const allServices = categories.flatMap((c) =>
    c.services.map((s) => ({ ...s, categoryTitle: c.title })),
  );

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<LifeEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifeEvent | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<LifeEventFormState>(emptyLifeEvent());
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
    setForm(emptyLifeEvent());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(ev: LifeEvent) {
    setForm(lifeEventToForm(ev));
    setErrors({});
    setEditTarget(ev);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateLifeEvent(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const id =
      form.id.trim() ||
      form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const item: LifeEvent = {
      id,
      title: form.title.trim(),
      icon: FaStore,
      services: form.serviceIds,
    };

    if (panelMode === "create") {
      setLifeEvents((prev) => [...prev, item]);
    } else if (editTarget) {
      setLifeEvents((prev) =>
        prev.map((e) =>
          e.id === editTarget.id
            ? { ...e, title: form.title.trim(), services: form.serviceIds }
            : e,
        ),
      );
      markSaved(editTarget.id);
    }
    closePanel();
  }

  function toggleService(serviceId: string) {
    setForm((p) => ({
      ...p,
      serviceIds: p.serviceIds.includes(serviceId)
        ? p.serviceIds.filter((id) => id !== serviceId)
        : [...p.serviceIds, serviceId],
    }));
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
      title="Life Events"
      description="Curated service groupings based on life situations"
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
        >
          <LuPlus className="h-4 w-4" /> Add Life Event
        </button>
      }
    >
      <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
        {lifeEvents.length === 0 && (
          <p className="col-span-2 py-10 text-center text-sm text-gray-400">
            No life events yet. Add one above.
          </p>
        )}
        <AnimatePresence>
          {lifeEvents.map((ev) => {
            const Icon = ev.icon;
            const linkedServices = allServices.filter((s) =>
              ev.services.includes(s.id),
            );
            return (
              <motion.div
                key={ev.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 text-neutral-600">
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">
                          {ev.title}
                        </p>
                        <AnimatePresence>
                          {savedIds.has(ev.id) && (
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
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {ev.services.length} linked{" "}
                        {ev.services.length === 1 ? "service" : "services"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      ref={
                        getEditRef(ev.id) as React.RefObject<HTMLButtonElement>
                      }
                      type="button"
                      onClick={() => openEdit(ev)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      aria-label={`Edit ${ev.title}`}
                    >
                      <LuPencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ev)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                      aria-label={`Remove ${ev.title}`}
                    >
                      <LuTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {linkedServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {linkedServices.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700"
                      >
                        {s.title}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add Life Event" : "Edit Life Event"
            }
            subtitle="Displayed on the public Services page"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="le-form"
            submitLabel={
              panelMode === "create" ? "Add Life Event" : "Save Changes"
            }
          >
            <form
              id="le-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="le-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="le-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, title: e.target.value }));
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  className={errors.title ? inputError : inputNormal}
                  placeholder="e.g. Starting a Business"
                />
                <FieldError id="le-title-err" msg={errors.title} />
              </div>
              <p className="text-xs text-gray-400 -mt-1">
                Icon is set via the codebase. Contact a developer to change it.
              </p>
              <div className="border-t border-gray-100 pt-4">
                <p className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <LuShuffle className="h-3.5 w-3.5 text-gray-400" /> Linked
                  Services
                  <span className="ml-auto text-[11px] font-normal text-gray-400">
                    {form.serviceIds.length} selected
                  </span>
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 py-1.5">
                        {cat.title}
                      </p>
                      {cat.services.map((s) => {
                        const checked = form.serviceIds.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={[
                              "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                              checked ? "bg-blue-50" : "hover:bg-gray-50",
                            ].join(" ")}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleService(s.id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span
                              className={`text-xs font-medium ${checked ? "text-blue-700" : "text-gray-700"}`}
                            >
                              {s.title}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setLifeEvents((prev) =>
                prev.filter((e) => e.id !== deleteTarget.id),
              )
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Stats Summary Card ───────────────────────────────────────────────────────

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

// ─── Root Page Component ──────────────────────────────────────────────────────

export function ServicesModulePage() {
  const [activeTab, setActiveTab] = useState<ServicesTab>("categories");
  const [categories, setCategories] =
    useState<ServiceCategory[]>(INITIAL_CATEGORIES);
  const [lifeEvents, setLifeEvents] =
    useState<LifeEvent[]>(INITIAL_LIFE_EVENTS);

  const totalServices = categories.reduce(
    (sum, c) => sum + c.services.length,
    0,
  );

  const tabCounts: Record<ServicesTab, number> = {
    categories: categories.length,
    services: totalServices,
    "life-events": lifeEvents.length,
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
        <h1 className="text-xl font-bold text-gray-900">Services Management</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage categories, services, and life events displayed on the public
          Services page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard
          label="Categories"
          value={categories.length}
          color="bg-blue-50"
          icon={<LuLayoutGrid className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="Total Services"
          value={totalServices}
          color="bg-indigo-50"
          icon={<LuFileText className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          label="Life Events"
          value={lifeEvents.length}
          color="bg-emerald-50"
          icon={<LuCalendarDays className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Services sections"
          >
            {SERVICES_TABS.map(({ key, label, icon }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`svc-tabpanel-${key}`}
                  id={`svc-tab-${key}`}
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
          id={`svc-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`svc-tab-${activeTab}`}
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
              {activeTab === "categories" && (
                <CategoriesPanel
                  categories={categories}
                  setCategories={setCategories}
                />
              )}
              {activeTab === "services" && (
                <ServicesPanel
                  categories={categories}
                  setCategories={setCategories}
                />
              )}
              {activeTab === "life-events" && (
                <LifeEventsPanel
                  lifeEvents={lifeEvents}
                  setLifeEvents={setLifeEvents}
                  categories={categories}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

ServicesModulePage.displayName = "ServicesModulePage";
export default ServicesModulePage;
