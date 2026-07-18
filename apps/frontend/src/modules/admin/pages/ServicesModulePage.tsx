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
  LuRefreshCw,
  LuTriangleAlert,
  LuImage,
} from "react-icons/lu";
import { useServicesStore } from "../store/servicesStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import { resolveIcon, ICON_KEYS } from "@/modules/services/utils/iconMap";
import type {
  ServiceCategoryRecord,
  ServiceItemRecord,
  LifeEventRecord,
  CategoryPayload,
  ServiceItemPayload,
  LifeEventPayload,
} from "../services/services.api";

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

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4 animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-gray-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3.5 w-1/3 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-7 w-16 rounded-lg bg-gray-100" />
            <div className="h-7 w-16 rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100">
      <LuTriangleAlert className="h-4 w-4 text-red-500 shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors shrink-0"
        >
          Retry
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
  isSubmitting?: boolean;
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
  isSubmitting = false,
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
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={isSubmitting}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60 ${submitColorClass}`}
          >
            {isSubmitting ? "Saving…" : submitLabel}
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
  title: string;
  slug: string;
  description: string;
  iconKey: string;
  status: "published" | "draft";
}

const emptyCategory = (): CategoryFormState => ({
  title: "",
  slug: "",
  description: "",
  iconKey: "FaFileAlt",
  status: "draft",
});

function categoryToForm(c: ServiceCategoryRecord): CategoryFormState {
  return {
    title: c.title,
    slug: c.slug,
    description: c.description,
    iconKey: c.iconKey,
    status: c.status,
  };
}

function validateCategory(f: CategoryFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Title is required.";
  if (!f.slug.trim()) e.slug = "Slug is required.";
  if (!f.description.trim()) e.description = "Description is required.";
  return e;
}

function CategoriesPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const categories = useServicesStore((s) => s.adminCategories);
  const isLoading = useServicesStore((s) => s.isAdminCategoriesLoading);
  const error = useServicesStore((s) => s.error);
  const {
    fetchAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useServicesStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ServiceCategoryRecord | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] =
    useState<ServiceCategoryRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<CategoryFormState>(emptyCategory());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  function openCreate() {
    setForm(emptyCategory());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: ServiceCategoryRecord) {
    setForm(categoryToForm(c));
    setErrors({});
    setEditTarget(c);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateCategory(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const payload: CategoryPayload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        iconKey: form.iconKey,
        status: form.status,
      };
      if (panelMode === "create") {
        await createCategory(payload, accessToken);
        toast("Category created.", "success");
      } else if (editTarget) {
        const updated = await updateCategory(
          editTarget.id,
          payload,
          accessToken,
        );
        markSaved(updated.id);
        toast("Category updated.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(
        err?.response?.data?.message || "Failed to save category.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteCategory(id, accessToken);
      toast("Category removed.", "success");
    } catch {
      toast("Failed to remove category.", "error");
    }
  }

  const filtered = categories.filter(
    (c) =>
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()),
  );

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
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => accessToken && fetchAdminCategories(accessToken)}
        />
      )}
      {isLoading && categories.length === 0 ? (
        <SkeletonRows />
      ) : categories.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <LuLayoutGrid className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            No categories yet
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Add your first service category to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Category
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {filtered.map((cat) => {
              const Icon = resolveIcon(cat.iconKey);
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
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                        >
                          {cat.status}
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
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Category" : "Edit Category"}
            subtitle="Displayed on the public Services page"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="cat-form"
            submitLabel={
              panelMode === "create" ? "Add Category" : "Save Changes"
            }
            isSubmitting={isSubmitting}
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
                      setForm((p) => ({
                        ...p,
                        title: t,
                        slug: panelMode === "create" ? autoSlug(t) : p.slug,
                      }));
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
              <div>
                <label
                  htmlFor="cat-icon"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuImage className="h-3.5 w-3.5 text-gray-400" /> Icon
                </label>
                <select
                  id="cat-icon"
                  value={form.iconKey}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, iconKey: e.target.value }))
                  }
                  className={inputNormal}
                >
                  {ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="cat-status"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Status
                </label>
                <select
                  id="cat-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as "published" | "draft",
                    }))
                  }
                  className={inputNormal}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget.id)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Services Panel ───────────────────────────────────────────────────────────

interface ServiceFormState {
  title: string;
  description: string;
  categoryId: string;
  fee: string;
  processingTime: string;
  link: string;
  requirements: string[];
  steps: string[];
}

function emptyService(cats: ServiceCategoryRecord[]): ServiceFormState {
  return {
    title: "",
    description: "",
    categoryId: cats[0]?.id ?? "",
    fee: "",
    processingTime: "",
    link: "",
    requirements: [],
    steps: [],
  };
}

function serviceToForm(
  s: ServiceItemRecord,
  cats: ServiceCategoryRecord[],
): ServiceFormState {
  const cat = cats.find((c) => c.slug === s.categorySlug);
  return {
    title: s.title,
    description: s.description,
    categoryId: cat?.id ?? "",
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
  if (!f.categoryId) e.categoryId = "Category is required.";
  return e;
}

function ServicesPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const categories = useServicesStore((s) => s.adminCategories);
  const isLoading = useServicesStore((s) => s.isAdminCategoriesLoading);
  const error = useServicesStore((s) => s.error);
  const { fetchAdminCategories, addService, updateService, removeService } =
    useServicesStore();

  const allServices = categories.flatMap((cat) =>
    cat.services.map((s) => ({
      ...s,
      categoryTitle: cat.title,
      categoryId: cat.id,
    })),
  );

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<
    (ServiceItemRecord & { categoryId: string }) | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    (ServiceItemRecord & { categoryId: string }) | null
  >(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [form, setForm] = useState<ServiceFormState>(emptyService(categories));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setForm(emptyService(categories));
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(s: ServiceItemRecord & { categoryId: string }) {
    setForm(serviceToForm(s, categories));
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
    const e = validateService(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!accessToken) return;

    const payload: ServiceItemPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      fee: form.fee.trim() || undefined,
      processingTime: form.processingTime.trim() || undefined,
      link: form.link.trim() || undefined,
      requirements: form.requirements.filter(Boolean),
      steps: form.steps.filter(Boolean),
    };

    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await addService(form.categoryId, payload, accessToken);
        toast("Service added.", "success");
      } else if (editTarget) {
        const updated = await updateService(
          editTarget.categoryId,
          editTarget.id,
          payload,
          accessToken,
        );
        const updatedService = updated.services.find(
          (s) => s.title === form.title.trim(),
        );
        if (updatedService) markSaved(updatedService.id);
        toast("Service updated.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save service.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(categoryId: string, serviceId: string) {
    if (!accessToken) return;
    try {
      await removeService(categoryId, serviceId, accessToken);
      toast("Service removed.", "success");
    } catch {
      toast("Failed to remove service.", "error");
    }
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
            disabled={categories.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LuPlus className="h-4 w-4" /> Add Service
          </button>
        </div>
      }
    >
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => accessToken && fetchAdminCategories(accessToken)}
        />
      )}

      {categories.length === 0 && !isLoading && (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold text-gray-500 mb-1">
            No categories yet
          </p>
          <p className="text-xs text-gray-400">
            Create categories first before adding services.
          </p>
        </div>
      )}

      {isLoading && allServices.length === 0 ? (
        <SkeletonRows />
      ) : (
        categories.length > 0 && (
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
                variants={{
                  visible: { transition: { staggerChildren: 0.03 } },
                }}
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
                        key={`${s.categoryId}-${s.id}`}
                        variants={rowVariants}
                        exit="exit"
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
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
                              type="button"
                              onClick={() =>
                                openEdit({ ...s, categoryId: s.categoryId })
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                              aria-label={`Edit ${s.title}`}
                            >
                              <LuPencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  ...s,
                                  categoryId: s.categoryId,
                                })
                              }
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
        )
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Service" : "Edit Service"}
            subtitle="Displayed on the public Services page"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="svc-form"
            submitLabel={
              panelMode === "create" ? "Add Service" : "Save Changes"
            }
            isSubmitting={isSubmitting}
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
                  value={form.categoryId}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, categoryId: e.target.value }));
                    setErrors((p) => ({ ...p, categoryId: "" }));
                  }}
                  className={errors.categoryId ? inputError : inputNormal}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <FieldError id="svc-cat-err" msg={errors.categoryId} />
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
            onConfirm={() =>
              handleDelete(deleteTarget.categoryId, deleteTarget.id)
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Life Events Panel ────────────────────────────────────────────────────────

interface LifeEventFormState {
  title: string;
  iconKey: string;
  serviceIds: string[];
  status: "published" | "draft";
}

const emptyLifeEvent = (): LifeEventFormState => ({
  title: "",
  iconKey: "FaStore",
  serviceIds: [],
  status: "draft",
});

function lifeEventToForm(e: LifeEventRecord): LifeEventFormState {
  return {
    title: e.title,
    iconKey: e.iconKey,
    serviceIds: e.serviceIds,
    status: e.status,
  };
}

function validateLifeEvent(f: LifeEventFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.title.trim()) e.title = "Title is required.";
  return e;
}

function LifeEventsPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const lifeEvents = useServicesStore((s) => s.adminLifeEvents);
  const categories = useServicesStore((s) => s.adminCategories);
  const isLoading = useServicesStore((s) => s.isAdminLifeEventsLoading);
  const error = useServicesStore((s) => s.error);
  const {
    fetchAdminLifeEvents,
    createLifeEvent,
    updateLifeEvent,
    deleteLifeEvent,
  } = useServicesStore();

  const allServices = categories.flatMap((c) =>
    c.services.map((s) => ({ ...s, categoryTitle: c.title })),
  );

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<LifeEventRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifeEventRecord | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<LifeEventFormState>(emptyLifeEvent());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setForm(emptyLifeEvent());
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(ev: LifeEventRecord) {
    setForm(lifeEventToForm(ev));
    setErrors({});
    setEditTarget(ev);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateLifeEvent(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!accessToken) return;

    const payload: LifeEventPayload = {
      title: form.title.trim(),
      iconKey: form.iconKey,
      serviceIds: form.serviceIds,
      status: form.status,
    };

    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createLifeEvent(payload, accessToken);
        toast("Life event created.", "success");
      } else if (editTarget) {
        const updated = await updateLifeEvent(
          editTarget.id,
          payload,
          accessToken,
        );
        markSaved(updated.id);
        toast("Life event updated.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(
        err?.response?.data?.message || "Failed to save life event.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteLifeEvent(id, accessToken);
      toast("Life event removed.", "success");
    } catch {
      toast("Failed to remove life event.", "error");
    }
  }

  function toggleService(serviceId: string) {
    setForm((p) => ({
      ...p,
      serviceIds: p.serviceIds.includes(serviceId)
        ? p.serviceIds.filter((id) => id !== serviceId)
        : [...p.serviceIds, serviceId],
    }));
  }

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
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => accessToken && fetchAdminLifeEvents(accessToken)}
        />
      )}

      {isLoading && lifeEvents.length === 0 ? (
        <SkeletonRows count={3} />
      ) : lifeEvents.length === 0 && !isLoading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <LuCalendarDays className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            No life events yet
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Add life events to help residents find relevant services.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Life Event
          </button>
        </div>
      ) : (
        <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
          <AnimatePresence>
            {lifeEvents.map((ev) => {
              const Icon = resolveIcon(ev.iconKey);
              const linkedServices = allServices.filter((s) =>
                ev.serviceIds.includes(s.id),
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
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${ev.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {ev.status}
                          </span>
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
                          {ev.serviceIds.length} linked{" "}
                          {ev.serviceIds.length === 1 ? "service" : "services"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
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
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add Life Event" : "Edit Life Event"
            }
            subtitle="Displayed on the public Services page"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="le-form"
            submitLabel={
              panelMode === "create" ? "Add Life Event" : "Save Changes"
            }
            isSubmitting={isSubmitting}
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
              <div>
                <label
                  htmlFor="le-icon"
                  className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"
                >
                  <LuImage className="h-3.5 w-3.5 text-gray-400" /> Icon
                </label>
                <select
                  id="le-icon"
                  value={form.iconKey}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, iconKey: e.target.value }))
                  }
                  className={inputNormal}
                >
                  {ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="le-status"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Status
                </label>
                <select
                  id="le-status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      status: e.target.value as "published" | "draft",
                    }))
                  }
                  className={inputNormal}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
                  <LuShuffle className="h-3.5 w-3.5 text-gray-400" /> Linked
                  Services
                  <span className="ml-auto text-[11px] font-normal text-gray-400">
                    {form.serviceIds.length} selected
                  </span>
                </p>
                {allServices.length === 0 ? (
                  <p className="text-xs text-gray-400 py-4 text-center">
                    No services available. Add categories and services first.
                  </p>
                ) : (
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
                )}
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.title}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget.id)}
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
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const categories = useServicesStore((s) => s.adminCategories);
  const lifeEvents = useServicesStore((s) => s.adminLifeEvents);
  const isAdminCategoriesLoading = useServicesStore(
    (s) => s.isAdminCategoriesLoading,
  );
  const isAdminLifeEventsLoading = useServicesStore(
    (s) => s.isAdminLifeEventsLoading,
  );
  const { fetchAdminCategories, fetchAdminLifeEvents } = useServicesStore();
  const [activeTab, setActiveTab] = useState<ServicesTab>("categories");

  useEffect(() => {
    if (!accessToken) return;
    fetchAdminCategories(accessToken).catch(() => {});
    fetchAdminLifeEvents(accessToken).catch(() => {});
  }, [accessToken]);

  const totalServices = categories.reduce(
    (sum, c) => sum + c.services.length,
    0,
  );

  const tabCounts: Record<ServicesTab, number> = {
    categories: categories.length,
    services: totalServices,
    "life-events": lifeEvents.length,
  };

  function refresh() {
    if (!accessToken) return;
    fetchAdminCategories(accessToken).catch(() => {});
    fetchAdminLifeEvents(accessToken).catch(() => {});
    toast("Refreshed", "success");
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Services Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage categories, services, and life events displayed on the public
            Services page.
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isAdminCategoriesLoading || isAdminLifeEventsLoading}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors shrink-0 disabled:opacity-50"
        >
          <LuRefreshCw
            className={`h-4 w-4 ${isAdminCategoriesLoading || isAdminLifeEventsLoading ? "animate-spin" : ""}`}
          />{" "}
          Refresh
        </button>
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
              {activeTab === "categories" && <CategoriesPanel />}
              {activeTab === "services" && <ServicesPanel />}
              {activeTab === "life-events" && <LifeEventsPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

ServicesModulePage.displayName = "ServicesModulePage";
export default ServicesModulePage;
