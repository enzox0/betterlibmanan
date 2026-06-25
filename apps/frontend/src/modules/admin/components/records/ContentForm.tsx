import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuX } from "react-icons/lu";
import { mockSections } from "../../data/mockSections";
import { useAdminStore } from "../../store/adminStore";
import { useBetterLugsStore } from "../../store/betterLugsStore";
import { useBarangayMapStore } from "../../store/barangayMapStore";
import { usePopularServicesStore } from "../../store/popular-services.store";
import { useAtAGlanceStore } from "../../store/atAGlanceStore";
import { useHistoryStore } from "../../store/historyStore";
import { useLatestUpdatesStore } from "../../store/latestUpdatesStore";
import { useLeadershipStore } from "../../store/leadershipStore";
import { useContactStore } from "../../store/contactStore";
import { useQuizStore } from "../../store/quizStore";
import { useEmergencyContactsStore } from "../../store/emergencyContactsStore";
import { useMarqueeImagesStore } from "../../store/marqueeImagesStore";
import { ImageUploadPlaceholder } from "./ImageUploadPlaceholder";
import { PreviewPanel } from "../preview/PreviewPanel";
import { LucideIconPicker } from "./ReactIconPicker";
import { uploadBetterLugImageRequest } from "../../services/better-lugs.api";
import { uploadBarangayMapImageRequest } from "../../services/barangay-map.api";
import { uploadPopularServiceIcon } from "../../services/popular-services.api";
import { uploadLeadershipAvatarRequest } from "../../services/leadership.api";
import { uploadMarqueeImageFileRequest } from "../../services/marquee-images.api";
import type {
  ContentFormProps,
  ContentRecord,
  ContentStatus,
} from "../../types/admin.types";

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function getTitleFieldKey(
  fields: { key: string; type: string; required: boolean }[],
): string {
  const firstRequiredText = fields.find((f) => f.type === "text" && f.required);
  if (firstRequiredText) return firstRequiredText.key;

  if (fields.some((f) => f.key === "title")) return "title";
  if (fields.some((f) => f.key === "name")) return "name";

  const firstText = fields.find((f) => f.type === "text");
  if (firstText) return firstText.key;

  return fields[0]?.key ?? "title";
}

function buildInitialValues(
  fields: { key: string; type: string }[],
  initialData?: ContentRecord,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const raw = initialData?.fields[field.key];
    values[field.key] = raw !== undefined && raw !== null ? String(raw) : "";
  }
  return values;
}

function isValidImageFile(file: File): boolean {
  return (
    ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
      file.type,
    ) && file.size <= 5 * 1024 * 1024
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new Error("Failed to read the selected image"));
    reader.readAsDataURL(file);
  });
}

const SLIDE_EASE = [0.22, 1, 0.36, 1] as const;

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

export function ContentForm({
  mode,
  sectionKey,
  initialData,
  onClose,
  returnFocusRef,
  onSubmitted,
}: ContentFormProps) {
  const addRecord = useAdminStore((s) => s.addRecord);
  const updateRecord = useAdminStore((s) => s.updateRecord);
  const accessToken = useAdminStore((s) => s.accessToken);
  const createBetterLug = useBetterLugsStore((s) => s.createBetterLug);
  const updateBetterLug = useBetterLugsStore((s) => s.updateBetterLug);
  const createBarangayMap = useBarangayMapStore((s) => s.createBarangayMap);
  const updateBarangayMap = useBarangayMapStore((s) => s.updateBarangayMap);
  const createPopularService = usePopularServicesStore(
    (s) => s.createPopularService,
  );
  const updatePopularService = usePopularServicesStore(
    (s) => s.updatePopularService,
  );
  const createAtAGlance = useAtAGlanceStore((s) => s.createAtAGlance);
  const updateAtAGlance = useAtAGlanceStore((s) => s.updateAtAGlance);
  const createHistory = useHistoryStore((s) => s.createHistory);
  const updateHistory = useHistoryStore((s) => s.updateHistory);
  const createLatestUpdate = useLatestUpdatesStore((s) => s.createLatestUpdate);
  const updateLatestUpdate = useLatestUpdatesStore((s) => s.updateLatestUpdate);
  const createLeadership = useLeadershipStore((s) => s.createLeadership);
  const updateLeadership = useLeadershipStore((s) => s.updateLeadership);
  const createContact = useContactStore((s) => s.createContact);
  const updateContact = useContactStore((s) => s.updateContact);
  const createQuiz = useQuizStore((s) => s.createQuiz);
  const updateQuiz = useQuizStore((s) => s.updateQuiz);
  const createEmergencyContact = useEmergencyContactsStore(
    (s) => s.createEmergencyContact,
  );
  const updateEmergencyContact = useEmergencyContactsStore(
    (s) => s.updateEmergencyContact,
  );
  const createMarqueeImage = useMarqueeImagesStore((s) => s.createMarqueeImage);
  const updateMarqueeImage = useMarqueeImagesStore((s) => s.updateMarqueeImage);

  const section = mockSections.find((s) => s.key === sectionKey);
  const fields = section?.fields ?? [];
  const supportsPreview = section?.supportsPreview ?? false;
  const isBetterLugsSection = sectionKey === "partner-logos";
  const isBarangayMapSection = sectionKey === "barangay-map";
  const isPopularServicesSection = sectionKey === "popular-services";
  const isAtAGlanceSection = sectionKey === "at-a-glance";
  const isHistorySection = sectionKey === "history";
  const isLatestUpdatesSection = sectionKey === "latest-updates";
  const isLeadershipSection = sectionKey === "leadership";
  const isContactSection = sectionKey === "contact";
  const isQuizSection = sectionKey === "quiz";
  const isEmergencyContactsSection = sectionKey === "emergency-contacts";
  const isMarqueeImagesSection = sectionKey === "marquee-images";
  const managedImageFieldKey = isBetterLugsSection
    ? "logo"
    : isBarangayMapSection
      ? "image"
      : isLeadershipSection
        ? "avatar"
        : isMarqueeImagesSection
          ? "imageUrl"
          : null;

  // Status field (always present)
  const [status, setStatus] = useState<ContentStatus>(
    initialData?.status ?? "draft",
  );

  // Field values (excludes image fields — handled by ImageUploadPlaceholder internally)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const base = buildInitialValues(fields, initialData);
    // For the quiz section, expand the options array (stored in fields.options) into
    // individual option0…option3 keys that the form fields expect.
    if (sectionKey === "quiz" && initialData) {
      const raw = initialData.fields.options;
      let options: string[] = [];
      if (Array.isArray(raw)) {
        options = raw as string[];
      } else if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          options = Array.isArray(parsed) ? parsed : [];
        } catch {
          options = [];
        }
      }
      options.forEach((opt, i) => {
        base[`option${i}`] = opt;
      });
    }
    return base;
  });

  // Validation errors keyed by field key; 'status' key reserved for the status field
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview toggle
  const [showPreview, setShowPreview] = useState(false);

  const initialManagedImageUrl = managedImageFieldKey
    ? (initialData?.fields[managedImageFieldKey] ?? "")
    : "";
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(
    initialManagedImageUrl || null,
  );
  const [imageChangeState, setImageChangeState] = useState<
    "unchanged" | "selected" | "removed"
  >(initialManagedImageUrl ? "unchanged" : "removed");
  const [imageError, setImageError] = useState<string | null>(null);

  // Ref for first focusable element in the panel (used for focus-on-open)
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstFocusableRef.current?.focus();
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // Restore focus to the trigger element after the React state flush
    setTimeout(() => {
      returnFocusRef.current?.focus();
    }, 0);
  }, [onClose, returnFocusRef]);

  // Escape key closes the form
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleClose]);

  function handleFieldChange(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
    // Clear error on change
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      if (field.type === "image") continue;

      const value = fieldValues[field.key] ?? "";

      if (field.required && value.trim() === "") {
        newErrors[field.key] = `${field.label} is required.`;
        continue;
      }

      if (
        field.type === "url" &&
        value.trim() !== "" &&
        !isValidUrl(value.trim())
      ) {
        newErrors[field.key] = `${field.label} must be a valid URL.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleManagedImageFileChange(file: File) {
    if (!isValidImageFile(file)) {
      setSelectedImageFile(null);
      setImageError(
        "File must be PNG, JPG, GIF, or WEBP and no larger than 5MB",
      );
      return;
    }

    const previewUrl = await readFileAsDataUrl(file);
    setSelectedImageFile(file);
    setImagePreviewUrl(previewUrl);
    setImageChangeState("selected");
    setImageError(null);
    setSubmitError(null);
  }

  function handleRemoveManagedImage() {
    if (!managedImageFieldKey) return;
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setImageChangeState("removed");
    setImageError(null);
    setFieldValues((prev) => ({ ...prev, [managedImageFieldKey]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (imageError) return;

    const titleFieldKey = getTitleFieldKey(fields);
    const title =
      fieldValues[titleFieldKey] ??
      fieldValues["title"] ??
      fieldValues["name"] ??
      "";

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (isBetterLugsSection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage Better LUGs.");
        }

        const payload: {
          name: string;
          websiteUrl?: string;
          logoUrl?: string;
          logoKey?: string;
          status: ContentStatus;
        } = {
          name: fieldValues.name?.trim() ?? title.trim(),
          websiteUrl: fieldValues.websiteUrl?.trim() ?? "",
          status,
        };

        if (imageChangeState === "selected" && selectedImageFile) {
          const uploaded = await uploadBetterLugImageRequest(
            {
              filename: selectedImageFile.name,
              mimeType: selectedImageFile.type,
              data: await readFileAsDataUrl(selectedImageFile),
            },
            accessToken,
          );
          payload.logoUrl = uploaded.url;
          payload.logoKey = uploaded.key;
        } else if (imageChangeState === "removed") {
          payload.logoUrl = "";
          payload.logoKey = "";
        }

        if (mode === "create") {
          await createBetterLug(payload, accessToken);
        } else {
          await updateBetterLug(initialData!.id, payload, accessToken);
        }
      } else if (isBarangayMapSection) {
        if (!accessToken) {
          throw new Error(
            "You must be signed in to manage barangay map records.",
          );
        }

        const payload: {
          name: string;
          imageUrl?: string;
          imageKey?: string;
          description?: string;
          touristAttractions?: string;
          population?: string;
          area?: string;
          festivals?: string;
          status: ContentStatus;
        } = {
          name: fieldValues.name?.trim() ?? title.trim(),
          description: fieldValues.description?.trim() ?? "",
          touristAttractions: fieldValues.touristAttractions?.trim() ?? "",
          population: fieldValues.population?.trim() ?? "",
          area: fieldValues.area?.trim() ?? "",
          festivals: fieldValues.festivals?.trim() ?? "",
          status,
        };

        if (imageChangeState === "selected" && selectedImageFile) {
          const uploaded = await uploadBarangayMapImageRequest(
            {
              filename: selectedImageFile.name,
              mimeType: selectedImageFile.type,
              data: await readFileAsDataUrl(selectedImageFile),
            },
            accessToken,
          );
          payload.imageUrl = uploaded.url;
          payload.imageKey = uploaded.key;
        } else if (imageChangeState === "removed") {
          payload.imageUrl = "";
          payload.imageKey = "";
        }

        if (mode === "create") {
          await createBarangayMap(payload, accessToken);
        } else {
          await updateBarangayMap(initialData!.id, payload, accessToken);
        }
      } else if (isPopularServicesSection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage popular services.");
        }

        const payload: {
          name: string;
          icon?: string;
          description?: string;
          status: ContentStatus;
        } = {
          name: fieldValues.name?.trim() ?? title.trim(),
          icon: fieldValues.icon?.trim() ?? "",
          description: fieldValues.description?.trim() ?? "",
          status,
        };

        if (mode === "create") {
          await createPopularService(payload, accessToken);
        } else {
          await updatePopularService(initialData!.id, payload, accessToken);
        }
      } else if (isAtAGlanceSection) {
        if (!accessToken) {
          throw new Error(
            "You must be signed in to manage At a Glance records.",
          );
        }

        const payload: {
          label: string;
          value: string;
          icon?: string;
          sub?: string;
          status: ContentStatus;
        } = {
          label: fieldValues.label?.trim() ?? title.trim(),
          value: fieldValues.value?.trim() ?? "",
          icon: fieldValues.icon?.trim() ?? "",
          sub: fieldValues.sub?.trim() ?? "",
          status,
        };

        if (mode === "create") {
          await createAtAGlance(payload, accessToken);
        } else {
          await updateAtAGlance(initialData!.id, payload, accessToken);
        }
      } else if (isHistorySection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage History records.");
        }

        const payload: {
          title: string;
          content?: string;
          year?: string;
          status: ContentStatus;
        } = {
          title: fieldValues.title?.trim() ?? title.trim(),
          content: fieldValues.content?.trim() ?? "",
          year: fieldValues.year?.trim() ?? "",
          status,
        };

        if (mode === "create") {
          await createHistory(payload, accessToken);
        } else {
          await updateHistory(initialData!.id, payload, accessToken);
        }
      } else if (isLatestUpdatesSection) {
        if (!accessToken) {
          throw new Error(
            "You must be signed in to manage Latest Updates records.",
          );
        }

        const payload: {
          title: string;
          date?: string;
          summary?: string;
          status: ContentStatus;
        } = {
          title: fieldValues.title?.trim() ?? title.trim(),
          date: fieldValues.date?.trim() ?? "",
          summary: fieldValues.summary?.trim() ?? "",
          status,
        };

        if (mode === "create") {
          await createLatestUpdate(payload, accessToken);
        } else {
          await updateLatestUpdate(initialData!.id, payload, accessToken);
        }
      } else if (isLeadershipSection) {
        if (!accessToken) {
          throw new Error(
            "You must be signed in to manage Leadership records.",
          );
        }

        const payload: {
          name: string;
          position?: string;
          email?: string;
          phone?: string;
          avatarUrl?: string;
          avatarKey?: string;
          status: ContentStatus;
        } = {
          name: fieldValues.name?.trim() ?? title.trim(),
          position: fieldValues.position?.trim() ?? "",
          email: fieldValues.email?.trim() ?? "",
          phone: fieldValues.phone?.trim() ?? "",
          status,
        };

        if (imageChangeState === "selected" && selectedImageFile) {
          const uploaded = await uploadLeadershipAvatarRequest(
            {
              filename: selectedImageFile.name,
              mimeType: selectedImageFile.type,
              data: await readFileAsDataUrl(selectedImageFile),
            },
            accessToken,
          );
          payload.avatarUrl = uploaded.url;
          payload.avatarKey = uploaded.key;
        } else if (imageChangeState === "removed") {
          payload.avatarUrl = "";
          payload.avatarKey = "";
        }

        if (mode === "create") {
          await createLeadership(payload, accessToken);
        } else {
          await updateLeadership(initialData!.id, payload, accessToken);
        }
      } else if (isContactSection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage Contact records.");
        }

        const payload: {
          label: string;
          value: string;
          type?: "phone" | "email" | "address" | "fax";
          status: ContentStatus;
        } = {
          label: fieldValues.label?.trim() ?? title.trim(),
          value: fieldValues.value?.trim() ?? "",
          type:
            (fieldValues.type?.trim() as
              | "phone"
              | "email"
              | "address"
              | "fax") || "phone",
          status,
        };

        if (mode === "create") {
          await createContact(payload, accessToken);
        } else {
          await updateContact(initialData!.id, payload, accessToken);
        }
      } else if (isQuizSection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage Quiz records.");
        }

        // Collect non-empty options in order (option0–option3)
        const options = (["option0", "option1", "option2", "option3"] as const)
          .map((key) => fieldValues[key]?.trim() ?? "")
          .filter((v) => v !== "");

        const correctIndex = parseInt(fieldValues.correctIndex ?? "0", 10);

        const payload = {
          question: fieldValues.question?.trim() ?? title.trim(),
          options,
          correctIndex: isNaN(correctIndex) ? 0 : correctIndex,
          explanation: fieldValues.explanation?.trim() ?? "",
          category: fieldValues.category?.trim() ?? "",
          status,
        };

        if (mode === "create") {
          await createQuiz(payload, accessToken);
        } else {
          await updateQuiz(initialData!.id, payload, accessToken);
        }
      } else if (isEmergencyContactsSection) {
        if (!accessToken) {
          throw new Error(
            "You must be signed in to manage Emergency Contact records.",
          );
        }

        const payload: {
          name: string;
          number: string;
          icon?: string;
          status: ContentStatus;
        } = {
          name: fieldValues.name?.trim() ?? title.trim(),
          number: fieldValues.number?.trim() ?? "",
          icon: fieldValues.icon?.trim() || "",
          status,
        };

        if (mode === "create") {
          await createEmergencyContact(payload, accessToken);
        } else {
          await updateEmergencyContact(initialData!.id, payload, accessToken);
        }
      } else if (isMarqueeImagesSection) {
        if (!accessToken) {
          throw new Error("You must be signed in to manage marquee images.");
        }

        if (!selectedImageFile && mode === "create" && !fieldValues.imageUrl) {
          setImageError("Please upload an image.");
          setIsSubmitting(false);
          return;
        }

        const payload: {
          alt: string;
          imageUrl?: string;
          imageKey?: string;
          rowNumber: number;
          order: number;
          status: ContentStatus;
        } = {
          alt: fieldValues.alt?.trim() ?? title.trim(),
          rowNumber: parseInt(fieldValues.rowNumber ?? "1", 10) || 1,
          order: parseInt(fieldValues.order ?? "0", 10) || 0,
          status,
        };

        if (imageChangeState === "selected" && selectedImageFile) {
          // New image uploaded — upload to R2 and include new url/key
          const uploaded = await uploadMarqueeImageFileRequest(
            {
              filename: selectedImageFile.name,
              mimeType: selectedImageFile.type,
              data: await readFileAsDataUrl(selectedImageFile),
            },
            accessToken,
          );
          payload.imageUrl = uploaded.url;
          payload.imageKey = uploaded.key;
        } else if (imageChangeState === "removed") {
          // Explicitly cleared
          payload.imageUrl = "";
          payload.imageKey = "";
        }
        // imageChangeState === "unchanged" → omit both fields so the server keeps existing values

        if (mode === "create") {
          await createMarqueeImage(payload, accessToken);
        } else {
          await updateMarqueeImage(initialData!.id, payload, accessToken);
        }
      } else if (mode === "create") {
        addRecord(sectionKey, {
          title,
          status,
          sectionKey,
          fields: fieldValues,
        });
      } else {
        updateRecord(sectionKey, initialData!.id, {
          fields: fieldValues,
          title,
          status,
        });
      }

      await onSubmitted?.();
      handleClose();
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save this record.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderField(field: (typeof fields)[number]) {
    const id = `cf-${field.key}`;
    const value = fieldValues[field.key] ?? "";
    const error = errors[field.key];

    const commonInputClass = [
      "w-full rounded-lg border px-3 py-2 text-sm text-gray-800",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white",
      "transition-all",
      error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50",
    ].join(" ");

    return (
      <div key={field.key} className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>

        {field.type === "image" && managedImageFieldKey === field.key ? (
          <div className="space-y-3">
            {imagePreviewUrl ? (
              <div className="space-y-3">
                <img
                  src={imagePreviewUrl}
                  alt={`${field.label} preview`}
                  className="h-40 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain p-3"
                />
                <div className="flex gap-2">
                  <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Replace Image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleManagedImageFileChange(file);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveManagedImage}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Remove Image
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center hover:border-blue-400 hover:bg-blue-50">
                <span className="text-sm font-medium text-gray-700">
                  Click to upload a logo
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, GIF, or WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleManagedImageFileChange(file);
                    }
                  }}
                />
              </label>
            )}
            {imageError && (
              <p role="alert" className="text-xs text-red-600">
                {imageError}
              </p>
            )}
          </div>
        ) : field.type === "image" ? (
          <ImageUploadPlaceholder />
        ) : field.type === "textarea" ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            rows={4}
            className={commonInputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        ) : field.type === "icon-picker" ? (
          <LucideIconPicker
            value={value}
            onChange={(name) => handleFieldChange(field.key, name)}
            hasError={!!error}
          />
        ) : field.type === "select" ? (
          <select
            id={id}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={commonInputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          >
            <option value="">— Select —</option>
            {(field.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={
              field.type === "url"
                ? "url"
                : field.type === "date"
                  ? "date"
                  : field.type === "number"
                    ? "number"
                    : "text"
            }
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={commonInputClass}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
          />
        )}

        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key="cf-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: SLIDE_EASE }}
        className="fixed inset-0 z-40 bg-black/40 !mt-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <motion.aside
        key="cf-panel"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "New Record" : "Edit Record"}
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.4, ease: SLIDE_EASE }}
        className={[
          "fixed right-0 top-0 z-50 flex h-full flex-col bg-white shadow-2xl !mt-0",
          showPreview ? "w-full max-w-5xl" : "w-full max-w-[480px]",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {mode === "create" ? "New Record" : "Edit Record"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {mode === "create"
                ? "Fill in the fields below to create a new record."
                : "Update the fields below."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            {supportsPreview && (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className={[
                  "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  showPreview
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700",
                ].join(" ")}
                aria-pressed={showPreview}
              >
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            )}

            {/* Close button */}
            <button
              ref={firstFocusableRef}
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors"
            >
              <LuX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex flex-1 overflow-hidden">
          {/* Form column */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <form
              id="content-form"
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-1 flex-col gap-4 px-6 py-5"
            >
              {/* Dynamic section fields */}
              {fields.map((field) => renderField(field))}

              {submitError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                >
                  {submitError}
                </p>
              )}

              {/* Status field — always present */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="cf-status"
                  className="text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="cf-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContentStatus)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </form>
          </div>

          {/* Preview column */}
          {showPreview && supportsPreview && (
            <div className="w-[480px] flex-shrink-0 overflow-y-auto border-l border-gray-100 bg-gray-50/60 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                Live Preview
              </p>
              <PreviewPanel sectionKey={sectionKey} formValues={fieldValues} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="content-form"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Record"
                : "Save Changes"}
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

export default ContentForm;
