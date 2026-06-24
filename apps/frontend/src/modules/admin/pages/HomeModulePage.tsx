import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuPencil,
  LuTrash2,
  LuFileText,
  LuExternalLink,
  LuPlus,
  LuImage,
  LuPhone,
  LuMail,
  LuMapPin,
  LuWrench,
  LuEye,
  LuChevronRight,
  LuUser,
  LuUpload,
} from "react-icons/lu";
import { StatsCard } from "../components/overview/StatsCard";
import { useAdminStore } from "../store/adminStore";
import { useBetterLugsStore } from "../store/betterLugsStore";
import { useBarangayMapStore } from "../store/barangayMapStore";
import { usePopularServicesStore } from "../store/popular-services.store";
import { useAtAGlanceStore } from "../store/atAGlanceStore";
import { useHistoryStore } from "../store/historyStore";
import { useLatestUpdatesStore } from "../store/latestUpdatesStore";
import { mockSections } from "../data/mockSections";
import type { ContentRecord } from "../types/admin.types";
import { ContentForm } from "../components/records/ContentForm";
import { DeleteConfirmDialog } from "../components/records/DeleteConfirmDialog";
import { FreedomWallLayout } from "../components/records/FreedomWallLayout";
import { resolveIcon } from "../components/records/ReactIconPicker";
import { UploadJsonDialog } from "../components/records/UploadJsonDialog";
import type { JsonHistoryItem } from "../components/records/UploadJsonDialog";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatLastUpdated(isoString: string): string {
  const d = new Date(isoString);
  const month = MONTH_NAMES[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

function formatDate(isoString: string): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type FormMode = null | "create" | "edit";

// ─── Shared sub-components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ContentRecord["status"] }) {
  return status === "published" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      Draft
    </span>
  );
}

function CardActions({
  record,
  editRef,
  onEdit,
  onDelete,
}: {
  record: ContentRecord;
  editRef?: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        ref={editRef}
        type="button"
        onClick={() => onEdit(record)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition-colors"
      >
        <LuPencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(record)}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
      >
        <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
        Delete
      </button>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
      <LuFileText
        className="mx-auto h-9 w-9 text-gray-300 mb-2"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-400">No records in this section yet.</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline underline-offset-2"
      >
        Add the first record
      </button>
    </div>
  );
}

// ─── Section-specific layouts ─────────────────────────────────────────────────

/** Leadership — profile cards grid with avatar placeholder */
function LeadershipLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3"
        >
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center flex-shrink-0">
              <LuUser className="h-6 w-6 text-blue-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {record.fields.name ?? record.title}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {record.fields.position ?? "—"}
              </p>
            </div>
          </div>
          {/* Contact info */}
          <div className="flex flex-col gap-1">
            {record.fields.email && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                <LuMail
                  className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {record.fields.email}
              </p>
            )}
            {record.fields.phone && (
              <p className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                <LuPhone
                  className="h-3.5 w-3.5 text-gray-400 flex-shrink-0"
                  aria-hidden="true"
                />
                {record.fields.phone}
              </p>
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-50 mt-auto">
            <StatusBadge status={record.status} />
            <CardActions
              record={record}
              editRef={editRef}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Latest Updates — news feed cards with date badge */
function LatestUpdatesLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Date chip */}
          {record.fields.date ? (
            <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-blue-50 border border-blue-100 w-14 h-14 text-center">
              <span className="text-[10px] font-semibold uppercase text-blue-400 leading-tight">
                {MONTH_NAMES[new Date(record.fields.date).getMonth()]}
              </span>
              <span className="text-xl font-bold text-blue-700 leading-tight">
                {String(new Date(record.fields.date).getDate()).padStart(
                  2,
                  "0",
                )}
              </span>
              <span className="text-[10px] text-blue-400 leading-tight">
                {new Date(record.fields.date).getFullYear()}
              </span>
            </div>
          ) : (
            <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
              <LuFileText
                className="h-5 w-5 text-gray-300"
                aria-hidden="true"
              />
            </div>
          )}
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <StatusBadge status={record.status} />
              </div>
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {record.title}
              </h3>
              {record.fields.summary && (
                <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                  {record.fields.summary}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">
                Updated {formatLastUpdated(record.updatedAt)}
              </span>
              <CardActions
                record={record}
                editRef={editRef}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Popular Services — icon service cards in a grid */
function PopularServicesLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {records.map((record) => {
        const IconComponent = resolveIcon(record.fields.icon || "");
        return (
          <div
            key={record.id}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-violet-50 to-blue-100 border border-blue-100 flex items-center justify-center">
                <IconComponent
                  className="h-5 w-5 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {record.fields.name ?? record.title}
                </p>
                {record.fields.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                    {record.fields.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <StatusBadge status={record.status} />
              <CardActions
                record={record}
                editRef={editRef}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** History — vertical timeline with year markers */
function HistoryLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  const sorted = [...records].sort((a, b) => {
    const ya = parseInt(a.fields.year ?? "0", 10);
    const yb = parseInt(b.fields.year ?? "0", 10);
    return ya - yb;
  });
  return (
    <div className="relative flex flex-col gap-0 pl-8">
      {/* Vertical line */}
      <div
        className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200"
        aria-hidden="true"
      />
      {sorted.map((record, idx) => (
        <div
          key={record.id}
          className="relative flex flex-col gap-1 pb-6 last:pb-0"
        >
          {/* Timeline dot */}
          <div
            className={[
              "absolute -left-[25px] top-1 h-4 w-4 rounded-full border-2 border-white flex items-center justify-center",
              record.status === "published" ? "bg-blue-500" : "bg-amber-400",
            ].join(" ")}
            aria-hidden="true"
          />
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {record.fields.year && (
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                      {record.fields.year}
                    </span>
                  )}
                  <StatusBadge status={record.status} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {record.title}
                </h3>
                {record.fields.content && (
                  <p className="mt-1.5 text-xs text-gray-500 line-clamp-3">
                    {record.fields.content}
                  </p>
                )}
              </div>
              <CardActions
                record={record}
                editRef={idx === 0 ? editRef : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** At a Glance — stat metric tiles */
function AtAGlanceLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-2"
        >
          {/* Icon chip */}
          {record.fields.icon && (
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
              {(() => {
                const Icon = resolveIcon(record.fields.icon);
                return (
                  <Icon className="h-4 w-4 text-blue-500" aria-hidden="true" />
                );
              })()}
            </div>
          )}
          <p className="text-2xl font-black text-gray-900 leading-none">
            {record.fields.value ?? "—"}
          </p>
          <p className="text-xs font-medium text-gray-500 leading-snug">
            {record.fields.label ?? record.title}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
            <StatusBadge status={record.status} />
            <CardActions
              record={record}
              editRef={editRef}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const CONTACT_TYPE_META: Record<
  string,
  { icon: React.ReactNode; color: string }
> = {
  phone: {
    icon: <LuPhone className="h-4 w-4" aria-hidden="true" />,
    color: "bg-green-50 text-green-600",
  },
  email: {
    icon: <LuMail className="h-4 w-4" aria-hidden="true" />,
    color: "bg-blue-50 text-blue-600",
  },
  address: {
    icon: <LuMapPin className="h-4 w-4" aria-hidden="true" />,
    color: "bg-orange-50 text-orange-600",
  },
  fax: {
    icon: <LuPhone className="h-4 w-4" aria-hidden="true" />,
    color: "bg-purple-50 text-purple-600",
  },
};

/** Contact — grouped contact info list with type icons */
function ContactLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => {
        const type = record.fields.type ?? "phone";
        const meta = CONTACT_TYPE_META[type] ?? CONTACT_TYPE_META.phone;
        return (
          <div
            key={record.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm"
          >
            <div
              className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${meta.color}`}
            >
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {record.fields.label ?? record.title}
              </p>
              <p className="text-sm font-medium text-gray-800 truncate">
                {record.fields.value ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={record.status} />
              <CardActions
                record={record}
                editRef={editRef}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Quiz — Q&A accordion-style cards */
function QuizLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="flex flex-col gap-2">
      {records.map((record) => {
        const isOpen = openId === record.id;
        return (
          <div
            key={record.id}
            className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
              onClick={() => setOpenId(isOpen ? null : record.id)}
              aria-expanded={isOpen}
            >
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center">
                <LuEye
                  className="h-3.5 w-3.5 text-violet-500"
                  aria-hidden="true"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {record.fields.question ?? record.title}
                </p>
                {record.fields.category && (
                  <span className="text-[10px] font-medium text-violet-500">
                    {record.fields.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={record.status} />
                <LuChevronRight
                  className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/60">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {record.fields.answer ?? "—"}
                    </p>
                    <div className="flex items-center justify-end mt-3">
                      <CardActions
                        record={record}
                        editRef={editRef}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Better LUGs — logo tiles grid with name and URL */
function BetterLugsLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3"
        >
          {record.fields.logo ? (
            <img
              src={record.fields.logo}
              alt={record.fields.name ?? record.title}
              className="h-16 w-full rounded-lg border border-gray-100 bg-white object-contain p-2"
            />
          ) : (
            <div className="h-16 w-full rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <LuImage className="h-8 w-8 text-gray-300" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {record.fields.name ?? record.title}
            </p>
            {record.fields.websiteUrl && (
              <a
                href={record.fields.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 text-xs text-blue-500 hover:text-blue-700 truncate block"
              >
                {record.fields.websiteUrl}
              </a>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <StatusBadge status={record.status} />
            <CardActions
              record={record}
              editRef={editRef}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const EMERGENCY_ICON_META: Record<
  string,
  { label: string; color: string; svg: React.ReactNode }
> = {
  shield: {
    label: "Police",
    color: "bg-blue-50 text-blue-600",
    svg: <LuUser className="h-4 w-4" aria-hidden="true" />,
  },
  hospital: {
    label: "MSWDO",
    color: "bg-green-50 text-green-600",
    svg: <LuWrench className="h-4 w-4" aria-hidden="true" />,
  },
  fire: {
    label: "Fire",
    color: "bg-red-50 text-red-600",
    svg: <LuPhone className="h-4 w-4" aria-hidden="true" />,
  },
  building: {
    label: "DILG",
    color: "bg-gray-100 text-gray-600",
    svg: <LuFileText className="h-4 w-4" aria-hidden="true" />,
  },
  warning: {
    label: "MDRRMO",
    color: "bg-amber-50 text-amber-600",
    svg: <LuEye className="h-4 w-4" aria-hidden="true" />,
  },
  broadcast: {
    label: "R2TMC",
    color: "bg-purple-50 text-purple-600",
    svg: <LuPhone className="h-4 w-4" aria-hidden="true" />,
  },
};

/** Emergency Contacts — marquee-preview list matching the TopUtilityBar */
function EmergencyContactsLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="flex flex-col gap-2">
      {/* Marquee preview — mirrors the live TopUtilityBar */}
      {(() => {
        const published = records.filter((r) => r.status === "published");
        return published.length === 0 ? null : (
          <div className="mb-4 overflow-hidden rounded-lg bg-red-900 py-2 relative">
            {/* "Preview" label */}
            <span className="absolute left-2 top-1/2 -translate-y-1/2 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/50 pointer-events-none z-10">
              Preview
            </span>
            <style>{`
              @keyframes em-marquee {
                0%   { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
              }
              .em-marquee-track {
                display: inline-flex;
                animation: em-marquee 20s linear infinite;
              }
            `}</style>
            <div className="em-marquee-track whitespace-nowrap">
              {[...published, ...published].map((record, idx) => {
                const meta =
                  EMERGENCY_ICON_META[record.fields.icon ?? "shield"] ??
                  EMERGENCY_ICON_META.shield;
                return (
                  <span
                    key={`${record.id}-${idx}`}
                    className="inline-flex items-center gap-2 mx-6 sm:mx-12 text-[11px] sm:text-xs font-medium text-white"
                  >
                    <span className="opacity-70 shrink-0">{meta.svg}</span>
                    {record.fields.name}: {record.fields.number}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Editable rows */}
      {records.map((record) => {
        const icon = record.fields.icon ?? "shield";
        const meta = EMERGENCY_ICON_META[icon] ?? EMERGENCY_ICON_META.shield;
        return (
          <div
            key={record.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5 shadow-sm"
          >
            <div
              className={`flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center ${meta.color}`}
            >
              {meta.svg}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {record.fields.name ?? record.title}
              </p>
              <a
                href={`tel:${(record.fields.number ?? "").replace(/\s/g, "")}`}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
              >
                {record.fields.number ?? "—"}
              </a>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={record.status} />
              <CardActions
                record={record}
                editRef={editRef}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Barangay Map — barangay cards with details */
function BarangayMapLayout({
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
}: {
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
}) {
  if (records.length === 0) return <EmptyState onAdd={onAdd} />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-3"
        >
          {record.fields.image ? (
            <img
              src={record.fields.image}
              alt={record.fields.name ?? record.title}
              className="h-32 w-full rounded-lg border border-gray-100 bg-white object-cover"
            />
          ) : (
            <div className="h-32 w-full rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <LuImage className="h-8 w-8 text-gray-300" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {record.fields.name ?? record.title}
            </p>
            {record.fields.description && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {record.fields.description}
              </p>
            )}
            {record.fields.population && (
              <p className="mt-1 text-xs text-gray-500">
                Population: {record.fields.population}
              </p>
            )}
            {record.fields.area && (
              <p className="mt-1 text-xs text-gray-500">
                Area: {record.fields.area}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <StatusBadge status={record.status} />
            <CardActions
              record={record}
              editRef={editRef}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Layout router ─────────────────────────────────────────────────────────────

function SectionContent({
  sectionKey,
  records,
  editRef,
  onEdit,
  onDelete,
  onAdd,
  onFreedomWallCountChange,
}: {
  sectionKey: string;
  records: ContentRecord[];
  editRef: React.RefObject<HTMLButtonElement>;
  onEdit: (r: ContentRecord) => void;
  onDelete: (r: ContentRecord) => void;
  onAdd: () => void;
  onFreedomWallCountChange?: (count: number) => void;
}) {
  const props = { records, editRef, onEdit, onDelete, onAdd };
  switch (sectionKey) {
    case "leadership":
      return <LeadershipLayout {...props} />;
    case "latest-updates":
      return <LatestUpdatesLayout {...props} />;
    case "popular-services":
      return <PopularServicesLayout {...props} />;
    case "history":
      return <HistoryLayout {...props} />;
    case "at-a-glance":
      return <AtAGlanceLayout {...props} />;
    case "contact":
      return <ContactLayout {...props} />;
    case "quiz":
      return <QuizLayout {...props} />;
    case "partner-logos":
      return <BetterLugsLayout {...props} />;
    case "emergency-contacts":
      return <EmergencyContactsLayout {...props} />;
    case "barangay-map":
      return <BarangayMapLayout {...props} />;
    case "freedom-wall":
      return <FreedomWallLayout onCountChange={onFreedomWallCountChange} />;
    default:
      return <EmptyState onAdd={onAdd} />;
  }
}

// ─── Main component ────────────────────────────────────────────────────────────

export function HomeModulePage() {
  const records = useAdminStore((s) => s.records);
  const accessToken = useAdminStore((s) => s.accessToken);
  const betterLugsRecords = useBetterLugsStore((s) => s.adminRecords);
  const fetchAdminBetterLugs = useBetterLugsStore((s) => s.fetchAdminRecords);
  const barangayMapRecords = useBarangayMapStore((s) => s.adminRecords);
  const fetchAdminBarangayMap = useBarangayMapStore((s) => s.fetchAdminRecords);
  const popularServicesRecords = usePopularServicesStore((s) => s.adminRecords);
  const fetchAdminPopularServices = usePopularServicesStore(
    (s) => s.fetchAdminRecords,
  );
  const atAGlanceRecords = useAtAGlanceStore((s) => s.adminRecords);
  const fetchAdminAtAGlance = useAtAGlanceStore((s) => s.fetchAdminRecords);
  const historyRecords = useHistoryStore((s) => s.adminRecords);
  const fetchAdminHistory = useHistoryStore((s) => s.fetchAdminRecords);
  const bulkImportHistory = useHistoryStore((s) => s.bulkImportHistory);
  const latestUpdatesRecords = useLatestUpdatesStore((s) => s.adminRecords);
  const fetchAdminLatestUpdates = useLatestUpdatesStore(
    (s) => s.fetchAdminRecords,
  );
  const [activeTab, setActiveTab] = useState<string>(
    mockSections[0]?.key ?? "",
  );

  // Form / delete dialog state
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(
    null,
  );
  const [deletingRecord, setDeletingRecord] = useState<ContentRecord | null>(
    null,
  );
  const [freedomWallCount, setFreedomWallCount] = useState<number | null>(null);
  const [uploadJsonOpen, setUploadJsonOpen] = useState(false);
  const newRecordButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const uploadJsonButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!accessToken) return;

    fetchAdminBetterLugs(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
    fetchAdminBarangayMap(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
    fetchAdminPopularServices(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
    fetchAdminAtAGlance(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
    fetchAdminHistory(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
    fetchAdminLatestUpdates(accessToken).catch(() => {
      // Preserve the last known records so the page remains usable offline.
    });
  }, [
    accessToken,
    fetchAdminBarangayMap,
    fetchAdminBetterLugs,
    fetchAdminPopularServices,
    fetchAdminAtAGlance,
    fetchAdminHistory,
    fetchAdminLatestUpdates,
  ]);

  const mergedRecords: Record<string, ContentRecord[]> = {
    ...records,
    "partner-logos": betterLugsRecords,
    "barangay-map": barangayMapRecords,
    "popular-services": popularServicesRecords,
    "at-a-glance": atAGlanceRecords,
    history: historyRecords,
    "latest-updates": latestUpdatesRecords,
  };

  const allRecords = Object.values(mergedRecords).flat();
  const publishedCount = allRecords.filter(
    (r) => r.status === "published",
  ).length;
  const draftCount = allRecords.filter((r) => r.status === "draft").length;

  const lastUpdatedIso = allRecords.reduce<string>((max, r) => {
    return r.updatedAt > max ? r.updatedAt : max;
  }, "");
  const lastUpdatedDisplay = lastUpdatedIso
    ? formatLastUpdated(lastUpdatedIso)
    : "—";

  const activeSection = mockSections.find((s) => s.key === activeTab);
  const activeRecords =
    activeTab === "partner-logos"
      ? betterLugsRecords
      : activeTab === "popular-services"
        ? popularServicesRecords
        : activeTab === "at-a-glance"
          ? atAGlanceRecords
          : activeTab === "history"
            ? historyRecords
            : (mergedRecords[activeTab] ?? []);
  const activePublished = activeRecords.filter(
    (r) => r.status === "published",
  ).length;
  const activeDraft = activeRecords.filter((r) => r.status === "draft").length;

  function handleNewRecord() {
    setEditingRecord(null);
    setFormMode("create");
  }

  function handleEdit(record: ContentRecord) {
    setEditingRecord(record);
    setFormMode("edit");
  }

  function handleDelete(record: ContentRecord) {
    setDeletingRecord(record);
  }

  function handleFormClose() {
    setFormMode(null);
    setEditingRecord(null);
  }

  function handleDeleteClose() {
    setDeletingRecord(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all content sections displayed on the public Home page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          label="Total Sections"
          value={mockSections.length}
          trend="neutral"
          accentColor="blue"
        />
        <StatsCard
          label="Published Items"
          value={publishedCount}
          trend="up"
          accentColor="green"
        />
        <StatsCard
          label="Draft Items"
          value={draftCount}
          trend="neutral"
          accentColor="yellow"
        />
        <StatsCard
          label="Last Updated"
          value={lastUpdatedDisplay}
          trend="neutral"
          accentColor="blue"
        />
      </div>

      {/* Tab panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Content sections"
          >
            {mockSections.map((section) => {
              const sectionRecords = mergedRecords[section.key] ?? [];
              const isActive = section.key === activeTab;
              return (
                <button
                  key={section.key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${section.key}`}
                  id={`tab-${section.key}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(section.key);
                    setFormMode(null);
                    setEditingRecord(null);
                    setDeletingRecord(null);
                  }}
                  className={[
                    "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                    isActive
                      ? "text-blue-600 bg-blue-50/60"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {section.displayName}

                  {/* Record count badge */}
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px]",
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    {section.key === "freedom-wall"
                      ? (freedomWallCount ?? "—")
                      : sectionRecords.length}
                  </span>

                  {/* Active indicator */}
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
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="p-5"
        >
          {/* Section sub-header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {activeSection?.displayName}
              </h2>
              {activeTab === "freedom-wall" ? (
                <p className="mt-1 text-xs text-gray-400">
                  Anonymous community notes. Admins can remove notes here; only
                  this panel allows deletion.
                </p>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  {activeRecords.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">
                      No records yet
                    </span>
                  ) : (
                    <>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {activePublished} published
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        {activeDraft} draft
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {activeTab !== "freedom-wall" && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {activeTab === "history" && (
                  <button
                    ref={uploadJsonButtonRef}
                    type="button"
                    onClick={() => setUploadJsonOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all"
                  >
                    <LuUpload className="h-4 w-4" aria-hidden="true" />
                    Upload JSON
                  </button>
                )}
                <button
                  ref={newRecordButtonRef}
                  type="button"
                  onClick={handleNewRecord}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
                  <LuPlus className="h-4 w-4" aria-hidden="true" />
                  New Record
                </button>
              </div>
            )}
          </div>

          {/* Section-specific layout */}
          <SectionContent
            sectionKey={activeTab}
            records={activeRecords}
            editRef={editButtonRef}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleNewRecord}
            onFreedomWallCountChange={setFreedomWallCount}
          />
        </div>
      </div>

      {/* ContentForm — create mode */}
      {formMode === "create" && (
        <ContentForm
          mode="create"
          sectionKey={activeTab}
          onClose={handleFormClose}
          returnFocusRef={newRecordButtonRef}
        />
      )}

      {/* ContentForm — edit mode */}
      {formMode === "edit" && editingRecord !== null && (
        <ContentForm
          mode="edit"
          sectionKey={activeTab}
          initialData={editingRecord}
          onClose={handleFormClose}
          returnFocusRef={editButtonRef}
        />
      )}

      {/* DeleteConfirmDialog */}
      {deletingRecord !== null && (
        <DeleteConfirmDialog
          record={deletingRecord}
          sectionKey={activeTab}
          onClose={handleDeleteClose}
        />
      )}

      {/* UploadJsonDialog — history section only */}
      {uploadJsonOpen && (
        <UploadJsonDialog
          onClose={() => setUploadJsonOpen(false)}
          returnFocusRef={uploadJsonButtonRef}
          onImport={async (items: JsonHistoryItem[]) => {
            if (!accessToken) throw new Error("Not authenticated.");
            return bulkImportHistory(items, accessToken);
          }}
        />
      )}
    </motion.div>
  );
}

HomeModulePage.displayName = "HomeModulePage";
export default HomeModulePage;
