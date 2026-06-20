import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { StatsCard } from "../components/overview/StatsCard";
import { useAdminStore } from "../store/adminStore";
import { mockSections } from "../data/mockSections";
import {
  LuChevronRight,
  LuHouse,
  LuWrench,
  LuBuilding2,
  LuPhone,
  LuUsers,
  LuSearch,
} from "react-icons/lu";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatRelative(isoString: string): string {
  if (!isoString) return "—";
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

interface QuickLinkProps {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

function QuickLink({ to, label, description, icon, color }: QuickLinkProps) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-gray-500 leading-snug">
          {description}
        </p>
      </div>
      <LuChevronRight
        className="h-4 w-4 text-gray-300 group-hover:text-blue-400 mt-0.5 ml-auto flex-shrink-0 transition-colors"
        aria-hidden="true"
      />
    </Link>
  );
}

const QUICK_LINKS: QuickLinkProps[] = [
  {
    to: "/admin/home",
    label: "Home Page Content",
    description:
      "Edit hero, leadership, updates, and all public home sections.",
    color: "bg-blue-50 text-blue-600",
    icon: <LuHouse className="h-5 w-5" aria-hidden="true" />,
  },
  {
    to: "/admin/services",
    label: "Services",
    description: "Manage citizen-facing government services and categories.",
    color: "bg-violet-50 text-violet-600",
    icon: <LuWrench className="h-5 w-5" aria-hidden="true" />,
  },
  {
    to: "/admin/government",
    label: "Government",
    description: "Update organizational structure and department info.",
    color: "bg-amber-50 text-amber-600",
    icon: <LuBuilding2 className="h-5 w-5" aria-hidden="true" />,
  },
  {
    to: "/admin/contacts",
    label: "Contacts",
    description: "View and manage public inquiries submitted through the site.",
    color: "bg-green-50 text-green-600",
    icon: <LuPhone className="h-5 w-5" aria-hidden="true" />,
  },
  {
    to: "/admin/accounts",
    label: "Manage Accounts",
    description: "Add, edit, or remove admin user accounts.",
    color: "bg-rose-50 text-rose-600",
    icon: <LuUsers className="h-5 w-5" aria-hidden="true" />,
  },
  {
    to: "/admin/transparency",
    label: "Transparency",
    description: "Publish budget reports, ordinances, and public documents.",
    color: "bg-sky-50 text-sky-600",
    icon: <LuSearch className="h-5 w-5" aria-hidden="true" />,
  },
];

export function AdminDashboardPage() {
  const records = useAdminStore((s) => s.records);

  const allRecords = Object.values(records).flat();
  const totalRecords = allRecords.length;
  const publishedCount = allRecords.filter(
    (r) => r.status === "published",
  ).length;
  const draftCount = allRecords.filter((r) => r.status === "draft").length;
  const totalSections = mockSections.length;

  // 5 most recently updated records
  const recentActivity = [...allRecords]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="space-y-6"
    >
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your content, activity, and quick access to all modules.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Content Sections"
          value={totalSections}
          trend="neutral"
          accentColor="blue"
        />
        <StatsCard
          label="Total Records"
          value={totalRecords}
          trend="up"
          accentColor="blue"
        />
        <StatsCard
          label="Published"
          value={publishedCount}
          trend="up"
          accentColor="green"
        />
        <StatsCard
          label="Drafts"
          value={draftCount}
          trend="neutral"
          accentColor="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Quick Access</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <QuickLink key={link.to} {...link} />
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Recent Activity
          </h2>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">
                No activity yet.
              </p>
            ) : (
              recentActivity.map((record) => {
                const section = mockSections.find(
                  (s) => s.key === record.sectionKey,
                );
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    {/* Status dot */}
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        record.status === "published"
                          ? "bg-green-400"
                          : "bg-amber-400"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {record.title}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {section?.displayName ?? record.sectionKey} ·{" "}
                        {formatRelative(record.updatedAt)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        record.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

AdminDashboardPage.displayName = "AdminDashboardPage";
export default AdminDashboardPage;
