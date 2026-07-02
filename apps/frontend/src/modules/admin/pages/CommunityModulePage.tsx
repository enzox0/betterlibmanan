import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
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
  LuSearch,
  LuChevronDown,
  LuThumbsUp,
  LuUser,
  LuCalendar,
  LuCirclePlus,
} from "react-icons/lu";
import { useCommunityStore } from "../store/communityStore";
import { useAdminStore } from "../store/adminStore";
import { useToast } from "@/context/ToastContext";
import { StatsCard } from "../components/overview/StatsCard";
import {
  deleteDiscussionReplyRequest,
  deleteGroupMessageRequest,
} from "../services/community.api";
import type {
  Discussion,
  CommunityGroup,
  DiscussionReply,
  GroupMessage,
} from "../services/community.api";

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

function formatTime(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${ampm}`;
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
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonPanel() {
  return (
    <div className="flex flex-col gap-4 p-5 animate-pulse">
      <div className="h-4 w-3/5 rounded bg-gray-200" />
      <div className="h-3 w-4/5 rounded bg-gray-100" />
      <div className="h-3 w-2/5 rounded bg-gray-100" />
      <div className="h-px bg-gray-100 my-1" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-7 w-7 rounded-full bg-gray-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 w-1/4 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-100" />
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
  showAddButton,
}: {
  icon: React.ReactNode;
  message: string;
  sub?: string;
  showAddButton?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-3 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      {showAddButton && (
        <Link
          to="/admin/register"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
          <LuCirclePlus className="h-3.5 w-3.5" />
          Add Information
        </Link>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: CommunityGroup["status"] }) {
  const map = {
    approved: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
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

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  showStatusFilter,
  placeholder,
}: {
  query: string;
  onQuery: (v: string) => void;
  statusFilter: string;
  onStatusFilter: (v: string) => void;
  showStatusFilter: boolean;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
      <div className="relative flex-1 min-w-0">
        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <LuX className="h-3 w-3" />
          </button>
        )}
      </div>
      {showStatusFilter && (
        <div className="relative shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer transition"
          >
            <option value="all">All statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <LuChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>
      )}
    </div>
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

// ─── Detail Panel — fixed viewport-edge drawer ───────────────────────────────

function DetailPanel({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="dp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[200] bg-black/30"
            onClick={onClose}
          />
          <motion.aside
            key="dp-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed right-0 top-0 bottom-0 z-[201] w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-sm font-bold text-gray-900 leading-snug">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0 mt-0.5"
                aria-label="Close panel"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">{children}</div>

            {/* Footer — optional action area */}
            {footer && (
              <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Discussion Detail Panel Content ─────────────────────────────────────────

function DiscussionDetail({
  discussion,
  accessToken,
  onReplyDeleted,
}: {
  discussion: Discussion;
  accessToken: string;
  onReplyDeleted: (discussionId: string, replyId: string) => void;
}) {
  const fetchReplies = useCommunityStore((s) => s.fetchReplies);
  const repliesByDiscussion = useCommunityStore((s) => s.repliesByDiscussion);
  const isRepliesLoading = useCommunityStore((s) => s.isRepliesLoading);
  const { toast } = useToast();

  const replies: DiscussionReply[] = repliesByDiscussion[discussion._id] ?? [];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmReplyId, setConfirmReplyId] = useState<string | null>(null);
  const [replySearch, setReplySearch] = useState("");

  useEffect(() => {
    fetchReplies(discussion._id).catch(() => {});
  }, [discussion._id]);

  const handleDeleteReply = async (replyId: string) => {
    setDeletingId(replyId);
    try {
      await deleteDiscussionReplyRequest(replyId, accessToken);
      onReplyDeleted(discussion._id, replyId);
      toast("Reply deleted.", "success");
    } catch {
      toast("Failed to delete reply.", "error");
    } finally {
      setDeletingId(null);
      setConfirmReplyId(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Discussion meta */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-bold text-neutral-600 shrink-0">
            {discussion.avatarInitials}
          </div>
          <span className="text-xs font-semibold text-gray-700">
            {discussion.author}
          </span>
          {discussion.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              <LuPin className="h-2.5 w-2.5" /> Pinned
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900 leading-snug mb-2">
          {discussion.title}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {discussion.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {discussion.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5"
                >
                  <LuHash className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <LuCalendar className="h-3 w-3" />
            {formatDate(discussion.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <LuMessageSquare className="h-3 w-3" />
            {discussion.replies}{" "}
            {discussion.replies === 1 ? "reply" : "replies"}
          </span>
        </div>
      </div>

      {/* Replies */}
      <div className="px-6 py-4">
        {/* Search bar */}
        <div className="relative mb-3">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={replySearch}
            onChange={(e) => setReplySearch(e.target.value)}
            placeholder="Search replies…"
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          {replySearch && (
            <button
              type="button"
              onClick={() => setReplySearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <LuX className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Replies
          {replySearch && (
            <span className="ml-2 normal-case font-normal text-gray-400">
              —{" "}
              {
                replies.filter(
                  (r) =>
                    r.body.toLowerCase().includes(replySearch.toLowerCase()) ||
                    r.author.toLowerCase().includes(replySearch.toLowerCase()),
                ).length
              }{" "}
              result
              {replies.filter(
                (r) =>
                  r.body.toLowerCase().includes(replySearch.toLowerCase()) ||
                  r.author.toLowerCase().includes(replySearch.toLowerCase()),
              ).length !== 1
                ? "s"
                : ""}
            </span>
          )}
        </p>
        {isRepliesLoading && replies.length === 0 ? (
          <SkeletonPanel />
        ) : replies.length === 0 ? (
          <EmptyState
            icon={<LuMessageSquare className="h-5 w-5" />}
            message="No replies yet."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {(() => {
              const q = replySearch.toLowerCase();
              const filtered = q
                ? replies.filter(
                    (r) =>
                      r.body.toLowerCase().includes(q) ||
                      r.author.toLowerCase().includes(q),
                  )
                : replies;
              if (filtered.length === 0) {
                return (
                  <div className="flex flex-col items-center py-8 text-center">
                    <LuSearch className="h-5 w-5 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">
                      No replies match "{replySearch}"
                    </p>
                  </div>
                );
              }
              return filtered.map((r) => (
                <div
                  key={r._id}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                    {r.avatarInitials || <LuUser className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-gray-700">
                        {r.author}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(r.createdAt)} · {formatTime(r.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {r.body}
                    </p>
                    <span className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      <LuThumbsUp className="h-3 w-3" />
                      {r.likes}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmReplyId(r._id)}
                    disabled={deletingId === r._id}
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    aria-label="Delete reply"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmReplyId && (
          <DeleteConfirm
            label="reply"
            onConfirm={() => handleDeleteReply(confirmReplyId)}
            onCancel={() => setConfirmReplyId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Group Detail Panel Content ───────────────────────────────────────────────

function GroupDetail({
  group,
  accessToken,
  onMessageDeleted,
}: {
  group: CommunityGroup;
  accessToken: string;
  onMessageDeleted: (groupId: string, msgId: string) => void;
}) {
  const fetchGroupMessages = useCommunityStore((s) => s.fetchGroupMessages);
  const messagesByGroup = useCommunityStore((s) => s.messagesByGroup);
  const isMessagesLoading = useCommunityStore((s) => s.isMessagesLoading);
  const { toast } = useToast();

  const messages: GroupMessage[] = messagesByGroup[group._id] ?? [];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmMsgId, setConfirmMsgId] = useState<string | null>(null);
  const [msgSearch, setMsgSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroupMessages(group._id).catch(() => {});
  }, [group._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleDeleteMessage = async (msgId: string) => {
    setDeletingId(msgId);
    try {
      await deleteGroupMessageRequest(group._id, msgId, accessToken);
      onMessageDeleted(group._id, msgId);
      toast("Message deleted.", "success");
    } catch {
      toast("Failed to delete message.", "error");
    } finally {
      setDeletingId(null);
      setConfirmMsgId(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Group meta */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/40">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <LuUsers className="h-5 w-5 text-gray-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-900">
                {group.name}
              </span>
              <StatusChip status={group.status} />
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {group.memberCount} member{group.memberCount !== 1 ? "s" : ""} ·
              Created {formatDate(group.createdAt)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          {group.description}
        </p>
        {group.proposerName && (
          <p className="mt-2 text-[11px] text-gray-400">
            Proposed by{" "}
            <span className="font-semibold text-gray-600">
              {group.proposerName}
            </span>
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="px-6 py-4">
        {/* Search bar */}
        <div className="relative mb-3">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={msgSearch}
            onChange={(e) => setMsgSearch(e.target.value)}
            placeholder="Search messages…"
            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg bg-gray-50 border border-gray-200 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          {msgSearch && (
            <button
              type="button"
              onClick={() => setMsgSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <LuX className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Messages
          {msgSearch && (
            <span className="ml-2 normal-case font-normal text-gray-400">
              —{" "}
              {
                [...messages].filter(
                  (m) =>
                    m.text.toLowerCase().includes(msgSearch.toLowerCase()) ||
                    m.author.toLowerCase().includes(msgSearch.toLowerCase()),
                ).length
              }{" "}
              result
              {[...messages].filter(
                (m) =>
                  m.text.toLowerCase().includes(msgSearch.toLowerCase()) ||
                  m.author.toLowerCase().includes(msgSearch.toLowerCase()),
              ).length !== 1
                ? "s"
                : ""}
            </span>
          )}
        </p>
        {isMessagesLoading && messages.length === 0 ? (
          <SkeletonPanel />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<LuMessageSquare className="h-5 w-5" />}
            message="No messages yet."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {(() => {
              const q = msgSearch.toLowerCase();
              const pool = [...messages].slice(-50);
              const filtered = q
                ? pool.filter(
                    (m) =>
                      m.text.toLowerCase().includes(q) ||
                      m.author.toLowerCase().includes(q),
                  )
                : pool;
              if (filtered.length === 0) {
                return (
                  <div className="flex flex-col items-center py-8 text-center">
                    <LuSearch className="h-5 w-5 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">
                      No messages match "{msgSearch}"
                    </p>
                  </div>
                );
              }
              return filtered.map((m) => (
                <div
                  key={m._id}
                  className="group flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100/70 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-600 shrink-0">
                    {m.avatarInitials || <LuUser className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {m.replyToText && (
                      <p className="text-[10px] text-gray-400 border-l-2 border-gray-200 pl-2 mb-1 truncate italic">
                        ↩ {m.replyToAuthor}: {m.replyToText}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-gray-700">
                        {m.author}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatDate(m.createdAt)} · {formatTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {m.text}
                    </p>
                    {Object.keys(m.reactions).length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {Object.entries(m.reactions).map(([emoji, users]) => (
                          <span
                            key={emoji}
                            className="inline-flex items-center gap-0.5 text-[10px] bg-white border border-gray-200 rounded-full px-1.5 py-0.5"
                          >
                            {emoji} {users.length}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirmMsgId(m._id)}
                    disabled={deletingId === m._id}
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1.5 rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                    aria-label="Delete message"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ));
            })()}
            {!msgSearch && <div ref={bottomRef} />}
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmMsgId && (
          <DeleteConfirm
            label="message"
            onConfirm={() => handleDeleteMessage(confirmMsgId)}
            onCancel={() => setConfirmMsgId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Pending Group Detail Panel Content ──────────────────────────────────────

function PendingGroupDetail({
  group,
  onApprove: _onApprove,
  onReject: _onReject,
}: {
  group: CommunityGroup;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 py-5 bg-amber-50/40 border-b border-amber-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <LuUsers className="h-5 w-5 text-amber-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{group.name}</p>
            <StatusChip status={group.status} />
          </div>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          {group.description}
        </p>
      </div>

      <div className="px-6 py-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Submitted
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {formatDate(group.createdAt)}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Members
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {group.memberCount}
            </p>
          </div>
        </div>
        {group.proposerName && (
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Proposed by
            </p>
            <p className="text-xs font-semibold text-gray-700">
              {group.proposerName}
            </p>
          </div>
        )}
        {group.imageUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <img
              src={group.imageUrl}
              alt={group.name}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab: Discussions ─────────────────────────────────────────────────────────

function DiscussionsTab({
  discussions,
  loading,
  selectedId,
  onSelect,
  onDelete,
}: {
  discussions: Discussion[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (d: Discussion) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = discussions.filter((d) => {
    const q = query.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.author.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  if (loading) return <SkeletonRows />;

  return (
    <>
      <FilterBar
        query={query}
        onQuery={setQuery}
        statusFilter="all"
        onStatusFilter={() => {}}
        showStatusFilter={false}
        placeholder="Search by title, author, or tag…"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<LuMessageSquare className="h-6 w-6" />}
          message={
            query ? "No discussions match your search." : "No discussions yet."
          }
          sub={
            !query
              ? "Discussions posted by the public will appear here."
              : undefined
          }
          showAddButton={!query}
        />
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {filtered.map((d) => (
            <div
              key={d._id}
              onClick={() => onSelect(d)}
              className={[
                "flex items-start gap-4 px-5 py-4 transition-colors group cursor-pointer",
                selectedId === d._id ? "bg-blue-50/60" : "hover:bg-gray-50/60",
              ].join(" ")}
            >
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-[11px] font-bold text-neutral-600 shrink-0 mt-0.5">
                {d.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">
                    {d.author}
                  </span>
                  {d.isPinned && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                      <LuPin className="h-2.5 w-2.5" />
                      Pinned
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 leading-snug mb-1.5">
                  {d.title}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400">
                    <LuMessageSquare className="h-3 w-3" />
                    {d.replies} {d.replies === 1 ? "reply" : "replies"}
                  </span>
                  {d.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {d.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded px-1.5 py-0.5"
                        >
                          <LuHash className="h-2.5 w-2.5" />
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
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(d._id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label="Delete discussion"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Tab: Groups ──────────────────────────────────────────────────────────────

function GroupsTab({
  groups,
  loading,
  selectedId,
  onSelect,
  onDelete,
  onStatusChange,
}: {
  groups: CommunityGroup[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (g: CommunityGroup) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: "approved" | "rejected") => void;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = groups.filter((g) => {
    const q = query.toLowerCase();
    const matchesQuery =
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.proposerName ?? "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (loading) return <SkeletonRows />;

  return (
    <>
      <FilterBar
        query={query}
        onQuery={setQuery}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        showStatusFilter={true}
        placeholder="Search by name, description, or proposer…"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<LuUsers className="h-6 w-6" />}
          message={
            query || statusFilter !== "all"
              ? "No groups match your filters."
              : "No groups yet."
          }
          sub={
            !query && statusFilter === "all"
              ? "Approved groups appear on the public Community page."
              : undefined
          }
          showAddButton={!query && statusFilter === "all"}
        />
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {filtered.map((g) => (
            <div
              key={g._id}
              onClick={() => onSelect(g)}
              className={[
                "flex items-start gap-4 px-5 py-4 transition-colors group cursor-pointer",
                selectedId === g._id ? "bg-blue-50/60" : "hover:bg-gray-50/60",
              ].join(" ")}
            >
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                <LuUsers className="h-4 w-4 text-gray-400" />
              </div>
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
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {g.status !== "approved" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(g._id, "approved");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                  >
                    <LuCheck className="h-3.5 w-3.5" />
                    Approve
                  </button>
                )}
                {g.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(g._id, "rejected");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    <LuX className="h-3.5 w-3.5" />
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(g._id);
                  }}
                  className="inline-flex items-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors"
                  aria-label="Delete group"
                >
                  <LuTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Tab: Pending ─────────────────────────────────────────────────────────────

function PendingTab({
  groups,
  loading,
  selectedId,
  onSelect,
  onApprove,
  onReject,
}: {
  groups: CommunityGroup[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (g: CommunityGroup) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = groups.filter((g) => {
    const q = query.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      (g.proposerName ?? "").toLowerCase().includes(q)
    );
  });

  if (loading) return <SkeletonRows />;

  return (
    <>
      <FilterBar
        query={query}
        onQuery={setQuery}
        statusFilter="all"
        onStatusFilter={() => {}}
        showStatusFilter={false}
        placeholder="Search by name, description, or proposer…"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon={<LuClock className="h-6 w-6" />}
          message={
            query ? "No proposals match your search." : "No pending proposals."
          }
          sub={
            !query
              ? "Group proposals submitted by users will appear here for review."
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-gray-50">
          {filtered.map((g) => (
            <div
              key={g._id}
              onClick={() => onSelect(g)}
              className={[
                "flex items-start gap-4 px-5 py-4 transition-colors group cursor-pointer",
                selectedId === g._id
                  ? "bg-amber-50/60"
                  : "hover:bg-amber-50/30",
              ].join(" ")}
            >
              <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <LuUsers className="h-4 w-4 text-amber-500" />
              </div>
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
                  <LuClock className="h-3 w-3" />
                  Submitted {formatDate(g.createdAt)}
                </span>
                {g.proposerName && (
                  <span className="text-[11px] text-gray-400">
                    {" "}
                    · By{" "}
                    <span className="font-semibold text-gray-600">
                      {g.proposerName}
                    </span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(g._id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                >
                  <LuCheck className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(g._id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                >
                  <LuX className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "discussions" | "groups" | "pending";

type PanelTarget =
  | { type: "discussion"; item: Discussion }
  | { type: "group"; item: CommunityGroup }
  | { type: "pending"; item: CommunityGroup };

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
  const [panelTarget, setPanelTarget] = useState<PanelTarget | null>(null);

  useEffect(() => {
    fetchDiscussions().catch(() => {});
    if (accessToken) {
      fetchAllGroups(accessToken).catch(() => {});
      fetchPendingGroups(accessToken).catch(() => {});
    }
  }, [accessToken]);

  // Close panel when switching tabs
  useEffect(() => {
    setPanelTarget(null);
  }, [activeTab]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const approvedGroups = allGroups.filter(
    (g) => g.status === "approved",
  ).length;
  const totalReplies = discussions.reduce((n, d) => n + d.replies, 0);

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "discussions", label: "Discussions", count: discussions.length },
    { id: "groups", label: "Groups", count: allGroups.length },
    { id: "pending", label: "Pending", count: pendingGroups.length },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────

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
    if (
      panelTarget &&
      ((panelTarget.type === "discussion" && panelTarget.item._id === id) ||
        (panelTarget.type !== "discussion" && panelTarget.item._id === id))
    )
      setPanelTarget(null);

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

  // Sync panel item when store updates (e.g. after approve/reject)
  useEffect(() => {
    if (!panelTarget) return;
    if (panelTarget.type === "group") {
      const updated = allGroups.find((g) => g._id === panelTarget.item._id);
      if (updated) setPanelTarget({ type: "group", item: updated });
    }
    if (panelTarget.type === "pending") {
      const updated = pendingGroups.find((g) => g._id === panelTarget.item._id);
      if (!updated) setPanelTarget(null); // removed after approve/reject
    }
  }, [allGroups, pendingGroups]);

  const handleReplyDeleted = useCallback(
    (discussionId: string, replyId: string) => {
      useCommunityStore.setState((state) => ({
        repliesByDiscussion: {
          ...state.repliesByDiscussion,
          [discussionId]: (
            state.repliesByDiscussion[discussionId] ?? []
          ).filter((r) => r._id !== replyId),
        },
        discussions: state.discussions.map((d) =>
          d._id === discussionId
            ? { ...d, replies: Math.max(0, d.replies - 1) }
            : d,
        ),
      }));
    },
    [],
  );

  const handleMessageDeleted = useCallback((groupId: string, msgId: string) => {
    useCommunityStore.setState((state) => ({
      messagesByGroup: {
        ...state.messagesByGroup,
        [groupId]: (state.messagesByGroup[groupId] ?? []).filter(
          (m) => m._id !== msgId,
        ),
      },
    }));
  }, []);

  // ── Panel title ────────────────────────────────────────────────────────────
  const panelTitle = panelTarget
    ? panelTarget.type === "discussion"
      ? panelTarget.item.title
      : panelTarget.item.name
    : "";

  const panelOpen = panelTarget !== null;
  const selectedId = panelTarget?.item._id ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────
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
          <LuRefreshCw className="h-4 w-4" />
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

      {/* Main layout */}
      <div className="flex gap-4 items-start">
        {/* List panel — always full width, drawer overlays */}
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tab bar */}
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
                  selectedId={selectedId}
                  onSelect={(d) =>
                    setPanelTarget({ type: "discussion", item: d })
                  }
                  onDelete={(id) =>
                    setDeleteTarget({
                      type: "discussion",
                      id,
                      label: "discussion",
                    })
                  }
                />
              )}
              {activeTab === "groups" && (
                <GroupsTab
                  groups={allGroups}
                  loading={isAllGroupsLoading}
                  selectedId={selectedId}
                  onSelect={(g) => setPanelTarget({ type: "group", item: g })}
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
                  selectedId={selectedId}
                  onSelect={(g) => setPanelTarget({ type: "pending", item: g })}
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
      </div>

      {/* Fixed viewport-edge detail drawer */}
      <DetailPanel
        open={panelOpen}
        onClose={() => setPanelTarget(null)}
        title={panelTitle}
        subtitle={
          panelTarget?.type === "discussion"
            ? `by ${panelTarget.item.author} · ${formatDate(panelTarget.item.createdAt)}`
            : panelTarget?.type === "group" || panelTarget?.type === "pending"
              ? `${panelTarget.item.memberCount} member${panelTarget.item.memberCount !== 1 ? "s" : ""} · ${formatDate(panelTarget.item.createdAt)}`
              : undefined
        }
        footer={
          panelTarget?.type === "pending" ? (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  if (!accessToken || !panelTarget) return;
                  try {
                    await approveGroup(panelTarget.item._id, accessToken);
                    toast("Group approved.", "success");
                  } catch {
                    toast("Failed to approve group.", "error");
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
              >
                <LuCheck className="h-4 w-4" /> Approve
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!accessToken || !panelTarget) return;
                  try {
                    await rejectGroup(panelTarget.item._id, accessToken);
                    toast("Group rejected.", "info");
                  } catch {
                    toast("Failed to reject group.", "error");
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              >
                <LuX className="h-4 w-4" /> Reject
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPanelTarget(null)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          )
        }
      >
        {panelTarget?.type === "discussion" && accessToken && (
          <DiscussionDetail
            discussion={panelTarget.item}
            accessToken={accessToken}
            onReplyDeleted={handleReplyDeleted}
          />
        )}
        {panelTarget?.type === "group" && accessToken && (
          <GroupDetail
            group={panelTarget.item}
            accessToken={accessToken}
            onMessageDeleted={handleMessageDeleted}
          />
        )}
        {panelTarget?.type === "pending" && (
          <PendingGroupDetail
            group={panelTarget.item}
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
      </DetailPanel>

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
