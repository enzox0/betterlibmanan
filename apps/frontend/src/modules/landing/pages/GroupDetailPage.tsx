import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaUsers,
  FaLock,
  FaPaperPlane,
  FaSpinner,
  FaCalendarAlt,
  FaInfoCircle,
  FaTimes,
  FaSmile,
  FaReply,
  FaCheckCircle,
  FaChevronRight,
  FaBars,
  FaChevronLeft,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import SafeImage, { getProxiedUrl } from "../components/ui/SafeImage";
import type {
  CommunityGroup,
  GroupMessage,
  GroupMember,
} from "@/modules/admin/services/community.api";

// ─── Constants ────────────────────────────────────────────────────────────────

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Time divider ────────────────────────────────────────────────────────────

function TimeDivider({ date }: { date: Date | string }) {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
    ).toDateString() === d.toDateString();

  const label = isToday
    ? `Today at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : isYesterday
      ? `Yesterday at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : d.toLocaleDateString("en-PH", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }) +
        ` at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <div className="flex items-center gap-3 py-1 select-none">
      <div className="flex-1 h-px bg-neutral-200" />
      <span className="text-[10px] font-medium text-neutral-400 whitespace-nowrap px-1">
        {label}
      </span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

// ─── Reaction bar ─────────────────────────────────────────────────────────────

function ReactionBar({
  msg,
  currentUserId,
  onReact,
}: {
  msg: GroupMessage;
  currentUserId: string | null;
  onReact: (emoji: string) => void;
}) {
  // reactions is Record<string, string[]> from the API
  const entries = Object.entries(msg.reactions ?? {}).filter(
    ([, users]) => users.length > 0,
  );
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {entries.map(([emoji, users]) => {
        const reacted = currentUserId ? users.includes(currentUserId) : false;
        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            style={{ minHeight: 0 }}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
              reacted
                ? "bg-blue-50 border-blue-300 text-blue-700 font-semibold"
                : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50",
            )}
          >
            <span>{emoji}</span>
            <span>{users.length}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Emoji picker portal ──────────────────────────────────────────────────────

function EmojiPickerPortal({
  anchorRect,
  isOwn,
  onPick,
  onClose,
}: {
  anchorRect: DOMRect;
  isOwn: boolean;
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  // Position above the anchor button, aligned to its side
  const PICKER_W = 8 * 36 + 8; // ~6 emojis * 36px + padding
  const top = anchorRect.top - 48;
  const left = isOwn
    ? Math.max(8, anchorRect.right - PICKER_W)
    : anchorRect.left;

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-emoji-picker]")) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      data-emoji-picker
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ duration: 0.12 }}
      style={{ position: "fixed", top, left, zIndex: 9999 }}
      className="bg-white border border-neutral-200 rounded-2xl shadow-xl p-1.5 flex gap-1"
    >
      {REACTION_EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => {
            onPick(e);
            onClose();
          }}
          style={{ minHeight: 0 }}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-neutral-100 text-lg transition-colors"
        >
          {e}
        </button>
      ))}
    </motion.div>,
    document.body,
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────

function ChatBubble({
  msg,
  isOwn,
  currentUserId,
  onReact,
  onReply,
  isAuthenticated,
  onOpenAuth,
}: {
  msg: GroupMessage;
  isOwn: boolean;
  currentUserId: string | null;
  onReact: (msgId: string, emoji: string) => void;
  onReply: (msg: GroupMessage) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}) {
  const [pickerRect, setPickerRect] = useState<DOMRect | null>(null);
  const smileRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      className={cn(
        "flex gap-2.5 items-end group",
        isOwn ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 text-[10px] font-bold shrink-0 overflow-hidden">
          {msg.avatarUrl ? (
            <img
              src={getProxiedUrl(msg.avatarUrl)}
              alt={msg.author}
              className="w-full h-full object-cover"
            />
          ) : (
            msg.avatarInitials
          )}
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-0.5 max-w-[75%]",
          isOwn && "items-end",
        )}
      >
        {!isOwn && (
          <span className="text-[11px] font-semibold text-neutral-500 px-1">
            {msg.author}
          </span>
        )}

        {/* Reply-to preview */}
        {msg.replyToId && msg.replyToAuthor && (
          <div
            className={cn(
              "flex items-start gap-1.5 px-3 py-1.5 rounded-xl border-l-2 text-xs mb-0.5 max-w-full",
              isOwn
                ? "bg-neutral-700 border-neutral-400 text-neutral-300 rounded-br-sm"
                : "bg-neutral-100 border-neutral-400 text-neutral-500 rounded-bl-sm",
            )}
          >
            <FaReply size={9} className="mt-0.5 shrink-0 opacity-60" />
            <div className="min-w-0">
              <span className="font-semibold block truncate">
                {msg.replyToAuthor}
              </span>
              <span className="opacity-75 line-clamp-1">{msg.replyToText}</span>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
            isOwn
              ? "bg-neutral-900 text-white rounded-br-sm"
              : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm",
          )}
        >
          {msg.text}
        </div>

        {/* Reactions */}
        <ReactionBar
          msg={msg}
          currentUserId={currentUserId}
          onReact={(emoji) => {
            if (!isAuthenticated) {
              onOpenAuth();
              return;
            }
            onReact(msg._id, emoji);
          }}
        />

        {/* Timestamp + action buttons */}
        <div
          className={cn(
            "flex items-center gap-2 px-1 mt-0.5",
            isOwn ? "flex-row-reverse" : "flex-row",
          )}
        >
          <span className="text-[10px] text-neutral-400">
            {formatTime(msg.createdAt)}
          </span>

          {/* Action buttons — visible on hover */}
          <div
            className={cn(
              "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
              isOwn ? "flex-row-reverse" : "flex-row",
            )}
          >
            {/* React button */}
            <button
              ref={smileRef}
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth();
                  return;
                }
                const rect = smileRef.current?.getBoundingClientRect();
                setPickerRect((prev) => (prev ? null : (rect ?? null)));
              }}
              style={{ minHeight: 0 }}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="React"
            >
              <FaSmile size={11} />
            </button>

            {/* Reply button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth();
                  return;
                }
                onReply(msg);
              }}
              style={{ minHeight: 0 }}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
              aria-label="Reply"
            >
              <FaReply size={11} />
            </button>
          </div>
        </div>
      </div>

      {/* Emoji picker portal — rendered outside scroll container */}
      <AnimatePresence>
        {pickerRect && (
          <EmojiPickerPortal
            anchorRect={pickerRect}
            isOwn={isOwn}
            onPick={(e) => {
              onReact(msg._id, e);
              setPickerRect(null);
            }}
            onClose={() => setPickerRect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Joined Groups Panel ─────────────────────────────────────────────────────

const LEFT_PANEL_FULL = 220;
const LEFT_PANEL_RAIL = 52;

function JoinedGroupsPanel({
  groups,
  joinedGroupIds,
  currentGroupId,
  collapsed,
  onToggle,
}: {
  groups: CommunityGroup[];
  joinedGroupIds: string[];
  currentGroupId: string | undefined;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();

  // Founder-created groups are joined implicitly — include all where user is a member
  const myGroups = groups.filter((g) => joinedGroupIds.includes(g._id));

  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? LEFT_PANEL_RAIL : LEFT_PANEL_FULL }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex shrink-0 border-r border-neutral-200 bg-white flex-col overflow-hidden relative"
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center border-b border-neutral-100 shrink-0 h-11",
          collapsed ? "justify-center px-0" : "justify-between px-3",
        )}
      >
        {!collapsed && (
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap overflow-hidden">
            My Groups
          </span>
        )}
        <button
          onClick={onToggle}
          style={{ minHeight: 0 }}
          aria-label={
            collapsed ? "Expand groups panel" : "Collapse groups panel"
          }
          className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center"
          >
            <FaChevronLeft size={10} />
          </motion.span>
        </button>
      </div>

      {/* Group list */}
      <div className="flex-1 overflow-y-auto py-2">
        {myGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
            <FaUsers size={18} className="text-neutral-300" />
            {!collapsed && (
              <p className="text-[11px] text-neutral-400 leading-snug px-3">
                You haven't joined any groups yet.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 px-1.5">
            {myGroups.map((g) => {
              const isActive = g._id === currentGroupId;
              const initials = g.name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <button
                  key={g._id}
                  onClick={() => navigate(`/community/groups/${g._id}`)}
                  style={{ minHeight: 0 }}
                  title={g.name}
                  className={cn(
                    "flex items-center w-full rounded-xl transition-colors text-left",
                    collapsed
                      ? "justify-center px-0 py-2"
                      : "gap-2.5 px-2 py-2",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-700 hover:bg-neutral-100",
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg shrink-0 overflow-hidden flex items-center justify-center text-[10px] font-bold",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-neutral-200 text-neutral-600",
                    )}
                  >
                    {g.imageUrl ? (
                      <img
                        src={getProxiedUrl(g.imageUrl)}
                        alt={g.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {/* Label — hidden when collapsed */}
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-xs font-semibold truncate leading-tight",
                          isActive ? "text-white" : "text-neutral-800",
                        )}
                      >
                        {g.name}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] truncate",
                          isActive ? "text-white/60" : "text-neutral-400",
                        )}
                      >
                        {g.memberCount} member{g.memberCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Group Info Sidebar ───────────────────────────────────────────────────────

function MembersSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neutral-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-1">
            <div className="h-2.5 bg-neutral-200 rounded w-3/5" />
            <div className="h-2 bg-neutral-100 rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupInfoSidebar({
  group,
  isJoined,
  isFounder,
  onJoin,
  onLeave,
  isGuest,
  members,
  isMembersLoading,
  onClose,
}: {
  group: CommunityGroup;
  isJoined: boolean;
  isFounder: boolean;
  onJoin: () => void;
  onLeave: () => void;
  isGuest: boolean;
  members: GroupMember[];
  isMembersLoading?: boolean;
  onClose?: () => void;
}) {
  const memberLabel =
    group.memberCount >= 1000
      ? `${(group.memberCount / 1000).toFixed(1)}k`
      : String(group.memberCount);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 lg:hidden">
          <span className="text-sm font-bold text-neutral-700">Group Info</span>
          <button
            onClick={onClose}
            style={{ minHeight: 0 }}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400"
          >
            <FaTimes size={13} />
          </button>
        </div>
      )}

      <div className="p-5 flex flex-col gap-5">
        {/* Cover + name */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-2xl bg-neutral-100 flex items-center justify-center border border-neutral-200 overflow-hidden">
            {group.imageUrl ? (
              <SafeImage
                src={group.imageUrl}
                alt={group.name}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            ) : (
              <FaUsers size={32} className="text-neutral-400" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-neutral-900 text-base leading-snug">
              {group.name}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center justify-center gap-1">
              <FaUsers size={9} /> {memberLabel} members
            </p>
          </div>

          {/* Join / Leave / Already joined */}
          {isGuest ? (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className="w-full py-2 rounded-xl bg-neutral-200 text-neutral-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-300 transition-colors"
            >
              <FaLock size={10} /> Join Group
            </button>
          ) : isFounder ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
              <FaUsers size={12} /> Founder
            </div>
          ) : isJoined ? (
            <div className="w-full flex flex-col gap-2">
              <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-semibold">
                <FaCheckCircle size={12} /> Joined
              </div>
              <button
                onClick={onLeave}
                style={{ minHeight: 0 }}
                className="w-full py-1.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                Leave group
              </button>
            </div>
          ) : (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className="w-full py-2 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 active:bg-black transition-colors"
            >
              Join Group
            </button>
          )}
        </div>

        <div className="h-px bg-neutral-100" />

        {/* About */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FaInfoCircle size={11} className="text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              About
            </span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {group.description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <FaCalendarAlt size={10} />
          <span>Created {formatDate(group.createdAt)}</span>
        </div>

        <div className="h-px bg-neutral-100" />

        {/* Members list */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaUsers size={11} className="text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Members
            </span>
            <span className="ml-auto text-xs text-neutral-400 font-medium">
              {memberLabel}
            </span>
          </div>

          {isMembersLoading ? (
            <MembersSkeleton />
          ) : members.length === 0 ? (
            <p className="text-xs text-neutral-400">
              No members yet. Be the first to join!
            </p>
          ) : (
            <div className="overflow-y-auto max-h-64 flex flex-col gap-2.5 pr-1 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
              {members.map((member, i) => {
                const name = member.displayName || "Unknown Member";
                return (
                  <div
                    key={member.userId ?? i}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 text-[10px] font-bold shrink-0 overflow-hidden">
                      {member.avatarUrl ? (
                        <img
                          src={getProxiedUrl(member.avatarUrl)}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.avatarInitials || getInitials(name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-800 font-semibold truncate">
                        {name}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {i === 0 ? "Founder" : "Member"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Auth ─────────────────────────────────────────────────────────────────────
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const userToken = useUserStore((s) => s.token);
  const displayName = currentUser?.displayName ?? "Anonymous";
  const userId = currentUser?._id ?? null;

  // ── Store ─────────────────────────────────────────────────────────────────────
  const groups = useCommunityStore((s) => s.groups);
  const isGroupsLoading = useCommunityStore((s) => s.isGroupsLoading);
  const fetchGroups = useCommunityStore((s) => s.fetchGroups);
  const joinGroup = useCommunityStore((s) => s.joinGroup);
  const leaveGroup = useCommunityStore((s) => s.leaveGroup);
  const joinedGroupIds = useCommunityStore((s) => s.joinedGroupIds);

  const messagesByGroup = useCommunityStore((s) => s.messagesByGroup);
  const isMessagesLoading = useCommunityStore((s) => s.isMessagesLoading);
  const fetchGroupMessages = useCommunityStore((s) => s.fetchGroupMessages);
  const sendGroupMessage = useCommunityStore((s) => s.sendGroupMessage);
  const reactToGroupMessage = useCommunityStore((s) => s.reactToGroupMessage);

  const membersByGroup = useCommunityStore((s) => s.membersByGroup);
  const isMembersLoading = useCommunityStore((s) => s.isMembersLoading);
  const fetchGroupMembers = useCommunityStore((s) => s.fetchGroupMembers);

  // ── Local state ───────────────────────────────────────────────────────────────
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null);
  const isInitialLoad = useRef(true);

  // Auto-collapse left panel on narrower lg screens
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const handler = (e: MediaQueryListEvent) =>
      setLeftPanelCollapsed(!e.matches);
    setLeftPanelCollapsed(!mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  // Resolve group
  useEffect(() => {
    if (groups.length === 0)
      fetchGroups().catch(() => toast("Failed to load groups.", "error"));
  }, [fetchGroups, groups.length]);

  useEffect(() => {
    const found = groups.find((g) => g._id === id);
    if (found) {
      setGroup(found);
      isInitialLoad.current = true;
    }
  }, [groups, id]);

  // Fetch messages + members
  useEffect(() => {
    if (!id) return;
    fetchGroupMessages(id).catch(() => {});
    fetchGroupMembers(id).catch(() => {});
  }, [id, fetchGroupMessages, fetchGroupMembers]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isInitialLoad.current) {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      isInitialLoad.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByGroup]);

  const messages: GroupMessage[] = id ? (messagesByGroup[id] ?? []) : [];
  const members: GroupMember[] = id ? (membersByGroup[id] ?? []) : [];
  const isJoined = id ? joinedGroupIds.includes(id) : false;
  // Treat the first member as the founder; founders are automatically considered members
  const isFounder =
    !!userId && members.length > 0 && members[0].userId === userId;
  const isMember = isFounder || isJoined;

  const handleJoin = async () => {
    if (!userToken) {
      setAuthModalOpen(true);
      return;
    }
    if (!group) return;
    try {
      await joinGroup(group._id, userToken, displayName);
      fetchGroupMembers(group._id).catch(() => {});
      toast(`Joined "${group.name}"!`, "success");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "";
      if (msg === "Already a member") {
        toast("You're already a member of this group.", "info");
      } else {
        toast("Failed to join group.", "error");
      }
    }
  };

  const handleLeave = async () => {
    if (!userToken || !group) return;
    try {
      await leaveGroup(group._id, userToken);
      fetchGroupMembers(group._id).catch(() => {});
      toast(`Left "${group.name}"`, "info");
    } catch {
      toast("Failed to leave group.", "error");
    }
  };

  const handleReact = async (msgId: string, emoji: string) => {
    if (!userToken || !id) return;
    try {
      await reactToGroupMessage(id, msgId, emoji, userToken);
    } catch {
      toast("Failed to react.", "error");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !group || !userToken) return;
    setSending(true);
    const text = input.trim();
    const rTo = replyingTo;
    setInput("");
    setReplyingTo(null);
    try {
      await sendGroupMessage(
        group._id,
        {
          author: displayName,
          text,
          replyToId: rTo?._id,
          avatarUrl: currentUser?.avatarUrl ?? "",
        },
        userToken,
      );
    } catch {
      toast("Failed to send message.", "error");
      setInput(text);
      setReplyingTo(rTo);
    } finally {
      setSending(false);
    }
  };

  const handleSetReply = (msg: GroupMessage) => {
    setReplyingTo(msg);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (isGroupsLoading || (!group && groups.length === 0)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <FaUsers size={36} className="text-neutral-300" />
        <p className="text-neutral-500 font-semibold">Group not found.</p>
        <button
          onClick={() => navigate("/community")}
          className="text-sm text-blue-600 underline"
        >
          Back to Community
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col bg-neutral-50 overflow-hidden"
      style={{ height: "100dvh", minHeight: 0 }}
    >
      {/* Top bar */}
      <div className="bg-white border-b border-neutral-200 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/community")}
            style={{ minHeight: 0 }}
            className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
            aria-label="Back"
          >
            <FaArrowLeft size={14} />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 overflow-hidden">
              {group.imageUrl ? (
                <SafeImage
                  src={group.imageUrl}
                  alt={group.name}
                  className="w-full h-full object-cover"
                  containerClassName="w-full h-full"
                />
              ) : (
                <FaUsers size={16} className="text-neutral-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold text-neutral-900 truncate leading-tight">
                {group.name}
              </h1>
              <p className="text-xs text-neutral-400">
                {group.memberCount.toLocaleString()} members
              </p>
            </div>
          </div>
          {/* Mobile: open drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ minHeight: 0 }}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 shrink-0 lg:hidden"
            aria-label="Group info"
          >
            <FaBars size={15} />
          </button>
          {/* Desktop: toggle sidebar collapse */}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            style={{ minHeight: 0 }}
            className="hidden lg:flex p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 shrink-0"
            aria-label={
              sidebarCollapsed ? "Show group info" : "Hide group info"
            }
          >
            <FaBars size={15} />
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel — joined groups */}
        <JoinedGroupsPanel
          groups={groups}
          joinedGroupIds={joinedGroupIds}
          currentGroupId={id}
          collapsed={leftPanelCollapsed}
          onToggle={() => setLeftPanelCollapsed((v) => !v)}
        />

        {/* Chat panel */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* ── Join gate: shown to unauthenticated users OR authenticated non-members ── */}
          {!isAuthenticated || !isMember ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center overflow-hidden">
                {group.imageUrl ? (
                  <SafeImage
                    src={group.imageUrl}
                    alt={group.name}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                ) : (
                  <FaUsers size={28} className="text-neutral-400" />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-base font-bold text-neutral-900">
                  {group.name}
                </h2>
                <p className="text-sm text-neutral-500 max-w-xs leading-relaxed">
                  {group.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <FaUsers size={10} />
                <span>{group.memberCount.toLocaleString()} members</span>
              </div>
              <div className="h-px w-16 bg-neutral-200" />
              <div className="flex flex-col gap-2 items-center">
                <p className="text-sm text-neutral-500 font-medium">
                  {isAuthenticated
                    ? "Join this group to view messages and participate."
                    : "Sign in and join this group to participate."}
                </p>
                {isAuthenticated ? (
                  <button
                    onClick={handleJoin}
                    style={{ minHeight: 0 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    <FaUsers size={12} />
                    Join Group
                  </button>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    style={{ minHeight: 0 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    <FaLock size={12} />
                    Sign In to Join
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
              >
                {isMessagesLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <FaSpinner
                      className="animate-spin text-neutral-400"
                      size={20}
                    />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 gap-3 text-neutral-400 py-12">
                    <FaUsers size={28} className="opacity-40" />
                    <p className="text-sm font-medium text-center">
                      No messages yet. Be the first to say hello!
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const prev = messages[i - 1];
                    const showDivider =
                      i === 0 ||
                      (prev &&
                        new Date(msg.createdAt).getTime() -
                          new Date(prev.createdAt).getTime() >=
                          10 * 60 * 1000);
                    return (
                      <div key={msg._id} className="flex flex-col gap-4">
                        {showDivider && <TimeDivider date={msg.createdAt} />}
                        <ChatBubble
                          msg={msg}
                          isOwn={msg.author === displayName}
                          currentUserId={userId}
                          onReact={handleReact}
                          onReply={handleSetReply}
                          isAuthenticated={isAuthenticated}
                          onOpenAuth={() => setAuthModalOpen(true)}
                        />
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="shrink-0 border-t border-neutral-200 bg-white">
                {/* Reply-to context banner */}
                <AnimatePresence>
                  {replyingTo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-3 px-4 py-2 bg-neutral-50 border-b border-neutral-200 overflow-hidden"
                    >
                      <FaReply
                        size={11}
                        className="text-neutral-400 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-neutral-700">
                          {replyingTo.author}
                        </span>
                        <p className="text-xs text-neutral-400 truncate">
                          {replyingTo.text}
                        </p>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        style={{ minHeight: 0 }}
                        className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 transition-colors shrink-0"
                        aria-label="Cancel reply"
                      >
                        <FaTimes size={11} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-4 py-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
                      {currentUser?.avatarUrl ? (
                        <img
                          src={getProxiedUrl(currentUser.avatarUrl)}
                          alt={displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-100 border border-neutral-200 focus-within:border-neutral-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-neutral-900/5 transition-all">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                          if (e.key === "Escape") setReplyingTo(null);
                        }}
                        placeholder={
                          replyingTo
                            ? `Reply to ${replyingTo.author}…`
                            : `Message ${group.name}…`
                        }
                        rows={1}
                        style={{ fontSize: "16px" }}
                        className="flex-1 bg-transparent outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 leading-relaxed self-center"
                      />
                      <button
                        type="button"
                        style={{ minHeight: 0 }}
                        className="shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Emoji"
                      >
                        <FaSmile size={15} />
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || sending}
                      style={{ minHeight: 0 }}
                      className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                      {sending ? (
                        <FaSpinner className="animate-spin" size={12} />
                      ) : (
                        <FaPaperPlane size={12} />
                      )}
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right sidebar (desktop) — collapsible */}
        <div className="hidden lg:flex shrink-0 relative">
          {/* Toggle tab — always visible, sits outside the animated panel */}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            style={{ minHeight: 0 }}
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-colors"
          >
            <motion.span
              animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              <FaChevronRight size={9} />
            </motion.span>
          </button>

          <motion.aside
            initial={false}
            animate={{ width: sidebarCollapsed ? 0 : 288 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="xl:w-80 shrink-0 border-l border-neutral-200 bg-white flex flex-col overflow-hidden"
          >
            <div className="w-72 xl:w-80 flex flex-col h-full overflow-hidden">
              <GroupInfoSidebar
                group={group}
                isJoined={isMember}
                isFounder={isFounder}
                onJoin={() => requireAuth(handleJoin)}
                onLeave={handleLeave}
                isGuest={!isAuthenticated}
                members={members}
                isMembersLoading={isMembersLoading}
              />
            </div>
          </motion.aside>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[160] w-[85vw] max-w-sm bg-white border-l border-neutral-200 overflow-hidden flex flex-col lg:hidden"
            >
              <GroupInfoSidebar
                group={group}
                isJoined={isMember}
                isFounder={isFounder}
                onJoin={() => {
                  setSidebarOpen(false);
                  requireAuth(handleJoin);
                }}
                onLeave={() => {
                  setSidebarOpen(false);
                  handleLeave();
                }}
                isGuest={!isAuthenticated}
                members={members}
                isMembersLoading={isMembersLoading}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}

GroupDetailPage.displayName = "GroupDetailPage";

export default GroupDetailPage;
