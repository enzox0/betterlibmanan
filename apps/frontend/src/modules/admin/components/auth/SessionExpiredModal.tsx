import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAdminStore } from "../../store/adminStore";

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

const ADMIN_LOGIN_PATH = "/admin/login";

function clearPersistedAdminState() {
  if (typeof window === "undefined") {
    return;
  }
  const PERSISTED_ADMIN_STORAGE_KEYS = ["admin-auth", "better-lugs-store"];
  for (const key of PERSISTED_ADMIN_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
}

function redirectToAdminLogin() {
  clearPersistedAdminState();
  window.location.replace(ADMIN_LOGIN_PATH);
}

function ModalContent() {
  const closeSessionExpiredModal = useAdminStore(
    (s) => s.closeSessionExpiredModal,
  );
  const reason = useAdminStore((s) => s.sessionExpiredReason);
  const [countdown, setCountdown] = useState(3);

  const isInactivity = reason === "inactivity";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToAdminLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="session-expired-title"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
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
          className="h-1 bg-gradient-to-r from-amber-500 to-amber-700"
          aria-hidden="true"
        />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 mx-auto mb-4">
            <svg
              className="w-6 h-6 text-amber-600"
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
            id="session-expired-title"
            className="text-center text-base font-bold text-gray-900 mb-2"
          >
            {isInactivity ? "Session Timed Out" : "Session Expired"}
          </h2>

          {/* Body */}
          <p className="text-center text-sm text-gray-500 mb-6">
            {isInactivity
              ? "You were inactive for a while, so your session has been ended for security. Please log in again to continue."
              : "Your session has expired. Please log in again to continue."}
            <br />
            <span className="text-xs text-gray-400">
              Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
            </span>
          </p>

          {/* Actions */}
          <button
            type="button"
            onClick={() => {
              closeSessionExpiredModal();
              redirectToAdminLogin();
            }}
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all"
          >
            Log In Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function SessionExpiredModal() {
  const isOpen = useAdminStore((s) => s.sessionExpiredModalOpen);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <ModalContent key="session-expired-modal" />
    </AnimatePresence>,
    document.body,
  );
}

export default SessionExpiredModal;
