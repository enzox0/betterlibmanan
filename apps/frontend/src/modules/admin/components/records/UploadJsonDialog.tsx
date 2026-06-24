import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuUpload,
  LuX,
  LuFileJson,
  LuCheck,
  LuTriangleAlert,
} from "react-icons/lu";

export interface JsonHistoryItem {
  title: string;
  content?: string;
  year?: string;
  status?: "published" | "draft";
}

export interface JsonQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
  status?: "published" | "draft";
}

interface UploadJsonDialogProps {
  onClose: () => void;
  /** Label shown in the dialog header description */
  sectionLabel?: string;
  /** Example JSON shown in the "Expected format" hint */
  exampleJson?: string;
  /** Custom validation function — defaults to history item validation */
  validateItems?: (raw: unknown) => JsonHistoryItem[] | JsonQuizItem[];
  onImport: (
    items: JsonHistoryItem[] | JsonQuizItem[],
  ) => Promise<{ imported: number }>;
  returnFocusRef?: React.RefObject<HTMLElement>;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const transition = { ease: EASE, duration: 0.3 };

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 8 },
};

/**
 * Validates that the parsed value is an array of objects with at minimum a
 * non-empty `title` string field. Returns a typed array or throws with a
 * human-readable message.
 */
function parseAndValidate(raw: unknown): JsonHistoryItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("JSON must be an array of objects.");
  }
  if (raw.length === 0) {
    throw new Error("The array is empty — nothing to import.");
  }
  if (raw.length > 500) {
    throw new Error(
      `Too many items (${raw.length}). Maximum is 500 per import.`,
    );
  }

  const items: JsonHistoryItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (typeof item !== "object" || item === null) {
      throw new Error(`Item at index ${i} is not an object.`);
    }
    const obj = item as Record<string, unknown>;
    if (typeof obj.title !== "string" || obj.title.trim() === "") {
      throw new Error(`Item at index ${i} is missing a "title" string field.`);
    }
    if (
      obj.status !== undefined &&
      obj.status !== "published" &&
      obj.status !== "draft"
    ) {
      throw new Error(
        `Item at index ${i} has an invalid "status" value. Use "published" or "draft".`,
      );
    }
    items.push({
      title: (obj.title as string).trim(),
      content: typeof obj.content === "string" ? obj.content.trim() : undefined,
      year: typeof obj.year === "string" ? obj.year.trim() : undefined,
      status: (obj.status as "published" | "draft") ?? undefined,
    });
  }
  return items;
}

function parseAndValidateQuiz(raw: unknown): JsonQuizItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("JSON must be an array of objects.");
  }
  if (raw.length === 0) {
    throw new Error("The array is empty — nothing to import.");
  }
  if (raw.length > 500) {
    throw new Error(
      `Too many items (${raw.length}). Maximum is 500 per import.`,
    );
  }

  const items: JsonQuizItem[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (typeof item !== "object" || item === null) {
      throw new Error(`Item at index ${i} is not an object.`);
    }
    const obj = item as Record<string, unknown>;

    if (typeof obj.question !== "string" || obj.question.trim() === "") {
      throw new Error(
        `Item at index ${i} is missing a "question" string field.`,
      );
    }
    if (
      !Array.isArray(obj.options) ||
      (obj.options as unknown[]).length < 2 ||
      !(obj.options as unknown[]).every((o) => typeof o === "string")
    ) {
      throw new Error(
        `Item at index ${i} must have an "options" array of at least 2 strings.`,
      );
    }
    if (
      typeof obj.correctIndex !== "number" ||
      !Number.isInteger(obj.correctIndex) ||
      obj.correctIndex < 0 ||
      obj.correctIndex >= (obj.options as unknown[]).length
    ) {
      throw new Error(
        `Item at index ${i} has an invalid "correctIndex" — must be an integer within the options range.`,
      );
    }
    if (
      obj.status !== undefined &&
      obj.status !== "published" &&
      obj.status !== "draft"
    ) {
      throw new Error(
        `Item at index ${i} has an invalid "status" value. Use "published" or "draft".`,
      );
    }

    items.push({
      question: (obj.question as string).trim(),
      options: (obj.options as string[]).map((o) => o.trim()),
      correctIndex: obj.correctIndex as number,
      explanation:
        typeof obj.explanation === "string"
          ? obj.explanation.trim()
          : undefined,
      category:
        typeof obj.category === "string" ? obj.category.trim() : undefined,
      status: (obj.status as "published" | "draft") ?? undefined,
    });
  }
  return items;
}

function DialogContent({
  onClose,
  onImport,
  returnFocusRef,
  sectionLabel = "history timeline entries",
  exampleJson,
  validateItems,
}: UploadJsonDialogProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<
    JsonHistoryItem[] | JsonQuizItem[] | null
  >(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => returnFocusRef?.current?.focus(), 0);
  }, [onClose, returnFocusRef]);

  function reset() {
    setFileName(null);
    setParsedItems(null);
    setParseError(null);
    setImportError(null);
    setImportedCount(null);
  }

  function readFile(file: File) {
    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setParseError("Only .json files are supported.");
      setFileName(null);
      setParsedItems(null);
      return;
    }

    setFileName(file.name);
    setParseError(null);
    setParsedItems(null);
    setImportError(null);
    setImportedCount(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(String(e.target?.result ?? ""));
        const items = validateItems
          ? validateItems(raw)
          : parseAndValidate(raw);
        setParsedItems(items);
      } catch (err: any) {
        setParseError(err.message ?? "Invalid JSON file.");
        setParsedItems(null);
      }
    };
    reader.onerror = () => setParseError("Failed to read the file.");
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    // Reset so the same file can be re-selected after a reset
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  async function handleImport() {
    if (!parsedItems) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const result = await onImport(parsedItems);
      setImportedCount(result.imported);
      setParsedItems(null);
      setFileName(null);
    } catch (err: any) {
      setImportError(
        err?.response?.data?.message || err?.message || "Import failed.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  const DEFAULT_EXAMPLE_JSON = JSON.stringify(
    [
      {
        title: "Founding of Libmanan",
        year: "1572",
        content: "Brief description here.",
        status: "published",
      },
      {
        title: "Construction of First Church",
        year: "1574",
        content: "Another event.",
      },
    ],
    null,
    2,
  );

  const EXAMPLE_JSON = exampleJson ?? DEFAULT_EXAMPLE_JSON;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="upload-json-title"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <motion.div
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        variants={dialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      >
        {/* Top accent */}
        <div
          className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <LuFileJson
                className="h-4 w-4 text-blue-600"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2
                id="upload-json-title"
                className="text-sm font-bold text-gray-900"
              >
                Upload JSON Records
              </h2>
              <p className="text-xs text-gray-400">
                Import {sectionLabel} from a JSON file
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
          >
            <LuX className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Success state */}
          {importedCount !== null ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center">
                <LuCheck
                  className="h-7 w-7 text-green-500"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">
                  Import successful!
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {importedCount} record{importedCount !== 1 ? "s" : ""} added
                  to the {sectionLabel} section.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Import Another
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Click or drag and drop a JSON file here"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                className={[
                  "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors select-none",
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40",
                ].join(" ")}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <LuUpload
                  className={`h-7 w-7 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400"}`}
                  aria-hidden="true"
                />
                {fileName ? (
                  <p className="text-sm font-medium text-blue-700">
                    {fileName}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700">
                      Drop your <span className="text-blue-600">.json</span>{" "}
                      file here
                    </p>
                    <p className="text-xs text-gray-400">
                      or click to browse — max 500 items
                    </p>
                  </>
                )}
              </div>

              {/* Parse error */}
              {parseError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <LuTriangleAlert
                    className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-red-700">{parseError}</p>
                </div>
              )}

              {/* Import error */}
              {importError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <LuTriangleAlert
                    className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-red-700">{importError}</p>
                </div>
              )}

              {/* Parsed preview */}
              {parsedItems && (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <LuCheck
                      className="h-4 w-4 text-green-600 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold text-green-800">
                      {parsedItems.length} valid record
                      {parsedItems.length !== 1 ? "s" : ""} ready to import
                    </p>
                  </div>
                  <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                    {parsedItems.slice(0, 8).map((item, i) => {
                      const histItem = item as JsonHistoryItem;
                      const quizItem = item as JsonQuizItem;
                      const label = quizItem.question
                        ? quizItem.question
                        : histItem.title;
                      const badge = quizItem.question
                        ? quizItem.category
                          ? `[${quizItem.category}]`
                          : null
                        : histItem.year
                          ? `[${histItem.year}]`
                          : "[—]";
                      return (
                        <li key={i} className="text-xs text-green-700 truncate">
                          {badge && (
                            <span className="font-medium">{badge} </span>
                          )}
                          {label}
                        </li>
                      );
                    })}
                    {parsedItems.length > 8 && (
                      <li className="text-xs text-green-600 italic">
                        …and {parsedItems.length - 8} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Expected format hint */}
              <details className="group">
                <summary className="cursor-pointer text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors select-none">
                  Expected JSON format
                </summary>
                <pre className="mt-2 rounded-lg bg-gray-950 px-4 py-3 text-[11px] text-gray-300 overflow-x-auto leading-relaxed">
                  {EXAMPLE_JSON}
                </pre>
              </details>
            </>
          )}
        </div>

        {/* Footer — only shown when not in success state */}
        {importedCount === null && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isImporting}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!parsedItems || isImporting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              <LuUpload className="h-4 w-4" aria-hidden="true" />
              {isImporting ? "Importing…" : "Import Records"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export { parseAndValidateQuiz };

export function UploadJsonDialog(props: UploadJsonDialogProps) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <DialogContent key="upload-json-dialog" {...props} />
    </AnimatePresence>,
    document.body,
  );
}

export default UploadJsonDialog;
