/**
 * SectionSourcesPanel
 *
 * Reusable admin panel that lets admins manage the "Source:" attributions
 * shown at the bottom of each public Statistics / Transparency page section.
 *
 * Usage:
 *   <SectionSourcesPanel
 *     sections={STATS_SECTIONS}   // which section keys to show
 *     accessToken={token}
 *   />
 */

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuExternalLink,
  LuPencil,
  LuCheck,
  LuX,
  LuLoader,
  LuLink,
  LuTriangleAlert,
} from "react-icons/lu";
import { useSectionSourcesStore } from "../store/sectionSourcesStore";
import type { SectionKey } from "../services/section-sources.api";
import { useToast } from "@/context/ToastContext";

// ─── Section metadata ─────────────────────────────────────────────────────────

export interface SectionMeta {
  key: SectionKey;
  label: string;
  description: string;
}

export const STATS_SECTIONS: SectionMeta[] = [
  {
    key: "stats-finance",
    label: "Finance",
    description: "Municipal Income section",
  },
  {
    key: "stats-population",
    label: "Population Trends",
    description: "Population growth chart section",
  },
  {
    key: "stats-barangays",
    label: "Barangay Distribution",
    description: "Population by Barangay section",
  },
  {
    key: "stats-economy",
    label: "Economy",
    description: "Economic Indicators section",
  },
  {
    key: "stats-poverty",
    label: "Poverty",
    description: "Poverty Statistics section",
  },
  {
    key: "stats-competitiveness",
    label: "Competitiveness",
    description: "Libmanan Competitive Index section",
  },
];

export const TRANSPARENCY_SECTIONS: SectionMeta[] = [
  {
    key: "transparency-financial-reports",
    label: "Financial Reports",
    description: "Statement of Receipts & Expenditures section",
  },
  {
    key: "transparency-dpwh-projects",
    label: "DPWH Projects",
    description: "Infrastructure Projects table and cards",
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
const inputError = `${inputBase} border-red-300 bg-red-50`;

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditState {
  label: string;
  url: string;
}

function SourceRow({
  meta,
  accessToken,
}: {
  meta: SectionMeta;
  accessToken: string;
}) {
  const store = useSectionSourcesStore();
  const { toast } = useToast();

  const existing = store.sources.find((s) => s.section === meta.key);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditState>({ label: "", url: "" });
  const [errors, setErrors] = useState<Partial<EditState>>({});

  const openEdit = useCallback(() => {
    setForm({
      label: existing?.label ?? "",
      url: existing?.url ?? "",
    });
    setErrors({});
    setEditing(true);
  }, [existing]);

  const cancel = () => {
    setEditing(false);
    setErrors({});
  };

  function validate(f: EditState): Partial<EditState> {
    const e: Partial<EditState> = {};
    if (!f.label.trim()) e.label = "Label is required.";
    if (!f.url.trim()) {
      e.url = "URL is required.";
    } else {
      try {
        new URL(f.url.trim());
      } catch {
        e.url = "Must be a valid URL (include https://).";
      }
    }
    return e;
  }

  const save = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      await store.upsert(
        { section: meta.key, label: form.label.trim(), url: form.url.trim() },
        accessToken,
      );
      toast(`Source for "${meta.label}" saved.`, "success");
      setEditing(false);
    } catch {
      toast("Failed to save source.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") cancel();
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900">{meta.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={openEdit}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LuPencil className="h-3 w-3" />
            {existing ? "Edit" : "Set"}
          </button>
        )}
      </div>

      {/* Current value */}
      {!editing && (
        <div className="px-4 py-3">
          {existing ? (
            <div className="flex items-center gap-2 min-w-0">
              <LuLink className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {existing.label}
                </p>
                <a
                  href={existing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                >
                  {existing.url}
                  <LuExternalLink className="h-2.5 w-2.5 shrink-0" />
                </a>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No source set — section will show no attribution on the public
              page.
            </p>
          )}
        </div>
      )}

      {/* Edit form */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3" onKeyDown={handleKey}>
              {/* Label */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Display Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Philippine Statistics Authority (PSA)"
                  value={form.label}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, label: e.target.value }));
                    setErrors((err) => ({ ...err, label: undefined }));
                  }}
                  className={errors.label ? inputError : inputNormal}
                  autoFocus
                />
                {errors.label && (
                  <p className="mt-1 text-xs text-red-600">{errors.label}</p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://psa.gov.ph/"
                  value={form.url}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, url: e.target.value }));
                    setErrors((err) => ({ ...err, url: undefined }));
                  }}
                  className={errors.url ? inputError : inputNormal}
                />
                {errors.url && (
                  <p className="mt-1 text-xs text-red-600">{errors.url}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancel}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <LuX className="h-3 w-3" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <LuLoader className="h-3 w-3 animate-spin" />
                  ) : (
                    <LuCheck className="h-3 w-3" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface Props {
  sections: SectionMeta[];
  accessToken: string;
}

export function SectionSourcesPanel({ sections, accessToken }: Props) {
  const store = useSectionSourcesStore();

  useEffect(() => {
    store.fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
        <LuLink className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-800">
            Source Attributions
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            Set the label and URL that appear in the{" "}
            <span className="font-semibold">Source:</span> citation at the
            bottom of each public page section. If a section has no source set,
            no attribution will be displayed.
          </p>
        </div>
      </div>

      {/* Error banner */}
      {store.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <LuTriangleAlert className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">{store.error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {store.isLoading && (
        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.key}
              className="rounded-xl border border-gray-100 bg-white shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-gray-200" />
                  <div className="h-2.5 w-40 rounded bg-gray-100" />
                </div>
                <div className="h-7 w-16 rounded-lg bg-gray-200 shrink-0" />
              </div>
              <div className="px-4 py-3">
                <div className="h-3 w-64 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Source rows */}
      {!store.isLoading && (
        <div className="space-y-3">
          {sections.map((meta) => (
            <SourceRow key={meta.key} meta={meta} accessToken={accessToken} />
          ))}
        </div>
      )}
    </div>
  );
}
