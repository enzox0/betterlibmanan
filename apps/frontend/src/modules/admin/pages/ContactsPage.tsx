import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactType = "phone" | "email" | "address" | "fax";

interface ContactEntry {
  id: string;
  type: ContactType;
  title: string;
  value: string;
  href: string;
  description: string;
}

type EmergencyCategory =
  | "police"
  | "disaster"
  | "fire"
  | "welfare"
  | "government"
  | "traffic";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  description: string;
  category: EmergencyCategory;
}

interface MedicalContact {
  id: string;
  name: string;
  number: string;
  description: string;
}

interface MunicipalOffice {
  id: string;
  name: string;
  number: string;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────

const INITIAL_CONTACTS: ContactEntry[] = [
  {
    id: "c-phone",
    type: "phone",
    title: "Phone",
    value: "09000000000",
    href: "tel:09000000000",
    description: "Mon-Fri: 8:00 AM - 5:00 PM",
  },
  {
    id: "c-fax",
    type: "fax",
    title: "Fax",
    value: "(000) 000-0000",
    href: "#",
    description: "Available 24/7",
  },
  {
    id: "c-email",
    type: "email",
    title: "Email",
    value: "lgulibmanan@gmail.com",
    href: "mailto:lgulibmanan@gmail.com",
    description: "We'll respond within 24 hours",
  },
  {
    id: "c-address",
    type: "address",
    title: "Address",
    value: "Municipal Hall, Poblacion, Libmanan, Camarines Sur 4418",
    href: "#",
    description: "Visit us during office hours",
  },
];

const INITIAL_EMERGENCY: EmergencyContact[] = [
  {
    id: "e-1",
    name: "PNP Libmanan",
    number: "09000000000",
    description: "Police Emergency",
    category: "police",
  },
  {
    id: "e-2",
    name: "MDRRMO Libmanan",
    number: "09000000000",
    description: "Disaster Response",
    category: "disaster",
  },
  {
    id: "e-3",
    name: "MSWDO Libmanan",
    number: "09000000000",
    description: "Social Welfare",
    category: "welfare",
  },
  {
    id: "e-4",
    name: "BFP Libmanan",
    number: "09000000000",
    description: "Fire Emergency",
    category: "fire",
  },
  {
    id: "e-5",
    name: "DILG Libmanan",
    number: "09000000000",
    description: "Local Government",
    category: "government",
  },
  {
    id: "e-6",
    name: "R2TMC",
    number: "09000000000",
    description: "Traffic Management",
    category: "traffic",
  },
];

const INITIAL_MEDICAL: MedicalContact[] = [
  {
    id: "m-1",
    name: "RHU Libmanan",
    number: "09000000000",
    description: "Rural Health Unit",
  },
  {
    id: "m-2",
    name: "Libmanan District Hospital",
    number: "09000000000",
    description: "District Hospital",
  },
  {
    id: "m-3",
    name: "Red Cross Libmanan",
    number: "09000000000",
    description: "Red Cross Services",
  },
];

const INITIAL_OFFICES: MunicipalOffice[] = [
  { id: "o-01", name: "Mayor's Office", number: "09000000000" },
  { id: "o-02", name: "Vice Mayor's Office", number: "09000000000" },
  { id: "o-03", name: "Sangguniang Bayan", number: "09000000000" },
  { id: "o-04", name: "Municipal Secretary", number: "09000000000" },
  { id: "o-05", name: "Municipal Treasurer", number: "09000000000" },
  { id: "o-06", name: "Municipal Assessor", number: "09000000000" },
  { id: "o-07", name: "Municipal Accountant", number: "09000000000" },
  { id: "o-08", name: "Municipal Budget Officer", number: "09000000000" },
  { id: "o-09", name: "Municipal Planning Officer", number: "09000000000" },
  { id: "o-10", name: "Municipal Engineer", number: "09000000000" },
  { id: "o-11", name: "Municipal Agriculturist", number: "09000000000" },
  { id: "o-12", name: "Municipal Civil Registrar", number: "09000000000" },
  {
    id: "o-13",
    name: "Municipal Social Welfare Officer",
    number: "09000000000",
  },
  { id: "o-14", name: "Municipal Health Officer", number: "09000000000" },
  { id: "o-15", name: "HRMO", number: "09000000000" },
  { id: "o-16", name: "Business Permits & Licensing", number: "09000000000" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

const EMERGENCY_CATEGORY_META: Record<
  EmergencyCategory,
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
};

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

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
const inputError = `${inputBase} border-red-300 bg-red-50`;

function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {msg}
    </p>
  );
}

// ─── Slide Panel ──────────────────────────────────────────────────────────────

interface SlidePanelProps {
  title: string;
  subtitle?: string;
  accentColor?: string; // tailwind gradient class pair e.g. 'from-blue-600 to-blue-800'
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
      {/* Backdrop */}
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

      {/* Panel */}
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
        {/* Top accent stripe */}
        <div
          className={`h-1 bg-gradient-to-r ${accentColor} shrink-0`}
          aria-hidden="true"
        />

        {/* Header */}
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {children}
        </div>

        {/* Footer */}
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

// ─── Delete Confirm Dialog (portal-less, inline) ──────────────────────────────

function DeleteConfirmDialog({
  label,
  onClose,
  onConfirm,
}: {
  label: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-red-600"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
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
    </AnimatePresence>
  );
}

// ─── Shared section wrapper ───────────────────────────────────────────────────

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
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
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

// ─── Section 1: Main Contact Info ─────────────────────────────────────────────

function ContactInfoSection() {
  const [contacts, setContacts] = useState<ContactEntry[]>(INITIAL_CONTACTS);
  const [editTarget, setEditTarget] = useState<ContactEntry | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // per-row edit button refs for focus return
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );
  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

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

  // form state
  const [value, setValue] = useState("");
  const [href, setHref] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openEdit(c: ContactEntry) {
    setValue(c.value);
    setHref(c.href);
    setDescription(c.description);
    setErrors({});
    setEditTarget(c);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!value.trim())
      e.value = `${editTarget ? CONTACT_TYPE_META[editTarget.type].label : "Value"} is required.`;
    if (!href.trim()) e.href = "Link/href is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!editTarget) return;
    setContacts((prev) =>
      prev.map((c) =>
        c.id === editTarget.id
          ? {
              ...c,
              value: value.trim(),
              href: href.trim(),
              description: description.trim(),
            }
          : c,
      ),
    );
    markSaved(editTarget.id);
    setEditTarget(null);
  }

  return (
    <SectionCard
      title="Main Contact Information"
      description="Phone, fax, email, and address shown at the top of the Contact page"
    >
      <div className="divide-y divide-gray-50">
        {contacts.map((c) => {
          const meta = CONTACT_TYPE_META[c.type];
          return (
            <div key={c.id} className="flex items-center gap-4 px-6 py-4">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
              >
                <span className={`text-xs font-bold ${meta.color}`}>
                  {meta.label[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                <p className="text-sm text-gray-500 truncate">{c.value}</p>
                <p className="text-xs text-gray-400 truncate font-mono">
                  {c.href}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Saved
                    </motion.span>
                  )}
                </AnimatePresence>
                <button
                  ref={getEditRef(c.id) as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={() => openEdit(c)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                  aria-label={`Edit ${c.title}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide panel */}
      <AnimatePresence>
        {editTarget && (
          <SlidePanel
            title={`Edit ${CONTACT_TYPE_META[editTarget.type].label}`}
            subtitle="Update public-facing contact info"
            accentColor={`from-blue-600 to-blue-800`}
            onClose={() => setEditTarget(null)}
            returnFocusRef={
              getEditRef(editTarget.id) as React.RefObject<HTMLButtonElement>
            }
            formId="ci-form"
            submitLabel="Save Changes"
          >
            <form
              id="ci-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* Current values preview */}
              <div
                className={`flex items-center gap-3 rounded-xl p-3 ${CONTACT_TYPE_META[editTarget.type].bg}`}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center bg-white/70`}
                >
                  <span
                    className={`text-xs font-bold ${CONTACT_TYPE_META[editTarget.type].color}`}
                  >
                    {CONTACT_TYPE_META[editTarget.type].label[0]}
                  </span>
                </div>
                <div>
                  <p
                    className={`text-xs font-bold ${CONTACT_TYPE_META[editTarget.type].color}`}
                  >
                    {CONTACT_TYPE_META[editTarget.type].label}
                  </p>
                  <p className="text-xs text-gray-500">{editTarget.title}</p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ci-value"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  {CONTACT_TYPE_META[editTarget.type].label}{" "}
                  <span className="text-red-500">*</span>
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
                  aria-invalid={!!errors.value}
                  aria-describedby="ci-value-err"
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
                  aria-invalid={!!errors.href}
                  aria-describedby="ci-href-err"
                  placeholder={CONTACT_TYPE_META[editTarget.type].hint}
                />
                <FieldError id="ci-href-err" msg={errors.href} />
                <p
                  className={`mt-1 text-xs ${CONTACT_TYPE_META[editTarget.type].color}`}
                >
                  {CONTACT_TYPE_META[editTarget.type].hint}
                </p>
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
                  aria-invalid={!!errors.description}
                  aria-describedby="ci-desc-err"
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

// ─── Tabbed Hotlines + Offices Panel ─────────────────────────────────────────

type DirectoryTab = "emergency" | "medical" | "offices";

const DIRECTORY_TABS: {
  key: DirectoryTab;
  label: string;
  getCount: (s: DirectoryTabState) => number;
}[] = [
  {
    key: "emergency",
    label: "Emergency Hotlines",
    getCount: (s) => s.emergency.length,
  },
  {
    key: "medical",
    label: "Medical Hotlines",
    getCount: (s) => s.medical.length,
  },
  {
    key: "offices",
    label: "Municipal Offices",
    getCount: (s) => s.offices.length,
  },
];

interface DirectoryTabState {
  emergency: EmergencyContact[];
  medical: MedicalContact[];
  offices: MunicipalOffice[];
}

// ─── Tabbed Directory Panel ───────────────────────────────────────────────────

// ─── Tabbed Directory Panel ───────────────────────────────────────────────────

function DirectoryPanel() {
  const [activeTab, setActiveTab] = useState<DirectoryTab>("emergency");

  // Shared state for all three tabs — kept here so counts in the tab bar stay live
  const [emergency, setEmergency] =
    useState<EmergencyContact[]>(INITIAL_EMERGENCY);
  const [medical, setMedical] = useState<MedicalContact[]>(INITIAL_MEDICAL);
  const [offices, setOffices] = useState<MunicipalOffice[]>(INITIAL_OFFICES);

  const tabState: DirectoryTabState = { emergency, medical, offices };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* ── Tab bar ── */}
      <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <nav
          className="flex min-w-max px-4 pt-3 gap-1"
          role="tablist"
          aria-label="Directory sections"
        >
          {DIRECTORY_TABS.map(({ key, label, getCount }) => {
            const isActive = key === activeTab;
            const count = getCount(tabState);
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

      {/* ── Tab panels ── */}
      <div
        key={activeTab}
        id={`dir-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`dir-tab-${activeTab}`}
      >
        {activeTab === "emergency" && (
          <EmergencyPanel contacts={emergency} setContacts={setEmergency} />
        )}
        {activeTab === "medical" && (
          <MedicalPanel contacts={medical} setContacts={setMedical} />
        )}
        {activeTab === "offices" && (
          <OfficesPanel offices={offices} setOffices={setOffices} />
        )}
      </div>
    </div>
  );
}

// ─── Emergency panel (tab body) ───────────────────────────────────────────────

function EmergencyPanel({
  contacts,
  setContacts,
}: {
  contacts: EmergencyContact[];
  setContacts: React.Dispatch<React.SetStateAction<EmergencyContact[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<EmergencyContact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(
    null,
  );
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EmergencyCategory>("police");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setName("");
    setNumber("");
    setDescription("");
    setCategory("police");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: EmergencyContact) {
    setName(c.name);
    setNumber(c.number);
    setDescription(c.description);
    setCategory(c.category);
    setErrors({});
    setEditTarget(c);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!number.trim()) e.number = "Number is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (panelMode === "create") {
      setContacts((prev) => [
        ...prev,
        {
          id: `e-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          number: number.trim(),
          description: description.trim(),
          category,
        },
      ]);
    } else if (editTarget) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? {
                ...c,
                name: name.trim(),
                number: number.trim(),
                description: description.trim(),
                category,
              }
            : c,
        ),
      );
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
    <div className="p-5">
      {/* Sub-header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Emergency Hotlines
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {contacts.length === 0
              ? "No hotlines yet"
              : `${contacts.length} entr${contacts.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Add Hotline
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Number
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Category
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-gray-50"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            <AnimatePresence>
              {contacts.map((c) => {
                const cat = EMERGENCY_CATEGORY_META[c.category];
                return (
                  <motion.tr
                    key={c.id}
                    variants={rowVariants}
                    exit="exit"
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {c.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-700 whitespace-nowrap">
                      {c.number}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{c.description}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cat.color} ${cat.bg}`}
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
                          aria-label={`Edit ${c.name}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                          aria-label={`Remove ${c.name}`}
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
        {contacts.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No emergency hotlines yet. Add one above.
          </div>
        )}
      </div>

      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create"
                ? "Add Emergency Hotline"
                : "Edit Emergency Hotline"
            }
            subtitle="These appear on the public Contact page"
            accentColor="from-gray-800 to-gray-900"
            onClose={closePanel}
            returnFocusRef={returnFocusRef}
            formId="em-form"
            submitLabel={
              panelMode === "create" ? "Add Hotline" : "Save Changes"
            }
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
                      setCategory(e.target.value as EmergencyCategory)
                    }
                    className={inputNormal}
                  >
                    {(
                      Object.entries(EMERGENCY_CATEGORY_META) as [
                        EmergencyCategory,
                        (typeof EMERGENCY_CATEGORY_META)[EmergencyCategory],
                      ][]
                    ).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Category preview
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${EMERGENCY_CATEGORY_META[category].color} ${EMERGENCY_CATEGORY_META[category].bg}`}
                >
                  {EMERGENCY_CATEGORY_META[category].label}
                </span>
              </div>
            </form>
          </SlidePanel>
        )}
        {deleteTarget && (
          <DeleteConfirmDialog
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setContacts((prev) =>
                prev.filter((c) => c.id !== deleteTarget.id),
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Medical panel (tab body) ─────────────────────────────────────────────────

function MedicalPanel({
  contacts,
  setContacts,
}: {
  contacts: MedicalContact[];
  setContacts: React.Dispatch<React.SetStateAction<MedicalContact[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<MedicalContact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalContact | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function openCreate() {
    setName("");
    setNumber("");
    setDescription("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(c: MedicalContact) {
    setName(c.name);
    setNumber(c.number);
    setDescription(c.description);
    setErrors({});
    setEditTarget(c);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!number.trim()) e.number = "Number is required.";
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (panelMode === "create") {
      setContacts((prev) => [
        ...prev,
        {
          id: `m-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          number: number.trim(),
          description: description.trim(),
        },
      ]);
    } else if (editTarget) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editTarget.id
            ? {
                ...c,
                name: name.trim(),
                number: number.trim(),
                description: description.trim(),
              }
            : c,
        ),
      );
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
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Medical Emergency Hotlines
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {contacts.length === 0
              ? "No hotlines yet"
              : `${contacts.length} entr${contacts.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          Add Hotline
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Facility / Service
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Number
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                Description
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-gray-50"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            <AnimatePresence>
              {contacts.map((c) => (
                <motion.tr
                  key={c.id}
                  variants={rowVariants}
                  exit="exit"
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {c.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-blue-600 whitespace-nowrap">
                    {c.number}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{c.description}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        ref={
                          getEditRef(c.id) as React.RefObject<HTMLButtonElement>
                        }
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        aria-label={`Edit ${c.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        aria-label={`Remove ${c.name}`}
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
        {contacts.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No medical hotlines yet. Add one above.
          </div>
        )}
      </div>

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
          <DeleteConfirmDialog
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setContacts((prev) =>
                prev.filter((c) => c.id !== deleteTarget.id),
              )
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Offices panel (tab body) ─────────────────────────────────────────────────

function OfficesPanel({
  offices,
  setOffices,
}: {
  offices: MunicipalOffice[];
  setOffices: React.Dispatch<React.SetStateAction<MunicipalOffice[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<MunicipalOffice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MunicipalOffice | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = offices.filter(
    (o) =>
      search.trim() === "" ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.number.includes(search.trim()),
  );

  function openCreate() {
    setName("");
    setNumber("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }
  function openEdit(o: MunicipalOffice) {
    setName(o.name);
    setNumber(o.number);
    setErrors({});
    setEditTarget(o);
    setPanelMode("edit");
  }
  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Office name is required.";
    if (!number.trim()) e.number = "Contact number is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (panelMode === "create") {
      setOffices((prev) => [
        ...prev,
        {
          id: `o-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          number: number.trim(),
        },
      ]);
    } else if (editTarget) {
      setOffices((prev) =>
        prev.map((o) =>
          o.id === editTarget.id
            ? { ...o, name: name.trim(), number: number.trim() }
            : o,
        ),
      );
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
    <div className="p-5">
      {/* Sub-header + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Municipal Offices Directory
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {offices.length} offices total
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
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
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            Add Office
          </button>
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          {search
            ? "No offices match your search."
            : "No offices yet. Add one above."}
        </p>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 pb-7">
                    <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2">
                      {o.name}
                    </p>
                    <p className="mt-1 font-mono text-xs text-indigo-600">
                      {o.number}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    ref={getEditRef(o.id) as React.RefObject<HTMLButtonElement>}
                    type="button"
                    onClick={() => openEdit(o)}
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    aria-label={`Edit ${o.name}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(o)}
                    className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                    aria-label={`Remove ${o.name}`}
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
          <DeleteConfirmDialog
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setOffices((prev) => prev.filter((o) => o.id !== deleteTarget.id))
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContactsPage() {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div>
        <h1 className="text-xl font-bold text-gray-900">Contacts Management</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage all contact information displayed on the public Contact page.
        </p>
      </div>

      <ContactInfoSection />
      <DirectoryPanel />
    </motion.div>
  );
}

export default ContactsPage;
