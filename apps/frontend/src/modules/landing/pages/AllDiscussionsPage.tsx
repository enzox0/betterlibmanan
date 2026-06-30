import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaComment,
  FaFire,
  FaLock,
  FaPlus,
  FaSpinner,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import type { Discussion } from "@/modules/admin/services/community.api";

// ─── Discussion card ──────────────────────────────────────────────────────────

function DiscussionCard({
  discussion,
  index,
  onClick,
}: {
  discussion: Discussion;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Author row */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0">
          {discussion.avatarInitials}
        </div>
        <span className="text-xs font-semibold text-neutral-600">
          {discussion.author}
        </span>
        {discussion.isPinned && (
          <span className="ml-auto text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            Pinned
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-neutral-900 leading-snug line-clamp-3">
        {discussion.title}
      </p>

      {/* Reply count */}
      <div className="flex items-center gap-1.5 text-neutral-400 text-xs">
        <FaComment size={10} />
        <span>
          {discussion.replies}{" "}
          {discussion.replies === 1 ? "reply" : "replies"}
        </span>
      </div>

      {/* Tags */}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AllDiscussionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    fetchDiscussions().catch(() =>
      toast("Failed to load discussions.", "error"),
    );
  }, [fetchDiscussions]);

  // Derive all unique tags from loaded discussions
  const allTags = Array.from(
    new Set(discussions.flatMap((d) => d.tags)),
  ).sort();

  // Filter by search query and active tag
  const filtered = discussions.filter((d) => {
    const matchesSearch =
      !search.trim() ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = !activeTag || d.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  // Pinned first, then by reply count
  const sorted = [...filtered].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return b.replies - a.replies;
  });

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="responsive-container py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/community")}
              style={{ minHeight: 0 }}
              className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
              aria-label="Back to Community"
            >
              <FaArrowLeft size={14} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FaFire size={14} className="text-neutral-500 shrink-0" />
                <h1 className="responsive-heading text-neutral-900 leading-tight">
                  All Discussions
                </h1>
              </div>
              <p className="text-sm text-neutral-500 mt-0.5">
                Browse every conversation in the community
              </p>
            </div>

            {/* New Discussion button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setAuthModalOpen(true);
                  return;
                }
                navigate("/community");
              }}
              style={{ minHeight: 0 }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm shrink-0",
                isAuthenticated
                  ? "bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white"
                  : "bg-neutral-200 text-neutral-500 hover:bg-neutral-300",
              )}
            >
              {isAuthenticated ? (
                <FaPlus size={11} />
              ) : (
                <FaLock size={11} />
              )}
              <span className="hidden sm:inline">New Discussion</span>
            </button>
          </div>

          {/* Guest nudge */}
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
                to start a discussion.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="responsive-container py-8 sm:py-10 lg:py-12">
        {/* Search + tag filters */}
        <div className="flex flex-col gap-3 mb-6">
          {/* Search input */}
          <div className="relative">
            <FaSearch
              size={12}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search discussions, authors, or tags…"
              style={{ fontSize: "16px" }}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{ minHeight: 0 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>

          {/* Tag pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setActiveTag((prev) => (prev === tag ? null : tag))
                  }
                  style={{ minHeight: 0 }}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                    activeTag === tag
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200",
                  )}
                >
                  #{tag}
                </button>
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  style={{ minHeight: 0 }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-400 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                >
                  <FaTimes size={9} />
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Result count */}
        {!isDiscussionsLoading && discussions.length > 0 && (
          <p className="text-xs text-neutral-400 font-medium mb-4 uppercase tracking-wide">
            {sorted.length} {sorted.length === 1 ? "discussion" : "discussions"}
            {activeTag ? ` tagged #${activeTag}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        )}

        {/* List */}
        {isDiscussionsLoading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-neutral-400" size={24} />
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <FaComment size={28} className="text-neutral-300" />
            <p className="text-sm text-neutral-400 font-medium">
              {discussions.length === 0
                ? "No discussions yet — be the first to start one!"
                : "No discussions match your search."}
            </p>
            {(search || activeTag) && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveTag(null);
                }}
                style={{ minHeight: 0 }}
                className="text-xs text-neutral-500 underline hover:text-neutral-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sorted.map((d, i) => (
              <DiscussionCard
                key={d._id}
                discussion={d}
                index={i}
                onClick={() => navigate(`/community/discussions/${d._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}

AllDiscussionsPage.displayName = "AllDiscussionsPage";

export default AllDiscussionsPage;
