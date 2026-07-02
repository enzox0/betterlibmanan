import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuEye,
  LuEyeOff,
  LuCircleCheck,
  LuLoaderCircle,
  LuArrowLeft,
  LuShieldCheck,
  LuClock,
} from "react-icons/lu";
import { submitAdminRegistration } from "../../services/admin-registrations.api";
import heroBg from "@/assets/image/hero-bg.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  reason: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  displayName?: string;
  username?: string;
  email?: string;
  phone?: string;
  department?: string;
  reason?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const INITIAL_FORM: FormState = {
  displayName: "",
  username: "",
  email: "",
  phone: "",
  department: "",
  reason: "",
  password: "",
  confirmPassword: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputBase =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50 hover:border-gray-300`;
const inputError = `${inputBase} border-red-300 bg-red-50`;

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminRegisterPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    else if (form.displayName.trim().length < 2)
      next.displayName = "Full name must be at least 2 characters.";

    if (!form.username.trim()) next.username = "Username is required.";
    else if (!/^[a-z0-9_]{3,32}$/.test(form.username.trim()))
      next.username =
        "Username: 3–32 characters, lowercase letters, numbers, underscores only.";

    if (!form.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";

    if (!form.password) next.password = "Password is required.";
    else if (form.password.length < 8)
      next.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match.";

    if (!form.reason.trim())
      next.reason = "Please briefly describe why you need admin access.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      await submitAdminRegistration({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        department: form.department.trim(),
        reason: form.reason.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
          <div className="p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <LuCircleCheck className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Registration Submitted
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Your admin registration request has been submitted successfully. A
              Super Admin will review your request and notify you of the
              decision.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-6 flex items-start gap-3 text-left">
              <LuClock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Your account will remain in a{" "}
                <span className="font-semibold">Pending Approval</span> state
                until a Super Admin reviews and approves your request.
              </p>
            </div>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <LuArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-white"
      >
        {/* ── Left panel ── */}
        <div
          className="hidden md:flex md:w-2/5 flex-col justify-between relative overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/30 to-gray-900/80" />

          {/* Logo */}
          <div className="relative z-10 p-8 flex items-center gap-2.5">
            <img
              src="/betterlibmanan.png"
              alt="BetterLibmanan"
              className="h-10 w-auto drop-shadow-md"
              draggable={false}
            />
            <span className="text-white font-bold text-sm tracking-wide drop-shadow">
              BetterLibmanan
            </span>
          </div>

          {/* Info cards */}
          <div className="relative z-10 p-8 space-y-3">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <LuShieldCheck className="h-4 w-4 text-blue-300 shrink-0" />
                <span className="text-sm font-semibold text-white">
                  Pending Approval Required
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                All admin registrations must be reviewed and approved by a Super
                Admin before granting access to the dashboard.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <LuClock className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="text-sm font-semibold text-white">
                  Review Process
                </span>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Once approved, you'll gain admin privileges and access to the
                BetterLibmanan Admin Dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:px-12 overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="flex items-center gap-2.5 mb-6 md:hidden">
              <img
                src="/betterlibmanan.png"
                alt="BetterLibmanan"
                className="h-9 w-auto"
                draggable={false}
              />
              <span className="font-bold text-gray-900 text-sm tracking-wide">
                BetterLibmanan
              </span>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Register for Admin Access
              </h1>
              <p className="text-sm text-gray-500">
                Fill in your details to request an admin account. Your
                application will be reviewed by a Super Admin.
              </p>
            </div>

            {/* Form-level error */}
            <AnimatePresence>
              {errors.form && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
                >
                  <LuLoaderCircle
                    className="h-4 w-4 shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  {errors.form}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={form.displayName}
                  onChange={(e) => set("displayName", e.target.value)}
                  disabled={submitting}
                  aria-invalid={!!errors.displayName}
                  placeholder="e.g. Maria Santos"
                  className={errors.displayName ? inputError : inputNormal}
                />
                {errors.displayName && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.displayName}
                  </p>
                )}
              </div>

              {/* Username + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    autoComplete="username"
                    value={form.username}
                    onChange={(e) =>
                      set("username", e.target.value.toLowerCase())
                    }
                    disabled={submitting}
                    aria-invalid={!!errors.username}
                    placeholder="e.g. msantos"
                    className={errors.username ? inputError : inputNormal}
                  />
                  {errors.username && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="reg-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    disabled={submitting}
                    aria-invalid={!!errors.email}
                    placeholder="admin@libmanan.gov.ph"
                    className={errors.email ? inputError : inputNormal}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone + Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="reg-phone"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Phone{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    disabled={submitting}
                    placeholder="+63 9XX XXX XXXX"
                    className={inputNormal}
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-dept"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Department{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="reg-dept"
                    type="text"
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    disabled={submitting}
                    placeholder="e.g. DILG Office"
                    className={inputNormal}
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label
                  htmlFor="reg-reason"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Reason for Admin Access{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reg-reason"
                  rows={3}
                  value={form.reason}
                  onChange={(e) => set("reason", e.target.value)}
                  disabled={submitting}
                  aria-invalid={!!errors.reason}
                  placeholder="Briefly explain why you need admin access to BetterLibmanan…"
                  className={`${errors.reason ? inputError : inputNormal} resize-none`}
                />
                {errors.reason && (
                  <p role="alert" className="mt-1 text-xs text-red-600">
                    {errors.reason}
                  </p>
                )}
              </div>

              {/* Password section */}
              <div className="pt-1 border-t border-gray-100">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                  Set Password
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        disabled={submitting}
                        aria-invalid={!!errors.password}
                        placeholder="Min. 8 characters"
                        className={`${errors.password ? inputError : inputNormal} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <LuEyeOff className="h-4 w-4" />
                        ) : (
                          <LuEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="reg-confirm"
                      className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                      Confirm <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={(e) => set("confirmPassword", e.target.value)}
                        disabled={submitting}
                        aria-invalid={!!errors.confirmPassword}
                        placeholder="Repeat password"
                        className={`${errors.confirmPassword ? inputError : inputNormal} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <LuEyeOff className="h-4 w-4" />
                        ) : (
                          <LuEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p role="alert" className="mt-1 text-xs text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting…
                  </span>
                ) : (
                  "Submit Registration Request"
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-5 flex flex-col items-center gap-2 text-xs text-gray-400">
              <p>
                Already have an account?{" "}
                <Link
                  to="/admin/login"
                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <Link
                to="/"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                ← Back to BetterLibmanan.org
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

AdminRegisterPage.displayName = "AdminRegisterPage";
export default AdminRegisterPage;
