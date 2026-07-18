import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useUserStore } from "@/modules/admin/store/userStore";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

interface UserAuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional: redirect or callback after successful auth */
  onSuccess?: () => void;
  /** Start on a specific tab */
  defaultTab?: "login" | "register";
}

export function UserAuthModal({
  open,
  onClose,
  onSuccess,
  defaultTab = "login",
}: UserAuthModalProps) {
  const { toast } = useToast();
  const login = useUserStore((s) => s.login);
  const register = useUserStore((s) => s.register);
  const isLoading = useUserStore((s) => s.isLoading);
  const error = useUserStore((s) => s.error);
  const clearError = useUserStore((s) => s.clearError);

  const [tab, setTab] = useState<"login" | "register">(defaultTab);

  // Login fields
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register fields
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);

  const resetFields = () => {
    setLoginId("");
    setLoginPass("");
    setShowLoginPass(false);
    setRegName("");
    setRegUsername("");
    setRegEmail("");
    setRegPass("");
    setShowRegPass(false);
    clearError();
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const handleSwitchTab = (t: "login" | "register") => {
    clearError();
    setTab(t);
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !loginPass) {
      toast("Please fill in all fields.", "error");
      return;
    }
    try {
      await login({ emailOrUsername: loginId.trim(), password: loginPass });
      toast("Welcome back!", "success");
      resetFields();
      onSuccess?.();
      onClose();
    } catch {
      // error already in store
    }
  };

  const handleRegister = async () => {
    if (
      !regName.trim() ||
      !regUsername.trim() ||
      !regEmail.trim() ||
      !regPass
    ) {
      toast("Please fill in all fields.", "error");
      return;
    }
    if (regPass.length < 8) {
      toast("Password must be at least 8 characters.", "error");
      return;
    }
    try {
      await register({
        displayName: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPass,
      });
      toast("Account created! Welcome to the community.", "success");
      resetFields();
      onSuccess?.();
      onClose();
    } catch {
      // error already in store
    }
  };

  const inputBase =
    "w-full px-3 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/5 outline-none text-sm text-neutral-900 placeholder:text-neutral-400 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white w-full sm:max-w-sm shadow-2xl rounded-t-3xl sm:rounded-2xl pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-4 pb-2 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-neutral-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4 sm:pt-5">
              <div>
                <h2 className="text-base font-bold text-neutral-900">
                  {tab === "login" ? "Sign In" : "Create Account"}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {tab === "login"
                    ? "Sign in to join discussions and groups"
                    : "Join the community — it's free"}
                </p>
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

            {/* Tab switcher */}
            <div className="flex mx-5 mb-5 rounded-xl bg-neutral-100 p-1 gap-1">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleSwitchTab(t)}
                  style={{ minHeight: 0 }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold transition-all",
                    tab === t
                      ? "bg-white text-neutral-900 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700",
                  )}
                >
                  {t === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-5 mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.15 }}
                  className="px-5 flex flex-col gap-3"
                >
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Email or Username
                    </label>
                    <div className="relative">
                      <FaUser
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={12}
                      />
                      <input
                        autoFocus
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="you@example.com or username"
                        style={{ fontSize: "16px", paddingLeft: "2rem" }}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <FaLock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={12}
                      />
                      <input
                        type={showLoginPass ? "text" : "password"}
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        placeholder="Your password"
                        style={{
                          fontSize: "16px",
                          paddingLeft: "2rem",
                          paddingRight: "2.5rem",
                        }}
                        className={inputBase}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass((v) => !v)}
                        style={{ minHeight: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        aria-label={
                          showLoginPass ? "Hide password" : "Show password"
                        }
                      >
                        {showLoginPass ? (
                          <FaEyeSlash size={13} />
                        ) : (
                          <FaEye size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="mt-1 w-full rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow disabled:opacity-60"
                  >
                    {isLoading ? "Signing in…" : "Sign In"}
                  </button>
                  <p className="text-center text-xs text-neutral-500 pb-1">
                    No account?{" "}
                    <button
                      onClick={() => handleSwitchTab("register")}
                      style={{ minHeight: 0 }}
                      className="font-semibold text-neutral-900 hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.15 }}
                  className="px-5 flex flex-col gap-3"
                >
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Display Name
                    </label>
                    <div className="relative">
                      <FaUser
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={12}
                      />
                      <input
                        autoFocus
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Juan Dela Cruz"
                        maxLength={64}
                        style={{ fontSize: "16px", paddingLeft: "2rem" }}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">
                        @
                      </span>
                      <input
                        value={regUsername}
                        onChange={(e) =>
                          setRegUsername(
                            e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                          )
                        }
                        placeholder="juandelacruz"
                        maxLength={32}
                        style={{ fontSize: "16px", paddingLeft: "1.75rem" }}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative">
                      <FaEnvelope
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={12}
                      />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        style={{ fontSize: "16px", paddingLeft: "2rem" }}
                        className={inputBase}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Password{" "}
                      <span className="normal-case font-normal">
                        (min 8 chars)
                      </span>
                    </label>
                    <div className="relative">
                      <FaLock
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        size={12}
                      />
                      <input
                        type={showRegPass ? "text" : "password"}
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        placeholder="Choose a strong password"
                        style={{
                          fontSize: "16px",
                          paddingLeft: "2rem",
                          paddingRight: "2.5rem",
                        }}
                        className={inputBase}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass((v) => !v)}
                        style={{ minHeight: 0 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        aria-label={
                          showRegPass ? "Hide password" : "Show password"
                        }
                      >
                        {showRegPass ? (
                          <FaEyeSlash size={13} />
                        ) : (
                          <FaEye size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="mt-1 w-full rounded-xl bg-neutral-900 hover:bg-neutral-700 active:bg-black py-2.5 text-sm font-semibold text-white transition-colors shadow disabled:opacity-60"
                  >
                    {isLoading ? "Creating account…" : "Create Account"}
                  </button>
                  <p className="text-center text-xs text-neutral-500 pb-1">
                    Already have an account?{" "}
                    <button
                      onClick={() => handleSwitchTab("login")}
                      style={{ minHeight: 0 }}
                      className="font-semibold text-neutral-900 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default UserAuthModal;
