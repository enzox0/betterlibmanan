import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaLock,
  FaArrowLeft,
  FaSpinner,
  FaPlus,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import { useUserStore } from "@/modules/admin/store/userStore";
import { UserAuthModal } from "../components/ui/UserAuthModal";
import SafeImage from "../components/ui/SafeImage";
import type {
  CommunityGroup,
  ProposeGroupPayload,
} from "@/modules/admin/services/community.api";

// ─── Group card (same visual as CommunitySection) ─────────────────────────────

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
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AllPeerGroupsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const userToken = useUserStore((s) => s.token);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const groups = useCommunityStore((s) => s.groups);
  const isGroupsLoading = useCommunityStore((s) => s.isGroupsLoading);
  const fetchGroups = useCommunityStore((s) => s.fetchGroups);
  const joinGroup = useCommunityStore((s) => s.joinGroup);
  const leaveGroup = useCommunityStore((s) => s.leaveGroup);
  const proposeGroup = useCommunityStore((s) => s.proposeGroup);
  const joinedGroupIds = useCommunityStore((s) => s.joinedGroupIds);

  const [proposing, setProposing] = useState(false);

  const requireAuth = (action: () => void): void => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    action();
  };

  useEffect(() => {
    fetchGroups().catch(() => toast("Failed to load groups.", "error"));
  }, [fetchGroups]);

  const handleToggleGroup = async (group: CommunityGroup) => {
    if (!userToken) return;
    const isJoined = joinedGroupIds.includes(group._id);
    try {
      if (isJoined) {
        await leaveGroup(group._id, userToken);
        toast(`Left "${group.name}"`, "info");
      } else {
        await joinGroup(
          group._id,
          userToken,
          currentUser?.displayName ?? "Member",
        );
        toast(`Joined "${group.name}"`, "success");
      }
    } catch {
      toast("Failed to update membership.", "error");
    }
  };

  const handlePropose = async (payload: ProposeGroupPayload) => {
    if (!userToken) return;
    setProposing(true);
    try {
      await proposeGroup(payload, userToken);
      toast("Your group proposal has been submitted for review!", "success");
    } catch {
      toast("Failed to submit group proposal.", "error");
    } finally {
      setProposing(false);
    }
  };

  void handlePropose;
  void proposing;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page header */}
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
            <div className="flex-1">
              <h1 className="responsive-heading text-neutral-900 leading-tight">
                All Peer Groups
              </h1>
              <p className="text-sm text-neutral-500">
                Browse and join groups that matter to you
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={() => requireAuth(() => navigate("/community"))}
                style={{ minHeight: 0 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white transition-colors shadow-sm shrink-0"
              >
                <FaPlus size={11} />
                <span className="hidden sm:inline">Propose a Group</span>
              </button>
            )}
          </div>

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
                to join groups and propose new ones.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Groups list */}
      <div className="responsive-container py-10 sm:py-12 lg:py-16">
        {isGroupsLoading ? (
          <div className="flex items-center justify-center py-20">
            <FaSpinner className="animate-spin text-neutral-400" size={24} />
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-neutral-400 py-16 text-center">
            No groups available yet.
          </p>
        ) : (
          <>
            <p className="text-xs text-neutral-400 font-medium mb-4 uppercase tracking-wide">
              {groups.length} {groups.length === 1 ? "group" : "groups"}{" "}
              available
            </p>
            <div className="flex flex-col gap-3">
              {[...groups]
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .map((group, i) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    index={i}
                    isJoined={joinedGroupIds.includes(group._id)}
                    onJoin={() => requireAuth(() => handleToggleGroup(group))}
                    isGuest={!isAuthenticated}
                    onClick={() => navigate(`/community/groups/${group._id}`)}
                  />
                ))}
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="mt-4 w-full py-2.5 rounded-xl border-2 border-dashed border-neutral-300 text-sm font-semibold text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaLock size={11} />
                Sign in to join groups or propose a new one
              </button>
            )}
          </>
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

AllPeerGroupsPage.displayName = "AllPeerGroupsPage";

export default AllPeerGroupsPage;
