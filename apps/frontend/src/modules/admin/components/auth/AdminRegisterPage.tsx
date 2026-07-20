import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuEye,
  LuEyeOff,
  LuShieldCheck,
  LuClock,
  LuArrowLeft,
  LuCircleAlert,
  LuCircleCheck,
  LuX,
  LuMail,
} from "react-icons/lu";
import {
  initiateAdminRegistration,
  lookupRegistrationByEmail,
  resendAdminRegistrationOtp,
  verifyAdminRegistrationOtp,
  type RegistrationLookup,
} from "../../services/admin-registrations.api";
import heroBg from "@/assets/image/hero-bg.png";

// Constants
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Input styles
const inputBase =
  "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed";
const inputNormal = `${inputBase} border-gray-200 bg-gray-50 hover:border-gray-300`;
const inputErr = `${inputBase} border-red-300 bg-red-50`;

// Form types
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
  reason?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
}

const EMPTY_FORM: FormState = {
  displayName: "",
  username: "",
  email: "",
  phone: "",
  department: "",
  reason: "",
  password: "",
  confirmPassword: "",
};

// Spinner component
function Spinner() {
  return (
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Duplicate Modal
function DuplicateModal({
  lookup,
  email,
  onClose,
}: {
  lookup: RegistrationLookup;
  email: string;
  onClose: () => void;
}) {
  const meta = {
    pending: {
      label: "Pending Review",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-400",
      icon: LuClock,
      description: "Your application is awaiting review by a Super Admin.",
    },
    approved: {
      label: "Approved",
      color: "text-green-700",
      bg: "bg-green-50 border-green-200",
      dot: "bg-green-500",
      icon: LuCircleCheck,
      description: "Your application was approved. You can now sign in.",
    },
    rejected: {
      label: "Rejected",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      icon: LuCircleAlert,
      description: "Your application was not approved.",
    },
  }[lookup.status];
  const Icon = meta.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: EASE }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div
          className={`h-1 w-full ${lookup.status === "pending" ? "bg-amber-400" : lookup.status === "approved" ? "bg-green-500" : "bg-red-500"}`}
        />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center border ${meta.bg}`}
              >
                <Icon className={`h-5 w-5 ${meta.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Application Already Exists
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  This email has already been used to apply
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>

          <div className={`rounded-xl border px-4 py-3.5 mb-4 ${meta.bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span
                className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}
              >
                {meta.label}
              </span>
            </div>
            <p className={`text-sm font-medium ${meta.color}`}>
              {meta.description}
            </p>
            {lookup.status === "rejected" && lookup.rejectionReason && (
              <p className="mt-2 text-xs text-red-600 border-t border-red-200 pt-2">
                <span className="font-semibold">Reason:</span>{" "}
                {lookup.rejectionReason}
              </p>
            )}
          </div>

          <div className="space-y-2.5 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Applicant</span>
              <span className="font-semibold text-gray-800">
                {lookup.displayName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold text-gray-800">{email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Submitted</span>
              <span className="font-semibold text-gray-800">
                {new Date(lookup.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex gap-2.5">
            {lookup.status === "approved" ? (
              <Link
                to="/admin/login"
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component
export function AdminRegisterPage() {
  // Form state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Step state
  type Step = "form" | "otp" | "success";
  const [step, setStep] = useState<Step>("form");
  const [tempId, setTempId] = useState<string | null>(null);

  // OTP state
  const [otp, setOtp] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  // Duplicate modal
  const [dupLookup, setDupLookup] = useState<RegistrationLookup | null>(null);

  // Password visibility
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Resend cooldown timer
  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = window.setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Handlers
  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
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
    const e: FormErrors = {};
    if (!form.displayName.trim()) {
      e.displayName = "Full name is required.";
    } else if (form.displayName.trim().length < 2) {
      e.displayName = "Must be at least 2 characters.";
    }

    if (!form.username.trim()) {
      e.username = "Username is required.";
    } else if (!/^[a-z0-9_]+$/.test(form.username.trim())) {
      e.username =
        "Username can only contain lowercase letters, numbers, and underscores.";
    } else if (
      form.username.trim().length < 3 ||
      form.username.trim().length > 32
    ) {
      e.username = "Username must be between 3 and 32 characters.";
    }

    if (!form.email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address.";
    }

    if (!form.reason.trim()) {
      e.reason = "Please describe why you need admin access.";
    }

    if (!form.password) {
      e.password = "Password is required.";
    } else if (form.password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      e.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = "Passwords do not match.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Handle form submit (initiate)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});

    try {
      const existing = await lookupRegistrationByEmail(form.email.trim());
      if (existing) {
        setDupLookup(existing);
        return;
      }

      const result = await initiateAdminRegistration({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        department: form.department.trim(),
        reason: form.reason.trim(),
      });

      setTempId(result.tempId);
      setStep("otp");
      setResendCooldown(60);
    } catch (err: any) {
      if (err?.response?.data?.message) {
        const msg = err.response.data.message;
        if (
          err?.response?.status === 409 &&
          msg.toLowerCase().includes("email")
        ) {
          const existing = await lookupRegistrationByEmail(
            form.email.trim(),
          ).catch(() => null);
          if (existing) {
            setDupLookup(existing);
            return;
          }
        }
        setErrors({ form: msg });
      } else {
        setErrors({
          form: "Something went wrong. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Handle resend OTP
  async function handleResendOtp() {
    if (!tempId || resendCooldown > 0 || submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      await resendAdminRegistrationOtp(tempId);
      setResendCooldown(60);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors({ form: msg || "Failed to resend OTP" });
    } finally {
      setSubmitting(false);
    }
  }

  // Handle verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!tempId || otp.length !== 6) return;
    setSubmitting(true);
    setErrors({});
    try {
      await verifyAdminRegistrationOtp(tempId, otp);
      setStep("success");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setErrors({ form: msg || "Verification failed" });
    } finally {
      setSubmitting(false);
    }
  }

  // OTP handlers
  function handleOtpChange(index: number, value: string) {
    const newOtp = otp.split("");
    newOtp[index] = value;
    const updated = newOtp.join("").slice(0, 6);
    setOtp(updated);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  // Render OTP screen
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div className="p-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <LuMail className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2 text-center">
              Verify your email
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 text-center">
              We've sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700">
                {form.email.trim()}
              </span>
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <AnimatePresence>
                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
                  >
                    <LuCircleAlert
                      className="h-4 w-4 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    {errors.form}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => (otpInputRefs.current[i] = el)}
                    type="text"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={submitting}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-lg border-2 border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || otp.length !== 6}
                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner />
                    Verifying...
                  </span>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={submitting || resendCooldown > 0}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render success screen
  if (step === "success") {
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
              Registration Successful!
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Your email has been verified and your admin registration request
              has been submitted. A Super Admin will review your request and
              you'll be notified of the decision.
            </p>
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 mb-7 flex items-start gap-3 text-left">
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
              <LuArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render form screen
  return (
    <>
      <AnimatePresence>
        {dupLookup && (
          <DuplicateModal
            lookup={dupLookup}
            email={form.email.trim()}
            onClose={() => setDupLookup(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-white"
          style={{ minHeight: "600px" }}
        >
          {/* Left panel */}
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

            <div className="relative z-10 p-8 space-y-3">
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <LuShieldCheck className="h-4 w-4 text-blue-300 shrink-0" />
                  <span className="text-sm font-semibold text-white">
                    Pending Approval Required
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  All admin registrations must be reviewed and approved by a
                  Super Admin before granting access to the dashboard.
                </p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 p-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <LuClock className="h-4 w-4 text-amber-300 shrink-0" />
                  <span className="text-sm font-semibold text-white">
                    Review Process
                  </span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Once approved, you'll gain admin privileges and full access to
                  the BetterLibmanan Admin Dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10 sm:px-12 overflow-y-auto">
            <div className="w-full max-w-sm mx-auto">
              {/* Mobile logo */}
              <div className="flex items-center gap-2.5 mb-8 md:hidden">
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
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Register for Admin Access
                </h1>
                <p className="text-sm text-gray-500">
                  Fill in your details to request an admin account. Your
                  application will be reviewed by a Super Admin.
                </p>
              </div>

              {/* Form level error */}
              <AnimatePresence>
                {errors.form && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
                  >
                    <LuCircleAlert
                      className="h-4 w-4 shrink-0 text-red-500"
                      aria-hidden="true"
                    />
                    {errors.form}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full name */}
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
                    onChange={(e) => updateField("displayName", e.target.value)}
                    disabled={submitting}
                    aria-invalid={!!errors.displayName}
                    placeholder="e.g. Maria Santos"
                    className={errors.displayName ? inputErr : inputNormal}
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
                        updateField("username", e.target.value.toLowerCase())
                      }
                      disabled={submitting}
                      aria-invalid={!!errors.username}
                      placeholder="e.g. msantos"
                      className={errors.username ? inputErr : inputNormal}
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
                      onChange={(e) => updateField("email", e.target.value)}
                      disabled={submitting}
                      aria-invalid={!!errors.email}
                      placeholder="admin@libmanan.gov.ph"
                      className={errors.email ? inputErr : inputNormal}
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
                      onChange={(e) => updateField("phone", e.target.value)}
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
                      onChange={(e) =>
                        updateField("department", e.target.value)
                      }
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
                    onChange={(e) => updateField("reason", e.target.value)}
                    disabled={submitting}
                    aria-invalid={!!errors.reason}
                    placeholder="Briefly explain why you need admin access to BetterLibmanan..."
                    className={`${
                      errors.reason ? inputErr : inputNormal
                    } resize-none`}
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
                          type={showPw ? "text" : "password"}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={(e) =>
                            updateField("password", e.target.value)
                          }
                          disabled={submitting}
                          aria-invalid={!!errors.password}
                          placeholder="Min. 8 characters"
                          className={`${
                            errors.password ? inputErr : inputNormal
                          } pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          tabIndex={-1}
                          aria-label={
                            showPw ? "Hide password" : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPw ? (
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
                          onChange={(e) =>
                            updateField("confirmPassword", e.target.value)
                          }
                          disabled={submitting}
                          aria-invalid={!!errors.confirmPassword}
                          placeholder="Repeat password"
                          className={`${
                            errors.confirmPassword ? inputErr : inputNormal
                          } pr-10`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                          aria-label={
                            showConfirm ? "Hide password" : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
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

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner />
                      Sending Code...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </form>

              {/* Footer links */}
              <div className="mt-6 space-y-1.5 text-center text-xs text-gray-400">
                <p>
                  Already have an account?{" "}
                  <Link
                    to="/admin/login"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
                <p>
                  <Link
                    to="/"
                    className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                  >
                    ← Back to BetterLibmanan.org
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

AdminRegisterPage.displayName = "AdminRegisterPage";
export default AdminRegisterPage;
