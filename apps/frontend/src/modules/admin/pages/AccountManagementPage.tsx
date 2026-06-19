import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";

// ─── Types ──────────────────────────────────────────────────────────────────

type AccountRole = "super-admin" | "editor" | "viewer";
type AccountStatus = "active" | "inactive";

interface AdminAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  createdAt: string;
  lastLogin: string | null;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_ACCOUNTS: AdminAccount[] = [
  {
    id: "acc-001",
    name: "Maria Santos",
    username: "admin",
    email: "mayor@libmanan.gov.ph",
    role: "super-admin",
    status: "active",
    createdAt: "2024-01-10T08:00:00.000Z",
    lastLogin: "2024-06-14T09:22:00.000Z",
  },
  {
    id: "acc-002",
    name: "Jose Reyes",
    username: "jreyes",
    email: "jreyes@libmanan.gov.ph",
    role: "editor",
    status: "active",
    createdAt: "2024-02-15T10:00:00.000Z",
    lastLogin: "2024-06-13T14:05:00.000Z",
  },
  {
    id: "acc-003",
    name: "Ana Dela Cruz",
    username: "adelacruz",
    email: "adelacruz@libmanan.gov.ph",
    role: "editor",
    status: "inactive",
    createdAt: "2024-03-20T09:30:00.000Z",
    lastLogin: null,
  },
  {
    id: "acc-004",
    name: "Ramon Villanueva",
    username: "rvillanueva",
    email: "rvillanueva@libmanan.gov.ph",
    role: "viewer",
    status: "active",
    createdAt: "2024-04-05T11:00:00.000Z",
    lastLogin: "2024-06-10T08:47:00.000Z",
  },
];

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
      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${getAvatarColor(account.id)}`}
      aria-hidden="true"
    >
      {getInitials(account.name)}
    </div>
  );
}

// ─── Account Form Modal ────────────────────────────────────────────────────────

interface AccountFormModalProps {
  mode: "create" | "edit";
  initialData?: AdminAccount;
  onClose: () => void;
  onSave: (data: Omit<AdminAccount, "id" | "createdAt" | "lastLogin">) => void;
}

interface FormState {
  name: string;
  username: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
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
    name: initialData?.name ?? "",
    username: initialData?.username ?? "",
    email: initialData?.email ?? "",
    role: initialData?.role ?? "editor",
    status: initialData?.status ?? "active",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const firstInputRef = useRef<HTMLInputElement>(null);

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
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.username.trim()) next.username = "Username is required.";
    else if (!/^[a-z0-9_]{3,32}$/.test(form.username.trim())) {
      next.username =
        "Username must be 3–32 characters: lowercase letters, numbers, underscores.";
    }
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (isCreate) {
      if (!form.password) next.password = "Password is required.";
      else if (form.password.length < 8)
        next.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match.";
      }
    } else if (form.password) {
      if (form.password.length < 8)
        next.password = "Password must be at least 8 characters.";
      if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      role: form.role,
      status: form.status,
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
          {/* Top accent */}
          <div
            className="h-1 bg-gradient-to-r from-blue-600 to-blue-800"
            aria-hidden="true"
          />

          {/* Header */}
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

          {/* Body */}
          <form id="account-form" onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Name */}
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
                  ref={firstInputRef}
                  id="af-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Maria Santos"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "af-name-error" : undefined}
                  className={errors.name ? inputError : inputNormal}
                />
                {errors.name && (
                  <p
                    id="af-name-error"
                    role="alert"
                    className="mt-1 text-xs text-red-600"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Username + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="af-username"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Username{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="af-username"
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      set("username", e.target.value.toLowerCase())
                    }
                    placeholder="e.g. msantos"
                    aria-invalid={!!errors.username}
                    aria-describedby={
                      errors.username ? "af-username-error" : undefined
                    }
                    className={errors.username ? inputError : inputNormal}
                  />
                  {errors.username && (
                    <p
                      id="af-username-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
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
                    aria-describedby={
                      errors.email ? "af-email-error" : undefined
                    }
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && (
                    <p
                      id="af-email-error"
                      role="alert"
                      className="mt-1 text-xs text-red-600"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Role + Status */}
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
                    <option value="super-admin">Super Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
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
                    value={form.status}
                    onChange={(e) =>
                      set("status", e.target.value as AccountStatus)
                    }
                    className={inputNormal}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password */}
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
                      aria-describedby={
                        errors.password ? "af-password-error" : undefined
                      }
                      className={errors.password ? inputError : inputNormal}
                    />
                    {errors.password && (
                      <p
                        id="af-password-error"
                        role="alert"
                        className="mt-1 text-xs text-red-600"
                      >
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
                      aria-describedby={
                        errors.confirmPassword ? "af-confirm-error" : undefined
                      }
                      className={
                        errors.confirmPassword ? inputError : inputNormal
                      }
                    />
                    {errors.confirmPassword && (
                      <p
                        id="af-confirm-error"
                        role="alert"
                        className="mt-1 text-xs text-red-600"
                      >
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                {isCreate ? "Create Account" : "Save Changes"}
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
  onConfirm: () => void;
}

function DeleteDialog({ account, onClose, onConfirm }: DeleteDialogProps) {
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
                    {account.name}
                  </span>{" "}
                  (@{account.username})? This action cannot be undone.
                </p>
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
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

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
    <div className={`rounded-xl border bg-white p-4 shadow-sm border-gray-100`}>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p
        className={`mt-0.5 text-xs font-semibold uppercase tracking-widest ${color}`}
      >
        {label}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterStatus = "all" | AccountStatus;
type FilterRole = "all" | AccountRole;

export function AccountManagementPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(INITIAL_ACCOUNTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");

  const [formMode, setFormMode] = useState<null | "create" | "edit">(null);
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);

  const newButtonRef = useRef<HTMLButtonElement>(null);

  // ── Derived stats
  const totalActive = accounts.filter((a) => a.status === "active").length;
  const totalAdmins = accounts.filter((a) => a.role === "super-admin").length;
  const totalEditors = accounts.filter((a) => a.role === "editor").length;

  // ── Filtered list
  const filtered = accounts.filter((a) => {
    const matchSearch =
      search.trim() === "" ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.username.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchRole = filterRole === "all" || a.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  // ── CRUD handlers
  function handleCreate(
    data: Omit<AdminAccount, "id" | "createdAt" | "lastLogin">,
  ) {
    const newAccount: AdminAccount = {
      ...data,
      id: `acc-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };
    setAccounts((prev) => [...prev, newAccount]);
  }

  function handleEdit(
    data: Omit<AdminAccount, "id" | "createdAt" | "lastLogin">,
  ) {
    if (!editTarget) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === editTarget.id ? { ...a, ...data } : a)),
    );
  }

  function handleDelete(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  function openEdit(account: AdminAccount) {
    setEditTarget(account);
    setFormMode("edit");
  }

  function openDelete(account: AdminAccount) {
    setDeleteTarget(account);
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
      </div>

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
          value={totalAdmins}
          color="text-blue-600"
        />
        <SummaryCard
          label="Editors"
          value={totalEditors}
          color="text-violet-600"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:items-center">
          {/* Search */}
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
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search by name, username, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search accounts"
              className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            aria-label="Filter by status"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-auto transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {/* Role filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
            aria-label="Filter by role"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-auto transition-all"
          >
            <option value="all">All Roles</option>
            <option value="super-admin">Super Admin</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <motion.div
            className="py-16 text-center"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-gray-300 mx-auto mb-3"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p className="text-sm font-medium text-gray-400">
              No accounts found.
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Try adjusting your search or filters.
            </p>
          </motion.div>
        )}

        {/* Desktop table */}
        {filtered.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr className="bg-gray-50/60">
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Account
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Joined
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-gray-50 bg-white"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <AnimatePresence mode="popLayout">
                  {filtered.map((account) => (
                    <motion.tr
                      key={account.id}
                      className="hover:bg-blue-50/20 transition-colors group"
                      variants={rowVariants}
                      exit="exit"
                      layout
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar account={account} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {account.name}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              @{account.username} · {account.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={account.role} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={account.status} />
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(account.createdAt)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {account.lastLogin ? (
                          formatDateTime(account.lastLogin)
                        ) : (
                          <span className="text-gray-300">Never</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(account)}
                            aria-label={`Edit ${account.name}`}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(account)}
                            aria-label={`Remove ${account.name}`}
                            disabled={
                              account.role === "super-admin" &&
                              accounts.filter((a) => a.role === "super-admin")
                                .length === 1
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        )}

        {/* Mobile card view */}
        {filtered.length > 0 && (
          <motion.ul
            className="md:hidden divide-y divide-gray-100"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((account) => (
                <motion.li
                  key={account.id}
                  className="p-4"
                  variants={rowVariants}
                  exit="exit"
                  layout
                >
                  <div className="flex items-start gap-3">
                    <Avatar account={account} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {account.name}
                        </p>
                        <StatusBadge status={account.status} />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        @{account.username} · {account.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <RoleBadge role={account.role} />
                        <span className="text-xs text-gray-400">
                          Joined {formatDate(account.createdAt)}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                        <button
                          type="button"
                          onClick={() => openEdit(account)}
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDelete(account)}
                          disabled={
                            account.role === "super-admin" &&
                            accounts.filter((a) => a.role === "super-admin")
                              .length === 1
                          }
                          className="flex-1 rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}

        {/* Table footer with count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 rounded-b-xl">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {accounts.length} account
              {accounts.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>

      {/* Create form modal */}
      {formMode === "create" && (
        <AccountFormModal
          mode="create"
          onClose={closeForm}
          onSave={handleCreate}
        />
      )}

      {/* Edit form modal */}
      {formMode === "edit" && editTarget && (
        <AccountFormModal
          mode="edit"
          initialData={editTarget}
          onClose={closeForm}
          onSave={handleEdit}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <DeleteDialog
          account={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget.id)}
        />
      )}
    </motion.div>
  );
}

export default AccountManagementPage;
