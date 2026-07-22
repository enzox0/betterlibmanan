import React from "react";
import { LatestUpdatesSection } from "@/modules/landing/components/sections/LatestUpdatesSection";
import { PopularServicesSection } from "@/modules/landing/components/sections/PopularServicesSection";

interface PreviewPanelProps {
  sectionKey: string;
  formValues: Record<string, string>;
}

export function PreviewPanel({ sectionKey, formValues }: PreviewPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SectionPreview sectionKey={sectionKey} />

      <FormValuesBox sectionKey={sectionKey} formValues={formValues} />
    </div>
  );
}

function SectionPreview({ sectionKey }: { sectionKey: string }) {
  switch (sectionKey) {
    case "latest-updates":
      return (
        <div className="rounded-xl overflow-hidden border border-neutral-200 pointer-events-none scale-[0.85] origin-top">
          <LatestUpdatesSection />
        </div>
      );
    case "popular-services":
      return (
        <div className="rounded-xl overflow-hidden border border-neutral-200 pointer-events-none scale-[0.85] origin-top">
          <PopularServicesSection />
        </div>
      );
    default:
      // partner-logos and any other section: no dedicated component yet
      return null;
  }
}

interface FormValuesBoxProps {
  sectionKey: string;
  formValues: Record<string, string>;
}

function FormValuesBox({ sectionKey, formValues }: FormValuesBoxProps) {
  const entries = Object.entries(formValues);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-200">
        <span
          className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-500"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-neutral-700 capitalize">
          {sectionKey.replace(/-/g, " ")} — current values
        </h3>
      </div>

      {/* Values */}
      {entries.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-400 italic text-center">
          No values entered yet.
        </p>
      ) : (
        <dl className="divide-y divide-neutral-100">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-3 px-4 py-3">
              <dt className="min-w-[8rem] text-xs font-medium text-neutral-500 uppercase tracking-wide pt-0.5">
                {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
              </dt>
              <dd className="flex-1 text-sm text-neutral-800 break-words">
                {value || <span className="italic text-neutral-400">—</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

PreviewPanel.displayName = "PreviewPanel";

export default PreviewPanel;
