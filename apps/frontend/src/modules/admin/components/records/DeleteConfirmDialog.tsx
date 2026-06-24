import { useEffect } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "../../store/adminStore";
import { useBetterLugsStore } from "../../store/betterLugsStore";
import { useBarangayMapStore } from "../../store/barangayMapStore";
import { usePopularServicesStore } from "../../store/popular-services.store";
import { useAtAGlanceStore } from "../../store/atAGlanceStore";
import { useHistoryStore } from "../../store/historyStore";
import { useLatestUpdatesStore } from "../../store/latestUpdatesStore";
import type { ContentRecord } from "../../types/admin.types";

interface DeleteConfirmDialogProps {
  record: ContentRecord;
  sectionKey: string;
  onClose: () => void;
  onDeleted?: () => Promise<void> | void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const transition = { ease: EASE, duration: 0.3 };

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function DialogContent({
  record,
  sectionKey,
  onClose,
}: DeleteConfirmDialogProps) {
  const deleteRecord = useAdminStore((s) => s.deleteRecord);
  const accessToken = useAdminStore((s) => s.accessToken);
  const deleteBetterLug = useBetterLugsStore((s) => s.deleteBetterLug);
  const deleteBarangayMap = useBarangayMapStore((s) => s.deleteBarangayMap);
  const deletePopularService = usePopularServicesStore(
    (s) => s.deletePopularService,
  );
  const deleteAtAGlance = useAtAGlanceStore((s) => s.deleteAtAGlance);
  const deleteHistory = useHistoryStore((s) => s.deleteHistory);
  const deleteLatestUpdate = useLatestUpdatesStore((s) => s.deleteLatestUpdate);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleConfirmDelete() {
    if (sectionKey === "partner-logos") {
      if (!accessToken) return;
      await deleteBetterLug(record.id, accessToken);
    } else if (sectionKey === "barangay-map") {
      if (!accessToken) return;
      await deleteBarangayMap(record.id, accessToken);
    } else if (sectionKey === "popular-services") {
      if (!accessToken) return;
      await deletePopularService(record.id, accessToken);
    } else if (sectionKey === "at-a-glance") {
      if (!accessToken) return;
      await deleteAtAGlance(record.id, accessToken);
    } else if (sectionKey === "history") {
      if (!accessToken) return;
      await deleteHistory(record.id, accessToken);
    } else if (sectionKey === "latest-updates") {
      if (!accessToken) return;
      await deleteLatestUpdate(record.id, accessToken);
    } else {
      deleteRecord(sectionKey, record.id);
    }
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="delete-dialog-title"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        variants={dialogVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      >
        {/* Top accent */}
        <div
          className="h-1 bg-gradient-to-r from-red-500 to-red-700"
          aria-hidden="true"
        />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2
            id="delete-dialog-title"
            className="text-center text-base font-bold text-gray-900 mb-2"
          >
            Delete Record
          </h2>

          {/* Body */}
          <p className="text-center text-sm text-gray-500 mb-6">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-800">
              &ldquo;{record.title}&rdquo;
            </span>
            ?
            <br />
            <span className="text-xs text-gray-400">
              This action cannot be undone.
            </span>
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DeleteConfirmDialog(props: DeleteConfirmDialogProps) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <DialogContent key="delete-confirm-dialog" {...props} />
    </AnimatePresence>,
    document.body,
  );
}

export default DeleteConfirmDialog;
