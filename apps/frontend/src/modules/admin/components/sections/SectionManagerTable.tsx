import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ContentRecord } from '../../types/admin.types';
import { useContentFilter } from '../../hooks/useContentFilter';

interface SectionManagerTableProps {
  records: ContentRecord[];
  onEdit: (record: ContentRecord) => void;
  onDelete: (record: ContentRecord) => void;
}

type StatusFilter = 'all' | 'published' | 'draft';

const statusBadgeClasses: Record<'published' | 'draft', string> = {
  published: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  draft: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const tableContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const tableRowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: EASE } },
};

function StatusBadge({ status }: { status: ContentRecord['status'] }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusBadgeClasses[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} aria-hidden="true" />
      {status}
    </span>
  );
}

export function SectionManagerTable({ records, onEdit, onDelete }: SectionManagerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredRecords = useContentFilter(records, searchTerm, statusFilter);

  return (
    <div className="space-y-4">
      {/* Search + Filter controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search records…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search records"
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-gray-50 focus:bg-white transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-auto transition-all"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* Empty state */}
      {filteredRecords.length === 0 && (
        <motion.div
          className="py-12 text-center"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-gray-300 mx-auto mb-3" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="text-sm text-gray-400">No records match your search.</p>
        </motion.div>
      )}

      {/* Desktop table — hidden on mobile */}
      {filteredRecords.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Title / Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <motion.tbody
              className="bg-white divide-y divide-gray-50"
              variants={tableContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {filteredRecords.map((record) => (
                  <motion.tr
                    key={record.id}
                    className="hidden md:table-row hover:bg-blue-50/30 transition-colors group"
                    variants={tableRowVariants}
                    exit="exit"
                    layout
                  >
                    <td className="px-4 py-3.5 text-gray-800 font-medium">{record.title}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        aria-label="Edit record"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        aria-label="Delete record"
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
      )}

      {/* Mobile card view */}
      {filteredRecords.length > 0 && (
        <motion.ul
          className="md:hidden space-y-3"
          variants={tableContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredRecords.map((record) => (
              <motion.li
                key={record.id}
                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                variants={tableRowVariants}
                exit="exit"
                layout
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Title / Name</p>
                      <p className="text-sm font-medium text-gray-800 truncate">{record.title}</p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      aria-label="Edit record"
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(record)}
                      aria-label="Delete record"
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

export default SectionManagerTable;
