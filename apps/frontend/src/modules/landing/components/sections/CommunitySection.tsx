import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUsers,
  FaPlus,
  FaTimes,
  FaComment,
  FaHashtag,
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
import { uploadGroupImageRequest } from "@/modules/admin/services/community.api";
import SafeImage, { getProxiedUrl } from "../ui/SafeImage";

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
  onClick,
}: {
  discussion: Discussion;
  index: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 text-[10px] font-bold shrink-0 overflow-hidden">
          {discussion.avatarUrl ? (
            <img
              src={getProxiedUrl(discussion.avatarUrl)}
              alt={discussion.author}
              className="w-full h-full object-cover"
            />
          ) : (
            discussion.avatarInitials
          )}
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
  onClick,
}: {
  group: CommunityGroup;
  index: number;
  isJoined: boolean;
  onJoin: () => void;
  isGuest: boolean;
  onClick?: () => void;
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
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden flex items-stretch hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      <div className="w-24 sm:w-32 shrink-0 bg-neutral-100 flex items-center justify-center overflow-hidden">
        {group.imageUrl ? (
          <SafeImage
            src={group.imageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
            containerClassName="w-full h-full"
          />
        ) : (
          <FaUsers size={24} className="text-neutral-300" />
        )}
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
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
              style={{ minHeight: 0 }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 bg-neutral-200 text-neutral-500 hover:bg-neutral-300 flex items-center gap-1"
            >
              <FaLock size={9} />
              Join Group
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onJoin();
              }}
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
  avatarUrl,
}: {
  open: boolean;
  onClose: () => void;
  onPost: (title: string, tags: string[]) => Promise<void>;
  posting: boolean;
  displayName: string;
  avatarUrl?: string;
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
              <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-neutral-700 shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={getProxiedUrl(avatarUrl)}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const ACCEPTED = ["image/png", "image/jpeg", "image/gif", "image/webp"];
  const MAX_BYTES = 5 * 1024 * 1024;

  const handleImageFile = (file: File) => {
    setImageError(null);
    if (!ACCEPTED.includes(file.type) || file.size > MAX_BYTES) {
      setImageError("Must be PNG, JPG, GIF or WebP — max 5 MB.");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const reset = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageError(null);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

    let imageUrl = "";
    let imageKey = "";

    if (imageFile) {
      setUploadingImage(true);
      try {
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
        const uploaded = await uploadGroupImageRequest({
          filename: imageFile.name,
          mimeType: imageFile.type,
          data: dataUrl,
        });
        imageUrl = uploaded.url;
        imageKey = uploaded.key;
      } catch {
        toast("Image upload failed. Submitting without image.", "error");
      } finally {
        setUploadingImage(false);
      }
    }

    await onPropose({
      name: name.trim(),
      description: description.trim(),
      imageUrl,
      imageKey,
    });
    reset();
  };

  const isSubmitting = proposing || uploadingImage;

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
            className="bg-white w-full sm:max-w-md shadow-2xl rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-h-[90dvh] overflow-y-auto"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center mb-4 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>

            {/* Header */}
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

            {/* Group image — optional */}
            <label className="block mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Group Image{" "}
              <span className="normal-case font-normal text-neutral-400">
                (optional)
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageFile(f);
              }}
            />

            {imagePreview ? (
              <div className="relative mb-4 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-36 object-cover"
                />
                <button
                  onClick={() => {
                    if (imagePreview) URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    setImageFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{ minHeight: 0 }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label="Remove image"
                >
                  <FaTimes size={11} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleImageFile(f);
                }}
                style={{ minHeight: 0 }}
                className="w-full mb-4 flex flex-col items-center gap-2 py-6 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                  <FaUsers size={16} className="text-neutral-400" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-neutral-600">
                    Click or drag to upload an image
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    PNG, JPG, GIF, WebP · max 5 MB
                  </p>
                </div>
              </button>
            )}

            {imageError && (
              <p className="text-xs text-red-500 mb-3 -mt-2">{imageError}</p>
            )}

            {/* Group Name */}
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

            {/* Description */}
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

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    {uploadingImage ? "Uploading…" : "Submitting…"}
                  </>
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
  const userToken = useUserStore((s) => s.token);
  const displayName = currentUser?.displayName ?? "Anonymous";

  const navigate = useNavigate();

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

  const trendingTags = useCommunityStore((s) => s.trendingTags);
  const fetchTrendingTags = useCommunityStore((s) => s.fetchTrendingTags);

  const joinedGroupIds = useCommunityStore((s) => s.joinedGroupIds);

  // ── Local UI state ──────────────────────────────────────────────────────────
  const [isAddingDiscussion, setIsAddingDiscussion] = useState(false);
  const [posting, setPosting] = useState(false);
  const [isProposingGroup, setIsProposingGroup] = useState(false);
  const [proposing, setProposing] = useState(false);

  // ── Fetch on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (discussions.length === 0) {
      fetchDiscussions().catch(() =>
        toast("Failed to load discussions.", "error"),
      );
    }
    if (groups.length === 0) {
      fetchGroups().catch(() => toast("Failed to load groups.", "error"));
    }
    fetchFeaturedEvent().catch(() => {});
    fetchTrendingTags().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handlePostDiscussion = async (title: string, tags: string[]) => {
    setPosting(true);
    try {
      if (!userToken) {
        toast("Please sign in to post a discussion.", "error");
        return;
      }
      await postDiscussion(
        {
          author: displayName,
          title,
          tags,
        },
        userToken,
      );
      setIsAddingDiscussion(false);
      toast("Discussion posted!", "success");
    } catch {
      toast("Failed to post discussion.", "error");
    } finally {
      setPosting(false);
    }
  };

  const handleToggleGroup = async (group: CommunityGroup) => {
    if (!userToken) return;
    const isJoined = joinedGroupIds.includes(group._id);
    try {
      if (isJoined) {
        await leaveGroup(group._id, userToken);
        toast(`Left "${group.name}"`, "info");
      } else {
        await joinGroup(group._id, userToken, displayName);
        toast(`Joined "${group.name}"`, "success");
      }
    } catch {
      toast("Failed to update membership.", "error");
    }
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
      if (!userToken) {
        toast("Please sign in to propose a group.", "error");
        return;
      }
      await proposeGroup(payload, userToken);
      setIsProposingGroup(false);
      toast("Your group proposal has been submitted for review!", "success");
    } catch {
      toast("Failed to submit group proposal.", "error");
    } finally {
      setProposing(false);
    }
  };

  // ── Top Contributors (client-side, derived from loaded data) ────────────────
  const topContributors = (() => {
    const tally: Record<
      string,
      {
        name: string;
        initials: string;
        avatarUrl: string;
        discussions: number;
        groups: number;
      }
    > = {};

    for (const d of discussions) {
      if (!tally[d.author]) {
        tally[d.author] = {
          name: d.author,
          initials: d.avatarInitials,
          avatarUrl: d.avatarUrl ?? "",
          discussions: 0,
          groups: 0,
        };
      }
      tally[d.author].discussions += 1;
      // keep the latest avatarUrl in case it was updated
      if (d.avatarUrl) tally[d.author].avatarUrl = d.avatarUrl;
    }

    return Object.values(tally)
      .sort((a, b) => b.discussions + b.groups - (a.discussions + a.groups))
      .slice(0, 10);
  })();

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
                onAction={() => navigate("/community/discussions")}
              />
              {isDiscussionsLoading ? (
                <LoadingRows count={2} />
              ) : discussions.length === 0 ? (
                <p className="text-sm text-neutral-400 py-8 text-center">
                  No discussions yet — be the first to start one!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {discussions.slice(0, 2).map((d, i) => (
                    <DiscussionCard
                      key={d._id}
                      discussion={d}
                      index={i}
                      onClick={() =>
                        navigate(`/community/discussions/${d._id}`)
                      }
                    />
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
                <>
                  <div className="flex flex-col gap-3">
                    {groups.slice(0, 10).map((group, i) => (
                      <GroupCard
                        key={group._id}
                        group={group}
                        index={i}
                        isJoined={joinedGroupIds.includes(group._id)}
                        onJoin={() =>
                          requireAuth(() => handleToggleGroup(group))
                        }
                        isGuest={!isAuthenticated}
                        onClick={() =>
                          navigate(`/community/groups/${group._id}`)
                        }
                      />
                    ))}
                  </div>

                  {/* View More — shown when there are more than 10 groups */}
                  {groups.length > 10 && (
                    <button
                      onClick={() => navigate("/community/groups")}
                      style={{ minHeight: 0 }}
                      className="mt-4 w-full py-3 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      View All Peer Groups
                      <FaChevronRight size={11} />
                    </button>
                  )}
                </>
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
              {trendingTags.length === 0 ? (
                <p className="text-xs text-neutral-400">
                  No trending tags yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() =>
                        navigate(
                          `/community/discussions?tag=${encodeURIComponent(tag.label)}`,
                        )
                      }
                      style={{ minHeight: 0 }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                    >
                      #{tag.label}
                      <span className="text-neutral-400 font-normal">
                        {tag.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Top Contributors */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl bg-white border border-neutral-200 p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <FaUsers size={12} className="text-neutral-400" />
                <h3 className="font-bold text-sm text-neutral-900">
                  Most Active Members
                </h3>
              </div>

              {isDiscussionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <FaSpinner
                    className="animate-spin text-neutral-300"
                    size={16}
                  />
                </div>
              ) : topContributors.length === 0 ? (
                <p className="text-xs text-neutral-400">No contributors yet.</p>
              ) : (
                <ol className="flex flex-col gap-2.5">
                  {topContributors.map((contributor, idx) => (
                    <li
                      key={contributor.name}
                      className="flex items-center gap-2.5"
                    >
                      {/* Rank */}
                      <span className="w-5 shrink-0 text-center text-[11px] font-bold text-neutral-400">
                        {idx + 1}
                      </span>

                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700 text-[10px] font-bold shrink-0 overflow-hidden">
                        {contributor.avatarUrl ? (
                          <img
                            src={getProxiedUrl(contributor.avatarUrl)}
                            alt={contributor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          contributor.initials
                        )}
                      </div>

                      {/* Name + stat */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate leading-tight">
                          {contributor.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 leading-tight">
                          {contributor.discussions}{" "}
                          {contributor.discussions === 1
                            ? "discussion"
                            : "discussions"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
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
        avatarUrl={currentUser?.avatarUrl}
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
