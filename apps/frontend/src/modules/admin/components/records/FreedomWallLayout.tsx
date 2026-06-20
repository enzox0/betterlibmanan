import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuFileText,
  LuSearch,
  LuX,
  LuTrash2,
  LuTriangleAlert,
} from "react-icons/lu";
import { useAdminStore } from "../../store/adminStore";
import {
  listNotes,
  deleteNoteRequest,
  type AdminNote,
} from "../../services/freedom-wall.api";

// Admin-only Freedom Wall management panel

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Map the stored class-string to a small color swatch shown on the row */
function colorSwatchClass(noteColor: string): string {
  if (noteColor.includes("yellow")) return "bg-yellow-300";
  if (noteColor.includes("blue")) return "bg-blue-300";
  if (noteColor.includes("green")) return "bg-green-300";
  if (noteColor.includes("pink")) return "bg-pink-300";
  if (noteColor.includes("purple")) return "bg-purple-300";
  if (noteColor.includes("orange")) return "bg-orange-300";
  return "bg-gray-300";
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 py-14 text-center">
      <LuFileText
        className="mx-auto h-9 w-9 text-gray-300 mb-2"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-400">
        No notes posted yet on the Freedom Wall.
      </p>
    </div>
  );
}

interface ConfirmState {
  open: boolean;
  note: AdminNote | null;
}

export function FreedomWallLayout({
  onCountChange,
}: {
  onCountChange?: (count: number) => void;
}) {
  const accessToken = useAdminStore((s) => s.accessToken);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    note: null,
  });
  const [deleting, setDeleting] = useState(false);

  // Derived: notes that match the search query
  const filtered = query.trim()
    ? notes.filter((n) => n.content.toLowerCase().includes(query.toLowerCase()))
    : notes;

  // ── Load notes ──────────────────────────────────────────────────────────────
  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listNotes();
      setNotes(data);
      onCountChange?.(data.length);
    } catch {
      setError("Failed to load Freedom Wall notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!confirm.note || !accessToken) return;
    setDeleting(true);
    try {
      await deleteNoteRequest(confirm.note._id, accessToken);
      setNotes((prev) => {
        const next = prev.filter((n) => n._id !== confirm.note!._id);
        onCountChange?.(next.length);
        return next;
      });
      setConfirm({ open: false, note: null });
    } catch {
      setError("Failed to delete note. Your session may have expired.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white py-14 text-center">
        <div className="mx-auto h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin mb-2" />
        <p className="text-xs text-gray-400 uppercase tracking-widest">
          Loading notes…
        </p>
      </div>
    );
  }

  if (error && notes.length === 0) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={reload}
          className="rounded-md bg-white border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (notes.length === 0) return <EmptyState />;

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Summary stat + search bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {notes.length} {notes.length === 1 ? "note" : "notes"} total
          {query.trim() && (
            <span className="text-blue-400 font-normal">
              &nbsp;· {filtered.length} match{filtered.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <LuSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <LuX className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Notes table */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-4 py-2.5 font-semibold w-10"></th>
              <th className="px-4 py-2.5 font-semibold">Content</th>
              <th className="px-4 py-2.5 font-semibold w-44 hidden md:table-cell">
                Posted
              </th>
              <th className="px-4 py-2.5 font-semibold text-right w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-sm text-gray-400"
                >
                  {query.trim() ? `No notes match "${query}"` : "No notes yet."}
                </td>
              </tr>
            ) : (
              filtered.map((note) => (
                <tr
                  key={note._id}
                  className="hover:bg-gray-50/40 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block h-3 w-3 rounded-full ${colorSwatchClass(note.color)}`}
                      aria-hidden="true"
                    />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words line-clamp-3">
                      {note.content}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-500 hidden md:table-cell">
                    {fmtDateTime(note.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <button
                      type="button"
                      onClick={() => setConfirm({ open: true, note })}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors"
                    >
                      <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirm.open && confirm.note && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !deleting)
                setConfirm({ open: false, note: null });
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                  <LuTriangleAlert
                    className="h-5 w-5 text-red-500"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Remove this note?
                  </h3>
                  <p className="text-xs text-gray-500">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 mb-5">
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-4">
                  {confirm.note.content}
                </p>
                <p className="mt-2 text-[11px] text-gray-400">
                  Posted {fmtDateTime(confirm.note.createdAt)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirm({ open: false, note: null })}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting && (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  )}
                  {deleting ? "Removing…" : "Remove note"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

FreedomWallLayout.displayName = "FreedomWallLayout";
export default FreedomWallLayout;
