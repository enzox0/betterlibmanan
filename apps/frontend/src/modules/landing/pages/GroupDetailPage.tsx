import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaUsers,
  FaLock,
  FaPaperPlane,
  FaSpinner,
  FaShieldAlt,
  FaCalendarAlt,
  FaUserCircle,
  FaInfoCircle,
  FaTimes,
  FaSmile,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import SafeImage from "../components/ui/SafeImage";
import type { CommunityGroup } from "@/modules/admin/services/community.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  author: string;
  initials: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

interface MockMember {
  id: string;
  name: string;
  initials: string;
  role: "admin" | "member";
  joinedLabel: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Build a stable but deterministic mock member list from a group */
function buildMockMembers(group: CommunityGroup): MockMember[] {
  const seed = group._id.charCodeAt(0) % 5;
  const names = [
    "Maria Santos",
    "Juan dela Cruz",
    "Ana Reyes",
    "Carlos Bautista",
    "Liza Gonzales",
    "Ramon Flores",
    "Teresa Villanueva",
    "Miguel Torres",
  ];
  const count = Math.min(group.memberCount, 8);
  const picked = [...names].sort(
    (a, b) => (a.charCodeAt(seed) % 7) - (b.charCodeAt(seed) % 7),
  );
  return picked.slice(0, count).map((name, i) => ({
    id: `${group._id}-member-${i}`,
    name,
    initials: getInitials(name),
    role: i === 0 ? "admin" : "member",
    joinedLabel: i === 0 ? "Founder" : `Member`,
  }));
}

/** Seed welcome messages for a group */
function buildSeedMessages(group: CommunityGroup): ChatMessage[] {
  const admin = buildMockMembers(group)[0];
  return [
    {
      id: "seed-1",
      author: admin?.name ?? "Admin",
      initials: admin?.initials ?? "AD",
      text: `Welcome to ${group.name}! This is a space to connect, share ideas, and grow together. Feel free to introduce yourself! 👋`,
      timestamp: new Date(group.createdAt),
      isOwn: false,
    },
    {
      id: "seed-2",
      author: "Community Bot",
      initials: "CB",
      text: `📌 Reminder: Keep discussions respectful and relevant to the group's purpose. Happy connecting!`,
      timestamp: new Date(
        new Date(group.createdAt).getTime() + 2 * 60 * 1000,
      ),
      isOwn: false,
    },
  ];
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = "md",
  color = "neutral",
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "neutral" | "dark";
}) {
  const sizes = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-16 h-16 text-xl",
  };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        color === "dark"
          ? "bg-neutral-900 text-white"
          : "bg-neutral-200 text-neutral-700",
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: ChatMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-2.5 items-end",
        msg.isOwn ? "flex-row-reverse" : "flex-row",
      )}
    >
      {!msg.isOwn && (
        <Avatar initials={msg.initials} size="sm" />
      )}
      <div className={cn("flex flex-col gap-0.5 max-w-[75%]", msg.isOwn && "items-end")}>
        {!msg.isOwn && (
          <span className="text-[11px] font-semibold text-neutral-500 px-1">
            {msg.author}
          </span>
        )}
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
            msg.isOwn
              ? "bg-neutral-900 text-white rounded-br-sm"
              : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm",
          )}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-neutral-400 px-1">
          {formatTime(msg.timestamp)}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────

function GroupInfoSidebar({
  group,
  members,
  isJoined,
  onJoin,
  isGuest,
  onClose,
}: {
  group: CommunityGroup;
  members: MockMember[];
  isJoined: boolean;
  onJoin: () => void;
  isGuest: boolean;
  onClose?: () => void;
}) {
  const admin = members.find((m) => m.role === "admin");
  const regularMembers = members.filter((m) => m.role === "member");

  const memberLabel =
    group.memberCount >= 1000
      ? `${(group.memberCount / 1000).toFixed(1)}k`
      : String(group.memberCount);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Mobile close */}
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

      <div className="p-5 flex flex-col gap-6">
        {/* Group avatar + name */}
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
              <FaUsers size={9} />
              {memberLabel} members
            </p>
          </div>

          {/* Join / Leave button */}
          {isGuest ? (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className="w-full py-2 rounded-xl bg-neutral-200 text-neutral-500 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-neutral-300 transition-colors"
            >
              <FaLock size={10} />
              Join Group
            </button>
          ) : (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className={cn(
                "w-full py-2 rounded-xl text-sm font-semibold transition-colors",
                isJoined
                  ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  : "bg-neutral-900 text-white hover:bg-neutral-700 active:bg-black",
              )}
            >
              {isJoined ? "✓ Joined" : "Join Group"}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* Description */}
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

        {/* Created */}
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <FaCalendarAlt size={10} />
          <span>Created {formatDate(group.createdAt)}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* Admin */}
        {admin && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FaShieldAlt size={11} className="text-neutral-400" />
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Avatar initials={admin.initials} size="md" color="dark" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">
                  {admin.name}
                </p>
                <p className="text-xs text-neutral-400">{admin.joinedLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-neutral-100" />

        {/* Members */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FaUserCircle size={11} className="text-neutral-400" />
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Members
            </span>
            <span className="ml-auto text-xs text-neutral-400 font-medium">
              {memberLabel}
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {regularMembers.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <Avatar initials={m.initials} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">
                    {m.name}
                  </p>
                  <p className="text-xs text-neutral-400">{m.joinedLabel}</p>
                </div>
              </div>
            ))}
            {group.memberCount > regularMembers.length + 1 && (
              <p className="text-xs text-neutral-400 pl-1 mt-0.5">
                +{group.memberCount - regularMembers.length - 1} more members
              </p>
            )}
          </div>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll the chat container to the top on mount
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  }, []);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const displayName = currentUser?.displayName ?? "You";

  const groups = useCommunityStore((s) => s.groups);
  const isGroupsLoading = useCommunityStore((s) => s.isGroupsLoading);
  const fetchGroups = useCommunityStore((s) => s.fetchGroups);
  const joinGroup = useCommunityStore((s) => s.joinGroup);
  const leaveGroup = useCommunityStore((s) => s.leaveGroup);

  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Track whether messages were seeded on load vs. a new send
  const isInitialLoad = useRef(true);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  // Resolve group from store
  useEffect(() => {
    if (groups.length === 0) {
      fetchGroups().catch(() => toast("Failed to load groups.", "error"));
    }
  }, [fetchGroups, groups.length]);

  useEffect(() => {
    const found = groups.find((g) => g._id === id);
    if (found) {
      setGroup(found);
      setMessages(buildSeedMessages(found));
      isInitialLoad.current = true;
    }
  }, [groups, id]);

  // Auto-scroll to latest message only when the user sends a new one
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleToggleJoin = async () => {
    if (!group) return;
    const wasJoined = isJoined;
    setIsJoined(!wasJoined);
    try {
      if (wasJoined) {
        await leaveGroup(group._id);
        toast(`Left "${group.name}"`, "info");
      } else {
        await joinGroup(group._id);
        toast(`Joined "${group.name}"!`, "success");
      }
    } catch {
      setIsJoined(wasJoined);
      toast("Failed to update membership.", "error");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !group) return;
    setSending(true);
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      author: displayName,
      initials: getInitials(displayName),
      text: input.trim(),
      timestamp: new Date(),
      isOwn: true,
    };
    setInput("");
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));
    setMessages((prev) => [...prev, newMsg]);
    setSending(false);
  };

  // Loading state
  if (isGroupsLoading || (!group && groups.length === 0)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

  // Not found
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

  const members = buildMockMembers(group);

  return (
    <div className="flex flex-col flex-1 bg-neutral-50 overflow-hidden" style={{ minHeight: 0 }}>
      {/* ── Top bar ── */}
      <div className="bg-white border-b border-neutral-200 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/community")}
            style={{ minHeight: 0 }}
            className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
            aria-label="Back to Community"
          >
            <FaArrowLeft size={14} />
          </button>

          {/* Group avatar + info */}
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

          {/* Info toggle (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ minHeight: 0 }}
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors text-neutral-500 shrink-0 lg:hidden"
            aria-label="Group info"
          >
            <FaInfoCircle size={15} />
          </button>
        </div>
      </div>

      {/* ── Main layout: chat + sidebar ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Chat panel ── */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Guest banner */}
          {!isAuthenticated && (
            <div className="shrink-0 px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
              <FaLock size={11} className="text-blue-400 shrink-0" />
              <p className="text-xs text-blue-600 flex-1">
                You're browsing as a guest.{" "}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="font-semibold underline"
                >
                  Sign in
                </button>{" "}
                to send messages.
              </p>
            </div>
          )}

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} msg={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="shrink-0 border-t border-neutral-200 bg-white px-4 py-3">
            {isAuthenticated ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2"
              >
                <Avatar
                  initials={getInitials(displayName)}
                  size="sm"
                  color="dark"
                />
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Message ${group.name}…`}
                    rows={1}
                    style={{ fontSize: "16px" }}
                    className="w-full px-4 py-2.5 pr-10 rounded-2xl bg-neutral-100 border border-neutral-200 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed"
                  />
                  <button
                    type="button"
                    style={{ minHeight: 0 }}
                    className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label="Emoji"
                  >
                    <FaSmile size={14} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  style={{ minHeight: 0 }}
                  className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white transition-colors disabled:opacity-40 shrink-0"
                  aria-label="Send"
                >
                  {sending ? (
                    <FaSpinner className="animate-spin" size={13} />
                  ) : (
                    <FaPaperPlane size={13} />
                  )}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-2.5 rounded-2xl bg-neutral-100 border border-neutral-200 text-sm text-neutral-400 font-medium flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
              >
                <FaLock size={11} />
                Sign in to participate
              </button>
            )}
          </div>
        </div>

        {/* ── Right sidebar (desktop) ── */}
        <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 border-l border-neutral-200 bg-white flex-col overflow-hidden">
          <GroupInfoSidebar
            group={group}
            members={members}
            isJoined={isJoined}
            onJoin={() => requireAuth(handleToggleJoin)}
            isGuest={!isAuthenticated}
          />
        </aside>
      </div>

      {/* ── Mobile sidebar drawer ── */}
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
                members={members}
                isJoined={isJoined}
                onJoin={() => requireAuth(handleToggleJoin)}
                isGuest={!isAuthenticated}
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
