import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";

// ─── Types ───────────────────────────────────────────────────────────────────

type AccountRole = "super-admin" | "editor" | "viewer";

interface UserProfile {
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  phone: string;
  department: string;
  bio: string;
  joinedAt: string;
  lastLogin: string;
}

// ─── Mock "current user" ─────────────────────────────────────────────────────

const CURRENT_USER: UserProfile = {
  name: "Maria Santos",
  username: "admin",
  email: "mayor@libmanan.gov.ph",
  role: "super-admin",
  phone: "+63 917 123 4567",
  department: "Office of the Mayor",
  bio: "Administrator for the BetterLibmanan web platform. Manages content, accounts, and site settings.",
  joinedAt: "2024-01-10T08:00:00.000Z",
  lastLogin: "2024-06-14T09:22:00.000Z",
};

// ─── Constants ───────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ROLE_META: Record<AccountRole, { label: string; classes: string }> = {
  "super-admin": {
    label: "Super Admin",
    classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  editor: {
    label: "Editor",
    classes: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
  viewer: {
    label: "Viewer",
    classes: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: AccountRole }) {
  const { label, classes } = ROLE_META[role];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
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
      <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
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

// ─── Edit Profile Modal ────────────────────────────────────────────────────────

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
}

function EditProfileModal({ profile, onClose, onSave }: EditProfileModalProps) {
  const [form, setForm] = useState({
    name: profile.name,
    phone: profile.phone,
    department: profile.department,
    bio: profile.bio,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!form.name.trim()) next.name = "Full name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      phone: form.phone.trim(),
      department: form.department.trim(),
      bio: form.bio.trim(),
    });
    onClose();
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
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
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  className={errors.name ? inputError : inputNormal}
                />
                {errors.name && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.name}
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
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
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
}

function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSuccess(true);
    setTimeout(onClose, 1400);
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-green-600"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Password updated!
              </p>
              <p className="text-xs text-gray-400">Closing automatically…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="px-6 py-5 space-y-4">
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
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                >
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

// ─── Activity Log (mock) ──────────────────────────────────────────────────────

const ACTIVITY_LOG = [
  {
    id: 1,
    action: "Updated hero section content",
    ts: "2024-06-14T09:22:00.000Z",
    icon: "edit",
  },
  {
    id: 2,
    action: "Created new editor account",
    ts: "2024-06-13T14:05:00.000Z",
    icon: "user-plus",
  },
  {
    id: 3,
    action: "Published latest update #12",
    ts: "2024-06-12T11:30:00.000Z",
    icon: "check",
  },
  {
    id: 4,
    action: "Deleted draft from services section",
    ts: "2024-06-10T08:47:00.000Z",
    icon: "trash",
  },
  {
    id: 5,
    action: "Logged in from Chrome / Windows",
    ts: "2024-06-09T07:15:00.000Z",
    icon: "login",
  },
];

function ActivityIcon({ type }: { type: string }) {
  const base = "h-4 w-4";
  if (type === "edit")
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className={base}
        aria-hidden="true"
      >
        <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.79 2.291a.75.75 0 0 0 .949.95l2.29-.79a2.75 2.75 0 0 0 .892-.597l4.262-4.262a1.75 1.75 0 0 0 0-2.475Z" />
        <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
      </svg>
    );
  if (type === "user-plus")
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className={base}
        aria-hidden="true"
      >
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 8 17c1.52 0 2.959-.346 4.125-.955A1.23 1.23 0 0 0 12.535 14.493C11.657 12.39 9.998 11 8 11c-1.998 0-3.657 1.39-4.535 3.493Z" />
        <path d="M13.25 8.75a.75.75 0 0 1 .75.75v1.25h1.25a.75.75 0 0 1 0 1.5H14v1.25a.75.75 0 0 1-1.5 0V12.25H11.25a.75.75 0 0 1 0-1.5H12.5V9.5a.75.75 0 0 1 .75-.75Z" />
      </svg>
    );
  if (type === "check")
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className={base}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
          clipRule="evenodd"
        />
      </svg>
    );
  if (type === "trash")
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className={base}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Z"
          clipRule="evenodd"
        />
      </svg>
    );
  // login
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className={base}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M2 4.75A2.75 2.75 0 0 1 4.75 2h3a2.75 2.75 0 0 1 2.75 2.75v.5a.75.75 0 0 1-1.5 0v-.5c0-.69-.56-1.25-1.25-1.25h-3c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h3c.69 0 1.25-.56 1.25-1.25v-.5a.75.75 0 0 1 1.5 0v.5A2.75 2.75 0 0 1 7.75 14h-3A2.75 2.75 0 0 1 2 11.25v-6.5Zm9.47.47a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 1 1-1.06-1.06l.97-.97H6.75a.75.75 0 0 1 0-1.5h5.69l-.97-.97a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const ACTIVITY_ICON_COLORS: Record<string, string> = {
  edit: "bg-blue-50 text-blue-500",
  "user-plus": "bg-violet-50 text-violet-500",
  check: "bg-green-50 text-green-500",
  trash: "bg-red-50 text-red-500",
  login: "bg-gray-100 text-gray-500",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MyAccountPage() {
  const [profile, setProfile] = useState<UserProfile>(CURRENT_USER);
  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const editButtonRef = useRef<HTMLButtonElement>(null);

  function handleProfileSave(updates: Partial<UserProfile>) {
    setProfile((prev) => ({ ...prev, ...updates }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const gradient = getAvatarGradient(profile.name);

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
        {/* Banner */}
        <div
          className="h-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900"
          aria-hidden="true"
        />

        <div className="px-6 pb-6">
          {/* Avatar + actions row */}
          <div className="flex items-start justify-between gap-4 -mt-10">
            {/* Avatar — straddles banner */}
            <div
              className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-black shrink-0 ring-4 ring-white shadow-lg select-none`}
              aria-hidden="true"
            >
              {getInitials(profile.name)}
            </div>

            {/* Edit profile button — pinned to the right, on white */}
            <button
              ref={editButtonRef}
              type="button"
              onClick={() => setEditOpen(true)}
              className="mt-12 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.79 2.291a.75.75 0 0 0 .949.95l2.29-.79a2.75 2.75 0 0 0 .892-.597l4.262-4.262a1.75 1.75 0 0 0 0-2.475Z" />
                <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9a.75.75 0 0 1 1.5 0v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Name + role — always below the avatar, fully on white */}
          <div className="mt-3 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 leading-tight">
                {profile.name}
              </h2>
              <RoleBadge role={profile.role} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-gray-500 max-w-prose leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Quick stats strip */}
          <div className="mt-5 flex flex-wrap gap-4 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7Z"
                  clipRule="evenodd"
                />
              </svg>
              Joined {formatDate(profile.joinedAt)}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5 text-gray-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Last login {formatDateTime(profile.lastLogin)}
            </div>
          </div>
        </div>

        {/* Save confirmation toast */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
                  clipRule="evenodd"
                />
              </svg>
              Profile saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Contact Info */}
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
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
              }
            />
            <InfoRow
              label="Phone Number"
              value={
                profile.phone || <span className="text-gray-300">Not set</span>
              }
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.5 2A1.5 1.5 0 0 0 2 3.5V5c0 5.799 4.701 10.5 10.5 10.5H14a1.5 1.5 0 0 0 1.5-1.5v-1.232a1.5 1.5 0 0 0-1.12-1.452l-2.07-.518a1.5 1.5 0 0 0-1.586.698l-.032.052a11.034 11.034 0 0 1-4.24-4.24l.052-.032a1.5 1.5 0 0 0 .698-1.586L6.684 3.62A1.5 1.5 0 0 0 5.232 2.5H3.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
            <InfoRow
              label="Department"
              value={
                profile.department || (
                  <span className="text-gray-300">Not set</span>
                )
              }
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3.5A1.5 1.5 0 0 1 4.5 2h7A1.5 1.5 0 0 1 13 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 12.5v-9Zm4 6a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H7Zm0-2.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H7ZM6.5 5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H7a.5.5 0 0 1-.5-.5Z"
                    clipRule="evenodd"
                  />
                </svg>
              }
            />
            <InfoRow
              label="Username"
              value={
                <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-xs">
                  @{profile.username}
                </span>
              }
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
              }
            />
          </SectionCard>

          {/* Activity Log */}
          <SectionCard
            title="Recent Activity"
            description="Your latest actions on the admin panel."
          >
            <ul className="space-y-1" aria-label="Recent activity list">
              {ACTIVITY_LOG.map((entry, i) => (
                <motion.li
                  key={entry.id}
                  className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.22, ease: EASE }}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${ACTIVITY_ICON_COLORS[entry.icon]}`}
                  >
                    <ActivityIcon type={entry.icon} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      {entry.action}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {formatDateTime(entry.ts)}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </SectionCard>
        </div>

        {/* Right: Quick actions + Security */}
        <div className="space-y-6">
          {/* Account Details */}
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
              <div className="pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Member Since
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {formatDate(profile.joinedAt)}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
                  Last Login
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {formatDateTime(profile.lastLogin)}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Security */}
          <SectionCard
            title="Security"
            description="Manage your login credentials."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-500 shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">
                      Password
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Last changed: never
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9.5 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM6.75 9.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5h-2.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
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
        />
      )}
      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </motion.div>
  );
}

export default MyAccountPage;
