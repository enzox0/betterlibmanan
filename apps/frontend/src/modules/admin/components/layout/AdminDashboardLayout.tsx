import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const sidebarMobileVariants = {
  hidden: { x: '-100%' },
  visible: { x: 0 },
  exit: { x: '-100%' },
};

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);
  const handleCloseSidebar = () => setSidebarOpen(false);

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
        {/* Header — fixed height of 64px (h-16) */}
        <AdminHeader
          onToggleSidebar={handleToggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Main content area — page-level fade+slide on route change */}
        <main className="flex-1 overflow-y-auto bg-gray-50/80">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="px-6 py-6 min-h-full"
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: EASE }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


export default AdminDashboardLayout;
