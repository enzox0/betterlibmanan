import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  LuX,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuCheck,
  LuTriangleAlert,
  LuMapPin,
  LuStar,
  LuTag,
  LuImage,
  LuRefreshCw,
} from "react-icons/lu";
import { useTourismStore } from "../store/tourismStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import SafeImage from "@/modules/landing/components/ui/SafeImage";
import {
  uploadTourismImageRequest,
  type TouristSpotRecord,
  type TouristSpotPayload,
  type TourismCategory,
} from "../services/tourism.api";

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_OPTIONS: { value: TourismCategory; label: string }[] = [
  { value: "nature", label: "Nature" },
  { value: "water", label: "Rivers & Lakes" },
  { value: "heritage", label: "Heritage" },
  { value: "viewpoint", label: "Viewpoints" },
  { value: "photo", label: "Photo Spots" },
  { value: "other", label: "Other" },
];

const CATEGORY_COLORS: Record<TourismCategory, string> = {
  nature: "bg-emerald-50 text-emerald-700",
  water: "bg-blue-50 text-blue-700",
  heritage: "bg-amber-50 text-amber-700",
  viewpoint: "bg-purple-50 text-purple-700",
  photo: "bg-rose-50 text-rose-700",
  other: "bg-gray-100 text-gray-600",
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

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
const inputError = `${inputBase} border-red-300 bg-red-50`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── SlidePanel ───────────────────────────────────────────────────────────────

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

// ─── DeleteConfirmDialog ──────────────────────────────────────────────────────

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
        aria-labelledby="tour-del-title"
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
                  id="tour-del-title"
                  className="text-sm font-bold text-gray-900"
                >
                  Remove Tourist Spot
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

// ─── Form state ───────────────────────────────────────────────────────────────

interface SpotFormState {
  name: string;
  location: string;
  description: string;
  category: TourismCategory;
  rating: string;
  entryFee: string;
  tags: string[];
  imageUrl: string;
  imageKey: string;
  status: "published" | "draft";
}

const emptyForm = (): SpotFormState => ({
  name: "",
  location: "",
  description: "",
  category: "other",
  rating: "",
  entryFee: "",
  tags: [],
  imageUrl: "",
  imageKey: "",
  status: "draft",
});

function recordToForm(r: TouristSpotRecord): SpotFormState {
  return {
    name: r.fields.name,
    location: r.fields.location,
    description: r.fields.description,
    category: r.fields.category,
    rating: r.fields.rating,
    entryFee: r.fields.entryFee,
    tags: r.fields.tags ?? [],
    imageUrl: r.fields.image,
    imageKey: "",
    status: r.status,
  };
}

function validateForm(f: SpotFormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (!f.name.trim()) e.name = "Name is required.";
  if (!f.category) e.category = "Category is required.";
  return e;
}

// ─── TouristSpotsPanel ────────────────────────────────────────────────────────

function TouristSpotsPanel() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);
  const spots = useTourismStore((s) => s.adminSpots);
  const isLoading = useTourismStore((s) => s.isAdminLoading);
  const error = useTourismStore((s) => s.error);
  const { fetchAdminSpots, createSpot, updateSpot, deleteSpot } =
    useTourismStore();

  const [panelMode, setPanelMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<TouristSpotRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TouristSpotRecord | null>(
    null,
  );
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<TourismCategory | "all">(
    "all",
  );
  const [form, setForm] = useState<SpotFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (accessToken && spots.length === 0 && !isLoading) {
      fetchAdminSpots(accessToken).catch(() => {});
    }
  }, [accessToken]);

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

  function openEdit(s: TouristSpotRecord) {
    setForm(recordToForm(s));
    setErrors({});
    setEditTarget(s);
    setPanelMode("edit");
  }

  function closePanel() {
    setPanelMode(null);
    setEditTarget(null);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;
    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(",")[1];
        const uploaded = await uploadTourismImageRequest(
          { filename: file.name, mimeType: file.type, data: base64 },
          accessToken,
        );
        setForm((p) => ({
          ...p,
          imageUrl: uploaded.url,
          imageKey: uploaded.key,
        }));
        toast("Image uploaded.", "success");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast("Failed to upload image.", "error");
      setIsUploadingImage(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateForm(form);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    if (!accessToken) return;
    setIsSubmitting(true);
    try {
      const payload: TouristSpotPayload = {
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        category: form.category,
        rating: form.rating.trim(),
        entryFee: form.entryFee.trim(),
        tags: form.tags,
        imageUrl: form.imageUrl.trim(),
        imageKey: form.imageKey.trim(),
        status: form.status,
      };
      if (panelMode === "create") {
        await createSpot(payload, accessToken);
        toast("Tourist spot created.", "success");
      } else if (editTarget) {
        const updated = await updateSpot(editTarget.id, payload, accessToken);
        markSaved(updated.id);
        toast("Tourist spot updated.", "success");
      }
      closePanel();
    } catch (err: any) {
      toast(err?.response?.data?.message || "Failed to save.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!accessToken) return;
    try {
      await deleteSpot(id, accessToken);
      toast("Tourist spot removed.", "success");
    } catch {
      toast("Failed to remove tourist spot.", "error");
    }
  }

  const filtered = spots.filter((s) => {
    const matchSearch =
      !search.trim() ||
      s.fields.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fields.location.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      filterCategory === "all" || s.fields.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Tourist Spots</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            Manage destinations displayed on the public Tourism page
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative hidden sm:block">
            <LuSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search spots…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search tourist spots"
              className="rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-44"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value as TourismCategory | "all")
            }
            aria-label="Filter by category"
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="all">All categories</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              accessToken && fetchAdminSpots(accessToken).catch(() => {})
            }
            disabled={isLoading}
            aria-label="Refresh"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
          >
            <LuRefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            ref={addBtnRef}
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all whitespace-nowrap"
          >
            <LuPlus className="h-4 w-4" /> Add Spot
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <ErrorBanner
          message={error}
          onRetry={() =>
            accessToken && fetchAdminSpots(accessToken).catch(() => {})
          }
        />
      )}

      {/* Content */}
      {isLoading && spots.length === 0 ? (
        <SkeletonRows />
      ) : spots.length === 0 && !isLoading ? (
        <div className="py-14 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <LuMapPin className="h-6 w-6 text-blue-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            No tourist spots yet
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Add your first destination to get started.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <LuPlus className="h-4 w-4" /> Add Spot
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          <AnimatePresence>
            {filtered.map((spot) => (
              <motion.div
                key={spot.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {spot.fields.image ? (
                    <SafeImage
                      src={spot.fields.image}
                      alt={spot.fields.name}
                      className="h-10 w-10 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100">
                      <LuMapPin className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-gray-900">
                        {spot.fields.name}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[spot.fields.category]}`}
                      >
                        {CATEGORY_OPTIONS.find(
                          (o) => o.value === spot.fields.category,
                        )?.label ?? spot.fields.category}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${spot.status === "published" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {spot.status}
                      </span>
                      <AnimatePresence>
                        {savedIds.has(spot.id) && (
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
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                      {spot.fields.location && (
                        <span className="flex items-center gap-1">
                          <LuMapPin className="h-3 w-3 text-gray-400" />
                          {spot.fields.location}
                        </span>
                      )}
                      {spot.fields.rating && (
                        <span className="flex items-center gap-1">
                          <LuStar className="h-3 w-3 text-yellow-400" />
                          {spot.fields.rating}
                        </span>
                      )}
                      {spot.fields.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <LuTag className="h-3 w-3 text-gray-400" />
                          {spot.fields.tags.slice(0, 3).join(", ")}
                          {spot.fields.tags.length > 3 &&
                            ` +${spot.fields.tags.length - 3}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(spot)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                    aria-label={`Edit ${spot.fields.name}`}
                  >
                    <LuPencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(spot)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all"
                    aria-label={`Remove ${spot.fields.name}`}
                  >
                    <LuTrash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && spots.length > 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No spots match your filter.
            </p>
          )}
        </div>
      )}

      {/* SlidePanel */}
      <AnimatePresence>
        {panelMode && (
          <SlidePanel
            title={
              panelMode === "create" ? "Add Tourist Spot" : "Edit Tourist Spot"
            }
            subtitle="Displayed on the public Tourism page"
            onClose={closePanel}
            returnFocusRef={addBtnRef}
            formId="spot-form"
            submitLabel={panelMode === "create" ? "Add Spot" : "Save Changes"}
            isSubmitting={isSubmitting}
          >
            <form
              id="spot-form"
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="spot-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="spot-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    setErrors((p) => ({ ...p, name: "" }));
                  }}
                  className={errors.name ? inputError : inputNormal}
                  placeholder="e.g. Libmanan Cave"
                />
                <FieldError id="spot-name-err" msg={errors.name} />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="spot-category"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="spot-category"
                  value={form.category}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      category: e.target.value as TourismCategory,
                    }));
                    setErrors((p) => ({ ...p, category: "" }));
                  }}
                  className={errors.category ? inputError : inputNormal}
                >
                  {CATEGORY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <FieldError id="spot-cat-err" msg={errors.category} />
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="spot-location"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Location
                </label>
                <input
                  id="spot-location"
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className={inputNormal}
                  placeholder="e.g. Barangay Palestina, Libmanan"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="spot-desc"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="spot-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  className={`${inputNormal} resize-none`}
                  placeholder="Brief description of the destination…"
                />
              </div>

              {/* Rating & Entry Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="spot-rating"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Rating
                  </label>
                  <input
                    id="spot-rating"
                    type="text"
                    value={form.rating}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, rating: e.target.value }))
                    }
                    className={inputNormal}
                    placeholder="e.g. 4.8"
                  />
                </div>
                <div>
                  <label
                    htmlFor="spot-fee"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Entry Fee
                  </label>
                  <input
                    id="spot-fee"
                    type="text"
                    value={form.entryFee}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, entryFee: e.target.value }))
                    }
                    className={inputNormal}
                    placeholder="e.g. Free or ₱50"
                  />
                </div>
              </div>

              {/* Tags */}
              <ListEditorField
                label="Tags"
                items={form.tags}
                onChange={(tags) => setForm((p) => ({ ...p, tags }))}
                placeholder="e.g. Cave, Adventure… (Enter to add)"
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <LuImage className="h-3.5 w-3.5 text-gray-400" /> Cover Image
                </label>
                {form.imageUrl && (
                  <div className="mb-2 relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                    <SafeImage
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, imageUrl: "", imageKey: "" }))
                      }
                      className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                      aria-label="Remove image"
                    >
                      <LuX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="spot-image-upload"
                />
                <label
                  htmlFor="spot-image-upload"
                  className={`inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-all ${isUploadingImage ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <LuImage className="h-4 w-4 text-gray-400" />
                  {isUploadingImage
                    ? "Uploading…"
                    : form.imageUrl
                      ? "Replace image"
                      : "Upload image"}
                </label>
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="spot-status"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Status
                </label>
                <select
                  id="spot-status"
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
            label={deleteTarget.fields.name}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TourismModulePage() {
  const spots = useTourismStore((s) => s.adminSpots);
  const published = spots.filter((s) => s.status === "published").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Tourism
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage tourist spots displayed on the public Tourism page
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm text-center min-w-[80px]">
            <p className="text-xl font-bold text-gray-900">{spots.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
              Total
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 shadow-sm text-center min-w-[80px]">
            <p className="text-xl font-bold text-blue-700">{published}</p>
            <p className="text-[10px] uppercase tracking-wider text-blue-500 mt-0.5">
              Published
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm text-center min-w-[80px]">
            <p className="text-xl font-bold text-gray-600">
              {spots.length - published}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
              Draft
            </p>
          </div>
        </div>
      </div>

      {/* Panel */}
      <TouristSpotsPanel />
    </div>
  );
}

export default TourismModulePage;
