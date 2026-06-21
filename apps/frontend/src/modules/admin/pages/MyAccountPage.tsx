import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import {
  LuX,
  LuCheck,
  LuPencil,
  LuUserPlus,
  LuCircleCheck,
  LuTrash2,
  LuLogIn,
  LuCalendar,
  LuClock,
  LuShield,
  LuBuilding2,
  LuPhone,
  LuMail,
  LuUser,
  LuLoader,
  LuLoaderCircle,
} from "react-icons/lu";
import { useAdminStore } from "../store/adminStore";
import {
  getMeRequest,
  updateMeRequest,
  changeMyPasswordRequest,
  getMyActivityRequest,
  type ActivityLogEntry,
  type AdminProfile,
} from "../services/auth.api";

// ─── Constants ───────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ROLE_META: Record<string, { label: string; classes: string }> = {
  superadmin: {
    label: "Super Admin",
    classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  admin: {
    label: "Admin",
    classes: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
};

const AVATAR_COLORS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-violet-700",
  "from-rose-500 to-rose-700",
  "from-teal-500 to-teal-700",
];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 16 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarGradient(name: string) {
  const sum = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Map an audit log action string to an icon type for the activity list. */
function actionToIcon(action: string, module: string): string {
  if (action === "LOGIN") return "login";
  if (action === "LOGOUT" || action === "LOGOUT_ALL") return "login";
  if (action === "DELETE") return "trash";
  if (action === "CREATE") return "user-plus";
  if (module === "MyAccount" || action === "UPDATE") return "edit";
  if (action === "ACTIVATE") return "check";
  return "edit";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[role] ?? {
    label: role,
    classes: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
}

function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      {icon && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-1">
          {label}
        </p>
        <div className="text-sm font-medium text-gray-800">{value}</div>
      </div>
    </div>
  );
}

const ACTIVITY_ICON_COLORS: Record<string, string> = {
  edit: "bg-blue-50 text-blue-500",
  "user-plus": "bg-violet-50 text-violet-500",
  check: "bg-green-50 text-green-500",
  trash: "bg-red-50 text-red-500",
  login: "bg-gray-100 text-gray-500",
};

function ActivityIcon({ type }: { type: string }) {
  const base = "h-4 w-4";
  if (type === "edit") return <LuPencil className={base} aria-hidden="true" />;
  if (type === "user-plus")
    return <LuUserPlus className={base} aria-hidden="true" />;
  if (type === "check")
    return <LuCircleCheck className={base} aria-hidden="true" />;
  if (type === "trash") return <LuTrash2 className={base} aria-hidden="true" />;
  return <LuLogIn className={base} aria-hidden="true" />;
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────

interface EditProfileModalProps {
  profile: AdminProfile;
  onClose: () => void;
  onSave: (updated: AdminProfile) => void;
  accessToken: string;
}

function EditProfileModal({
  profile,
  onClose,
  onSave,
  accessToken,
}: EditProfileModalProps) {
  const [form, setForm] = useState({
    displayName: profile.displayName ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    department: profile.department ?? "",
    bio: profile.bio ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(key: K, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.displayName.trim()) next.displayName = "Full name is required.";
    if (!form.email.trim()) next.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const updated = await updateMeRequest(
        {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          department: form.department.trim(),
          bio: form.bio.trim(),
        },
        accessToken,
      );
      onSave(updated);
      onClose();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? "Failed to save. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
  const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
  const inputError = `${inputBase} border-red-300 bg-red-50`;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: EASE }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div
            className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2
                id="edit-profile-title"
                className="text-base font-bold text-gray-900"
              >
                Edit Profile
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Update your personal information.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              <LuX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {apiError && (
                <div
                  className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700"
                  role="alert"
                >
                  <LuLoaderCircle
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  />
                  {apiError}
                </div>
              )}
              <div>
                <label
                  htmlFor="ep-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="ep-name"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setField("displayName", e.target.value)}
                  placeholder="Your full name"
                  aria-invalid={!!errors.displayName}
                  className={errors.displayName ? inputError : inputNormal}
                />
                {errors.displayName && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.displayName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="ep-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email Address{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="ep-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="you@libmanan.gov.ph"
                  aria-invalid={!!errors.email}
                  className={errors.email ? inputError : inputNormal}
                />
                {errors.email && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="ep-phone"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="ep-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="+63 9XX XXX XXXX"
                  className={inputNormal}
                />
              </div>
              <div>
                <label
                  htmlFor="ep-dept"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Department / Office
                </label>
                <input
                  id="ep-dept"
                  type="text"
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="e.g. Office of the Mayor"
                  className={inputNormal}
                />
              </div>
              <div>
                <label
                  htmlFor="ep-bio"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Bio
                </label>
                <textarea
                  id="ep-bio"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setField("bio", e.target.value)}
                  placeholder="A brief description about you…"
                  className={`${inputNormal} resize-none`}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {submitting && (
                  <LuLoader
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

interface ChangePasswordModalProps {
  onClose: () => void;
  accessToken: string;
}

function ChangePasswordModal({
  onClose,
  accessToken,
}: ChangePasswordModalProps) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function setField(key: keyof typeof form, val: string) {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!form.current) next.current = "Current password is required.";
    if (!form.next) next.next = "New password is required.";
    else if (form.next.length < 8)
      next.next = "Password must be at least 8 characters.";
    if (form.next !== form.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError(null);
    try {
      await changeMyPasswordRequest(
        { currentPassword: form.current, newPassword: form.next },
        accessToken,
      );
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ??
          "Failed to update password. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all";
  const inputNormal = `${inputBase} border-gray-200 bg-gray-50`;
  const inputError = `${inputBase} border-red-300 bg-red-50`;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-pw-title"
      >
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: EASE }}
          onClick={onClose}
          aria-hidden="true"
        />
        <motion.div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.28, ease: EASE }}
        >
          <div
            className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"
            aria-hidden="true"
          />
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2
                id="change-pw-title"
                className="text-base font-bold text-gray-900"
              >
                Change Password
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                Choose a strong, unique password.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              <LuX className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {success ? (
            <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <LuCheck
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Password updated!
              </p>
              <p className="text-xs text-gray-400">Closing automatically…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="px-6 py-5 space-y-4">
                {apiError && (
                  <div
                    className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-700"
                    role="alert"
                  >
                    <LuLoaderCircle
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                    {apiError}
                  </div>
                )}
                <div>
                  <label
                    htmlFor="cp-current"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Current Password{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="cp-current"
                    type="password"
                    value={form.current}
                    onChange={(e) => setField("current", e.target.value)}
                    placeholder="Your current password"
                    aria-invalid={!!errors.current}
                    className={errors.current ? inputError : inputNormal}
                  />
                  {errors.current && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.current}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="cp-next"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    New Password{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="cp-next"
                    type="password"
                    value={form.next}
                    onChange={(e) => setField("next", e.target.value)}
                    placeholder="Min. 8 characters"
                    aria-invalid={!!errors.next}
                    className={errors.next ? inputError : inputNormal}
                  />
                  {errors.next && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.next}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="cp-confirm"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Confirm Password{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="cp-confirm"
                    type="password"
                    value={form.confirm}
                    onChange={(e) => setField("confirm", e.target.value)}
                    placeholder="Repeat new password"
                    aria-invalid={!!errors.confirm}
                    className={errors.confirm ? inputError : inputNormal}
                  />
                  {errors.confirm && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.confirm}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60"
                >
                  {submitting && (
                    <LuLoader
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Update Password
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-gray-200" />
        <div className="px-6 pb-6 pt-4 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-gray-300 -mt-10" />
          <div className="h-5 w-48 rounded bg-gray-200" />
          <div className="h-3 w-32 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Activity Section ─────────────────────────────────────────────────────────

const ACTIVITY_PAGE_SIZE = 10;

function ActivitySection({
  log,
  loading,
  ease,
}: {
  log: ActivityLogEntry[];
  loading: boolean;
  ease: [number, number, number, number];
}) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? log : log.slice(0, ACTIVITY_PAGE_SIZE);
  const hasMore = log.length > ACTIVITY_PAGE_SIZE;

  return (
    <SectionCard
      title="Recent Activity"
      description="Your latest actions on the admin panel."
    >
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-gray-400 text-sm">
          <LuLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading activity…
        </div>
      ) : log.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          No activity recorded yet.
        </p>
      ) : (
        <>
          <ul className="space-y-1" aria-label="Recent activity list">
            {visible.map((entry, i) => {
              const iconType = actionToIcon(entry.action, entry.module);
              return (
                <motion.li
                  key={entry._id}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.22, ease }}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ACTIVITY_ICON_COLORS[iconType]}`}
                  >
                    <ActivityIcon type={iconType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      {entry.description}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          {hasMore && (
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                {expanded
                  ? `Showing all ${log.length} entries`
                  : `Showing ${ACTIVITY_PAGE_SIZE} of ${log.length} entries`}
              </p>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
              >
                {expanded
                  ? "Show less"
                  : `View ${log.length - ACTIVITY_PAGE_SIZE} more`}
              </button>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MyAccountPage() {
  const {
    admin: storeAdmin,
    accessToken,
    setAdmin,
  } = useAdminStore((s) => ({
    admin: s.admin,
    accessToken: s.accessToken,
    setAdmin: s.setAdmin,
  }));

  // Always null on mount — the skeleton shows until the DB response arrives.
  // Never use the persisted store value here; it may be stale or missing
  // the extended fields (phone, department, bio, passwordChangedAt).
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch full profile on mount (DB hit for extended fields)
  const fetchProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setPageError(null);
      const data = await getMeRequest(accessToken);
      setProfile(data);
    } catch (err: any) {
      setPageError(err?.response?.data?.message ?? "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch activity log on mount
  const fetchActivity = useCallback(async () => {
    if (!accessToken) return;
    try {
      setActivityLoading(true);
      const logs = await getMyActivityRequest(accessToken);
      setActivityLog(logs);
    } catch {
      // non-critical — silently fail
    } finally {
      setActivityLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, [fetchProfile, fetchActivity]);

  function handleProfileSave(updated: AdminProfile) {
    setProfile(updated);
    setAdmin(updated); // sync store so sidebar/header reflect the new name
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) return <PageSkeleton />;

  if (pageError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <LuLoaderCircle className="h-6 w-6 text-red-500" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold text-gray-800">
          Could not load profile
        </p>
        <p className="text-xs text-gray-400 max-w-xs">{pageError}</p>
        <button
          type="button"
          onClick={fetchProfile}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const gradient = getAvatarGradient(profile.displayName);
  const token = accessToken ?? "";

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Account</h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Manage your profile, credentials, and preferences.
        </p>
      </div>

      {/* ── Profile Hero Card ── */}
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div
          className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900"
          aria-hidden="true"
        />
        <div className="px-6 pb-6">
          <div className="flex items-start justify-between gap-4 -mt-10">
            <div
              className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black shrink-0 ring-4 ring-white shadow-lg select-none`}
              aria-hidden="true"
            >
              {getInitials(profile.displayName)}
            </div>
            <button
              ref={editButtonRef}
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-12 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm"
            >
              <LuPencil className="h-4 w-4" aria-hidden="true" />
              Edit Profile
            </button>
          </div>
          <div className="mt-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {profile.displayName}
              </h2>
              <RoleBadge role={profile.role} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">@{profile.username}</p>
          </div>
          {profile.bio && (
            <p className="mt-4 text-sm text-gray-500 max-w-prose leading-relaxed">
              {profile.bio}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-4 pt-5 border-t border-gray-100">
            {profile.createdAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <LuCalendar
                  className="h-3.5 w-3.5 text-gray-400"
                  aria-hidden="true"
                />
                Joined {formatDate(profile.createdAt)}
              </div>
            )}
            {profile.lastLoginAt && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <LuClock
                  className="h-3.5 w-3.5 text-gray-400"
                  aria-hidden="true"
                />
                Last login {formatDateTime(profile.lastLoginAt)}
              </div>
            )}
          </div>
        </div>

        {/* Save toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.22, ease: EASE }}
              role="status"
              aria-live="polite"
            >
              <LuCheck className="h-4 w-4" aria-hidden="true" />
              Profile saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Contact Information"
            description="Your contact details and department."
          >
            <InfoRow
              label="Email Address"
              value={
                <a
                  href={`mailto:${profile.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {profile.email}
                </a>
              }
              icon={<LuMail className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <InfoRow
              label="Phone Number"
              value={
                profile.phone || <span className="text-gray-300">Not set</span>
              }
              icon={<LuPhone className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <InfoRow
              label="Department"
              value={
                profile.department || (
                  <span className="text-gray-300">Not set</span>
                )
              }
              icon={<LuBuilding2 className="h-3.5 w-3.5" aria-hidden="true" />}
            />
            <InfoRow
              label="Username"
              value={
                <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-xs">
                  @{profile.username}
                </span>
              }
              icon={<LuUser className="h-3.5 w-3.5" aria-hidden="true" />}
            />
          </SectionCard>

          {/* Activity Log */}
          <ActivitySection
            log={activityLog}
            loading={activityLoading}
            ease={EASE}
          />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <SectionCard title="Account Details">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Role
                </p>
                <RoleBadge role={profile.role} />
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Status
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-green-500"
                    aria-hidden="true"
                  />
                  Active
                </span>
              </div>
              {profile.createdAt && (
                <div className="pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Member Since
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
              )}
              {profile.lastLoginAt && (
                <div className="pt-3 border-t border-gray-50">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Last Login
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDateTime(profile.lastLoginAt)}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Manage your login credentials."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm">
                    <LuShield className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Password
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {profile.passwordChangedAt
                        ? `Last changed ${formatDate(profile.passwordChangedAt)}`
                        : "Last changed: never"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPwOpen(true)}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all shadow-sm"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm">
                    <LuShield className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Two-Factor Auth
                    </p>
                    <p className="text-[11px] text-gray-400">Not configured</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-600 ring-1 ring-amber-200">
                  Off
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Modals */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => {
            setEditOpen(false);
            setTimeout(() => editButtonRef.current?.focus(), 0);
          }}
          onSave={handleProfileSave}
          accessToken={token}
        />
      )}
      {pwOpen && (
        <ChangePasswordModal
          onClose={() => setPwOpen(false)}
          accessToken={token}
        />
      )}
    </motion.div>
  );
}

export default MyAccountPage;
