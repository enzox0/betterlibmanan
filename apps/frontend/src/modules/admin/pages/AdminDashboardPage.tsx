import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { StatsCard } from '../components/overview/StatsCard';
import { useAdminStore } from '../store/adminStore';
import { mockSections } from '../data/mockSections';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatRelative(isoString: string): string {
  if (!isoString) return '—';
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
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
      <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500 leading-snug">{description}</p>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 text-gray-300 group-hover:text-blue-400 mt-0.5 ml-auto flex-shrink-0 transition-colors" aria-hidden="true">
        <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </Link>
  );
}

const QUICK_LINKS: QuickLinkProps[] = [
  {
    to: '/admin/home',
    label: 'Home Page Content',
    description: 'Edit hero, leadership, updates, and all public home sections.',
    color: 'bg-blue-50 text-blue-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: '/admin/services',
    label: 'Services',
    description: 'Manage citizen-facing government services and categories.',
    color: 'bg-violet-50 text-violet-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    to: '/admin/government',
    label: 'Government',
    description: 'Update organizational structure and department info.',
    color: 'bg-amber-50 text-amber-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M3 22V8l9-6 9 6v14" /><path d="M9 22V12h6v10" /><path d="M3 22h18" />
      </svg>
    ),
  },
  {
    to: '/admin/contacts',
    label: 'Contacts',
    description: 'View and manage public inquiries submitted through the site.',
    color: 'bg-green-50 text-green-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    to: '/admin/accounts',
    label: 'Manage Accounts',
    description: 'Add, edit, or remove admin user accounts.',
    color: 'bg-rose-50 text-rose-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/admin/transparency',
    label: 'Transparency',
    description: 'Publish budget reports, ordinances, and public documents.',
    color: 'bg-sky-50 text-sky-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
];

export function AdminDashboardPage() {
  const records = useAdminStore((s) => s.records);

  const allRecords = Object.values(records).flat();
  const totalRecords = allRecords.length;
  const publishedCount = allRecords.filter((r) => r.status === 'published').length;
  const draftCount = allRecords.filter((r) => r.status === 'draft').length;
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
        <StatsCard label="Content Sections" value={totalSections}  trend="neutral" accentColor="blue" />
        <StatsCard label="Total Records"    value={totalRecords}   trend="up"      accentColor="blue" />
        <StatsCard label="Published"        value={publishedCount} trend="up"      accentColor="green" />
        <StatsCard label="Drafts"           value={draftCount}     trend="neutral" accentColor="yellow" />
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
          <h2 className="text-sm font-semibold text-gray-700">Recent Activity</h2>
          <div className="rounded-xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">No activity yet.</p>
            ) : (
              recentActivity.map((record) => {
                const section = mockSections.find((s) => s.key === record.sectionKey);
                return (
                  <div key={record.id} className="flex items-start gap-3 px-4 py-3">
                    {/* Status dot */}
                    <span
                      className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        record.status === 'published' ? 'bg-green-400' : 'bg-amber-400'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-800 truncate">{record.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {section?.displayName ?? record.sectionKey} · {formatRelative(record.updatedAt)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        record.status === 'published'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
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

AdminDashboardPage.displayName = 'AdminDashboardPage';
export default AdminDashboardPage;
