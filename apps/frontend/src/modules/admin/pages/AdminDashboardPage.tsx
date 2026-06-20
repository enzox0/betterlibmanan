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
  LuFileSearch,
  LuActivity,
  LuClock,
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

// ─── Quick Link ───────────────────────────────────────────────────────────────

interface QuickLinkProps {
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  accentBar: string;
}

function QuickLink({
  to,
  label,
  description,
  icon,
  iconBg,
  accentBar,
}: QuickLinkProps) {
  return (
    <Link
      to={to}
      className="group relative flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Left accent bar */}
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${accentBar}`}
        aria-hidden="true"
      />
      <div
        className={`flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400 leading-snug line-clamp-1">
          {description}
        </p>
      </div>
      <LuChevronRight
        className="h-4 w-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors"
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
    iconBg: "bg-blue-50 text-blue-600",
    accentBar: "bg-blue-500",
    icon: <LuHouse className="h-4 w-4" aria-hidden="true" />,
  },
  {
    to: "/admin/services",
    label: "Services",
    description: "Manage citizen-facing government services and categories.",
    iconBg: "bg-violet-50 text-violet-600",
    accentBar: "bg-violet-500",
    icon: <LuWrench className="h-4 w-4" aria-hidden="true" />,
  },
  {
    to: "/admin/government",
    label: "Government",
    description: "Update organizational structure and department info.",
    iconBg: "bg-amber-50 text-amber-600",
    accentBar: "bg-amber-500",
    icon: <LuBuilding2 className="h-4 w-4" aria-hidden="true" />,
  },
  {
    to: "/admin/contacts",
    label: "Contacts",
    description: "View and manage public inquiries submitted through the site.",
    iconBg: "bg-green-50 text-green-600",
    accentBar: "bg-green-500",
    icon: <LuPhone className="h-4 w-4" aria-hidden="true" />,
  },
  {
    to: "/admin/accounts",
    label: "Manage Accounts",
    description: "Add, edit, or remove admin user accounts.",
    iconBg: "bg-rose-50 text-rose-600",
    accentBar: "bg-rose-500",
    icon: <LuUsers className="h-4 w-4" aria-hidden="true" />,
  },
  {
    to: "/admin/transparency",
    label: "Transparency",
    description: "Publish budget reports, ordinances, and public documents.",
    iconBg: "bg-sky-50 text-sky-600",
    accentBar: "bg-sky-500",
    icon: <LuFileSearch className="h-4 w-4" aria-hidden="true" />,
  },
];

// ─── Section Breakdown ────────────────────────────────────────────────────────

interface SectionRowProps {
  displayName: string;
  published: number;
  draft: number;
  total: number;
}

function SectionRow({ displayName, published, draft, total }: SectionRowProps) {
  const pct = total > 0 ? Math.round((published / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-medium text-gray-700 truncate">
            {displayName}
          </p>
          <span className="flex-shrink-0 text-[10px] text-gray-400 tabular-nums">
            {published}/{total}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          />
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {published > 0 && (
          <span className="inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
            {published}
          </span>
        )}
        {draft > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
            {draft}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const records = useAdminStore((s) => s.records);
  const admin = useAdminStore((s) => s.admin);

  const allRecords = Object.values(records).flat();
  const totalRecords = allRecords.length;
  const publishedCount = allRecords.filter(
    (r) => r.status === "published",
  ).length;
  const draftCount = allRecords.filter((r) => r.status === "draft").length;
  const totalSections = mockSections.length;

  // 8 most recently updated records
  const recentActivity = [...allRecords]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  // Per-section breakdown (only sections with records)
  const sectionBreakdown = mockSections
    .map((s) => {
      const recs = records[s.key] ?? [];
      return {
        key: s.key,
        displayName: s.displayName,
        total: recs.length,
        published: recs.filter((r) => r.status === "published").length,
        draft: recs.filter((r) => r.status === "draft").length,
      };
    })
    .filter((s) => s.total > 0);

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const adminName = admin?.displayName?.split(" ")[0] ?? "Admin";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-0.5">
            {greeting}, {adminName}
          </p>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Overview of your content, activity, and quick access to all modules.
          </p>
        </div>
        {/* Live indicator */}
        <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 mt-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"
            aria-hidden="true"
          />
          <span className="text-[11px] font-semibold text-green-700">Live</span>
        </div>
      </motion.div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
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
      </motion.div>

      {/* ── Main content grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        {/* Quick Access — spans 2 cols */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Quick Access
            </h2>
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {QUICK_LINKS.length} modules
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <QuickLink key={link.to} {...link} />
            ))}
          </div>

          {/* Section Breakdown — placed under Quick Access on wide screens */}
          {sectionBreakdown.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  Section Breakdown
                </h2>
                <div className="flex items-center gap-2 ml-auto text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                    published
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                    draft
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div
                  className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"
                  aria-hidden="true"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-50 py-1">
                  {sectionBreakdown.map((s) => (
                    <SectionRow
                      key={s.key}
                      displayName={s.displayName}
                      published={s.published}
                      draft={s.draft}
                      total={s.total}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Right column: Recent Activity only */}
        <motion.div variants={itemVariants} className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuActivity
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              />
              <h2 className="text-sm font-semibold text-gray-700">
                Recent Activity
              </h2>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              last updated
            </span>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            {/* Accent bar */}
            <div
              className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"
              aria-hidden="true"
            />
            <div className="divide-y divide-gray-50">
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
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
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
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1 py-px">
                            {section?.displayName ?? record.sectionKey}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                            <LuClock
                              className="h-2.5 w-2.5"
                              aria-hidden="true"
                            />
                            {formatRelative(record.updatedAt)}
                          </span>
                        </div>
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
        </motion.div>
      </div>
    </motion.div>
  );
}

AdminDashboardPage.displayName = "AdminDashboardPage";
export default AdminDashboardPage;
