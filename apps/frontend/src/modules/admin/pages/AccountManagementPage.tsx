import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";
import { useAdminStore } from "../store/adminStore";
import { TableSkeletonRows, Pagination } from "@/shared/ui";
import {
  fetchAccounts,
  createAccountRequest,
  updateAccountRequest,
  deleteAccountRequest,
  setAccountStatusRequest,
  type AdminAccount,
  type AccountRole,
  type CreateAccountPayload,
  type UpdateAccountPayload,
} from "../services/accounts.api";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountStatus = "active" | "inactive";

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PAGE_SIZE = 20;

const ROLE_META: Record<AccountRole, { label: string; classes: string }> = {
  superadmin: {
    label: "Super Admin",
    classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  admin: {
    label: "Admin",
    classes: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
};

const STATUS_META: Record<
  AccountStatus,
  { label: string; dotClass: string; classes: string }
> = {
  active: {
    label: "Active",
    dotClass: "bg-green-500",
    classes: "bg-green-50 text-green-700 ring-1 ring-green-200",
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-gray-400",
    classes: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.18, ease: EASE } },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-teal-500",
  "bg-indigo-500",
];

function getAvatarColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
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

function StatusBadge({ status }: { status: AccountStatus }) {
  const { label, dotClass, classes } = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotClass}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function Avatar({ account }: { account: AdminAccount }) {
  return (
    <div
      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${getAvatarColor(account._id)}`}
      aria-hidden="true"
    >
      {getInitials(account.displayName)}
    </div>
  );
}

// ─── Account Form Modal ───────────────────────────────────────────────────────

interface AccountFormModalProps {
  mode: "create" | "edit";
  initialData?: AdminAccount;
  onClose: () => void;
  onSave: (data: CreateAccountPayload | UpdateAccountPayload) => Promise<void>;
}

interface FormState {
  displayName: string;
  username: string;
  email: string;
  role: AccountRole;
  isActive: boolean;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function AccountFormModal({
  mode,
  initialData,
  onClose,
  onSave,
}: AccountFormModalProps) {
  const [form, setForm] = useState<FormState>({
    displayName: initialData?.displayName ?? "",
    username: initialData?.username ?? "",
    email: initialData?.email ?? "",
    role: initialData?.role ?? "admin",
    isActive: initialData?.isActive ?? true,
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const isCreate = mode === "create";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key as keyof FormErrors];
        return n;
      });
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.displayName.trim()) next.displayName = "Full name is required.";
    if (isCreate) {
      if (!form.username.trim()) next.username = "Username is required.";
      else if (!/^[a-z0-9_]{3,32}$/.test(form.username.trim()))
        next.username =
          "Username: 3–32 characters, lowercase letters, numbers, underscores.";
    }
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (isCreate) {
      if (!form.password) next.password = "Password is required.";
      else if (form.password.length < 8)
        next.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match.";
    } else if (form.password) {
      if (form.password.length < 8)
        next.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword)
        next.confirmPassword = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setApiError(null);
    try {
      if (isCreate) {
        await onSave({
          displayName: form.displayName.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
          password: form.password,
        } as CreateAccountPayload);
      } else {
        const update: UpdateAccountPayload = {
          displayName: form.displayName.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive,
        };
        if (form.password) update.password = form.password;
        await onSave(update);
      }
      onClose();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || err?.message || "An error occurred.",
      );
    } finally {
      setSaving(false);
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
        aria-modal="true"
        role="dialog"
        aria-labelledby="account-form-title"
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
          className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
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
                id="account-form-title"
                className="text-base font-bold text-gray-900"
              >
                {isCreate ? "New Account" : "Edit Account"}
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                {isCreate
                  ? "Set up a new admin account."
                  : "Update account details."}
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
          <form id="account-form" onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {apiError && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200"
                >
                  {apiError}
                </p>
              )}
              <div>
                <label
                  htmlFor="af-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name{" "}
                  <span className="text-red-500" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="af-name"
                  type="text"
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  placeholder="e.g. Maria Santos"
                  aria-invalid={!!errors.displayName}
                  className={errors.displayName ? inputError : inputNormal}
                />
                {errors.displayName && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.displayName}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="af-username"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Username{" "}
                    {isCreate && (
                      <span className="text-red-500" aria-hidden="true">
                        *
                      </span>
                    )}
                  </label>
                  <input
                    id="af-username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      set("username", e.target.value.toLowerCase())
                    }
                    placeholder="e.g. msantos"
                    disabled={!isCreate}
                    aria-invalid={!!errors.username}
                    className={`${errors.username ? inputError : inputNormal} ${!isCreate ? "opacity-60 cursor-not-allowed" : ""}`}
                  />
                  {errors.username && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="af-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="af-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="user@libmanan.gov.ph"
                    aria-invalid={!!errors.email}
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="af-role"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Role
                  </label>
                  <select
                    id="af-role"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value as AccountRole)}
                    className={inputNormal}
                  >
                    <option value="superadmin">Super Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="af-status"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Status
                  </label>
                  <select
                    id="af-status"
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      set("isActive", e.target.value === "active")
                    }
                    className={inputNormal}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="pt-1 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  {isCreate ? "Set Password" : "Change Password"}
                  {!isCreate && (
                    <span className="ml-1 font-normal normal-case tracking-normal text-gray-400">
                      (leave blank to keep current)
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="af-password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Password{" "}
                      {isCreate && (
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>
                    <input
                      id="af-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="Min. 8 characters"
                      aria-invalid={!!errors.password}
                      className={errors.password ? inputError : inputNormal}
                    />
                    {errors.password && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="af-confirm"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Confirm{" "}
                      {isCreate && (
                        <span className="text-red-500" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>
                    <input
                      id="af-confirm"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      placeholder="Repeat password"
                      aria-invalid={!!errors.confirmPassword}
                      className={
                        errors.confirmPassword ? inputError : inputNormal
                      }
                    />
                    {errors.confirmPassword && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="account-form"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Create Account"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  account: AdminAccount;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteDialog({ account, onClose, onConfirm }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleConfirm() {
    setDeleting(true);
    setApiError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message || err?.message || "Delete failed.",
      );
      setDeleting(false);
    }
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
        aria-labelledby="delete-dialog-title"
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
          className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: EASE }}
        >
          <div
            className="h-1 bg-gradient-to-r from-red-500 to-red-600"
            aria-hidden="true"
          />
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-red-600"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
              </div>
              <div>
                <h2
                  id="delete-dialog-title"
                  className="text-sm font-bold text-gray-900"
                >
                  Remove Account
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-gray-800">
                    {account.displayName}
                  </span>{" "}
                  (@{account.username})? This action cannot be undone.
                </p>
                {apiError && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {apiError}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all disabled:opacity-60"
              >
                {deleting ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Summary Card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm border-gray-100">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p
        className={`mt-0.5 text-xs font-semibold uppercase tracking-widest ${color}`}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Access Denied Banner ─────────────────────────────────────────────────────

function AccessDeniedBanner() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5 text-amber-500 shrink-0 mt-0.5"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold text-amber-800">View Only</p>
        <p className="mt-0.5 text-xs text-amber-700">
          Only Super Admins can create, edit, delete, or change account status.
          You can view the account list.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = "all" | AccountStatus;
type FilterRole = "all" | AccountRole;

export function AccountManagementPage() {
  const { admin, accessToken } = useAdminStore((s) => ({
    admin: s.admin,
    accessToken: s.accessToken,
  }));
  const isSuperAdmin = admin?.role === "superadmin";

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const loadAccounts = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setApiError(null);
    try {
      const data = await fetchAccounts(accessToken);
      setAccounts(data);
    } catch (err: any) {
      setApiError(err?.response?.data?.message || "Failed to load accounts.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterRole]);

  // ── Derived stats
  const totalActive = accounts.filter((a) => a.isActive).length;
  const totalSuperAdmins = accounts.filter(
    (a) => a.role === "superadmin",
  ).length;
  const totalAdmins = accounts.filter((a) => a.role === "admin").length;

  // ── Filtered + paginated
  const filtered = accounts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.displayName.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" ? a.isActive : !a.isActive);
    const matchRole = filterRole === "all" || a.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const colCount = isSuperAdmin ? 6 : 5;

  // ── CRUD handlers
  async function handleCreate(
    payload: CreateAccountPayload | UpdateAccountPayload,
  ) {
    await createAccountRequest(payload as CreateAccountPayload, accessToken!);
    await loadAccounts();
  }

  async function handleEdit(
    payload: CreateAccountPayload | UpdateAccountPayload,
  ) {
    if (!editTarget) return;
    await updateAccountRequest(
      editTarget._id,
      payload as UpdateAccountPayload,
      accessToken!,
    );
    await loadAccounts();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteAccountRequest(deleteTarget._id, accessToken!);
    await loadAccounts();
  }

  async function handleToggleStatus(account: AdminAccount) {
    await setAccountStatusRequest(account._id, !account.isActive, accessToken!);
    await loadAccounts();
  }

  function openEdit(account: AdminAccount) {
    setEditTarget(account);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode(null);
    setEditTarget(null);
    setTimeout(() => newButtonRef.current?.focus(), 0);
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Account Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage admin accounts, roles, and access permissions.
          </p>
        </div>
        {isSuperAdmin && (
          <button
            ref={newButtonRef}
            type="button"
            onClick={() => setFormMode("create")}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all self-start sm:self-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
            </svg>
            New Account
          </button>
        )}
      </div>

      {!isSuperAdmin && <AccessDeniedBanner />}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="Total Accounts"
          value={accounts.length}
          color="text-gray-400"
        />
        <SummaryCard
          label="Active"
          value={totalActive}
          color="text-green-600"
        />
        <SummaryCard
          label="Super Admins"
          value={totalSuperAdmins}
          color="text-blue-600"
        />
        <SummaryCard
          label="Admins"
          value={totalAdmins}
          color="text-violet-600"
        />
      </div>

      {/* Error */}
      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {apiError}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search by name, username, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search accounts"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              aria-label="Filter by status"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as FilterRole)}
              aria-label="Filter by role"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="all">All Roles</option>
              <option value="superadmin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Account
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Joined
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Last Login
                </th>
                {isSuperAdmin && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {loading ? (
              <tbody>
                <TableSkeletonRows rows={8} cols={colCount} />
              </tbody>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {paginated.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colCount}
                        className="py-12 text-center text-sm text-gray-400"
                      >
                        No accounts match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((account) => (
                      <motion.tr
                        key={account._id}
                        variants={rowVariants}
                        layout
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar account={account} />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {account.displayName}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                @{account.username} · {account.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <RoleBadge role={account.role} />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge
                            status={account.isActive ? "active" : "inactive"}
                          />
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {formatDate(account.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {account.lastLoginAt ? (
                            formatDateTime(account.lastLoginAt)
                          ) : (
                            <span className="text-gray-300">Never</span>
                          )}
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(account)}
                                title={
                                  account.isActive ? "Deactivate" : "Activate"
                                }
                                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${account.isActive ? "text-amber-700 bg-amber-50 hover:bg-amber-100 ring-1 ring-amber-200 focus:ring-amber-400" : "text-green-700 bg-green-50 hover:bg-green-100 ring-1 ring-green-200 focus:ring-green-400"}`}
                              >
                                {account.isActive ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openEdit(account)}
                                className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 ring-1 ring-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(account)}
                                disabled={account._id === admin?.id}
                                title={
                                  account._id === admin?.id
                                    ? "Cannot delete your own account"
                                    : "Remove account"
                                }
                                className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 ring-1 ring-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Remove
                              </button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))
                  )}
                </motion.tbody>
              </AnimatePresence>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {formMode && (
          <AccountFormModal
            mode={formMode}
            initialData={
              formMode === "edit" ? (editTarget ?? undefined) : undefined
            }
            onClose={closeForm}
            onSave={formMode === "create" ? handleCreate : handleEdit}
          />
        )}
      </AnimatePresence>

      {/* Delete dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            account={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
