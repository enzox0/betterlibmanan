import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { ContentRecord } from '../../types/admin.types';
import { useAdminStore } from '../../store/adminStore';
import { mockSections } from '../../data/mockSections';
import { SectionManagerTable } from './SectionManagerTable';
// These components may not exist yet — they will be implemented in later tasks
import { ContentForm } from '../records/ContentForm';
import { DeleteConfirmDialog } from '../records/DeleteConfirmDialog';

interface SectionManagerProps {
  sectionKey: string;
  onBack: () => void;
}

type FormMode = null | 'create' | 'edit';

export function SectionManager({ sectionKey, onBack }: SectionManagerProps) {
  const getRecords = useAdminStore((s) => s.getRecords);
  const records = getRecords(sectionKey);

  const section = mockSections.find((s) => s.key === sectionKey);
  const displayName = section?.displayName ?? sectionKey;

  // Local open-state for form / dialog
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingRecord, setEditingRecord] = useState<ContentRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<ContentRecord | null>(null);

  // Ref to the "New Record" button — used as returnFocusRef for create mode
  const newRecordButtonRef = useRef<HTMLButtonElement>(null);

  // Ref to track the edit button of the row being edited — used as returnFocusRef for edit mode
  const editButtonRef = useRef<HTMLButtonElement>(null);

  function handleNewRecord() {
    setEditingRecord(null);
    setFormMode('create');
  }

  function handleEdit(record: ContentRecord) {
    setEditingRecord(record);
    setFormMode('edit');
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
      className="space-y-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home Manager"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
              <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-gray-200" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{displayName}</h2>
            <p className="text-xs text-gray-400">Manage section records</p>
          </div>
        </div>

        <button
          ref={newRecordButtonRef}
          type="button"
          onClick={handleNewRecord}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          New Record
        </button>
      </div>

      {/* Records table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <SectionManagerTable
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ContentForm — create mode */}
      {formMode === 'create' && (
        <ContentForm
          mode="create"
          sectionKey={sectionKey}
          onClose={handleFormClose}
          returnFocusRef={newRecordButtonRef}
        />
      )}

      {/* ContentForm — edit mode */}
      {formMode === 'edit' && editingRecord !== null && (
        <ContentForm
          mode="edit"
          sectionKey={sectionKey}
          initialData={editingRecord}
          onClose={handleFormClose}
          returnFocusRef={editButtonRef}
        />
      )}

      {/* DeleteConfirmDialog */}
      {deletingRecord !== null && (
        <DeleteConfirmDialog
          record={deletingRecord}
          sectionKey={sectionKey}
          onClose={handleDeleteClose}
        />
      )}
    </motion.div>
  );
}

export default SectionManager;
