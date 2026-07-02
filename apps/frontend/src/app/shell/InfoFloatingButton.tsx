import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TiInfoLarge } from "react-icons/ti";
import {
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFax,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useContactStore } from "@/modules/admin/store/contactStore";
import type { IconType } from "react-icons";

const TYPE_ICON: Record<string, IconType> = {
  phone: FaPhone,
  email: FaEnvelope,
  address: FaMapMarkerAlt,
  fax: FaFax,
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const transition = { ease: EASE, duration: 0.22 };

interface InfoFloatingButtonProps {
  setAuthModalOpen: (open: boolean) => void;
}

export function InfoFloatingButton({
  setAuthModalOpen,
}: InfoFloatingButtonProps) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const publicRecords = useContactStore((s) => s.publicRecords);
  const isPublicLoading = useContactStore((s) => s.isPublicLoading);
  const fetchPublicRecords = useContactStore((s) => s.fetchPublicRecords);

  useEffect(() => {
    fetchPublicRecords().catch(() => {});
  }, [fetchPublicRecords]);

  function buildHref(type: string, value: string): string {
    if (type === "phone" || type === "fax") {
      return `tel:${value.replace(/\s/g, "")}`;
    }
    if (type === "email") {
      return `mailto:${value}`;
    }
    return "#";
  }

  return (
    <>
      <div className="fixed bottom-20 left-4 sm:bottom-8 sm:left-8 z-[9999999]">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white/40 hover:bg-white text-blue-900 p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 border border-neutral-200/30 hover:border-neutral-200 backdrop-blur-sm"
          aria-label="Show information"
        >
          <TiInfoLarge size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-[9999999] flex items-end sm:items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={transition}
              className="relative z-10 bg-white w-full sm:max-w-lg shadow-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-4 pb-2 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-neutral-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-4 sm:pt-5">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">
                    About BetterLibmanan
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    A volunteer-built platform
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{ minHeight: 0 }}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                  aria-label="Close"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pb-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 bg-emerald-900/10 border border-emerald-700/20 text-emerald-700 px-4 py-2.5 rounded-lg text-sm font-medium">
                    Cost to residents: <span className="font-bold">₱0</span>
                  </div>

                  <p className="text-sm text-neutral-600 leading-relaxed">
                    This system is maintained by dedicated volunteers and relies
                    on community contributions to keep information accurate and
                    up to date.
                  </p>

                  <p className="text-sm text-neutral-600 leading-relaxed">
                    We encourage you to become a volunteer by contributing data
                    or helping improve the platform — your contribution makes a
                    difference!
                  </p>

                  <p className="text-sm text-neutral-600 leading-relaxed">
                    If you encounter any bugs, incorrect information, or
                    technical issues, please{" "}
                    <a
                      href="https://github.com/enzox0/betterlibmanan/issues"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-neutral-900 underline underline-offset-2 hover:text-neutral-700 transition-colors inline-flex items-center gap-1"
                    >
                      file an issue on GitHub <FaExternalLinkAlt size={10} />
                    </a>
                    .
                  </p>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate("/admin/register");
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors"
                    >
                      Contribute Info
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
