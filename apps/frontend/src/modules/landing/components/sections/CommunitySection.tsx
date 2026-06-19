import { useState } from "react";
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
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Discussion {
  id: string;
  author: string;
  avatarInitials: string;
  title: string;
  replies: number;
  tags: string[];
}

interface PeerGroup {
  id: string;
  name: string;
  description: string;
  members: string;
}

interface TrendingTag {
  id: string;
  label: string;
}

interface Person {
  id: string;
  name: string;
  role: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: "1",
    author: "JuanDeLaCruz",
    avatarInitials: "JD",
    title: "What public services should be improved first in Libmanan?",
    replies: 87,
    tags: ["LocalGov", "PublicService", "Community"],
  },
  {
    id: "2",
    author: "MariaSantos",
    avatarInitials: "MS",
    title: "Tips for applying for business permits — share your experience!",
    replies: 43,
    tags: ["Business", "Permits", "Advice"],
  },
];

const PEER_GROUPS: PeerGroup[] = [
  {
    id: "1",
    name: "Farmers & Agri Enthusiasts",
    description: "For those who grow, harvest, and love the land of Libmanan.",
    members: "1.2k",
  },
  {
    id: "2",
    name: "Local Business Owners",
    description: "Connect with fellow entrepreneurs and share trade tips.",
    members: "860",
  },
  {
    id: "3",
    name: "Youth & Students",
    description: "A space for the next generation of Libmanan leaders.",
    members: "2.1k",
  },
  {
    id: "4",
    name: "Senior Citizens Forum",
    description: "Sharing stories, concerns, and community support.",
    members: "540",
  },
];

const TRENDING_TAGS: TrendingTag[] = [
  { id: "1", label: "LibmananProud" },
  { id: "2", label: "CleanLibmanan" },
  { id: "3", label: "LocalGovWatch" },
  { id: "4", label: "AgriTech" },
  { id: "5", label: "YouthLeaders" },
  { id: "6", label: "FoodAndFarming" },
  { id: "7", label: "CivicEngagement" },
  { id: "8", label: "SalingLibmanan" },
];

const PEOPLE_TO_FOLLOW: Person[] = [
  { id: "1", name: "Kapitan_Reyes", role: "Barangay Captain" },
  { id: "2", name: "Nenita_Farms", role: "Agri Advocate" },
  { id: "3", name: "BizHub_LGU", role: "Livelihood Officer" },
  { id: "4", name: "YouthCouncil01", role: "SK Chairman" },
  { id: "5", name: "Doc_Villanueva", role: "Health Officer" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Discussion Card ──────────────────────────────────────────────────────────

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
      className="bg-white border border-neutral-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <Avatar initials={discussion.avatarInitials} size="sm" />
        <span className="text-xs font-semibold text-neutral-600">
          {discussion.author}
        </span>
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

// ─── Peer Group Card ──────────────────────────────────────────────────────────

function PeerGroupCard({
  group,
  index,
  isJoined,
  onJoin,
}: {
  group: PeerGroup;
  index: number;
  isJoined: boolean;
  onJoin: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex items-stretch hover:border-neutral-300 hover:shadow-md transition-all"
    >
      {/* Cover strip */}
      <div className="w-24 sm:w-32 shrink-0 bg-neutral-200" />

      {/* Info */}
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
            <span>{group.members} members</span>
          </div>
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
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CommunitySection() {
  const { toast } = useToast();
  const [discussions, setDiscussions] =
    useState<Discussion[]>(INITIAL_DISCUSSIONS);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [followedPeople, setFollowedPeople] = useState<Set<string>>(new Set());
  const [isAddingDiscussion, setIsAddingDiscussion] = useState(false);

  // New discussion form state
  const [newTitle, setNewTitle] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [newTags, setNewTags] = useState<string[]>([]);

  const handleJoinGroup = (groupId: string, groupName: string) => {
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
        toast(`Left "${groupName}"`, "info");
      } else {
        next.add(groupId);
        toast(`Joined "${groupName}"`, "success");
      }
      return next;
    });
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

  const handleAddTag = () => {
    const tag = newTagInput.replace(/\s+/g, "").replace(/^#/, "");
    if (!tag) return;
    if (newTags.includes(tag)) {
      setNewTagInput("");
      return;
    }
    if (newTags.length >= 4) {
      toast("Max 4 tags allowed", "error");
      return;
    }
    setNewTags((prev) => [...prev, tag]);
    setNewTagInput("");
  };

  const handlePostDiscussion = () => {
    if (!newTitle.trim()) {
      toast("Please enter a discussion title.", "error");
      return;
    }
    const newDiscussion: Discussion = {
      id: Date.now().toString(),
      author: "You",
      avatarInitials: "YO",
      title: newTitle.trim(),
      replies: 0,
      tags: newTags,
    };
    setDiscussions((prev) => [newDiscussion, ...prev]);
    setNewTitle("");
    setNewTagInput("");
    setNewTags([]);
    setIsAddingDiscussion(false);
    toast("Discussion posted", "success");
  };

  const closeModal = () => {
    setIsAddingDiscussion(false);
    setNewTitle("");
    setNewTagInput("");
    setNewTags([]);
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="responsive-container py-6 sm:py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                  Community
                </h1>
                <p className="text-sm text-neutral-500">
                  Connect, discuss, and grow together in Libmanan
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddingDiscussion(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow-sm shrink-0"
            >
              <FaPlus size={11} />
              <span className="hidden sm:inline">New Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="responsive-container py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Left / Main column ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">
            {/* Trending Discussions */}
            <section>
              <SectionHeader
                icon={<FaFire size={13} className="text-neutral-500" />}
                title="Trending Discussions"
                actionLabel="See More"
                onAction={() => toast("More discussions coming soon", "info")}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {discussions.map((d, i) => (
                  <DiscussionCard key={d.id} discussion={d} index={i} />
                ))}
              </div>
            </section>

            {/* Peer Groups */}
            <section>
              <SectionHeader
                icon={<FaUsers size={13} className="text-neutral-500" />}
                title="Peer Groups"
                actionLabel="See More"
                onAction={() => toast("More groups coming soon", "info")}
              />
              <div className="flex flex-col gap-3">
                {PEER_GROUPS.map((group, i) => (
                  <PeerGroupCard
                    key={group.id}
                    group={group}
                    index={i}
                    isJoined={joinedGroups.has(group.id)}
                    onJoin={() => handleJoinGroup(group.id, group.name)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4">
            {/* Featured Event Banner */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-gray-900 p-5 text-white"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">
                <span>Featured Event</span>
              </div>
              <h3 className="font-bold text-base leading-snug mb-3">
                Barangay Assembly: Building Our Future
              </h3>
              <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt size={10} />
                  July 5
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock size={10} />9 AM (PST)
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed mb-4">
                Join your local officials and neighbors to discuss upcoming
                projects and community plans.
              </p>
              <button
                onClick={() =>
                  toast(
                    "Registration noted. Stay tuned for updates.",
                    "success",
                  )
                }
                className="w-full bg-white text-neutral-900 font-semibold text-sm py-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
              >
                Reserve a Seat
              </button>
            </motion.div>

            {/* Trending Hashtags */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="rounded-2xl bg-white border border-neutral-200 p-5"
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
              className="rounded-2xl bg-white border border-neutral-200 p-5"
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
                    <Avatar initials={getInitials(person.name)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">
                        {person.name}
                      </p>
                      <p className="text-xs text-neutral-500 truncate">
                        {person.role}
                      </p>
                    </div>
                    <button
                      onClick={() => handleFollow(person.id, person.name)}
                      style={{ minHeight: 0 }}
                      className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0",
                        followedPeople.has(person.id)
                          ? "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                          : "bg-neutral-900 text-white hover:bg-neutral-700",
                      )}
                    >
                      {followedPeople.has(person.id) ? "Following" : "+ Follow"}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>
      </div>

      {/* ── New Discussion Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddingDiscussion && (
          <div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "bg-white w-full sm:max-w-md shadow-2xl",
                "rounded-t-3xl sm:rounded-2xl",
                "p-5 sm:p-6",
                "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
              )}
            >
              {/* Sheet handle (mobile) */}
              <div className="flex justify-center mb-4 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-neutral-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <FaComment size={12} className="text-neutral-700" />
                  </div>
                  <h2 className="text-base font-bold text-neutral-900">
                    Start a Discussion
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  style={{ minHeight: 0 }}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
                  aria-label="Close"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Title */}
              <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Discussion Title
              </label>
              <textarea
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's on your mind? Ask a question or share a topic..."
                maxLength={200}
                style={{ fontSize: "16px" }}
                className="w-full h-24 p-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed mb-1"
              />
              <p className="text-right text-[11px] text-neutral-400 mb-4">
                {newTitle.length}/200
              </p>

              {/* Tags */}
              <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Tags{" "}
                <span className="normal-case font-normal">
                  (optional, max 4)
                </span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. LocalGov"
                  style={{ fontSize: "16px" }}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
                />
                <button
                  onClick={handleAddTag}
                  style={{ minHeight: 0 }}
                  className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              {newTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {newTags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-700"
                    >
                      #{tag}
                      <button
                        onClick={() =>
                          setNewTags((prev) => prev.filter((t) => t !== tag))
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

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostDiscussion}
                  className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow"
                >
                  Post Discussion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

CommunitySection.displayName = "CommunitySection";
