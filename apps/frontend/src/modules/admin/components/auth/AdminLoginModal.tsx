import { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAdminStore } from '../../store/adminStore';

interface FormErrors {
  username?: string;
  password?: string;
  form?: string;
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 16 },
};

const transition = { ease: EASE, duration: 0.3 };

function ModalContent() {
  const navigate = useNavigate();
  const closeLoginModal = useAdminStore((s) => s.closeLoginModal);
  const login = useAdminStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const modalRef = useRef<HTMLDivElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    usernameRef.current?.focus();

    return () => {
      if (
        previousFocusRef.current &&
        typeof (previousFocusRef.current as HTMLElement).focus === 'function'
      ) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeLoginModal]);

  const handleTrapFocus = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const container = modalRef.current;
    if (!container) return;

    const focusable = getFocusableElements(container);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!username.trim()) next.username = 'Username is required.';
    if (!password.trim()) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    await new Promise<void>((resolve) => setTimeout(resolve, 600));

    if (username === 'admin' && password === 'admin123') {
      login();
      navigate('/admin');
    } else {
      setErrors({ form: 'Invalid credentials. Please try again.' });
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
      aria-labelledby="admin-login-title"
      onKeyDown={handleTrapFocus}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Modal card */}
      <motion.div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-800" aria-hidden="true" />

        <div className="p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            {/* Logo mark */}
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-white" aria-hidden="true">
                <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.06l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 0 0 1.061 1.06l8.69-8.69z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a.3.3 0 0 1 .091-.086L12 5.432z" />
              </svg>
            </div>
            <h1
              id="admin-login-title"
              className="text-lg font-bold text-gray-900"
            >
              Admin Access
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Sign in to manage BetterLibmanan
            </p>
          </div>

          {/* Form-level error */}
          {errors.form && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="admin-username" className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <input
                ref={usernameRef}
                id="admin-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'admin-username-error' : undefined}
                className={[
                  'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
                  errors.username
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50',
                ].join(' ')}
                placeholder="admin"
              />
              {errors.username && (
                <p id="admin-username-error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'admin-password-error' : undefined}
                className={[
                  'w-full rounded-lg border px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-all',
                  errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-gray-50',
                ].join(' ')}
                placeholder="••••••••"
              />
              {errors.password && (
                <p id="admin-password-error" role="alert" className="mt-1 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeLoginModal}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AdminLoginModal() {
  const loginModalOpen = useAdminStore((s) => s.loginModalOpen);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {loginModalOpen && <ModalContent key="admin-login-modal" />}
    </AnimatePresence>,
    document.body,
  );
}

export default AdminLoginModal;
