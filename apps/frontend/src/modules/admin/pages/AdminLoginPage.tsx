import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAdminStore } from '../store/adminStore';
import heroBg from '@/assets/image/hero-bg.png';

interface FormErrors {
  username?: string;
  password?: string;
  form?: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useAdminStore((s) => s.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const usernameRef = useRef<HTMLInputElement>(null);

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
      navigate('/admin', { replace: true });
    } else {
      setErrors({ form: 'Invalid credentials. Please try again.' });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ minHeight: '560px' }}
      >
        {/* ── Left panel — hero image + quote ── */}
        <div
          className="hidden md:flex md:w-2/5 flex-col justify-between relative overflow-hidden"
          style={{ minHeight: '560px' }}
          aria-hidden="true"
        >
          {/* Background image */}
          <img
            src={heroBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-900/30 to-gray-900/80" />

          {/* Logo / branding */}
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

          {/* Quote at bottom */}
          <div className="relative z-10 p-8">
            <blockquote className="text-white">
              <p className="text-lg font-semibold leading-snug mb-4">
                "Serving the people of Libmanan with transparency and dedication."
              </p>
              <footer>
                <p className="text-sm font-bold text-white/90">BetterGov | BatterLGU</p>
                <p className="text-xs text-white/60">Libmanan, Camarines Sur</p>
              </footer>
            </blockquote>
          </div>
        </div>

        {/* ── Right panel — login form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 sm:px-12">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile logo (shown only when left panel is hidden) */}
            <div className="flex items-center gap-2.5 mb-8 md:hidden">
              <img
                src="/betterlibmanan.png"
                alt="BetterLibmanan"
                className="h-9 w-auto"
                draggable={false}
              />
              <span className="font-bold text-gray-900 text-sm tracking-wide">BetterLibmanan</span>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Welcome back
              </h1>
              <p className="text-sm text-gray-500">
                Sign in to manage BetterLibmanan admin panel.
              </p>
            </div>

            {/* Form-level error */}
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 shrink-0 text-red-500"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                    clipRule="evenodd"
                  />
                </svg>
                {errors.form}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Username
                </label>
                <input
                  ref={usernameRef}
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'admin-username-error' : undefined}
                  placeholder="admin"
                  className={[
                    'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    errors.username
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:bg-white',
                  ].join(' ')}
                />
                {errors.username && (
                  <p id="admin-username-error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'admin-password-error' : undefined}
                    placeholder="••••••••"
                    className={[
                      'w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-gray-800 placeholder-gray-400 transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      errors.password
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 focus:bg-white',
                    ].join(' ')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
                        <path d="m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="admin-password-error" role="alert" className="mt-1 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
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
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Back to site */}
            <p className="mt-6 text-center text-xs text-gray-400">
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:underline transition-colors"
              >
                ← Back to BetterLibmanan.org
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

AdminLoginPage.displayName = 'AdminLoginPage';
export default AdminLoginPage;
