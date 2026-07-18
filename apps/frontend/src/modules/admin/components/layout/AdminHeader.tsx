import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LuBell, LuMenu, LuSearch } from "react-icons/lu";
import { useAdminStore } from "../../store/adminStore";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const admin = useAdminStore((s) => s.admin);
  const initials = admin?.displayName
    ? admin.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";
  const roleLabel = admin?.role === "superadmin" ? "Super Admin" : "Admin";

  return (
    <motion.header
      className="h-16 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0 shadow-sm"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <LuMenu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Search input with icon */}
      <div className="flex-1 max-w-sm relative">
        <LuSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search…"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
        />
      </div>

      {/* Right-side controls */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications with badge */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <LuBell className="h-5 w-5" aria-hidden="true" />
          <span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white"
            aria-hidden="true"
          />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" aria-hidden="true" />

        {/* Admin identity */}
        <Link
          to="/admin/my-account"
          className="flex items-center gap-2.5 pl-1 rounded-lg px-2 py-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-label="My Account"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700 leading-tight">
              {admin?.displayName ?? "Admin"}
            </span>
            <span className="text-xs text-gray-400 leading-tight">
              {roleLabel}
            </span>
          </div>
          {/* Avatar */}
          <div
            className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold select-none shrink-0 ring-2 ring-blue-100"
            aria-hidden="true"
          >
            {initials}
          </div>
        </Link>
      </div>
    </motion.header>
  );
}

export default AdminHeader;
