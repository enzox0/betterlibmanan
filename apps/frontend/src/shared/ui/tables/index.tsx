import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── TableSkeleton ─────────────────────────────────────────────────────────────

/**
 * Renders `rows` animated placeholder rows inside a `<tbody>`.
 * Wrap it in the same `<table>` structure you use for real data so
 * the column widths stay consistent during loading.
 */
export function TableSkeletonRows({
  rows = 8,
  cols = 5,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className={cn("border-b border-gray-50", className)}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="px-5 py-3.5">
              <div
                className="animate-pulse rounded-md bg-neutral-200 h-4"
                style={{ width: `${55 + ((ri * 3 + ci * 7) % 35)}%` }}
                aria-hidden="true"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/**
 * A self-contained skeleton card that mimics a list-row layout
 * (used for card/list views outside of `<table>`).
 */
export function ListRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-4",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-10 w-10 shrink-0 rounded-lg animate-pulse bg-neutral-200" />
      <div className="flex-1 space-y-2 py-0.5">
        <div className="h-3.5 w-2/3 rounded-md animate-pulse bg-neutral-200" />
        <div className="h-3 w-1/2 rounded-md animate-pulse bg-neutral-200" />
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Reusable pagination bar.
 * Always visible so the layout doesn't shift; hides Prev/Next when irrelevant.
 */
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  if (totalPages <= 1 && total === 0) return null;

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">
        {total === 0 ? "No entries" : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        >
          Previous
        </button>
        <span className="text-xs text-gray-500 tabular-nums">
          Page {page} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
}
