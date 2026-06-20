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
} from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExecutiveOfficial {
  id: string;
  title: string;
  name: string;
  email: string;
  phone: string;
  hours: string;
}

interface LegislativeMember {
  id: string;
  name: string;
  position: string;
  committees: string[];
}

interface MunicipalOffice {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  link: string;
}

interface Barangay {
  id: string;
  name: string;
  captain: string;
  phone: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_EXECUTIVE: ExecutiveOfficial[] = [
  {
    id: "exec-001",
    title: "Municipal Mayor",
    name: "Hon. [Mayor Name]",
    email: "mayor@libmanan.gov.ph",
    phone: "(054) [Phone Number]",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
  },
  {
    id: "exec-002",
    title: "Municipal Vice Mayor",
    name: "Hon. [Vice Mayor Name]",
    email: "vicemayor@libmanan.gov.ph",
    phone: "(054) [Phone Number]",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
  },
];

const INITIAL_LEGISLATIVE: LegislativeMember[] = [
  {
    id: "leg-001",
    name: "Hon. [Councilor Name 1]",
    position: "SB Member",
    committees: ["Committee 1", "Committee 2"],
  },
  {
    id: "leg-002",
    name: "Hon. [Councilor Name 2]",
    position: "SB Member",
    committees: ["Committee 3", "Committee 4"],
  },
  {
    id: "leg-003",
    name: "Hon. [Councilor Name 3]",
    position: "SB Member",
    committees: ["Committee 5", "Committee 6"],
  },
  {
    id: "leg-004",
    name: "Hon. [Councilor Name 4]",
    position: "SB Member",
    committees: ["Committee 7", "Committee 8"],
  },
  {
    id: "leg-005",
    name: "Hon. [Councilor Name 5]",
    position: "SB Member",
    committees: ["Committee 9", "Committee 10"],
  },
  {
    id: "leg-006",
    name: "Hon. [Councilor Name 6]",
    position: "SB Member",
    committees: ["Committee 11", "Committee 12"],
  },
  {
    id: "leg-007",
    name: "Hon. [Councilor Name 7]",
    position: "SB Member",
    committees: ["Committee 13", "Committee 14"],
  },
  {
    id: "leg-008",
    name: "Hon. [Councilor Name 8]",
    position: "SB Member",
    committees: ["Committee 15", "Committee 16"],
  },
  {
    id: "leg-009",
    name: "Hon. [Liga President Name]",
    position: "Liga ng mga Barangay President",
    committees: ["Barangay Affairs"],
  },
  {
    id: "leg-010",
    name: "Hon. [SK President Name]",
    position: "SK Federation President",
    committees: ["Youth & Sports Development"],
  },
];

const INITIAL_OFFICES: MunicipalOffice[] = [
  {
    id: "off-001",
    name: "Municipal Civil Registrar",
    description: "Birth, death, marriage certificates, CENOMAR",
    phone: "(054) [Phone Number]",
    email: "civilreg@libmanan.gov.ph",
    link: "/services/certificates",
  },
  {
    id: "off-002",
    name: "Municipal Treasurer's Office",
    description: "Tax payments, real property tax, revenue collection",
    phone: "(054) [Phone Number]",
    email: "treasurer@libmanan.gov.ph",
    link: "/services/tax-payments",
  },
  {
    id: "off-003",
    name: "Municipal Engineering Office",
    description: "Building permits, construction permits, infrastructure",
    phone: "(054) [Phone Number]",
    email: "engineer@libmanan.gov.ph",
    link: "/services/infrastructure",
  },
  {
    id: "off-004",
    name: "MSWDO",
    description:
      "Social services, PWD & senior citizen IDs, financial assistance",
    phone: "(054) [Phone Number]",
    email: "mswdo@libmanan.gov.ph",
    link: "/services/social-services",
  },
  {
    id: "off-005",
    name: "Municipal Agriculture Office",
    description: "Agricultural loans, crop insurance, fertilizer assistance",
    phone: "(054) [Phone Number]",
    email: "agri@libmanan.gov.ph",
    link: "/services/agriculture",
  },
  {
    id: "off-006",
    name: "Municipal Planning & Development",
    description: "Development planning, project monitoring, zoning",
    phone: "(054) [Phone Number]",
    email: "mpdo@libmanan.gov.ph",
    link: "",
  },
  {
    id: "off-007",
    name: "Municipal Health Office",
    description: "Vaccination, health certificates, medical assistance",
    phone: "(054) [Phone Number]",
    email: "mho@libmanan.gov.ph",
    link: "/services/health",
  },
  {
    id: "off-008",
    name: "Business Permits & Licensing",
    description: "Business permits, Mayor's clearance, licensing",
    phone: "(054) [Phone Number]",
    email: "bpls@libmanan.gov.ph",
    link: "/services/business",
  },
  {
    id: "off-009",
    name: "MDRRMO",
    description: "Disaster preparedness, emergency response, risk reduction",
    phone: "(054) [Phone Number]",
    email: "mdrrmo@libmanan.gov.ph",
    link: "/services/public-safety",
  },
];

const INITIAL_BARANGAYS: Barangay[] = [
  {
    id: "brgy-001",
    name: "Barangay 1",
    captain: "Kap. [Name]",
    phone: "[Phone Number]",
  },
  {
    id: "brgy-002",
    name: "Barangay 2",
    captain: "Kap. [Name]",
    phone: "[Phone Number]",
  },
  {
    id: "brgy-003",
    name: "Barangay 3",
    captain: "Kap. [Name]",
    phone: "[Phone Number]",
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

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

// ─── Section Card wrapper ─────────────────────────────────────────────────────

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

function ExecutivePanel({
  officials,
  setOfficials,
}: {
  officials: ExecutiveOfficial[];
  setOfficials: React.Dispatch<React.SetStateAction<ExecutiveOfficial[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<ExecutiveOfficial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExecutiveOfficial | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setTitle("");
    setName("");
    setEmail("");
    setPhone("");
    setHours("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(o: ExecutiveOfficial) {
    setTitle(o.title);
    setName(o.name);
    setEmail(o.email);
    setPhone(o.phone);
    setHours(o.hours);
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
    if (!title.trim()) e.title = "Title is required.";
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    if (!phone.trim()) e.phone = "Phone is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      setOfficials((prev) => [
        ...prev,
        {
          id: `exec-${crypto.randomUUID().slice(0, 8)}`,
          title: title.trim(),
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          hours: hours.trim(),
        },
      ]);
    } else if (editTarget) {
      setOfficials((prev) =>
        prev.map((o) =>
          o.id === editTarget.id
            ? {
                ...o,
                title: title.trim(),
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                hours: hours.trim(),
              }
            : o,
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
      title="Executive Branch"
      description="Mayor, Vice Mayor, and other executive officials"
      action={
        <button
          ref={addBtnRef}
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <LuPlus className="h-4 w-4" aria-hidden="true" /> Add Official
        </button>
      }
    >
      <div className="divide-y divide-gray-50">
        {officials.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            No executive officials yet. Add one above.
          </p>
        )}
        {officials.map((o) => (
          <div
            key={o.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:gap-4 sm:px-6"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                <LuLandmark
                  className="h-5 w-5 text-blue-600"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {o.title}
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
                <p className="mt-1 text-sm font-bold text-gray-900">{o.name}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <LuMail className="h-3 w-3 text-gray-400" />
                    {o.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuPhone className="h-3 w-3 text-gray-400" />
                    {o.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuClock className="h-3 w-3 text-gray-400" />
                    {o.hours}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:shrink-0 sm:ml-auto">
              <button
                ref={getEditRef(o.id) as React.RefObject<HTMLButtonElement>}
                type="button"
                onClick={() => openEdit(o)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                aria-label={`Edit ${o.name}`}
              >
                <LuPencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(o)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                aria-label={`Remove ${o.name}`}
              >
                <LuTrash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

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
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
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
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setOfficials((prev) =>
                prev.filter((o) => o.id !== deleteTarget.id),
              )
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Legislative Panel ────────────────────────────────────────────────────────

function LegislativePanel({
  members,
  setMembers,
}: {
  members: LegislativeMember[];
  setMembers: React.Dispatch<React.SetStateAction<LegislativeMember[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<LegislativeMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LegislativeMember | null>(
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
  const [position, setPosition] = useState("SB Member");
  const [committeesRaw, setCommitteesRaw] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = members.filter(
    (m) =>
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.position.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setName("");
    setPosition("SB Member");
    setCommitteesRaw("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(m: LegislativeMember) {
    setName(m.name);
    setPosition(m.position);
    setCommitteesRaw(m.committees.join(", "));
    setErrors({});
    setEditTarget(m);
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
    if (!position.trim()) e.position = "Position is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const committees = committeesRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    if (panelMode === "create") {
      setMembers((prev) => [
        ...prev,
        {
          id: `leg-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          position: position.trim(),
          committees,
        },
      ]);
    } else if (editTarget) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editTarget.id
            ? { ...m, name: name.trim(), position: position.trim(), committees }
            : m,
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
                    {m.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      {m.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px]">
                    {m.committees.length > 0 ? (
                      m.committees.join(" · ")
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        ref={
                          getEditRef(m.id) as React.RefObject<HTMLButtonElement>
                        }
                        type="button"
                        onClick={() => openEdit(m)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        aria-label={`Edit ${m.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(m)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        aria-label={`Remove ${m.name}`}
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            {search
              ? "No members matched your search."
              : "No members yet. Add one above."}
          </p>
        )}
      </div>

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
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id))
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Offices Panel ────────────────────────────────────────────────────────────

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
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = offices.filter(
    (o) =>
      search.trim() === "" ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.description.toLowerCase().includes(search.toLowerCase()),
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

  function openEdit(o: MunicipalOffice) {
    setName(o.name);
    setDescription(o.description);
    setPhone(o.phone);
    setEmail(o.email);
    setLink(o.link);
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
    if (!description.trim()) e.description = "Description is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      setOffices((prev) => [
        ...prev,
        {
          id: `off-${crypto.randomUUID().slice(0, 8)}`,
          name: name.trim(),
          description: description.trim(),
          phone: phone.trim(),
          email: email.trim(),
          link: link.trim(),
        },
      ]);
    } else if (editTarget) {
      setOffices((prev) =>
        prev.map((o) =>
          o.id === editTarget.id
            ? {
                ...o,
                name: name.trim(),
                description: description.trim(),
                phone: phone.trim(),
                email: email.trim(),
                link: link.trim(),
              }
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
                    {o.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                    {o.description}
                  </p>
                  <div className="mt-2 space-y-0.5">
                    {o.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-gray-400">
                        <LuPhone className="h-3 w-3 shrink-0" />
                        {o.phone}
                      </p>
                    )}
                    {o.email && (
                      <p className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                        <LuMail className="h-3 w-3 shrink-0" />
                        {o.email}
                      </p>
                    )}
                    {o.link && (
                      <p className="flex items-center gap-1.5 text-xs text-blue-500 truncate">
                        <LuLink className="h-3 w-3 shrink-0" />
                        {o.link}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 px-3 py-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                  ref={getEditRef(o.id) as React.RefObject<HTMLButtonElement>}
                  type="button"
                  onClick={() => openEdit(o)}
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  aria-label={`Edit ${o.name}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(o)}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                  aria-label={`Remove ${o.name}`}
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-gray-400">
          {search
            ? "No offices matched your search."
            : "No offices yet. Add one above."}
        </p>
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
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setOffices((prev) => prev.filter((o) => o.id !== deleteTarget.id))
            }
          />
        )}
      </AnimatePresence>
    </SectionCard>
  );
}

// ─── Barangays Panel ──────────────────────────────────────────────────────────

function BarangaysPanel({
  barangays,
  setBarangays,
}: {
  barangays: Barangay[];
  setBarangays: React.Dispatch<React.SetStateAction<Barangay[]>>;
}) {
  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<Barangay | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Barangay | null>(null);
  const [search, setSearch] = useState("");
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const editRefs = useRef<Record<string, React.RefObject<HTMLButtonElement>>>(
    {},
  );

  function getEditRef(id: string) {
    if (!editRefs.current[id]) editRefs.current[id] = { current: null };
    return editRefs.current[id];
  }

  const [brgyName, setBrgyName] = useState("");
  const [captain, setCaptain] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = barangays.filter(
    (b) =>
      search.trim() === "" ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.captain.toLowerCase().includes(search.toLowerCase()),
  );

  function openCreate() {
    setBrgyName("");
    setCaptain("");
    setPhone("");
    setErrors({});
    setEditTarget(null);
    setPanelMode("create");
  }

  function openEdit(b: Barangay) {
    setBrgyName(b.name);
    setCaptain(b.captain);
    setPhone(b.phone);
    setErrors({});
    setEditTarget(b);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!brgyName.trim()) e.name = "Barangay name is required.";
    if (!captain.trim()) e.captain = "Captain name is required.";
    if (!phone.trim()) e.phone = "Phone number is required.";
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    if (panelMode === "create") {
      setBarangays((prev) => [
        ...prev,
        {
          id: `brgy-${crypto.randomUUID().slice(0, 8)}`,
          name: brgyName.trim(),
          captain: captain.trim(),
          phone: phone.trim(),
        },
      ]);
    } else if (editTarget) {
      setBarangays((prev) =>
        prev.map((b) =>
          b.id === editTarget.id
            ? {
                ...b,
                name: brgyName.trim(),
                captain: captain.trim(),
                phone: phone.trim(),
              }
            : b,
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
                        {b.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{b.captain}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {b.phone}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        ref={
                          getEditRef(b.id) as React.RefObject<HTMLButtonElement>
                        }
                        type="button"
                        onClick={() => openEdit(b)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        aria-label={`Edit ${b.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(b)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                        aria-label={`Remove ${b.name}`}
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
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            {search
              ? "No barangays matched your search."
              : "No barangays yet. Add one above."}
          </p>
        )}
        {filtered.length > 0 && (
          <p className="mt-3 text-xs text-gray-400">
            Showing {filtered.length} of {barangays.length} barangay
            {barangays.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

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
            label={deleteTarget.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() =>
              setBarangays((prev) =>
                prev.filter((b) => b.id !== deleteTarget.id),
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export function GovernmentModulePage() {
  const [activeTab, setActiveTab] = useState<GovTab>("executive");
  const [executive, setExecutive] =
    useState<ExecutiveOfficial[]>(INITIAL_EXECUTIVE);
  const [legislative, setLegislative] =
    useState<LegislativeMember[]>(INITIAL_LEGISLATIVE);
  const [offices, setOffices] = useState<MunicipalOffice[]>(INITIAL_OFFICES);
  const [barangays, setBarangays] = useState<Barangay[]>(INITIAL_BARANGAYS);

  const tabCounts: Record<GovTab, number> = {
    executive: executive.length,
    legislative: legislative.length,
    offices: offices.length,
    barangays: barangays.length,
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
          Government Management
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage all government officials, offices, and barangay units displayed
          on the public Government page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Executive Officials"
          value={executive.length}
          color="bg-blue-50"
          icon={<LuLandmark className="h-5 w-5 text-blue-600" />}
        />
        <SummaryCard
          label="SB Members"
          value={legislative.length}
          color="bg-indigo-50"
          icon={<LuGavel className="h-5 w-5 text-indigo-600" />}
        />
        <SummaryCard
          label="Municipal Offices"
          value={offices.length}
          color="bg-gray-100"
          icon={<LuBuilding2 className="h-5 w-5 text-gray-600" />}
        />
        <SummaryCard
          label="Barangays"
          value={barangays.length}
          color="bg-emerald-50"
          icon={<LuMapPin className="h-5 w-5 text-emerald-600" />}
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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

        {/* Tab panel content */}
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
              {activeTab === "executive" && (
                <ExecutivePanel
                  officials={executive}
                  setOfficials={setExecutive}
                />
              )}
              {activeTab === "legislative" && (
                <LegislativePanel
                  members={legislative}
                  setMembers={setLegislative}
                />
              )}
              {activeTab === "offices" && (
                <OfficesPanel offices={offices} setOffices={setOffices} />
              )}
              {activeTab === "barangays" && (
                <BarangaysPanel
                  barangays={barangays}
                  setBarangays={setBarangays}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

GovernmentModulePage.displayName = "GovernmentModulePage";
export default GovernmentModulePage;
