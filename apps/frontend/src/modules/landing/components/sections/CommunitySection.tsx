import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaPlus,
  FaTimes,
  FaComment,
  FaHashtag,
  FaUserPlus,
  FaFire,
  FaCalendarAlt,
  FaClock,
  FaChevronRight,
  FaSpinner,
  FaLock,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../ui/UserAuthModal";
import type {
  Discussion,
  CommunityGroup,
  FeaturedEvent,
  ProposeGroupPayload,
} from "@/modules/admin/services/community.api";

// ─── Static sidebar data ──────────────────────────────────────────────────────

const TRENDING_TAGS = [
  { id: "1", label: "CivicEngagement" },
  { id: "2", label: "CleanCommunity" },
  { id: "3", label: "LocalGovWatch" },
  { id: "4", label: "PublicServices" },
  { id: "5", label: "YouthLeaders" },
  { id: "6", label: "Agriculture" },
  { id: "7", label: "BusinessTips" },
  { id: "8", label: "HealthAwareness" },
];

const PEOPLE_TO_FOLLOW = [
  { id: "1", name: "CivicAdvocate", role: "Community Organizer" },
  { id: "2", name: "LocalFarmer", role: "Agri Advocate" },
  { id: "3", name: "BizConnect", role: "Livelihood Officer" },
  { id: "4", name: "YouthCouncil", role: "Youth Leader" },
  { id: "5", name: "HealthDesk", role: "Health Officer" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function Avatar({
  initials,
  size = "md",
}: {
  initials: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center bg-neutral-200 text-neutral-700 font-bold shrink-0",
        size === "sm" ? "w-7 h-7 text-[10px]" : "w-8 h-8 text-xs",
      )}
    >
      {initials}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{ minHeight: 0 }}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          {actionLabel}
          <FaChevronRight size={9} />
        </button>
      )}
    </div>
  );
}

function LoadingRows({ count = 2 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl bg-neutral-200 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Discussion card ──────────────────────────────────────────────────────────

function DiscussionCard({
  discussion,
  index,
}: {
  discussion: Discussion;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar initials={discussion.avatarInitials} size="sm" />
        <span className="text-xs font-semibold text-neutral-600">
          {discussion.author}
        </span>
        {discussion.isPinned && (
          <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Pinned
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-3">
        {discussion.title}
      </p>
      <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
        <FaComment size={10} />
        <span>
          {discussion.replies} {discussion.replies === 1 ? "reply" : "replies"}
        </span>
      </div>
      {discussion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {discussion.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-neutral-100 text-neutral-600"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Group card ───────────────────────────────────────────────────────────────

function GroupCard({
  group,
  index,
  isJoined,
  onJoin,
  isGuest,
}: {
  group: CommunityGroup;
  index: number;
  isJoined: boolean;
  onJoin: () => void;
  isGuest: boolean;
}) {
  const memberLabel =
    group.memberCount >= 1000
      ? `${(group.memberCount / 1000).toFixed(1)}k`
      : String(group.memberCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex items-stretch hover:border-neutral-300 hover:shadow-md transition-all"
    >
      <div className="w-24 sm:w-32 shrink-0 bg-neutral-100 flex items-center justify-center">
        <FaUsers size={24} className="text-neutral-300" />
      </div>
      <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 leading-snug">
            {group.name}
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed mt-0.5 line-clamp-2">
            {group.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-neutral-400 text-xs">
            <FaUsers size={10} />
            <span>{memberLabel} members</span>
          </div>
          {isGuest ? (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 bg-neutral-200 text-neutral-500 hover:bg-neutral-300 flex items-center gap-1"
            >
              <FaLock size={9} />
              Join Group
            </button>
          ) : (
            <button
              onClick={onJoin}
              style={{ minHeight: 0 }}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0",
                isJoined
                  ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  : "bg-neutral-900 text-white hover:bg-neutral-700 active:bg-black",
              )}
            >
              {isJoined ? "Joined" : "Join Group"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Featured Event panel ─────────────────────────────────────────────────────

function FeaturedEventPanel({
  event,
  loading,
  onRsvp,
}: {
  event: FeaturedEvent | null;
  loading: boolean;
  onRsvp: () => void;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-gray-900 p-5 min-h-[180px] flex items-center justify-center">
        <FaSpinner className="animate-spin text-gray-600" size={20} />
      </div>
    );
  }

  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-gray-900 p-5 text-white"
    >
      <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
        Featured Event
      </p>
      <h3 className="font-bold text-base leading-snug mb-3">{event.title}</h3>
      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
        <span className="flex items-center gap-1.5">
          <FaCalendarAlt size={10} />
          {event.date}
        </span>
        <span className="flex items-center gap-1.5">
          <FaClock size={10} />
          {event.time}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-4">
        {event.description}
      </p>
      <button
        onClick={onRsvp}
        className="w-full bg-white text-neutral-900 font-semibold text-sm py-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
      >
        {event.ctaLabel || "Reserve a Seat"}
      </button>
    </motion.div>
  );
}

// ─── Add Discussion modal ─────────────────────────────────────────────────────

function AddDiscussionModal({
  open,
  onClose,
  onPost,
  posting,
  displayName,
}: {
  open: boolean;
  onClose: () => void;
  onPost: (title: string, tags: string[]) => Promise<void>;
  posting: boolean;
  displayName: string;
}) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const reset = () => {
    setTitle("");
    setTagInput("");
    setTags([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const addTag = () => {
    const t = tagInput.replace(/\s+/g, "").replace(/^#/, "");
    if (!t) return;
    if (tags.includes(t)) {
      setTagInput("");
      return;
    }
    if (tags.length >= 4) {
      toast("Max 4 tags allowed", "error");
      return;
    }
    setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast("Please enter a discussion title.", "error");
      return;
    }
    await onPost(title.trim(), tags);
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full sm:max-w-md shadow-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <FaComment size={12} className="text-neutral-700" />
                </div>
                <h2 className="text-base font-bold text-neutral-900">
                  Start a Discussion
                </h2>
              </div>
              <button
                onClick={handleClose}
                style={{ minHeight: 0 }}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                aria-label="Close"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Posting as */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs text-neutral-500">
                Posting as{" "}
                <span className="font-semibold text-neutral-800">
                  {displayName}
                </span>
              </p>
            </div>

            <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Discussion Title
            </label>
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind? Ask a question or share a topic..."
              maxLength={200}
              style={{ fontSize: "16px" }}
              className="w-full h-24 p-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed mb-1"
            />
            <p className="text-right text-[11px] text-neutral-400 mb-4">
              {title.length}/200
            </p>

            <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Tags{" "}
              <span className="normal-case font-normal">(optional, max 4)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. LocalGov"
                style={{ fontSize: "16px" }}
                className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
              />
              <button
                onClick={addTag}
                style={{ minHeight: 0 }}
                className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-700"
                  >
                    #{tag}
                    <button
                      onClick={() =>
                        setTags((prev) => prev.filter((t) => t !== tag))
                      }
                      style={{ minHeight: 0 }}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Remove #${tag}`}
                    >
                      <FaTimes size={9} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={posting}
                className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow disabled:opacity-60"
              >
                {posting ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "Post Discussion"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Propose Group modal ──────────────────────────────────────────────────────

function ProposeGroupModal({
  open,
  onClose,
  onPropose,
  proposing,
}: {
  open: boolean;
  onClose: () => void;
  onPropose: (payload: ProposeGroupPayload) => Promise<void>;
  proposing: boolean;
}) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast("Please enter a group name.", "error");
      return;
    }
    if (!description.trim()) {
      toast("Please enter a group description.", "error");
      return;
    }
    await onPropose({ name: name.trim(), description: description.trim() });
    reset();
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full sm:max-w-md shadow-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <FaUsers size={12} className="text-neutral-700" />
                </div>
                <h2 className="text-base font-bold text-neutral-900">
                  Propose a Group
                </h2>
              </div>
              <button
                onClick={handleClose}
                style={{ minHeight: 0 }}
                className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                aria-label="Close"
              >
                <FaTimes size={13} />
              </button>
            </div>

            <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Group Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Local Farmers Circle"
              maxLength={100}
              style={{ fontSize: "16px" }}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all mb-1"
            />
            <p className="text-right text-[11px] text-neutral-400 mb-4">
              {name.length}/100
            </p>

            <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose and goals of this group..."
              maxLength={300}
              style={{ fontSize: "16px" }}
              className="w-full h-24 p-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed mb-1"
            />
            <p className="text-right text-[11px] text-neutral-400 mb-4">
              {description.length}/300
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={proposing}
                className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow disabled:opacity-60"
              >
                {proposing ? (
                  <FaSpinner className="animate-spin mx-auto" />
                ) : (
                  "Submit Proposal"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main exported section ────────────────────────────────────────────────────

export function CommunitySection() {
  const { toast } = useToast();

  // ── User identity ───────────────────────────────────────────────────────────
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const displayName = currentUser?.displayName ?? "Anonymous";

  // ── Auth modal state ────────────────────────────────────────────────────────
  const [authModalOpen, setAuthModalOpen] = useState(false);

  /** Call before any write action. Returns true if the user is logged in,
   *  otherwise opens the auth modal and returns false. */
  const requireAuth = (action: () => void): void => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  // ── Store selectors ─────────────────────────────────────────────────────────
  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);
  const postDiscussion = useCommunityStore((s) => s.postDiscussion);

  const groups = useCommunityStore((s) => s.groups);
  const isGroupsLoading = useCommunityStore((s) => s.isGroupsLoading);
  const fetchGroups = useCommunityStore((s) => s.fetchGroups);
  const joinGroup = useCommunityStore((s) => s.joinGroup);
  const leaveGroup = useCommunityStore((s) => s.leaveGroup);

  const featuredEvent = useCommunityStore((s) => s.featuredEvent);
  const isFeaturedEventLoading = useCommunityStore(
    (s) => s.isFeaturedEventLoading,
  );
  const fetchFeaturedEvent = useCommunityStore((s) => s.fetchFeaturedEvent);
  const rsvpEvent = useCommunityStore((s) => s.rsvpEvent);

  const proposeGroup = useCommunityStore((s) => s.proposeGroup);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [isAddingDiscussion, setIsAddingDiscussion] = useState(false);
  const [posting, setPosting] = useState(false);
  const [isProposingGroup, setIsProposingGroup] = useState(false);
  const [proposing, setProposing] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [followedPeople, setFollowedPeople] = useState<Set<string>>(new Set());

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDiscussions().catch(() =>
      toast("Failed to load discussions.", "error"),
    );
    fetchGroups().catch(() => toast("Failed to load groups.", "error"));
    fetchFeaturedEvent().catch(() => {});
  }, [fetchDiscussions, fetchGroups, fetchFeaturedEvent]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePostDiscussion = async (title: string, tags: string[]) => {
    setPosting(true);
    try {
      await postDiscussion({ author: displayName, title, tags });
      setIsAddingDiscussion(false);
      toast("Discussion posted!", "success");
    } catch {
      toast("Failed to post discussion.", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleToggleGroup = async (group: CommunityGroup) => {
    const isJoined = joinedGroups.has(group._id);
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      isJoined ? next.delete(group._id) : next.add(group._id);
      return next;
    });
    try {
      if (isJoined) {
        await leaveGroup(group._id);
        toast(`Left "${group.name}"`, "info");
      } else {
        await joinGroup(group._id);
        toast(`Joined "${group.name}"`, "success");
      }
    } catch {
      setJoinedGroups((prev) => {
        const next = new Set(prev);
        isJoined ? next.add(group._id) : next.delete(group._id);
        return next;
      });
      toast("Failed to update membership.", "error");
    }
  };

  const handleFollow = (personId: string, name: string) => {
    setFollowedPeople((prev) => {
      const next = new Set(prev);
      if (next.has(personId)) {
        next.delete(personId);
        toast(`Unfollowed @${name}`, "info");
      } else {
        next.add(personId);
        toast(`Following @${name}`, "success");
      }
      return next;
    });
  };

  const handleRsvp = async () => {
    try {
      await rsvpEvent();
      toast("RSVP received! We'll see you there.", "success");
    } catch {
      toast("Could not submit RSVP. Please try again.", "error");
    }
  };

  const handleProposeGroup = async (payload: ProposeGroupPayload) => {
    setProposing(true);
    try {
      await proposeGroup(payload);
      setIsProposingGroup(false);
      toast("Your group proposal has been submitted for review!", "success");
    } catch {
      toast("Failed to submit group proposal.", "error");
    } finally {
      setProposing(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="responsive-container py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="responsive-heading text-neutral-900 leading-tight">
                Community
              </h1>
              <p className="text-sm text-neutral-500">
                Connect, discuss, and grow together
              </p>
            </div>

            {/* New Discussion — gated for guests */}
            <button
              onClick={() => requireAuth(() => setIsAddingDiscussion(true))}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0",
                isAuthenticated
                  ? "bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white"
                  : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300",
              )}
            >
              {isAuthenticated ? <FaPlus size={11} /> : <FaLock size={11} />}
              <span className="hidden sm:inline">New Discussion</span>
            </button>
          </div>

          {/* Guest nudge — only shown to unauthenticated visitors */}
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200"
            >
              <FaLock size={12} className="text-blue-500 shrink-0" />
              <p className="text-sm text-blue-700 flex-1">
                You're browsing as a guest.{" "}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="font-semibold underline underline-offset-2 hover:text-blue-900 transition-colors"
                >
                  Sign in or create an account
                </button>{" "}
                to start discussions, join groups, and more.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content grid */}
      <div className="responsive-container py-10 sm:py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Trending Discussions */}
            <section>
              <SectionHeader
                icon={<FaFire size={13} className="text-neutral-500" />}
                title="Trending Discussions"
                actionLabel="See More"
                onAction={() => toast("More discussions coming soon", "info")}
              />
              {isDiscussionsLoading ? (
                <LoadingRows count={2} />
              ) : discussions.length === 0 ? (
                <p className="text-sm text-neutral-400 py-8 text-center">
                  No discussions yet — be the first to start one!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {discussions.map((d, i) => (
                    <DiscussionCard key={d._id} discussion={d} index={i} />
                  ))}
                </div>
              )}
            </section>

            {/* Peer Groups */}
            <section>
              <SectionHeader
                icon={<FaUsers size={13} className="text-neutral-500" />}
                title="Peer Groups"
                actionLabel={isAuthenticated ? "Propose a Group" : undefined}
                onAction={() => requireAuth(() => setIsProposingGroup(true))}
              />
              {isGroupsLoading ? (
                <LoadingRows count={3} />
              ) : groups.length === 0 ? (
                <p className="text-sm text-neutral-400 py-8 text-center">
                  No groups available yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {groups.map((group, i) => (
                    <GroupCard
                      key={group._id}
                      group={group}
                      index={i}
                      isJoined={joinedGroups.has(group._id)}
                      onJoin={() => requireAuth(() => handleToggleGroup(group))}
                      isGuest={!isAuthenticated}
                    />
                  ))}
                </div>
              )}

              {/* Guest invite below groups list */}
              {!isAuthenticated && groups.length > 0 && (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaLock size={11} />
                  Sign in to join groups or propose a new one
                </button>
              )}
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4">
            <FeaturedEventPanel
              event={featuredEvent}
              loading={isFeaturedEventLoading}
              onRsvp={() => requireAuth(handleRsvp)}
            />

            {/* Trending Hashtags */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-xl bg-white border border-neutral-200 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaHashtag size={12} className="text-neutral-400" />
                <h3 className="font-bold text-sm text-neutral-900">
                  Trending Hashtags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toast(`#${tag.label} — coming soon`, "info")}
                    style={{ minHeight: 0 }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  >
                    #{tag.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* People to Follow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl bg-white border border-neutral-200 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUserPlus size={12} className="text-neutral-400" />
                <h3 className="font-bold text-sm text-neutral-900">
                  People to Follow
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {PEOPLE_TO_FOLLOW.map((person) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <Avatar initials={person.name.slice(0, 2).toUpperCase()} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {person.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {person.role}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        requireAuth(() => handleFollow(person.id, person.name))
                      }
                      style={{ minHeight: 0 }}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0",
                        !isAuthenticated
                          ? "bg-neutral-100 text-neutral-400 cursor-default"
                          : followedPeople.has(person.id)
                            ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            : "bg-neutral-900 text-white hover:bg-neutral-700",
                      )}
                    >
                      {!isAuthenticated ? (
                        <span className="flex items-center gap-1">
                          <FaLock size={9} /> Follow
                        </span>
                      ) : followedPeople.has(person.id) ? (
                        "Following"
                      ) : (
                        "+ Follow"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      <AddDiscussionModal
        open={isAddingDiscussion}
        onClose={() => setIsAddingDiscussion(false)}
        onPost={handlePostDiscussion}
        posting={posting}
        displayName={displayName}
      />

      <ProposeGroupModal
        open={isProposingGroup}
        onClose={() => setIsProposingGroup(false)}
        onPropose={handleProposeGroup}
        proposing={proposing}
      />

      {/* Auth modal — triggered whenever a guest attempts a write action */}
      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}

CommunitySection.displayName = "CommunitySection";

export default CommunitySection;
