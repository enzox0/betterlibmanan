import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaComment,
  FaLock,
  FaPaperPlane,
  FaSpinner,
  FaThumbsUp,
  FaCalendarAlt,
  FaHashtag,
  FaThumbtack,
  FaTimes,
  FaFire,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import type { Discussion } from "@/modules/admin/services/community.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Reply {
  id: string;
  author: string;
  initials: string;
  body: string;
  likes: number;
  liked: boolean;
  createdAt: Date;
  isOwn: boolean;
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

function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

/** Generate seeded mock replies for a discussion */
function buildSeedReplies(discussion: Discussion): Reply[] {
  const names = [
    ["Maria Santos", "MS"],
    ["Juan dela Cruz", "JD"],
    ["Ana Reyes", "AR"],
    ["Carlos Bautista", "CB"],
    ["Liza Gonzales", "LG"],
  ];
  const bodies = [
    "This is such an important topic for our community. Thanks for bringing it up!",
    "I completely agree. We've been dealing with this issue for months now.",
    "Has anyone reached out to the barangay office about this? They might have resources available.",
    "Great point. I'd also add that community participation is key to making any real progress here.",
    "Looking forward to seeing more discussions like this. Keep them coming!",
  ];
  const count = Math.min(discussion.replies, 5);
  const seed = discussion._id.charCodeAt(0) % names.length;
  return Array.from({ length: count }).map((_, i) => {
    const idx = (seed + i) % names.length;
    const [name, initials] = names[idx];
    const hoursAgo = (i + 1) * 3;
    return {
      id: `reply-${discussion._id}-${i}`,
      author: name,
      initials,
      body: bodies[i % bodies.length],
      likes: Math.floor(Math.random() * 12),
      liked: false,
      createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      isOwn: false,
    };
  });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  initials,
  size = "md",
  dark = false,
}: {
  initials: string;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) {
  const sizes = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        dark ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-700",
        sizes[size],
      )}
    >
      {initials}
    </div>
  );
}

// ─── Reply card ───────────────────────────────────────────────────────────────

function ReplyCard({
  reply,
  index,
  onLike,
}: {
  reply: Reply;
  index: number;
  onLike: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.4) }}
      className={cn(
        "flex gap-3",
        reply.isOwn && "flex-row-reverse",
      )}
    >
      <Avatar initials={reply.initials} size="sm" dark={reply.isOwn} />
      <div className={cn("flex-1 min-w-0 flex flex-col gap-1", reply.isOwn && "items-end")}>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-semibold text-neutral-700", reply.isOwn && "order-last")}>
            {reply.isOwn ? "You" : reply.author}
          </span>
          <span className="text-[10px] text-neutral-400">{timeAgo(reply.createdAt)}</span>
        </div>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed text-neutral-800 border",
            reply.isOwn
              ? "bg-neutral-900 text-white border-transparent rounded-tr-sm"
              : "bg-white border-neutral-200 rounded-tl-sm",
          )}
        >
          {reply.body}
        </div>
        {/* Like button */}
        <button
          onClick={() => onLike(reply.id)}
          style={{ minHeight: 0 }}
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors mt-0.5",
            reply.liked
              ? "text-neutral-900 bg-neutral-100"
              : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100",
          )}
        >
          <FaThumbsUp size={9} />
          {reply.likes > 0 && <span>{reply.likes}</span>}
          <span>{reply.liked ? "Liked" : "Like"}</span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────

function DiscussionSidebar({
  discussion,
  related,
  onNavigate,
}: {
  discussion: Discussion;
  related: Discussion[];
  onNavigate: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Discussion info */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
          Discussion Info
        </h3>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <FaCalendarAlt size={10} className="text-neutral-400 shrink-0" />
          <span>Started {timeAgo(discussion.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <FaComment size={10} className="text-neutral-400 shrink-0" />
          <span>
            {discussion.replies} {discussion.replies === 1 ? "reply" : "replies"}
          </span>
        </div>

        {discussion.isPinned && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <FaThumbtack size={10} className="shrink-0" />
            <span>Pinned discussion</span>
          </div>
        )}

        {/* Tags */}
        {discussion.tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <FaHashtag size={10} className="text-neutral-400" />
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Tags
              </span>
            </div>
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
          </div>
        )}
      </div>

      {/* Related discussions */}
      {related.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <FaFire size={11} className="text-neutral-400" />
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
              Related Discussions
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            {related.map((d) => (
              <button
                key={d._id}
                onClick={() => onNavigate(d._id)}
                style={{ minHeight: 0 }}
                className="text-left flex flex-col gap-1 group"
              >
                <p className="text-sm font-semibold text-neutral-800 leading-snug line-clamp-2 group-hover:text-neutral-900 transition-colors">
                  {d.title}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <FaComment size={9} />
                  <span>{d.replies} replies</span>
                  <span>·</span>
                  <span>{timeAgo(d.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const replyBoxRef = useRef<HTMLTextAreaElement>(null);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const displayName = currentUser?.displayName ?? "You";

  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showAllReplies, setShowAllReplies] = useState(false);

  const PREVIEW_COUNT = 3;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    if (discussions.length === 0) {
      fetchDiscussions().catch(() =>
        toast("Failed to load discussions.", "error"),
      );
    }
  }, [fetchDiscussions, discussions.length]);

  useEffect(() => {
    const found = discussions.find((d) => d._id === id);
    if (found) {
      setDiscussion(found);
      setReplies(buildSeedReplies(found));
      setShowAllReplies(false);
    }
  }, [discussions, id]);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleLike = (replyId: string) => {
    requireAuth(() => {
      setReplies((prev) =>
        prev.map((r) =>
          r.id === replyId
            ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 }
            : r,
        ),
      );
    });
  };

  const handlePost = async () => {
    if (!replyText.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 350));
    const newReply: Reply = {
      id: `reply-own-${Date.now()}`,
      author: displayName,
      initials: getInitials(displayName),
      body: replyText.trim(),
      likes: 0,
      liked: false,
      createdAt: new Date(),
      isOwn: true,
    };
    setReplies((prev) => [...prev, newReply]);
    setReplyText("");
    setPosting(false);
    setShowAllReplies(true);
    toast("Reply posted!", "success");
  };

  const related = discussions
    .filter(
      (d) =>
        d._id !== id &&
        (d.isPinned ||
          d.tags.some((t) => discussion?.tags.includes(t)) ||
          d.replies > 0),
    )
    .slice(0, 4);

  // Loading
  if (isDiscussionsLoading || (!discussion && discussions.length === 0)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

  // Not found
  if (!discussion) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-4">
        <FaComment size={36} className="text-neutral-300" />
        <p className="text-neutral-500 font-semibold">Discussion not found.</p>
        <button
          onClick={() => navigate("/community/discussions")}
          className="text-sm text-blue-600 underline"
        >
          Back to Discussions
        </button>
      </div>
    );
  }

  const visibleReplies = showAllReplies ? replies : replies.slice(0, PREVIEW_COUNT);
  const hiddenCount = replies.length - PREVIEW_COUNT;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="responsive-container py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/community/discussions")}
              style={{ minHeight: 0 }}
              className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
              aria-label="Back to Discussions"
            >
              <FaArrowLeft size={14} />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <FaComment size={12} className="text-neutral-400 shrink-0" />
              <span className="text-sm font-semibold text-neutral-600 truncate">
                Discussion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="responsive-container py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* ── Original post ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
            >
              {/* Pinned banner */}
              {discussion.isPinned && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                  <FaThumbtack size={10} className="text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">
                    Pinned discussion
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6">
                {/* Author + meta */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={discussion.avatarInitials} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900">
                      {discussion.author}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {timeAgo(discussion.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Title / body */}
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug mb-4">
                  {discussion.title}
                </h1>

                {/* Tags */}
                {discussion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {discussion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-neutral-100 text-neutral-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats bar */}
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <FaComment size={11} />
                    <span>
                      {replies.length}{" "}
                      {replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                  {/* Reply CTA */}
                  <button
                    onClick={() =>
                      requireAuth(() => replyBoxRef.current?.focus())
                    }
                    style={{ minHeight: 0 }}
                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <FaComment size={11} />
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ── Replies ── */}
            {replies.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <FaComment size={11} className="text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <AnimatePresence initial={false}>
                    {visibleReplies.map((reply, i) => (
                      <ReplyCard
                        key={reply.id}
                        reply={reply}
                        index={i}
                        onLike={handleLike}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Show more / less toggle */}
                {replies.length > PREVIEW_COUNT && (
                  <button
                    onClick={() => setShowAllReplies((v) => !v)}
                    style={{ minHeight: 0 }}
                    className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors self-start px-1"
                  >
                    {showAllReplies ? (
                      <>
                        <FaChevronUp size={10} /> Show less
                      </>
                    ) : (
                      <>
                        <FaChevronDown size={10} />
                        Show {hiddenCount} more{" "}
                        {hiddenCount === 1 ? "reply" : "replies"}
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ── Reply composer ── */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <FaComment size={12} className="text-neutral-400" />
                <h2 className="text-sm font-bold text-neutral-700">
                  Leave a Reply
                </h2>
              </div>

              {isAuthenticated ? (
                <div className="flex gap-3 items-start">
                  <Avatar
                    initials={getInitials(displayName)}
                    size="sm"
                    dark
                  />
                  <div className="flex-1 flex flex-col gap-3">
                    {/* Posting as */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 w-fit">
                      <span className="text-[11px] text-neutral-400">Posting as</span>
                      <span className="text-[11px] font-semibold text-neutral-700">
                        {displayName}
                      </span>
                    </div>

                    <textarea
                      ref={replyBoxRef}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          e.preventDefault();
                          handlePost();
                        }
                      }}
                      placeholder="Share your thoughts or ask a follow-up question…"
                      rows={3}
                      maxLength={500}
                      style={{ fontSize: "16px" }}
                      className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed"
                    />

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] text-neutral-400">
                        {replyText.length}/500 · Ctrl+Enter to post
                      </span>
                      <button
                        onClick={handlePost}
                        disabled={!replyText.trim() || posting}
                        style={{ minHeight: 0 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
                      >
                        {posting ? (
                          <FaSpinner className="animate-spin" size={12} />
                        ) : (
                          <FaPaperPlane size={11} />
                        )}
                        Post Reply
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <FaLock size={14} className="text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500">
                    You need to be signed in to participate in this discussion.
                  </p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    style={{ minHeight: 0 }}
                    className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-700 text-white text-sm font-semibold transition-colors shadow-sm"
                  >
                    Sign in to reply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0">
            <DiscussionSidebar
              discussion={discussion}
              related={related}
              onNavigate={(newId) =>
                navigate(`/community/discussions/${newId}`)
              }
            />
          </aside>
        </div>
      </div>

      <UserAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}

DiscussionDetailPage.displayName = "DiscussionDetailPage";

export default DiscussionDetailPage;
