import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LuX } from "react-icons/lu";
import { mockSections } from "../../data/mockSections";
import { useAdminStore } from "../../store/adminStore";
import { ImageUploadPlaceholder } from "./ImageUploadPlaceholder";
import { PreviewPanel } from "../preview/PreviewPanel";
import {
  createBetterLugRequest,
  updateBetterLugRequest,
  uploadBetterLugImageRequest,
} from "../../services/better-lugs.api";
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
    values[field.key] = initialData?.fields[field.key] ?? "";
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

  const section = mockSections.find((s) => s.key === sectionKey);
  const fields = section?.fields ?? [];
  const supportsPreview = section?.supportsPreview ?? false;
  const isBetterLugsSection = sectionKey === "partner-logos";

  // Status field (always present)
  const [status, setStatus] = useState<ContentStatus>(
    initialData?.status ?? "draft",
  );

  // Field values (excludes image fields — handled by ImageUploadPlaceholder internally)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() =>
    buildInitialValues(fields, initialData),
  );

  // Validation errors keyed by field key; 'status' key reserved for the status field
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview toggle
  const [showPreview, setShowPreview] = useState(false);

  const initialLogoUrl = initialData?.fields.logo ?? "";
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    initialLogoUrl || null,
  );
  const [logoChangeState, setLogoChangeState] = useState<
    "unchanged" | "selected" | "removed"
  >(initialLogoUrl ? "unchanged" : "removed");
  const [logoError, setLogoError] = useState<string | null>(null);

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

  async function handleLogoFileChange(file: File) {
    if (!isValidImageFile(file)) {
      setSelectedLogoFile(null);
      setLogoError(
        "File must be PNG, JPG, GIF, or WEBP and no larger than 5MB",
      );
      return;
    }

    const previewUrl = await readFileAsDataUrl(file);
    setSelectedLogoFile(file);
    setLogoPreviewUrl(previewUrl);
    setLogoChangeState("selected");
    setLogoError(null);
    setSubmitError(null);
  }

  function handleRemoveLogo() {
    setSelectedLogoFile(null);
    setLogoPreviewUrl(null);
    setLogoChangeState("removed");
    setLogoError(null);
    setFieldValues((prev) => ({ ...prev, logo: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (logoError) return;

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

        if (logoChangeState === "selected" && selectedLogoFile) {
          const uploaded = await uploadBetterLugImageRequest(
            {
              filename: selectedLogoFile.name,
              mimeType: selectedLogoFile.type,
              data: await readFileAsDataUrl(selectedLogoFile),
            },
            accessToken,
          );
          payload.logoUrl = uploaded.url;
          payload.logoKey = uploaded.key;
        } else if (logoChangeState === "removed") {
          payload.logoUrl = "";
          payload.logoKey = "";
        }

        if (mode === "create") {
          await createBetterLugRequest(payload, accessToken);
        } else {
          await updateBetterLugRequest(initialData!.id, payload, accessToken);
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

        {field.type === "image" &&
        isBetterLugsSection &&
        field.key === "logo" ? (
          <div className="space-y-3">
            {logoPreviewUrl ? (
              <div className="space-y-3">
                <img
                  src={logoPreviewUrl}
                  alt="Better LUG logo preview"
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
                          void handleLogoFileChange(file);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
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
                      void handleLogoFileChange(file);
                    }
                  }}
                />
              </label>
            )}
            {logoError && (
              <p role="alert" className="text-xs text-red-600">
                {logoError}
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
