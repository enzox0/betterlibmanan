import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LuUsers,
  LuMessageSquare,
  LuCheck,
  LuX,
  LuTrash2,
  LuClock,
  LuPin,
  LuHash,
  LuRefreshCw,
  LuFileText,
} from "react-icons/lu";
import { useCommunityStore } from "../store/communityStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import { StatsCard } from "../components/overview/StatsCard";
import type { Discussion, CommunityGroup } from "../services/community.api";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="h-3.5 w-2/5 rounded bg-gray-200" />
            <div className="h-3 w-3/5 rounded bg-gray-100" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="h-7 w-16 rounded-lg bg-gray-100" />
            <div className="h-7 w-16 rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function StatusChip({ status }: { status: CommunityGroup["status"] }) {
  const map = {
    approved: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50   text-red-600   border-red-200",
  };
  const dot = {
    approved: "bg-green-500",
    pending: "bg-amber-400",
    rejected: "bg-red-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold shrink-0 ${map[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

function DeleteConfirm({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18, ease: EASE }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-400" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <LuTrash2 className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Delete {label}?</p>
              <p className="text-xs text-gray-500 mt-0.5">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tab: Discussions ─────────────────────────────────────────────────────────

function DiscussionsTab({
  discussions,
  loading,
  onDelete,
  onRefresh,
}: {
  discussions: Discussion[];
  loading: boolean;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}) {
  if (loading) return <SkeletonRows />;

  if (discussions.length === 0) {
    return (
      <EmptyState
        icon={<LuMessageSquare className="h-6 w-6" />}
        message="No discussions yet."
        sub="Discussions posted by the public will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {discussions.map((d) => (
        <div
          key={d._id}
          className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group"
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-bold text-neutral-600 shrink-0 mt-0.5">
            {d.avatarInitials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-xs font-semibold text-gray-700">
                {d.author}
              </span>
              {d.isPinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                  <LuPin className="h-2.5 w-2.5" aria-hidden="true" />
                  Pinned
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 leading-snug mb-1.5">
              {d.title}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <LuMessageSquare className="h-3 w-3" aria-hidden="true" />
                {d.replies} {d.replies === 1 ? "reply" : "replies"}
              </span>
              {d.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {d.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5"
                    >
                      <LuHash className="h-2.5 w-2.5" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-[11px] text-gray-400 ml-auto">
                {formatDate(d.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onDelete(d._id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label="Delete discussion"
            >
              <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Groups ──────────────────────────────────────────────────────────────

function GroupsTab({
  groups,
  loading,
  onDelete,
  onStatusChange,
}: {
  groups: CommunityGroup[];
  loading: boolean;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
}) {
  if (loading) return <SkeletonRows />;

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<LuUsers className="h-6 w-6" />}
        message="No groups yet."
        sub="Approved groups appear on the public Community page."
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {groups.map((g) => (
        <div
          key={g._id}
          className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/60 transition-colors group"
        >
          {/* Icon */}
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
            <LuUsers className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-sm font-bold text-gray-900 truncate">
                {g.name}
              </span>
              <StatusChip status={g.status} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
              {g.description}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span>
                {g.memberCount} member{g.memberCount !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span>{formatDate(g.createdAt)}</span>
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {g.status !== "approved" && (
              <button
                type="button"
                onClick={() => onStatusChange(g._id, "approved")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
              >
                <LuCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Approve
              </button>
            )}
            {g.status !== "rejected" && (
              <button
                type="button"
                onClick={() => onStatusChange(g._id, "rejected")}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <LuX className="h-3.5 w-3.5" aria-hidden="true" />
                Reject
              </button>
            )}
            <button
              type="button"
              onClick={() => onDelete(g._id)}
              className="inline-flex items-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
              aria-label="Delete group"
            >
              <LuTrash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Tab: Pending ─────────────────────────────────────────────────────────────

function PendingTab({
  groups,
  loading,
  onApprove,
  onReject,
}: {
  groups: CommunityGroup[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  if (loading) return <SkeletonRows />;

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={<LuClock className="h-6 w-6" />}
        message="No pending proposals."
        sub="Group proposals submitted by users will appear here for review."
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-gray-50">
      {groups.map((g) => (
        <div
          key={g._id}
          className="flex items-start gap-4 px-5 py-4 hover:bg-amber-50/30 transition-colors group"
        >
          {/* Icon */}
          <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
            <LuUsers className="h-4 w-4 text-amber-500" aria-hidden="true" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-bold text-gray-900 truncate">
                {g.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
              {g.description}
            </p>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <LuClock className="h-3 w-3" aria-hidden="true" />
              Submitted {formatDate(g.createdAt)}
            </span>
          </div>

          {/* Actions — always visible for pending */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onApprove(g._id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              <LuCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Approve
            </button>
            <button
              type="button"
              onClick={() => onReject(g._id)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              <LuX className="h-3.5 w-3.5" aria-hidden="true" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "discussions" | "groups" | "pending";

export function CommunityModulePage() {
  const { toast } = useToast();
  const accessToken = useAdminStore((s) => s.accessToken);

  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);
  const removeDiscussion = useCommunityStore((s) => s.removeDiscussion);

  const allGroups = useCommunityStore((s) => s.allGroups);
  const isAllGroupsLoading = useCommunityStore((s) => s.isAllGroupsLoading);
  const fetchAllGroups = useCommunityStore((s) => s.fetchAllGroups);
  const deleteGroup = useCommunityStore((s) => s.deleteGroup);
  const approveGroup = useCommunityStore((s) => s.approveGroup);
  const rejectGroup = useCommunityStore((s) => s.rejectGroup);

  const pendingGroups = useCommunityStore((s) => s.pendingGroups);
  const isPendingGroupsLoading = useCommunityStore(
    (s) => s.isPendingGroupsLoading,
  );
  const fetchPendingGroups = useCommunityStore((s) => s.fetchPendingGroups);

  const [activeTab, setActiveTab] = useState<Tab>("discussions");
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "discussion" | "group";
    id: string;
    label: string;
  } | null>(null);

  // Fetch all data on mount
  useEffect(() => {
    fetchDiscussions().catch(() => {});
    if (accessToken) {
      fetchAllGroups(accessToken).catch(() => {});
      fetchPendingGroups(accessToken).catch(() => {});
    }
  }, [accessToken]);

  // ── Derived stats ────────────────────────────────────────────────────────────
  const approvedGroups = allGroups.filter(
    (g) => g.status === "approved",
  ).length;
  const totalReplies = discussions.reduce((n, d) => n + d.replies, 0);

  // ── Tab config ───────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "discussions", label: "Discussions", count: discussions.length },
    { id: "groups", label: "Groups", count: allGroups.length },
    { id: "pending", label: "Pending", count: pendingGroups.length },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const refresh = () => {
    fetchDiscussions().catch(() => {});
    if (accessToken) {
      fetchAllGroups(accessToken).catch(() => {});
      fetchPendingGroups(accessToken).catch(() => {});
    }
    toast("Refreshed", "success");
  };

  const confirmDelete = () => {
    if (!deleteTarget || !accessToken) return;
    const { type, id, label } = deleteTarget;
    setDeleteTarget(null);
    if (type === "discussion") {
      removeDiscussion(id, accessToken)
        .then(() => toast("Discussion deleted.", "success"))
        .catch(() => toast("Failed to delete discussion.", "error"));
    } else {
      deleteGroup(id, accessToken)
        .then(() => toast(`"${label}" deleted.`, "success"))
        .catch(() => toast("Failed to delete group.", "error"));
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    if (!accessToken) return;
    try {
      if (status === "approved") {
        await approveGroup(id, accessToken);
        toast("Group approved.", "success");
      } else {
        await rejectGroup(id, accessToken);
        toast("Group rejected.", "info");
      }
    } catch {
      toast("Failed to update group status.", "error");
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage public discussions, peer groups, and group proposals.
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 shadow-sm transition-colors shrink-0"
        >
          <LuRefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          label="Discussions"
          value={discussions.length}
          trend="neutral"
          accentColor="blue"
        />
        <StatsCard
          label="Total Replies"
          value={totalReplies}
          trend="neutral"
          accentColor="green"
        />
        <StatsCard
          label="Approved Groups"
          value={approvedGroups}
          trend="neutral"
          accentColor="green"
        />
        <StatsCard
          label="Pending Proposals"
          value={pendingGroups.length}
          trend={pendingGroups.length > 0 ? "up" : "neutral"}
          accentColor={pendingGroups.length > 0 ? "yellow" : "blue"}
        />
      </div>

      {/* Main panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar — matches HomeModulePage pattern exactly */}
        <div className="border-b border-gray-100 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <nav
            className="flex min-w-max px-4 pt-3 gap-1"
            role="tablist"
            aria-label="Community sections"
          >
            {tabs.map(({ id, label, count }) => {
              const isActive = activeTab === id;
              const isPendingWithItems = id === "pending" && count > 0;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={[
                    "relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
                    isActive
                      ? "text-blue-600 bg-blue-50/60"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
                  ].join(" ")}
                >
                  {label}

                  {/* Count badge */}
                  <span
                    className={[
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px]",
                      isPendingWithItems
                        ? "bg-amber-100 text-amber-700"
                        : isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500",
                    ].join(" ")}
                  >
                    {count}
                  </span>

                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            {activeTab === "discussions" && (
              <DiscussionsTab
                discussions={discussions}
                loading={isDiscussionsLoading}
                onDelete={(id) =>
                  setDeleteTarget({
                    type: "discussion",
                    id,
                    label: "discussion",
                  })
                }
                onRefresh={() => fetchDiscussions().catch(() => {})}
              />
            )}
            {activeTab === "groups" && (
              <GroupsTab
                groups={allGroups}
                loading={isAllGroupsLoading}
                onDelete={(id) => {
                  const g = allGroups.find((x) => x._id === id);
                  setDeleteTarget({
                    type: "group",
                    id,
                    label: g?.name ?? "group",
                  });
                }}
                onStatusChange={handleStatusChange}
              />
            )}
            {activeTab === "pending" && (
              <PendingTab
                groups={pendingGroups}
                loading={isPendingGroupsLoading}
                onApprove={async (id) => {
                  if (!accessToken) return;
                  try {
                    await approveGroup(id, accessToken);
                    toast("Group approved.", "success");
                  } catch {
                    toast("Failed to approve group.", "error");
                  }
                }}
                onReject={async (id) => {
                  if (!accessToken) return;
                  try {
                    await rejectGroup(id, accessToken);
                    toast("Group rejected.", "info");
                  } catch {
                    toast("Failed to reject group.", "error");
                  }
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirm
            label={deleteTarget.label}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
