import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  LuX,
  LuTrash2,
  LuCheck,
  LuPencil,
  LuPlus,
  LuSearch,
  LuPhone,
  LuBuilding2,
  LuTriangleAlert,
  LuRefreshCw,
  LuLoader,
  LuLink,
  LuShare2,
} from "react-icons/lu";
import { useContactStore } from "../store/contactStore";
import { useEmergencyContactsStore } from "../store/emergencyContactsStore";
import { useMedicalContactsStore } from "../store/medicalContactsStore";
import { useOfficeDirectoryStore } from "../store/officeDirectoryStore";
import { useSocialLinksStore } from "../store/socialLinksStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import type { ContentRecord } from "../types/admin.types";
import type { EmergencyContactCategory } from "../services/emergency-contacts.api";
import type { SocialLinkPlatform } from "../services/social-links.api";
import type { ContactType } from "../services/contact.api";

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

const CONTACT_TYPE_META: Record<
  ContactType,
  { label: string; color: string; bg: string; hint: string }
> = {
  phone: {
    label: "Phone",
    color: "text-blue-600",
    bg: "bg-blue-50",
    hint: "tel:09XXXXXXXXX",
  },
  fax: {
    label: "Fax",
    color: "text-gray-600",
    bg: "bg-gray-100",
    hint: "Use # if not applicable",
  },
  email: {
    label: "Email",
    color: "text-violet-600",
    bg: "bg-violet-50",
    hint: "mailto:address@domain.com",
  },
  address: {
    label: "Address",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    hint: "Use # or a Google Maps URL",
  },
};

const EMERGENCY_CATEGORIES: EmergencyContactCategory[] = [
  "police",
  "disaster",
  "fire",
  "welfare",
  "government",
  "traffic",
  "medical",
  "other",
];
const EMERGENCY_CATEGORY_META: Record<
  EmergencyContactCategory,
  { label: string; color: string; bg: string }
> = {
  police: { label: "Police", color: "text-blue-700", bg: "bg-blue-50" },
  disaster: { label: "Disaster", color: "text-orange-700", bg: "bg-orange-50" },
  fire: { label: "Fire", color: "text-red-700", bg: "bg-red-50" },
  welfare: { label: "Welfare", color: "text-teal-700", bg: "bg-teal-50" },
  government: {
    label: "Government",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  traffic: { label: "Traffic", color: "text-amber-700", bg: "bg-amber-50" },
  medical: { label: "Medical", color: "text-emerald-700", bg: "bg-emerald-50" },
  other: { label: "Other", color: "text-gray-600", bg: "bg-gray-100" },
};

const SOCIAL_PLATFORMS: SocialLinkPlatform[] = [
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "other",
];
const SOCIAL_PLATFORM_META: Record<
  SocialLinkPlatform,
  { label: string; color: string; bg: string }
> = {
  facebook: { label: "Facebook", color: "text-blue-700", bg: "bg-blue-50" },
  twitter: { label: "X/Twitter", color: "text-gray-800", bg: "bg-gray-100" },
  instagram: { label: "Instagram", color: "text-pink-700", bg: "bg-pink-50" },
  youtube: { label: "YouTube", color: "text-red-700", bg: "bg-red-50" },
  tiktok: { label: "TikTok", color: "text-gray-800", bg: "bg-gray-100" },
  other: { label: "Other", color: "text-gray-600", bg: "bg-gray-100" },
};

type DirectoryTab = "emergency" | "medical" | "offices" | "social";

// ─── Field helpers ────────────────────────────────────────────────────────────

function f(record: ContentRecord, key: string, fallback = ""): string {
  return (record.fields as any)[key] ?? fallback;
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  );
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3 animate-pulse"
        >
          <div className="h-8 w-8 rounded-lg bg-gray-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-2.5 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-6 w-12 rounded-lg bg-gray-100" />
            <div className="h-6 w-14 rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton({
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
            <td key={j} className="px-5 py-3">
              <div
                className="h-3 rounded bg-gray-100"
                style={{ width: j === cols - 1 ? "5rem" : "60%" }}
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
    <div className="flex items-center gap-3 px-6 py-3 bg-red-50 border-b border-red-100">
      <LuTriangleAlert className="h-4 w-4 text-red-500 shrink-0" />
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
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

function SearchEmpty({ query }: { query: string }) {
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose]);

  return (
    <AnimatePresence>
      <motion.div
        key="sp-bd"
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

function DeleteDialog({
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
        aria-labelledby="del-title"
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
                <LuTrash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 id="del-title" className="text-sm font-bold text-gray-900">
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
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-60"
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
  error,
  onRetry,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  error?: string | null;
  onRetry?: () => void;
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
      {error && <ErrorBanner message={error} onRetry={onRetry} />}
      {children}
    </div>
  );
}

// ─── Contact Info Section ─────────────────────────────────────────────────────

function ContactInfoSection() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const adminRecords = useContactStore((s) => s.adminRecords);
  const isLoading = useContactStore((s) => s.isAdminLoading);
  const error = useContactStore((s) => s.error);
  const { fetchAdminRecords, updateContact } = useContactStore();

  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [value, setValue] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    if (accessToken) fetchAdminRecords(accessToken);
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

  function openEdit(c: ContentRecord) {
    setValue(f(c, "value"));
    setHref(f(c, "href"));
    setDescription(f(c, "description"));
    setErrors({});
    setEditTarget(c);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!value.trim()) e.value = "Value is required.";
    if (!href.trim()) e.href = "Link / href is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!editTarget) return;
    setIsSubmitting(true);
    try {
      await updateContact(
        editTarget.id,
        {
          label: f(editTarget, "label"),
          value: value.trim(),
          href: href.trim(),
          description: description.trim(),
          type: (f(editTarget, "type") as ContactType) || "phone",
          status: editTarget.status,
        },
        accessToken!,
      );
      markSaved(editTarget.id);
      toast("Contact info saved.", "success");
      setEditTarget(null);
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Only published records are shown on admin (they're all published — no draft logic for contact info)
  const contacts = adminRecords.length > 0 ? adminRecords : [];

  return (
    <SectionCard
      title="Main Contact Information"
      description="Phone, fax, email, and address shown at the top of the Contact page"
      error={error}
      onRetry={() => accessToken && fetchAdminRecords(accessToken)}
      action={
        <button
          type="button"
          onClick={() => accessToken && fetchAdminRecords(accessToken)}
          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
          aria-label="Refresh"
        >
          <LuRefreshCw className="h-3.5 w-3.5" />
        </button>
      }
    >
      {isLoading && contacts.length === 0 ? (
        <SkeletonRows count={4} />
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={<LuPhone className="h-6 w-6 text-gray-300" />}
          title="No contact info yet"
          sub="Contact records are managed through this section."
        />
      ) : (
        <div className="divide-y divide-gray-50">
          {contacts.map((c) => {
            const type = (f(c, "type") || "phone") as ContactType;
            const meta = CONTACT_TYPE_META[type];
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
                >
                  <span className={`text-xs font-bold ${meta.color}`}>
                    {meta.label[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {f(c, "label")}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {f(c, "value")}
                  </p>
                  <p className="text-xs text-gray-400 font-mono truncate">
                    {f(c, "href")}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
                  <AnimatePresence>
                    {savedIds.has(c.id) && (
                      <motion.span
                        key="saved"
                        className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-200"
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
                    ref={getEditRef(c.id) as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                    aria-label={`Edit ${f(c, "label")}`}
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {editTarget && (
          <SlidePanel
            title={`Edit ${CONTACT_TYPE_META[(f(editTarget, "type") as ContactType) || "phone"].label}`}
            subtitle="Update public-facing contact info"
            accentColor="from-blue-600 to-blue-800"
            onClose={() => setEditTarget(null)}
            returnFocusRef={
              getEditRef(editTarget.id) as React.RefObject<HTMLButtonElement>
            }
            formId="ci-form"
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
          >
            <form
              id="ci-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {(() => {
                const type = (f(editTarget, "type") as ContactType) || "phone";
                const meta = CONTACT_TYPE_META[type];
                return (
                  <div
                    className={`flex items-center gap-3 rounded-xl p-3 ${meta.bg}`}
                  >
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/70">
                      <span className={`text-xs font-bold ${meta.color}`}>
                        {meta.label[0]}
                      </span>
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${meta.color}`}>
                        {meta.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {f(editTarget, "label")}
                      </p>
                    </div>
                  </div>
                );
              })()}
              <div>
                <label
                  htmlFor="ci-value"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Value <span className="text-red-500">*</span>
                </label>
                <input
                  id="ci-value"
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setErrors((p) => ({ ...p, value: "" }));
                  }}
                  className={errors.value ? inputError : inputNormal}
                />
                <FieldError id="ci-value-err" msg={errors.value} />
              </div>
              <div>
                <label
                  htmlFor="ci-href"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Link / Href <span className="text-red-500">*</span>
                </label>
                <input
                  id="ci-href"
                  type="text"
                  value={href}
                  onChange={(e) => {
                    setHref(e.target.value);
                    setErrors((p) => ({ ...p, href: "" }));
                  }}
                  className={errors.href ? inputError : inputNormal}
                  placeholder={
                    CONTACT_TYPE_META[
                      (f(editTarget, "type") as ContactType) || "phone"
                    ].hint
                  }
                />
                <FieldError id="ci-href-err" msg={errors.href} />
              </div>
              <div>
                <label
                  htmlFor="ci-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="ci-desc"
                  type="text"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((p) => ({ ...p, description: "" }));
                  }}
                  className={errors.description ? inputError : inputNormal}
                  placeholder="e.g. Mon-Fri: 8:00 AM - 5:00 PM"
                />
                <FieldError id="ci-desc-err" msg={errors.description} />
              </div>
            </form>
          </SlidePanel>
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Emergency Panel ──────────────────────────────────────────────────────────

function EmergencyPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const records = useEmergencyContactsStore((s) => s.adminRecords);
  const isLoading = useEmergencyContactsStore((s) => s.isAdminLoading);
  const error = useEmergencyContactsStore((s) => s.error);
  const {
    fetchAdminRecords,
    createEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
  } = useEmergencyContactsStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EmergencyContactCategory>("police");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    if (accessToken) fetchAdminRecords(accessToken);
  }, []);

  function openCreate() {
    setName("");
    setNumber("");
    setDescription("");
    setCategory("police");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: ContentRecord) {
    setName(f(c, "name"));
    setNumber(f(c, "number"));
    setDescription(f(c, "description"));
    setCategory((f(c, "category") as EmergencyContactCategory) || "police");
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
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!number.trim()) e.number = "Number is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        number: number.trim(),
        description: description.trim(),
        category,
        status: "published" as const,
      };
      if (panelMode === "create") {
        await createEmergencyContact(payload, accessToken!);
        toast("Emergency hotline added.", "success");
      } else if (editTarget) {
        await updateEmergencyContact(editTarget.id, payload, accessToken!);
        toast("Emergency hotline saved.", "success");
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
      await deleteEmergencyContact(record.id, accessToken!);
      toast("Hotline removed.", "success");
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
    <div>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Emergency Hotlines
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} entr{records.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => accessToken && fetchAdminRecords(accessToken)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Hotline
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => accessToken && fetchAdminRecords(accessToken)}
        />
      )}

      {isLoading && records.length === 0 ? (
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Name", "Number", "Description", "Category", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 4 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <TableSkeleton cols={5} />
          </table>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<LuTriangleAlert className="h-6 w-6 text-gray-300" />}
          title="No emergency hotlines yet"
          sub="Add PNP, BFP, MDRRMO and other emergency contacts."
          onAdd={openCreate}
          addLabel="Add Hotline"
        />
      ) : (
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Name", "Number", "Description", "Category", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 4 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-50"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              <AnimatePresence>
                {records.map((c) => {
                  const cat =
                    EMERGENCY_CATEGORY_META[
                      (f(c, "category") as EmergencyContactCategory) || "other"
                    ];
                  return (
                    <motion.tr
                      key={c.id}
                      variants={rowVariants}
                      exit="exit"
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                        {f(c, "name")}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-700 whitespace-nowrap">
                        {f(c, "number")}
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {f(c, "description")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${cat.color} ${cat.bg}`}
                        >
                          {cat.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            ref={
                              getEditRef(
                                c.id,
                              ) as React.RefObject<HTMLButtonElement>
                            }
                            type="button"
                            onClick={() => openEdit(c)}
                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            aria-label={`Edit ${f(c, "name")}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                            aria-label={`Remove ${f(c, "name")}`}
                          >
                            Remove
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
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Emergency Hotline"
                : "Edit Emergency Hotline"
            }
            subtitle="Shown on the public Contact page"
            accentColor="from-gray-800 to-gray-900"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="em-form"
            submitLabel={
              panelMode === "create" ? "Add Hotline" : "Save Changes"
            }
            isSubmitting={isSubmitting}
            submitColorClass="bg-gray-900 hover:bg-gray-800 focus:ring-gray-700"
          >
            <form
              id="em-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="em-name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="em-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors((p) => ({ ...p, name: "" }));
                    }}
                    className={errors.name ? inputError : inputNormal}
                    placeholder="e.g. PNP Libmanan"
                  />
                  <FieldError id="em-name-err" msg={errors.name} />
                </div>
                <div>
                  <label
                    htmlFor="em-number"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="em-number"
                    type="text"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setErrors((p) => ({ ...p, number: "" }));
                    }}
                    className={errors.number ? inputError : inputNormal}
                    placeholder="09XXXXXXXXX"
                  />
                  <FieldError id="em-number-err" msg={errors.number} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="em-desc"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="em-desc"
                    type="text"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors((p) => ({ ...p, description: "" }));
                    }}
                    className={errors.description ? inputError : inputNormal}
                    placeholder="e.g. Police Emergency"
                  />
                  <FieldError id="em-desc-err" msg={errors.description} />
                </div>
                <div>
                  <label
                    htmlFor="em-cat"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Category
                  </label>
                  <select
                    id="em-cat"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as EmergencyContactCategory)
                    }
                    className={inputNormal}
                  >
                    {EMERGENCY_CATEGORIES.map((k) => (
                      <option key={k} value={k}>
                        {EMERGENCY_CATEGORY_META[k].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Preview
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${EMERGENCY_CATEGORY_META[category].color} ${EMERGENCY_CATEGORY_META[category].bg}`}
                >
                  {EMERGENCY_CATEGORY_META[category].label}
                </span>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Medical Panel ────────────────────────────────────────────────────────────

function MedicalPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const records = useMedicalContactsStore((s) => s.adminRecords);
  const isLoading = useMedicalContactsStore((s) => s.isAdminLoading);
  const error = useMedicalContactsStore((s) => s.error);
  const { fetchAdminRecords, createRecord, updateRecord, deleteRecord } =
    useMedicalContactsStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    if (accessToken) fetchAdminRecords(accessToken);
  }, []);

  function openCreate() {
    setName("");
    setNumber("");
    setDescription("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: ContentRecord) {
    setName(f(c, "name"));
    setNumber(f(c, "number"));
    setDescription(f(c, "description"));
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
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!number.trim()) e.number = "Number is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        number: number.trim(),
        description: description.trim(),
        status: "published" as const,
      };
      if (panelMode === "create") {
        await createRecord(payload, accessToken!);
        toast("Medical hotline added.", "success");
      } else if (editTarget) {
        await updateRecord(editTarget.id, payload, accessToken!);
        toast("Medical hotline saved.", "success");
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
      await deleteRecord(record.id, accessToken!);
      toast("Hotline removed.", "success");
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
    <div>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Medical Hotlines
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} entr{records.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => accessToken && fetchAdminRecords(accessToken)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
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
            <LuPlus className="h-4 w-4" /> Add Hotline
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onRetry={() => accessToken && fetchAdminRecords(accessToken)}
        />
      )}

      {isLoading && records.length === 0 ? (
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Facility / Service", "Number", "Description", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 3 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <TableSkeleton cols={4} />
          </table>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<LuPhone className="h-6 w-6 text-gray-300" />}
          title="No medical hotlines yet"
          sub="Add RHU, hospitals, and medical emergency contacts."
          onAdd={openCreate}
          addLabel="Add Hotline"
        />
      ) : (
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Facility / Service", "Number", "Description", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${i === 3 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-gray-50"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
            >
              <AnimatePresence>
                {records.map((c) => (
                  <motion.tr
                    key={c.id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {f(c, "name")}
                    </td>
                    <td className="px-5 py-3 font-mono text-blue-600 whitespace-nowrap">
                      {f(c, "number")}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {f(c, "description")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          ref={
                            getEditRef(
                              c.id,
                            ) as React.RefObject<HTMLButtonElement>
                          }
                          type="button"
                          onClick={() => openEdit(c)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          aria-label={`Edit ${f(c, "name")}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                          aria-label={`Remove ${f(c, "name")}`}
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
        </div>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Medical Hotline"
                : "Edit Medical Hotline"
            }
            subtitle="Hospitals, clinics, and health services"
            accentColor="from-blue-500 to-blue-700"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="med-form"
            submitLabel={
              panelMode === "create" ? "Add Hotline" : "Save Changes"
            }
            isSubmitting={isSubmitting}
          >
            <form
              id="med-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="med-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Facility / Service Name{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="med-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Libmanan District Hospital"
                />
                <FieldError id="med-name-err" msg={errors.name} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="med-number"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="med-number"
                    type="text"
                    value={number}
                    onChange={(e) => {
                      setNumber(e.target.value);
                      setErrors((p) => ({ ...p, number: "" }));
                    }}
                    className={errors.number ? inputError : inputNormal}
                    placeholder="09XXXXXXXXX"
                  />
                  <FieldError id="med-number-err" msg={errors.number} />
                </div>
                <div>
                  <label
                    htmlFor="med-desc"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="med-desc"
                    type="text"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setErrors((p) => ({ ...p, description: "" }));
                    }}
                    className={errors.description ? inputError : inputNormal}
                    placeholder="e.g. District Hospital"
                  />
                  <FieldError id="med-desc-err" msg={errors.description} />
                </div>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Offices Panel ────────────────────────────────────────────────────────────

function OfficesPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const records = useOfficeDirectoryStore((s) => s.records);
  const isLoading = useOfficeDirectoryStore((s) => s.isLoading);
  const error = useOfficeDirectoryStore((s) => s.error);
  const { fetchRecords, createRecord, updateRecord, deleteRecord } =
    useOfficeDirectoryStore();

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
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  const filtered = records.filter(
    (o) =>
      search.trim() === "" ||
      f(o, "name").toLowerCase().includes(search.toLowerCase()) ||
      f(o, "number").includes(search.trim()),
  );

  function openCreate() {
    setName("");
    setNumber("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(o: ContentRecord) {
    setName(f(o, "name"));
    setNumber(f(o, "number"));
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
    if (!number.trim()) e.number = "Contact number is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createRecord(
          { name: name.trim(), number: number.trim() },
          accessToken!,
        );
        toast("Office added.", "success");
      } else if (editTarget) {
        await updateRecord(
          editTarget.id,
          { name: name.trim(), number: number.trim() },
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
      await deleteRecord(record.id, accessToken!);
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
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Municipal Offices Directory
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} offices total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search offices…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search offices"
              className="rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-48"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchRecords()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
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
            <LuPlus className="h-4 w-4" /> Add Office
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchRecords()} />}

      {isLoading && records.length === 0 ? (
        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<LuBuilding2 className="h-6 w-6 text-gray-300" />}
          title="No offices yet"
          sub="Add municipal offices and their direct contact numbers."
          onAdd={openCreate}
          addLabel="Add Office"
        />
      ) : (
        <div className="px-5 pb-5">
          {filtered.length === 0 && search ? (
            <SearchEmpty query={search} />
          ) : (
            <motion.div
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                    className="group relative rounded-xl border border-gray-100 bg-gray-50/50 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <LuPhone className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 pb-7">
                        <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
                          {f(o, "name")}
                        </p>
                        <p className="mt-1 font-mono text-xs text-indigo-600">
                          {f(o, "number")}
                        </p>
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        ref={
                          getEditRef(o.id) as React.RefObject<HTMLButtonElement>
                        }
                        type="button"
                        onClick={() => openEdit(o)}
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                        aria-label={`Edit ${f(o, "name")}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(o)}
                        className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        aria-label={`Remove ${f(o, "name")}`}
                      >
                        Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={panelMode === "create" ? "Add Office" : "Edit Office"}
            subtitle="Municipal office directory entry"
            accentColor="from-indigo-500 to-indigo-700"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="of-form"
            submitLabel={panelMode === "create" ? "Add Office" : "Save Changes"}
            isSubmitting={isSubmitting}
            submitColorClass="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          >
            <form
              id="of-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="of-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Office Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="of-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Municipal Treasurer"
                />
                <FieldError id="of-name-err" msg={errors.name} />
              </div>
              <div>
                <label
                  htmlFor="of-number"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="of-number"
                  type="text"
                  value={number}
                  onChange={(e) => {
                    setNumber(e.target.value);
                    setErrors((p) => ({ ...p, number: "" }));
                  }}
                  className={errors.number ? inputError : inputNormal}
                  placeholder="09XXXXXXXXX"
                />
                <FieldError id="of-number-err" msg={errors.number} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Social Links Panel ───────────────────────────────────────────────────────

function SocialLinksPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const records = useSocialLinksStore((s) => s.records);
  const isLoading = useSocialLinksStore((s) => s.isLoading);
  const error = useSocialLinksStore((s) => s.error);
  const { fetchRecords, createRecord, updateRecord, deleteRecord } =
    useSocialLinksStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ContentRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContentRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  const [name, setName] = useState("");
  const [href, setHref] = useState("");
  const [platform, setPlatform] = useState<SocialLinkPlatform>("facebook");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  useEffect(() => {
    fetchRecords();
  }, []);

  function openCreate() {
    setName("");
    setHref("");
    setPlatform("facebook");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(r: ContentRecord) {
    setName(f(r, "name"));
    setHref(f(r, "href"));
    setPlatform((f(r, "platform") as SocialLinkPlatform) || "facebook");
    setErrors({});
    setEditTarget(r);
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
    if (!href.trim()) e.href = "URL is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setIsSubmitting(true);
    try {
      if (panelMode === "create") {
        await createRecord(
          { name: name.trim(), href: href.trim(), platform },
          accessToken!,
        );
        toast("Social link added.", "success");
      } else if (editTarget) {
        await updateRecord(
          editTarget.id,
          { name: name.trim(), href: href.trim(), platform },
          accessToken!,
        );
        toast("Social link saved.", "success");
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
      await deleteRecord(record.id, accessToken!);
      toast("Social link removed.", "success");
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
    <div>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Social Media Links
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {records.length} link{records.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchRecords()}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            aria-label="Refresh"
          >
            <LuRefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Link
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => fetchRecords()} />}

      {isLoading && records.length === 0 ? (
        <SkeletonRows count={4} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<LuShare2 className="h-6 w-6 text-gray-300" />}
          title="No social links yet"
          sub="Add Facebook, Instagram, YouTube, and other social channels."
          onAdd={openCreate}
          addLabel="Add Link"
        />
      ) : (
        <div className="divide-y divide-gray-50 pb-2">
          <AnimatePresence>
            {records.map((r) => {
              const pm =
                SOCIAL_PLATFORM_META[
                  (f(r, "platform") as SocialLinkPlatform) || "other"
                ];
              return (
                <motion.div
                  key={r.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${pm.bg}`}
                  >
                    <LuShare2 className={`h-4 w-4 ${pm.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {f(r, "name")}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${pm.color} ${pm.bg}`}
                      >
                        {pm.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate mt-0.5">
                      {f(r, "href")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <a
                      href={f(r, "href")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                      aria-label="Open link"
                    >
                      <LuLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      ref={
                        getEditRef(r.id) as React.RefObject<HTMLButtonElement>
                      }
                      type="button"
                      onClick={() => openEdit(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                      aria-label={`Edit ${f(r, "name")}`}
                    >
                      <LuPencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                      aria-label={`Remove ${f(r, "name")}`}
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
            title={
              panelMode === "create" ? "Add Social Link" : "Edit Social Link"
            }
            subtitle="Social media channels shown on the Contact page"
            accentColor="from-violet-500 to-violet-700"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="sl-form"
            submitLabel={panelMode === "create" ? "Add Link" : "Save Changes"}
            isSubmitting={isSubmitting}
            submitColorClass="bg-violet-600 hover:bg-violet-700 focus:ring-violet-500"
          >
            <form
              id="sl-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="sl-platform"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Platform
                </label>
                <select
                  id="sl-platform"
                  value={platform}
                  onChange={(e) =>
                    setPlatform(e.target.value as SocialLinkPlatform)
                  }
                  className={inputNormal}
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {SOCIAL_PLATFORM_META[p].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="sl-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="sl-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Facebook"
                />
                <FieldError id="sl-name-err" msg={errors.name} />
              </div>
              <div>
                <label
                  htmlFor="sl-href"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  id="sl-href"
                  type="url"
                  value={href}
                  onChange={(e) => {
                    setHref(e.target.value);
                    setErrors((p) => ({ ...p, href: "" }));
                  }}
                  className={errors.href ? inputError : inputNormal}
                  placeholder="https://facebook.com/lgulibmanan"
                />
                <FieldError id="sl-href-err" msg={errors.href} />
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteDialog
            label={f(deleteTarget, "name")}
            isDeleting={isDeleting}
            onClose={() => {
              if (!isDeleting) setDeleteTarget(null);
            }}
            onConfirm={() => handleDelete(deleteTarget)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Directory Tab Panel ──────────────────────────────────────────────────────

function DirectoryPanel() {
  const [activeTab, setActiveTab] = useState<DirectoryTab>("emergency");
  const emergencyCount = useEmergencyContactsStore(
    (s) => s.adminRecords.length,
  );
  const medicalCount = useMedicalContactsStore((s) => s.adminRecords.length);
  const officeCount = useOfficeDirectoryStore((s) => s.records.length);
  const socialCount = useSocialLinksStore((s) => s.records.length);

  const tabs: { key: DirectoryTab; label: string; count: number }[] = [
    { key: "emergency", label: "Emergency Hotlines", count: emergencyCount },
    { key: "medical", label: "Medical Hotlines", count: medicalCount },
    { key: "offices", label: "Municipal Offices", count: officeCount },
    { key: "social", label: "Social Media", count: socialCount },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav
          className="flex min-w-max px-4 pt-3 gap-1"
          role="tablist"
          aria-label="Directory sections"
        >
          {tabs.map(({ key, label, count }) => {
            const isActive = key === activeTab;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={`dir-tabpanel-${key}`}
                id={`dir-tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={[
                  "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                  isActive
                    ? "text-blue-600 bg-blue-50/60"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                ].join(" ")}
              >
                {label}
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
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div
        key={activeTab}
        id={`dir-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`dir-tab-${activeTab}`}
      >
        {activeTab === "emergency" && <EmergencyPanel />}
        {activeTab === "medical" && <MedicalPanel />}
        {activeTab === "offices" && <OfficesPanel />}
        {activeTab === "social" && <SocialLinksPanel />}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContactsPage() {
  const emergencyCount = useEmergencyContactsStore(
    (s) => s.adminRecords.length,
  );
  const medicalCount = useMedicalContactsStore((s) => s.adminRecords.length);
  const officeCount = useOfficeDirectoryStore((s) => s.records.length);
  const socialCount = useSocialLinksStore((s) => s.records.length);
  const contactCount = useContactStore((s) => s.adminRecords.length);
  const total =
    emergencyCount + medicalCount + officeCount + socialCount + contactCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage contact info, hotlines, offices, and social links on the
            public Contact page
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-gray-900">{total}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
              Total
            </p>
          </div>
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-red-700">{emergencyCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-red-500 mt-0.5">
              Emergency
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-blue-700">{medicalCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-500 mt-0.5">
              Medical
            </p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 shadow-sm text-center min-w-[70px]">
            <p className="text-xl font-bold text-indigo-700">{officeCount}</p>
            <p className="text-[10px] uppercase tracking-wider text-indigo-500 mt-0.5">
              Offices
            </p>
          </div>
        </div>
      </div>

      <ContactInfoSection />
      <DirectoryPanel />
    </div>
  );
}

export default ContactsPage;
