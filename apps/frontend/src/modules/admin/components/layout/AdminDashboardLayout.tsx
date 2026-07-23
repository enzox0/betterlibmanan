import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useAdminStore } from "../../store/adminStore";
import { useInactivityTimer } from "../../hooks/useInactivityTimer";
import { useTokenRefresh } from "../../hooks/useTokenRefresh";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sidebarMobileVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
};

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);

  // Proactively refresh the access token before it expires so authenticated
  // users are never interrupted by a TOKEN_EXPIRED 401.
  useTokenRefresh();

  // Monitor user activity. When the user is idle for the inactivity timeout
  // window, end the session. Any activity (mouse, keyboard, scroll, etc.)
  // resets the countdown and keeps the session alive.
  useInactivityTimer({ enabled: isAuthenticated });

  return (
    <div className="h-screen overflow-hidden flex">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            aria-hidden="true"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: EASE }}
            onClick={handleCloseSidebar}
          />
        )}
      </AnimatePresence>

      <div className="hidden lg:block shrink-0">
        <AdminSidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-mobile"
            className="fixed inset-y-0 left-0 z-30 lg:hidden"
            variants={sidebarMobileVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: EASE }}
          >
            <AdminSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right column: header + scrollable content */}
      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-y-auto bg-gray-50/80">
          <div className="px-4 py-4 sm:px-6 sm:py-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardLayout;
