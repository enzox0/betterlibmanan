import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaComment,
  FaUsers,
  FaCamera,
  FaSpinner,
  FaLock,
  FaEnvelope,
  FaUser,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaCheck,
} from "react-icons/fa";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useUserStore } from "@/modules/admin/store/userStore";
import { useCommunityStore } from "@/modules/admin/store/communityStore";
import SafeImage, { getProxiedUrl } from "../components/ui/SafeImage";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-neutral-200 rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        {icon}
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Labeled field ────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-400">{hint}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UserProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const currentUser = useUserStore((s) => s.user);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const changePassword = useUserStore((s) => s.changePassword);
  const isLoading = useUserStore((s) => s.isLoading);

  const discussions = useCommunityStore((s) => s.discussions);
  const isDiscussionsLoading = useCommunityStore((s) => s.isDiscussionsLoading);
  const fetchDiscussions = useCommunityStore((s) => s.fetchDiscussions);
  const groups = useCommunityStore((s) => s.groups);
  const isGroupsLoading = useCommunityStore((s) => s.isGroupsLoading);
  const fetchGroups = useCommunityStore((s) => s.fetchGroups);
  const joinedGroupIds = useCommunityStore((s) => s.joinedGroupIds);

  // ── Redirect guests ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) navigate("/community", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    fetchDiscussions().catch(() => {});
    fetchGroups().catch(() => {});
  }, [fetchDiscussions, fetchGroups]);

  // ── Profile fields ──────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(
    currentUser?.displayName ?? "",
  );
  const [email, setEmail] = useState(currentUser?.email ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentUser?.avatarUrl || null,
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password fields ─────────────────────────────────────────────────────────
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep fields in sync if user store updates externally
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName);
      setEmail(currentUser.email);
      setAvatarPreview(currentUser.avatarUrl || null);
    }
  }, [currentUser]);

  // ── Derived data ────────────────────────────────────────────────────────────

  const myDiscussions = discussions.filter(
    (d) => d.author === currentUser?.displayName,
  );

  const myGroups = groups.filter((g) => joinedGroupIds.includes(g._id));

  // ── Avatar ──────────────────────────────────────────────────────────────────
  const handleAvatarFile = (file: File) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast("Only PNG, JPG, or WebP images are supported.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be under 2 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setAvatarPreview(url);
    };
    reader.readAsDataURL(file);
  };

  // ── Save profile ────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast("Display name cannot be empty.", "error");
      return;
    }
    if (!email.trim()) {
      toast("Email cannot be empty.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        email: email.trim(),
        // Only send avatarUrl if it's a data URL (freshly picked) or cleared
        avatarUrl:
          avatarPreview && avatarPreview.startsWith("data:")
            ? avatarPreview
            : (avatarPreview ?? ""),
      });
      toast("Profile updated!", "success");
    } catch {
      // error already handled in store
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Save password ───────────────────────────────────────────────────────────
  const handleSavePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      toast("Please fill in all password fields.", "error");
      return;
    }
    if (newPass.length < 8) {
      toast("New password must be at least 8 characters.", "error");
      return;
    }
    if (newPass !== confirmPass) {
      toast("Passwords do not match.", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: currentPass,
        newPassword: newPass,
      });
      toast("Password changed successfully.", "success");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch {
      // error already handled in store
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = currentUser?.displayName.slice(0, 2).toUpperCase() ?? "??";

  if (!isAuthenticated || !currentUser) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-200">
        <div className="responsive-container py-6 sm:py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/community")}
              style={{ minHeight: 0 }}
              className="p-2 rounded-xl hover:bg-neutral-100 active:bg-neutral-200 transition-colors text-neutral-500 shrink-0"
              aria-label="Back"
            >
              <FaArrowLeft size={14} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="responsive-heading text-neutral-900 leading-tight">
                My Profile
              </h1>
              <p className="text-sm text-neutral-500 mt-0.5">
                Manage your account details and community activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="responsive-container py-8 sm:py-10 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left column — edit forms ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Avatar + Display Name banner */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6 flex items-center gap-5"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={
                        avatarPreview.startsWith("data:")
                          ? avatarPreview
                          : getProxiedUrl(avatarPreview)
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : currentUser.avatarUrl ? (
                    <img
                      src={getProxiedUrl(currentUser.avatarUrl)}
                      alt={currentUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-600">
                      {initials}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ minHeight: 0 }}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors shadow"
                  aria-label="Change avatar"
                >
                  <FaCamera size={10} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAvatarFile(f);
                  }}
                />
              </div>

              {/* Name + username */}
              <div className="min-w-0">
                <p className="text-lg font-bold text-neutral-900 truncate">
                  {currentUser.displayName}
                </p>
                <p className="text-sm text-neutral-500">
                  @{currentUser.username}
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Member since{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>

            {/* Edit profile details */}
            <Section
              title="Profile Details"
              icon={<FaUser size={12} className="text-neutral-400" />}
            >
              <div className="flex flex-col gap-4">
                <Field label="Display Name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={64}
                    style={{ fontSize: "16px" }}
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
                    placeholder="Your display name"
                  />
                </Field>

                <Field
                  label="Username"
                  hint="Username cannot be changed after registration."
                >
                  <input
                    value={currentUser.username}
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-sm text-neutral-400 cursor-not-allowed"
                  />
                </Field>

                <Field label="Email">
                  <div className="relative">
                    <FaEnvelope
                      size={11}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                    />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      style={{ fontSize: "16px" }}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                </Field>

                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || isLoading}
                  className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow disabled:opacity-60"
                >
                  {savingProfile ? (
                    <FaSpinner className="animate-spin" size={12} />
                  ) : (
                    <FaCheck size={11} />
                  )}
                  Save Changes
                </button>
              </div>
            </Section>

            {/* Change password */}
            <Section
              title="Change Password"
              icon={<FaKey size={12} className="text-neutral-400" />}
            >
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: "Current Password",
                    value: currentPass,
                    set: setCurrentPass,
                    show: showCurrentPass,
                    toggle: () => setShowCurrentPass((v) => !v),
                  },
                  {
                    label: "New Password",
                    value: newPass,
                    set: setNewPass,
                    show: showNewPass,
                    toggle: () => setShowNewPass((v) => !v),
                  },
                  {
                    label: "Confirm New Password",
                    value: confirmPass,
                    set: setConfirmPass,
                    show: showConfirmPass,
                    toggle: () => setShowConfirmPass((v) => !v),
                  },
                ].map(({ label, value, set, show, toggle }) => (
                  <Field key={label} label={label}>
                    <div className="relative">
                      <FaLock
                        size={11}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                      />
                      <input
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        style={{ fontSize: "16px" }}
                        className="w-full pl-8 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        style={{ minHeight: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label={show ? "Hide password" : "Show password"}
                      >
                        {show ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                      </button>
                    </div>
                  </Field>
                ))}

                {/* Password strength hint */}
                {newPass && (
                  <p
                    className={cn(
                      "text-[11px] font-medium",
                      newPass.length < 8
                        ? "text-red-500"
                        : newPass.length < 12
                          ? "text-amber-500"
                          : "text-green-600",
                    )}
                  >
                    {newPass.length < 8
                      ? "Too short — minimum 8 characters"
                      : newPass.length < 12
                        ? "Moderate strength"
                        : "Strong password"}
                  </p>
                )}

                <button
                  onClick={handleSavePassword}
                  disabled={savingPassword || isLoading}
                  className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black text-white text-sm font-semibold transition-colors shadow disabled:opacity-60"
                >
                  {savingPassword ? (
                    <FaSpinner className="animate-spin" size={12} />
                  ) : (
                    <FaKey size={11} />
                  )}
                  Update Password
                </button>
              </div>
            </Section>
          </div>

          {/* ── Right column — activity ── */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 flex flex-col gap-6">
            {/* My Discussions */}
            <Section
              title="My Discussions"
              icon={<FaComment size={12} className="text-neutral-400" />}
            >
              {isDiscussionsLoading ? (
                <div className="flex justify-center py-6">
                  <FaSpinner
                    className="animate-spin text-neutral-300"
                    size={18}
                  />
                </div>
              ) : myDiscussions.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  You haven't started any discussions yet.
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {myDiscussions.map((d) => (
                    <li key={d._id}>
                      <button
                        onClick={() =>
                          navigate(`/community/discussions/${d._id}`)
                        }
                        style={{ minHeight: 0 }}
                        className="w-full text-left p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all"
                      >
                        <p className="text-xs font-semibold text-neutral-800 line-clamp-2 leading-snug mb-1">
                          {d.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <FaComment size={9} />
                          <span>
                            {d.replies} {d.replies === 1 ? "reply" : "replies"}
                          </span>
                          {d.tags.length > 0 && (
                            <>
                              <span>·</span>
                              <span className="truncate">
                                #{d.tags[0]}
                                {d.tags.length > 1 && ` +${d.tags.length - 1}`}
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {/* Joined Groups */}
            <Section
              title="My Groups"
              icon={<FaUsers size={12} className="text-neutral-400" />}
            >
              {isGroupsLoading ? (
                <div className="flex justify-center py-6">
                  <FaSpinner
                    className="animate-spin text-neutral-300"
                    size={18}
                  />
                </div>
              ) : myGroups.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  You haven't joined any groups yet.
                </p>
              ) : (
                <ol className="flex flex-col gap-3">
                  {myGroups.map((g) => (
                    <li key={g._id}>
                      <button
                        onClick={() => navigate(`/community/groups/${g._id}`)}
                        style={{ minHeight: 0 }}
                        className="w-full text-left p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:bg-neutral-50 transition-all flex items-center gap-3"
                      >
                        {g.imageUrl ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-200">
                            <SafeImage
                              src={g.imageUrl}
                              alt={g.name}
                              className="w-full h-full object-cover"
                              containerClassName="w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-neutral-200 flex items-center justify-center shrink-0">
                            <FaUsers size={14} className="text-neutral-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-neutral-800 truncate leading-snug">
                            {g.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {g.memberCount}{" "}
                            {g.memberCount === 1 ? "member" : "members"}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

UserProfilePage.displayName = "UserProfilePage";

export default UserProfilePage;
