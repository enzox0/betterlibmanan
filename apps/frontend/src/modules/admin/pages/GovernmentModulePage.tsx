import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  LuX,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuBuilding2,
  LuLandmark,
  LuGavel,
  LuMapPin,
  LuPhone,
  LuMail,
  LuClock,
  LuLink,
  LuCheck,
  LuLoader,
  LuTriangleAlert,
  LuRefreshCw,
} from "react-icons/lu";
import { useGovernmentStore } from "../store/governmentStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import type { ContentRecord } from "../types/admin.types";

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

type GovTab = "executive" | "legislative" | "offices" | "barangays";

const GOV_TABS: { key: GovTab; label: string; icon: React.ReactNode }[] = [
  {
    key: "executive",
    label: "Executive",
    icon: <LuLandmark className="h-3.5 w-3.5" />,
  },
  {
    key: "legislative",
    label: "Legislative",
    icon: <LuGavel className="h-3.5 w-3.5" />,
  },
  {
    key: "offices",
    label: "Offices",
    icon: <LuBuilding2 className="h-3.5 w-3.5" />,
  },
  {
    key: "barangays",
    label: "Barangays",
    icon: <LuMapPin className="h-3.5 w-3.5" />,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  );
}

function f(record: ContentRecord, key: string, fallback = ""): string {
  return (record.fields as any)[key] ?? fallback;
}
function fArr(record: ContentRecord, key: string): string[] {
  return (record.fields as any)[key] ?? [];
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

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

function TableSkeletonRows({
  cols = 4,
  count = 4,
}: {
  cols?: number;
  count?: number;
}) {
  return (
    <tbody className="divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div
                className="h-3.5 rounded bg-gray-100"
                style={{
                  width: j === 0 ? "2rem" : j === cols - 1 ? "5rem" : "60%",
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
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

function EmptyState({
  icon,
  title,
  sub,
  onAdd,
  addLabel,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{sub}</p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <LuPlus className="h-4 w-4" /> {addLabel ?? "Add"}
        </button>
      )}
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
        <LuSearch className="h-6 w-6 text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">
        No results for "{query}"
      </p>
      <p className="text-xs text-gray-400">Try a different search term.</p>
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
  isSubmitting?: boolean;
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
  isSubmitting = false,
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
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-60 ${submitColorClass}`}
          >
            {isSubmitting && <LuLoader className="h-3.5 w-3.5 animate-spin" />}
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
  isDeleting,
}: {
  label: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 !mt-0"
        aria-modal="true"
        role="dialog"
        aria-labelledby="gov-del-title"
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
                  id="gov-del-title"
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
                onClick={onConfirm}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {isDeleting && (
                  <LuLoader className="h-3.5 w-3.5 animate-spin" />
                )}
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

// ─── Section Card ─────────────────────────────────────────────────────────────

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

// ─── Executive Panel ──────────────────────────────────────────────────────────

function ExecutivePanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const officials = useGovernmentStore((s) => s.executive);
  const isLoading = useGovernmentStore((s) => s.isExecutiveLoading);
  const error = useGovernmentStore((s) => s.error);
  const { fetchExecutive, createExecutive, updateExecutive, deleteExecutive } =
    useGovernmentStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [execTitle, setExecTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchExecutive();
  }, []);

  function markSaved(id: string) {
    setSavedIds((prev) => new Set([...prev, id]));
    setTimeout(
      () =>
        setSavedIds((prev) => {
          const n = new Set(prev);
          n.delete(id);
          return n;
        }),
      3000,
    );
  }

  function openCreate() {
    setExecTitle("");
    setName("");
    setEmail("");
    setPhone("");
    setHours("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(o: ContentRecord) {
    setExecTitle(f(o, "title"));
    setName(f(o, "name"));
    setEmail(f(o, "email"));
    setPhone(f(o, "phone"));
    setHours(f(o, "hours"));
    setErrors({});
    setEditTarget(o);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!execTitle.trim()) e.title = "Title is required.";
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    if (!phone.trim()) e.phone = "Phone is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createExecutive(
          {
            title: execTitle.trim(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            hours: hours.trim(),
          },
          accessToken!,
        );
        toast("Executive official added.", "success");
      } else if (editTarget) {
        await updateExecutive(
          editTarget.id,
          {
            title: execTitle.trim(),
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            hours: hours.trim(),
          },
          accessToken!,
        );
        markSaved(editTarget.id);
        toast("Executive official saved.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(record: ContentRecord) {
    setIsDeleting(true);
    try {
      await deleteExecutive(record.id, accessToken!);
      toast("Executive official removed.", "success");
      setDeleteTarget(null);
    } catch {
      toast("Failed to remove.", "error");
    } finally {
      setIsDeleting(false);
    }
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
      title="Executive Branch"
      description="Mayor, Vice Mayor, and other executive officials"
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchExecutive()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            <LuPlus className="h-4 w-4" aria-hidden="true" /> Add Official
          </button>
        </div>
      }
    >
      {error && (
        <ErrorBanner message={error} onRetry={() => fetchExecutive()} />
      )}

      {isLoading && officials.length === 0 ? (
        <SkeletonRows />
      ) : officials.length === 0 && !isLoading ? (
        <EmptyState
          icon={<LuLandmark className="h-6 w-6 text-gray-300" />}
          title="No executive officials yet"
          sub="Add the Mayor, Vice Mayor, and other executive officials."
          onAdd={openCreate}
          addLabel="Add Official"
        />
      ) : (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {officials.map((o) => (
              <motion.div
                key={o.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                    <LuLandmark
                      className="h-5 w-5 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        {f(o, "title")}
                      </span>
                      <AnimatePresence>
                        {savedIds.has(o.id) && (
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
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {f(o, "name")}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {f(o, "email") && (
                        <span className="flex items-center gap-1">
                          <LuMail className="h-3 w-3 text-gray-400" />
                          {f(o, "email")}
                        </span>
                      )}
                      {f(o, "phone") && (
                        <span className="flex items-center gap-1">
                          <LuPhone className="h-3 w-3 text-gray-400" />
                          {f(o, "phone")}
                        </span>
                      )}
                      {f(o, "hours") && (
                        <span className="flex items-center gap-1">
                          <LuClock className="h-3 w-3 text-gray-400" />
                          {f(o, "hours")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    ref={getEditRef(o.id) as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => openEdit(o)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                    aria-label={`Edit ${f(o, "name")}`}
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(o)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                    aria-label={`Remove ${f(o, "name")}`}
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Executive Official"
                : "Edit Executive Official"
            }
            subtitle="Displayed on the public Government page"
            accentColor="from-blue-600 to-blue-800"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="exec-form"
            submitLabel={
              panelMode === "create" ? "Add Official" : "Save Changes"
            }
            isSubmitting={isSubmitting}
          >
            <form
              id="exec-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="exec-title"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exec-title"
                    type="text"
                    value={execTitle}
                    onChange={(e) => {
                      setExecTitle(e.target.value);
                      setErrors((p) => ({ ...p, title: "" }));
                    }}
                    className={errors.title ? inputError : inputNormal}
                    placeholder="e.g. Municipal Mayor"
                  />
                  <FieldError id="exec-title-err" msg={errors.title} />
                </div>
                <div>
                  <label
                    htmlFor="exec-name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exec-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: "" }));
                    }}
                    className={errors.name ? inputError : inputNormal}
                    placeholder="e.g. Hon. Juan dela Cruz"
                  />
                  <FieldError id="exec-name-err" msg={errors.name} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="exec-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exec-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: "" }));
                    }}
                    className={errors.email ? inputError : inputNormal}
                    placeholder="mayor@libmanan.gov.ph"
                  />
                  <FieldError id="exec-email-err" msg={errors.email} />
                </div>
                <div>
                  <label
                    htmlFor="exec-phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="exec-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((p) => ({ ...p, phone: "" }));
                    }}
                    className={errors.phone ? inputError : inputNormal}
                    placeholder="(054) 871-0000"
                  />
                  <FieldError id="exec-phone-err" msg={errors.phone} />
                </div>
              </div>
              <div>
                <label
                  htmlFor="exec-hours"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Office Hours
                </label>
                <input
                  id="exec-hours"
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={inputNormal}
                  placeholder="Mon-Fri: 8:00 AM - 5:00 PM"
                />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Legislative Panel ────────────────────────────────────────────────────────

function LegislativePanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const members = useGovernmentStore((s) => s.legislative);
  const isLoading = useGovernmentStore((s) => s.isLegislativeLoading);
  const {
    fetchLegislative,
    createLegislative,
    updateLegislative,
    deleteLegislative,
  } = useGovernmentStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [name, setName] = useState("");
  const [position, setPosition] = useState("SB Member");
  const [committeesRaw, setCommitteesRaw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchLegislative();
  }, []);

  const filtered = members.filter(
    (m) =>
      search.trim() === "" ||
      f(m, "name").toLowerCase().includes(search.toLowerCase()) ||
      f(m, "position").toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setName("");
    setPosition("SB Member");
    setCommitteesRaw("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(m: ContentRecord) {
    setName(f(m, "name"));
    setPosition(f(m, "position"));
    setCommitteesRaw(fArr(m, "committees").join(", "));
    setErrors({});
    setEditTarget(m);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!position.trim()) e.position = "Position is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    const committees = committeesRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createLegislative(
          { name: name.trim(), position: position.trim(), committees },
          accessToken!,
        );
        toast("SB member added.", "success");
      } else if (editTarget) {
        await updateLegislative(
          editTarget.id,
          { name: name.trim(), position: position.trim(), committees },
          accessToken!,
        );
        toast("SB member saved.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(record: ContentRecord) {
    setIsDeleting(true);
    try {
      await deleteLegislative(record.id, accessToken!);
      toast("SB member removed.", "success");
      setDeleteTarget(null);
    } catch {
      toast("Failed to remove.", "error");
    } finally {
      setIsDeleting(false);
    }
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
      title="Legislative Branch"
      description="Sangguniang Bayan members and their committee assignments"
      action={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search members…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search members"
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchLegislative()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Member
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
            placeholder="Search members…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {isLoading && members.length === 0 ? (
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["#", "Name", "Position", "Committees", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 4 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <TableSkeletonRows cols={5} />
          </table>
        </div>
      ) : members.length === 0 && !isLoading ? (
        <EmptyState
          icon={<LuGavel className="h-6 w-6 text-gray-300" />}
          title="No SB members yet"
          sub="Add Sangguniang Bayan members and their committee assignments."
          onAdd={openCreate}
          addLabel="Add Member"
        />
      ) : (
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Committees
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
                {filtered.map((m, idx) => (
                  <motion.tr
                    key={m.id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-xs font-bold text-gray-500">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {f(m, "name")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {f(m, "position")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                      {fArr(m, "committees").length > 0 ? (
                        fArr(m, "committees").join(" · ")
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          ref={
                            getEditRef(
                              m.id,
                            ) as React.RefObject<HTMLButtonElement>
                          }
                          type="button"
                          onClick={() => openEdit(m)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          aria-label={`Edit ${f(m, "name")}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(m)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                          aria-label={`Remove ${f(m, "name")}`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
          {filtered.length === 0 && search && (
            <SearchEmptyState query={search} />
          )}
        </div>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add SB Member" : "Edit SB Member"}
            subtitle="Sangguniang Bayan legislative branch"
            accentColor="from-indigo-500 to-indigo-700"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="leg-form"
            submitLabel={panelMode === "create" ? "Add Member" : "Save Changes"}
            isSubmitting={isSubmitting}
            submitColorClass="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          >
            <form
              id="leg-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="leg-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="leg-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Hon. Juan dela Cruz"
                />
                <FieldError id="leg-name-err" msg={errors.name} />
              </div>
              <div>
                <label
                  htmlFor="leg-position"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  id="leg-position"
                  type="text"
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value);
                    setErrors((p) => ({ ...p, position: "" }));
                  }}
                  className={errors.position ? inputError : inputNormal}
                  placeholder="e.g. SB Member"
                />
                <FieldError id="leg-position-err" msg={errors.position} />
              </div>
              <div>
                <label
                  htmlFor="leg-committees"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Committees{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (comma-separated)
                  </span>
                </label>
                <textarea
                  id="leg-committees"
                  value={committeesRaw}
                  onChange={(e) => setCommitteesRaw(e.target.value)}
                  rows={3}
                  className={inputNormal}
                  placeholder="e.g. Finance, Public Works, Health"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Enter committee names separated by commas.
                </p>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Offices Panel ────────────────────────────────────────────────────────────

function OfficesPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const offices = useGovernmentStore((s) => s.offices);
  const isLoading = useGovernmentStore((s) => s.isOfficesLoading);
  const { fetchOffices, createOffice, updateOffice, deleteOffice } =
    useGovernmentStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchOffices();
  }, []);

  const filtered = offices.filter(
    (o) =>
      search.trim() === "" ||
      f(o, "name").toLowerCase().includes(search.toLowerCase()) ||
      f(o, "description").toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setName("");
    setDescription("");
    setPhone("");
    setEmail("");
    setLink("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(o: ContentRecord) {
    setName(f(o, "name"));
    setDescription(f(o, "description"));
    setPhone(f(o, "phone"));
    setEmail(f(o, "email"));
    setLink(f(o, "link"));
    setErrors({});
    setEditTarget(o);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Office name is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createOffice(
          {
            name: name.trim(),
            description: description.trim(),
            phone: phone.trim(),
            email: email.trim(),
            link: link.trim(),
          },
          accessToken!,
        );
        toast("Office added.", "success");
      } else if (editTarget) {
        await updateOffice(
          editTarget.id,
          {
            name: name.trim(),
            description: description.trim(),
            phone: phone.trim(),
            email: email.trim(),
            link: link.trim(),
          },
          accessToken!,
        );
        toast("Office saved.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(record: ContentRecord) {
    setIsDeleting(true);
    try {
      await deleteOffice(record.id, accessToken!);
      toast("Office removed.", "success");
      setDeleteTarget(null);
    } catch {
      toast("Failed to remove.", "error");
    } finally {
      setIsDeleting(false);
    }
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
      title="Municipal Offices"
      description="Department heads and offices listed on the Government page"
      action={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search offices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchOffices()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Office
          </button>
        </div>
      }
    >
      {isLoading && offices.length === 0 ? (
        <SkeletonRows count={3} />
      ) : offices.length === 0 && !isLoading ? (
        <EmptyState
          icon={<LuBuilding2 className="h-6 w-6 text-gray-300" />}
          title="No offices yet"
          sub="Add municipal offices, departments, and their contact information."
          onAdd={openCreate}
          addLabel="Add Office"
        />
      ) : (
        <>
          <motion.div
            className="grid gap-3 p-4 sm:p-5 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
          >
            <AnimatePresence>
              {filtered.map((o) => (
                <motion.div
                  key={o.id}
                  variants={rowVariants}
                  exit="exit"
                  className="group relative rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:border-gray-200 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                      <LuBuilding2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pb-8">
                      <p className="text-sm font-bold text-gray-900 leading-tight">
                        {f(o, "name")}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                        {f(o, "description")}
                      </p>
                      <div className="mt-2 space-y-0.5">
                        {f(o, "phone") && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-400">
                            <LuPhone className="h-3 w-3 shrink-0" />
                            {f(o, "phone")}
                          </p>
                        )}
                        {f(o, "email") && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                            <LuMail className="h-3 w-3 shrink-0" />
                            {f(o, "email")}
                          </p>
                        )}
                        {f(o, "link") && (
                          <p className="flex items-center gap-1.5 text-xs text-blue-500 truncate">
                            <LuLink className="h-3 w-3 shrink-0" />
                            {f(o, "link")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 px-3 py-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      ref={
                        getEditRef(o.id) as React.RefObject<HTMLButtonElement>
                      }
                      type="button"
                      onClick={() => openEdit(o)}
                      className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      aria-label={`Edit ${f(o, "name")}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(o)}
                      className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                      aria-label={`Remove ${f(o, "name")}`}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          {filtered.length === 0 && search && (
            <SearchEmptyState query={search} />
          )}
        </>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Municipal Office"
                : "Edit Municipal Office"
            }
            subtitle="Offices displayed on the public Government page"
            accentColor="from-gray-700 to-gray-900"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="off-form"
            submitLabel={panelMode === "create" ? "Add Office" : "Save Changes"}
            isSubmitting={isSubmitting}
            submitColorClass="bg-gray-900 hover:bg-gray-800 focus:ring-gray-700"
          >
            <form
              id="off-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="off-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Office Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="off-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Municipal Health Office"
                />
                <FieldError id="off-name-err" msg={errors.name} />
              </div>
              <div>
                <label
                  htmlFor="off-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="off-desc"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  rows={3}
                  className={errors.description ? inputError : inputNormal}
                  placeholder="Services provided by this office"
                />
                <FieldError id="off-desc-err" msg={errors.description} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="off-phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone
                  </label>
                  <input
                    id="off-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputNormal}
                    placeholder="(054) 871-0000"
                  />
                </div>
                <div>
                  <label
                    htmlFor="off-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="off-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputNormal}
                    placeholder="office@libmanan.gov.ph"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="off-link"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Service Link{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (optional)
                  </span>
                </label>
                <input
                  id="off-link"
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className={inputNormal}
                  placeholder="/services/health"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Internal path for the "View Services" button. Leave blank to
                  hide.
                </p>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Barangays Panel ──────────────────────────────────────────────────────────

function BarangaysPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const barangays = useGovernmentStore((s) => s.barangays);
  const isLoading = useGovernmentStore((s) => s.isBarangaysLoading);
  const { fetchBarangays, createBarangay, updateBarangay, deleteBarangay } =
    useGovernmentStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [brgyName, setBrgyName] = useState("");
  const [captain, setCaptain] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchBarangays();
  }, []);

  const filtered = barangays.filter(
    (b) =>
      search.trim() === "" ||
      f(b, "name").toLowerCase().includes(search.toLowerCase()) ||
      f(b, "captain").toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setBrgyName("");
    setCaptain("");
    setPhone("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(b: ContentRecord) {
    setBrgyName(f(b, "name"));
    setCaptain(f(b, "captain"));
    setPhone(f(b, "phone"));
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
    if (!brgyName.trim()) e.name = "Barangay name is required.";
    if (!captain.trim()) e.captain = "Captain name is required.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createBarangay(
          {
            name: brgyName.trim(),
            captain: captain.trim(),
            phone: phone.trim(),
          },
          accessToken!,
        );
        toast("Barangay added.", "success");
      } else if (editTarget) {
        await updateBarangay(
          editTarget.id,
          {
            name: brgyName.trim(),
            captain: captain.trim(),
            phone: phone.trim(),
          },
          accessToken!,
        );
        toast("Barangay saved.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(record: ContentRecord) {
    setIsDeleting(true);
    try {
      await deleteBarangay(record.id, accessToken!);
      toast("Barangay removed.", "success");
      setDeleteTarget(null);
    } catch {
      toast("Failed to remove.", "error");
    } finally {
      setIsDeleting(false);
    }
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
      title="Barangay Units"
      description={`${barangays.length} barangay${barangays.length !== 1 ? "s" : ""} of Libmanan`}
      action={
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search barangay or captain…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-52"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchBarangays()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Barangay
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
            placeholder="Search barangay or captain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {isLoading && barangays.length === 0 ? (
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Barangay", "Barangay Captain", "Phone", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 3 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <TableSkeletonRows cols={4} />
          </table>
        </div>
      ) : barangays.length === 0 && !isLoading ? (
        <EmptyState
          icon={<LuMapPin className="h-6 w-6 text-gray-300" />}
          title="No barangays yet"
          sub="Add barangay units with their captains and contact numbers."
          onAdd={openCreate}
          addLabel="Add Barangay"
        />
      ) : (
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Barangay
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Barangay Captain
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Phone
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
              variants={{ visible: { transition: { staggerChildren: 0.02 } } }}
            >
              <AnimatePresence>
                {filtered.map((b) => (
                  <motion.tr
                    key={b.id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-emerald-50/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          <LuMapPin className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {f(b, "name")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {f(b, "captain")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {f(b, "phone")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          ref={
                            getEditRef(
                              b.id,
                            ) as React.RefObject<HTMLButtonElement>
                          }
                          type="button"
                          onClick={() => openEdit(b)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          aria-label={`Edit ${f(b, "name")}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(b)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                          aria-label={`Remove ${f(b, "name")}`}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
          {filtered.length === 0 && search && (
            <SearchEmptyState query={search} />
          )}
          {filtered.length > 0 && (
            <p className="mt-3 text-xs text-gray-400">
              Showing {filtered.length} of {barangays.length} barangay
              {barangays.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Barangay" : "Edit Barangay"}
            subtitle="Barangay units of Libmanan"
            accentColor="from-emerald-500 to-emerald-700"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="brgy-form"
            submitLabel={
              panelMode === "create" ? "Add Barangay" : "Save Changes"
            }
            isSubmitting={isSubmitting}
            submitColorClass="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
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
                  value={brgyName}
                  onChange={(e) => {
                    setBrgyName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Barangay San Isidro"
                />
                <FieldError id="brgy-name-err" msg={errors.name} />
              </div>
              <div>
                <label
                  htmlFor="brgy-captain"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Barangay Captain <span className="text-red-500">*</span>
                </label>
                <input
                  id="brgy-captain"
                  type="text"
                  value={captain}
                  onChange={(e) => {
                    setCaptain(e.target.value);
                    setErrors((p) => ({ ...p, captain: "" }));
                  }}
                  className={errors.captain ? inputError : inputNormal}
                  placeholder="e.g. Kap. Juan dela Cruz"
                />
                <FieldError id="brgy-captain-err" msg={errors.captain} />
              </div>
              <div>
                <label
                  htmlFor="brgy-phone"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="brgy-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setErrors((p) => ({ ...p, phone: "" }));
                  }}
                  className={errors.phone ? inputError : inputNormal}
                  placeholder="09XXXXXXXXX"
                />
                <FieldError id="brgy-phone-err" msg={errors.phone} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function GovernmentModulePage() {
  const [activeTab, setActiveTab] = useState<GovTab>("executive");
  const executive = useGovernmentStore((s) => s.executive);
  const legislative = useGovernmentStore((s) => s.legislative);
  const offices = useGovernmentStore((s) => s.offices);
  const barangays = useGovernmentStore((s) => s.barangays);

  const tabCounts: Record<GovTab, number> = {
    executive: executive.length,
    legislative: legislative.length,
    offices: offices.length,
    barangays: barangays.length,
  };

  const total =
    executive.length + legislative.length + offices.length + barangays.length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Government
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage officials, offices, and barangay units for the public
            Government page
          </p>
        </div>

        {/* Quick stat chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-gray-900">{total}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
              Total
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-blue-700">
              {executive.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-blue-500 mt-0.5">
              Executive
            </p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-indigo-700">
              {legislative.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-indigo-500 mt-0.5">
              SB Members
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-gray-700">{offices.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
              Offices
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-emerald-700">
              {barangays.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-emerald-500 mt-0.5">
              Barangays
            </p>
          </div>
        </div>
      </div>

      {/* Tab panel */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Government sections"
          >
            {GOV_TABS.map(({ key, label, icon }) => {
              const isActive = key === activeTab;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`gov-tabpanel-${key}`}
                  id={`gov-tab-${key}`}
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

        {/* Tab content */}
        <div
          key={activeTab}
          id={`gov-tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`gov-tab-${activeTab}`}
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
              {activeTab === "executive" && <ExecutivePanel />}
              {activeTab === "legislative" && <LegislativePanel />}
              {activeTab === "offices" && <OfficesPanel />}
              {activeTab === "barangays" && <BarangaysPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

GovernmentModulePage.displayName = "GovernmentModulePage";
export default GovernmentModulePage;
