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
  FaFire,
  FaChevronDown,
  FaReply,
  FaTimes,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import { Avatar } from "../components/ui/Avatar";
import { useDiscussionSocket } from "@/hooks/useDiscussionSocket";
import { getSocket } from "@/lib/socket";
import type {
  Discussion,
  DiscussionReply,
} from "@/modules/admin/services/community.api";

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
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Build a tree: top-level replies each carry their nested children
interface ReplyNode {
  reply: DiscussionReply;
  children: ReplyNode[];
}

function buildReplyTree(replies: DiscussionReply[]): ReplyNode[] {
  const map = new Map<string, ReplyNode>();
  const roots: ReplyNode[] = [];
  for (const r of replies) {
    map.set(r._id, { reply: r, children: [] });
  }
  for (const r of replies) {
    const node = map.get(r._id)!;
    if (r.parentReplyId && map.has(r.parentReplyId)) {
      map.get(r.parentReplyId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

// ─── Inline reply composer ────────────────────────────────────────────────────

function InlineReplyComposer({
  replyingToAuthor,
  displayName,
  onPost,
  onCancel,
  posting,
}: {
  replyingToAuthor: string;
  displayName: string;
  onPost: (body: string) => Promise<void>;
  onCancel: () => void;
  posting: boolean;
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    await onPost(trimmed);
    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className="mt-2 ml-10 overflow-hidden"
    >
      <div className="flex gap-2.5 items-start">
        <Avatar initials={getInitials(displayName)} size="sm" dark />
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-[11px] text-neutral-400 font-medium">
            Replying to{" "}
            <span className="font-semibold text-neutral-600">
              {replyingToAuthor}
            </span>
          </div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape") onCancel();
            }}
            placeholder={`Reply to ${replyingToAuthor}…`}
            rows={2}
            maxLength={500}
            style={{ fontSize: "16px" }}
            className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:bg-white focus:ring-2 focus:ring-neutral-900/5 outline-none resize-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all leading-relaxed"
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-neutral-400 flex-1">
              {text.length}/500
            </span>
            <button
              onClick={onCancel}
              style={{ minHeight: 0 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:bg-neutral-100 transition-colors"
            >
              <FaTimes size={9} /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || posting}
              style={{ minHeight: 0 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {posting ? (
                <FaSpinner className="animate-spin" size={10} />
              ) : (
                <FaPaperPlane size={10} />
              )}
              Reply
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Reply node (recursive) ───────────────────────────────────────────────────

function ReplyNodeCard({
  node,
  depth,
  currentUserId,
  displayName,
  isAuthenticated,
  onLike,
  onReply,
  onOpenAuth,
  replyingToId,
  postingReplyTo,
  onPostNestedReply,
  onCancelReply,
}: {
  node: ReplyNode;
  depth: number;
  currentUserId: string | null;
  displayName: string;
  isAuthenticated: boolean;
  onLike: (id: string) => void;
  onReply: (id: string) => void;
  onOpenAuth: () => void;
  replyingToId: string | null;
  postingReplyTo: string | null;
  onPostNestedReply: (parentId: string, body: string) => Promise<void>;
  onCancelReply: () => void;
}) {
  const { reply, children } = node;
  const liked = currentUserId ? reply.likedBy.includes(currentUserId) : false;
  // Cap indent so it doesn't get too narrow on mobile
  const indent = Math.min(depth, 3) * 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      style={{ marginLeft: `${indent}px` }}
      className={cn(
        "flex flex-col",
        depth > 0 && "border-l-2 border-neutral-100 pl-3",
      )}
    >
      {/* The reply bubble */}
      <div className="flex gap-2.5">
        <Avatar
          initials={node.reply.avatarInitials}
          avatarUrl={node.reply.avatarUrl}
          size="sm"
        />
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-neutral-800">
              {reply.author}
            </span>
            <span className="text-[10px] text-neutral-400">
              {timeAgo(reply.createdAt)}
            </span>
          </div>
          <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-neutral-200 text-sm leading-relaxed text-neutral-800">
            {reply.body}
          </div>
          {/* Actions */}
          <div className="flex items-center gap-3 mt-0.5">
            <button
              onClick={() => onLike(reply._id)}
              style={{ minHeight: 0 }}
              className={cn(
                "flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors",
                liked
                  ? "text-neutral-900 bg-neutral-100"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100",
              )}
            >
              <FaThumbsUp size={9} />
              {reply.likes > 0 && <span>{reply.likes}</span>}
              <span>{liked ? "Liked" : "Like"}</span>
            </button>
            <button
              onClick={() =>
                isAuthenticated ? onReply(reply._id) : onOpenAuth()
              }
              style={{ minHeight: 0 }}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <FaReply size={9} />
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Inline composer for this reply */}
      <AnimatePresence>
        {replyingToId === reply._id && (
          <InlineReplyComposer
            replyingToAuthor={reply.author}
            displayName={displayName}
            onPost={(body) => onPostNestedReply(reply._id, body)}
            onCancel={onCancelReply}
            posting={postingReplyTo === reply._id}
          />
        )}
      </AnimatePresence>

      {/* Nested children */}
      {children.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {children.map((child) => (
            <ReplyNodeCard
              key={child.reply._id}
              node={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              displayName={displayName}
              isAuthenticated={isAuthenticated}
              onLike={onLike}
              onReply={onReply}
              onOpenAuth={onOpenAuth}
              replyingToId={replyingToId}
              postingReplyTo={postingReplyTo}
              onPostNestedReply={onPostNestedReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
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
            {discussion.replies}{" "}
            {discussion.replies === 1 ? "reply" : "replies"}
          </span>
        </div>
        {discussion.isPinned && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <FaThumbtack size={10} className="shrink-0" />
            <span>Pinned discussion</span>
          </div>
        )}
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
  const userToken = useUserStore((s) => s.token);
  const displayName = currentUser?.displayName ?? "Anonymous";

  // ── Real-time Socket.IO connection ────────────────────────────────────────────
  // Joins the discussion room so other users' replies appear live.
  useDiscussionSocket(id, userToken ?? undefined);

  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);
  const repliesByDiscussion = useCommunityStore((s) => s.repliesByDiscussion);
  const isRepliesLoading = useCommunityStore((s) => s.isRepliesLoading);
  const fetchReplies = useCommunityStore((s) => s.fetchReplies);
  const postReply = useCommunityStore((s) => s.postReply);
  const toggleLikeReply = useCommunityStore((s) => s.toggleLikeReply);

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  // replyingToId: which top-level/nested reply has the inline composer open
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  // postingReplyTo: tracks which inline composer is in-flight
  const [postingReplyTo, setPostingReplyTo] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // ── Pagination ────────────────────────────────────────────────────────────────
  // Replies are shown newest-first. Start with 20 visible root threads,
  // each "Load older" press reveals 20 more.
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    if (discussions.length === 0) {
      fetchDiscussions().catch(() =>
        toast("Failed to load discussions.", "error"),
      );
    }
  }, [fetchDiscussions, discussions.length, id]);

  useEffect(() => {
    const found = discussions.find((d) => d._id === id);
    if (found) setDiscussion(found);
  }, [discussions, id]);

  useEffect(() => {
    if (!id) return;
    fetchReplies(id).catch(() => {});
  }, [id, fetchReplies]);

  const replies = id ? (repliesByDiscussion[id] ?? []) : [];
  const replyTree = buildReplyTree(replies);

  // Newest root replies first; children inside each thread stay oldest-first
  // (natural reading order within a conversation thread).
  const reversedRoots = [...replyTree].reverse();
  const visibleRoots = reversedRoots.slice(0, visibleCount);
  const hasMore = visibleCount < reversedRoots.length;
  const remainingCount = reversedRoots.length - visibleCount;

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  const handleLike = (replyId: string) => {
    requireAuth(async () => {
      if (!userToken) return;
      try {
        await toggleLikeReply(replyId, userToken);
      } catch {
        toast("Failed to update like.", "error");
      }
    });
  };

  /** Post to the discussion (no parent) */
  const handlePost = async () => {
    if (!replyText.trim() || !id || !userToken) return;
    setPosting(true);
    try {
      const socketId = getSocket().id;
      await postReply(
        id,
        {
          author: displayName,
          body: replyText.trim(),
          avatarUrl: currentUser?.avatarUrl ?? "",
        },
        userToken,
        socketId,
      );
      setReplyText("");
      // Reset to first page so the new reply (newest) is immediately visible at top
      setVisibleCount(PAGE_SIZE);
      toast("Reply posted!", "success");
    } catch {
      toast("Failed to post reply.", "error");
    } finally {
      setPosting(false);
    }
  };

  /** Post a nested reply to another reply */
  const handlePostNestedReply = async (parentId: string, body: string) => {
    if (!id || !userToken) return;
    setPostingReplyTo(parentId);
    try {
      const socketId = getSocket().id;
      await postReply(
        id,
        {
          author: displayName,
          body,
          parentReplyId: parentId,
          avatarUrl: currentUser?.avatarUrl ?? "",
        },
        userToken,
        socketId,
      );
      setReplyingToId(null);
      setVisibleCount(PAGE_SIZE);
      toast("Reply posted!", "success");
    } catch {
      toast("Failed to post reply.", "error");
    } finally {
      setPostingReplyTo(null);
    }
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

  if (isDiscussionsLoading || (!discussion && discussions.length === 0)) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <FaSpinner className="animate-spin text-neutral-400" size={28} />
      </div>
    );
  }

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
              aria-label="Back"
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
            {/* Original post */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden"
            >
              {discussion.isPinned && (
                <div className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 border-b border-blue-100">
                  <FaThumbtack size={10} className="text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600">
                    Pinned discussion
                  </span>
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    initials={discussion.avatarInitials}
                    avatarUrl={discussion.avatarUrl}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-900">
                      {discussion.author}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {timeAgo(discussion.createdAt)}
                    </p>
                  </div>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug mb-4">
                  {discussion.title}
                </h1>
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
                <div className="flex items-center gap-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <FaComment size={11} />
                    <span>
                      {replies.length}{" "}
                      {replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      requireAuth(() => replyBoxRef.current?.focus())
                    }
                    style={{ minHeight: 0 }}
                    className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
                  >
                    <FaComment size={11} /> Reply
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Root reply composer */}
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
                    avatarUrl={currentUser?.avatarUrl}
                    size="sm"
                    dark
                  />
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200 w-fit">
                      <span className="text-[11px] text-neutral-400">
                        Posting as
                      </span>
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

            {/* Replies */}
            {isRepliesLoading && replies.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner
                  className="animate-spin text-neutral-400"
                  size={20}
                />
              </div>
            ) : replyTree.length > 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-4">
                  <FaComment size={11} className="text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                    {replies.length}{" "}
                    {replies.length === 1 ? "Reply" : "Replies"}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <AnimatePresence initial={false}>
                    {visibleRoots.map((node) => (
                      <ReplyNodeCard
                        key={node.reply._id}
                        node={node}
                        depth={0}
                        currentUserId={currentUser?._id ?? null}
                        displayName={displayName}
                        isAuthenticated={isAuthenticated}
                        onLike={handleLike}
                        onReply={(rid) =>
                          setReplyingToId((prev) => (prev === rid ? null : rid))
                        }
                        onOpenAuth={() => setAuthModalOpen(true)}
                        replyingToId={replyingToId}
                        postingReplyTo={postingReplyTo}
                        onPostNestedReply={handlePostNestedReply}
                        onCancelReply={() => setReplyingToId(null)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load older replies — appends the next PAGE_SIZE roots */}
                {hasMore && (
                  <button
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    style={{ minHeight: 0 }}
                    className="mt-4 w-full py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-200 text-xs font-semibold text-neutral-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FaChevronDown size={10} />
                    Load {Math.min(remainingCount, PAGE_SIZE)} older{" "}
                    {Math.min(remainingCount, PAGE_SIZE) === 1
                      ? "reply"
                      : "replies"}
                    <span className="text-neutral-400 font-normal">
                      ({remainingCount} remaining)
                    </span>
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 sticky top-[13dvh]">
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
