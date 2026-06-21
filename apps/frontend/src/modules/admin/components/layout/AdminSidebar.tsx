import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LuHouse,
  LuWrench,
  LuBuilding2,
  LuChartBar,
  LuFileText,
  LuSearch,
  LuPhone,
  LuLayoutDashboard,
  LuUser,
  LuUsers,
  LuLogOut,
  LuClipboardList,
} from "react-icons/lu";
import { useAdminStore } from "../../store/adminStore";

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    to: "/admin/home",
    icon: <LuHouse className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Services",
    to: "/admin/services",
    icon: <LuWrench className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Government",
    to: "/admin/government",
    icon: <LuBuilding2 className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Statistics",
    to: "/admin/statistics",
    icon: <LuChartBar className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Legislative",
    to: "/admin/legislative",
    icon: <LuFileText className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Transparency",
    to: "/admin/transparency",
    icon: <LuSearch className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
  {
    label: "Contacts",
    to: "/admin/contacts",
    icon: <LuPhone className="h-4 w-4 shrink-0" aria-hidden="true" />,
  },
];

const navContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export function AdminSidebar() {
  const { logout, admin } = useAdminStore((s) => ({
    logout: s.logout,
    admin: s.admin,
  }));
  const navigate = useNavigate();
  const isSuperAdmin = admin?.role === "superadmin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <motion.aside
      className="w-60 h-screen flex flex-col bg-gradient-to-b from-blue-950 to-blue-900 text-white shadow-2xl"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 shadow-md">
            <img
              src="/betterlibmanan.png"
              alt="BetterLibmanan logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">
              BetterLibmanan
            </p>
            <p className="text-[10px] text-blue-300 font-medium tracking-widest uppercase">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="px-3 pt-5 pb-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            [
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive
                ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                : "text-blue-200 hover:bg-white/10 hover:text-white",
            ].join(" ")
          }
        >
          <LuLayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Dashboard</span>
        </NavLink>
      </div>

      {/* Navigation label */}
      <div className="px-5 pt-3 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
          Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav
        className="flex-1 overflow-y-auto px-3 pb-3"
        aria-label="Admin navigation"
      >
        <motion.ul
          className="space-y-0.5"
          variants={navContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {NAV_ITEMS.map(({ label, to, icon }) => (
            <motion.li key={to} variants={navItemVariants}>
              <NavLink
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                      : "text-blue-200 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {icon}
                <span>{label}</span>
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>
      </nav>

      {/* Account section */}
      <div className="px-3 py-3">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-400">
          Account
        </p>
        <div className="space-y-0.5">
          <NavLink
            to="/admin/my-account"
            className={({ isActive }) =>
              [
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                  : "text-blue-200 hover:bg-white/10 hover:text-white",
              ].join(" ")
            }
          >
            <LuUser className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>My Account</span>
          </NavLink>
          {isSuperAdmin && (
            <NavLink
              to="/admin/accounts"
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                    : "text-blue-200 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <LuUsers className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Manage Accounts</span>
            </NavLink>
          )}
          {isSuperAdmin && (
            <NavLink
              to="/admin/audit-logs"
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/50"
                    : "text-blue-200 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <LuClipboardList
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              <span>Audit Logs</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 focus:ring-offset-blue-900"
        >
          <LuLogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}

export default AdminSidebar;
