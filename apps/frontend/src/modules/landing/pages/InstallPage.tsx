import { motion } from "framer-motion";
import { usePWAInstall } from "@/shared/hooks";
import { MdOutlineInstallDesktop, MdOutlinePhoneAndroid } from "react-icons/md";
import { HiOutlineHome, HiOutlineClock } from "react-icons/hi2";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { TbDeviceDesktopDown } from "react-icons/tb";
import { FaChrome, FaEdge, FaAndroid } from "react-icons/fa";

const steps = [
  {
    icon: TbDeviceDesktopDown,
    title: "Install the app",
    description:
      "Add BetterLibmanan to your home screen for quick access and a full-screen experience.",
  },
  {
    icon: HiOutlineHome,
    title: "Pick your start screen",
    description:
      "Choose where you land when you open the app from your home screen icon.",
  },
  {
    icon: HiOutlineClock,
    title: "Open anytime",
    description:
      "Launch from your home screen like a native app — your preference is remembered.",
  },
];

const platforms = [
  { icon: FaChrome, label: "Chrome (desktop)" },
  { icon: FaEdge, label: "Edge (desktop)" },
  { icon: FaAndroid, label: "Chrome (Android)" },
];

export function InstallPage() {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-14 sm:pt-16 sm:pb-20"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              Save BetterLibmanan to your
              <br className="hidden sm:block" />
              <span className="text-blue-400"> home screen</span>
            </h1>
            <p className="mt-3 text-sm text-gray-400 sm:text-base max-w-xl mx-auto leading-relaxed">
              Install our web app for a focused experience. Supported on{" "}
              <strong className="text-gray-300">Android</strong> and{" "}
              <strong className="text-gray-300">desktop</strong> browsers
              (Chrome, Edge).
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {platforms.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur-sm"
              >
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-8 sm:gap-12">
            {[
              { label: "Zero storage needed", value: "0 MB" },
              { label: "Install time", value: "1 tap" },
              { label: "Works offline", value: "Yes" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  How it works
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Three steps to get the app on any supported device.
                </p>
              </motion.div>

              <ul className="flex flex-col gap-4">
                {steps.map(({ icon: Icon, title, description }, index) => (
                  <motion.li
                    key={title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg"
                  >
                    {/* Accent bar */}
                    <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-blue-500 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                    {/* Icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600 transition-colors group-hover:border-neutral-900 group-hover:bg-neutral-900 group-hover:text-white">
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900 mb-0.5">
                        {title}
                      </p>
                      <p className="text-sm text-gray-500 leading-snug">
                        {description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="lg:sticky lg:top-28 flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 text-neutral-600">
                    <MdOutlineInstallDesktop size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                      Quick install
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 leading-tight">
                      Install BetterLibmanan
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-5 leading-snug">
                  {isInstalled
                    ? "You've already installed BetterLibmanan. Open it any time from your home screen or app drawer."
                    : canInstall
                      ? "Your browser is ready to install this app. Click the button below and confirm the system install prompt."
                      : "To install, open this page in Chrome or Edge on desktop or Android, then use your browser's install option."}
                </p>

                {isInstalled ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                    <IoCheckmarkCircleOutline size={18} />
                    Already installed
                  </div>
                ) : (
                  <button
                    onClick={canInstall ? promptInstall : undefined}
                    disabled={!canInstall}
                    className="
                      w-full flex items-center justify-center gap-2
                      bg-blue-800 hover:bg-blue-700 active:scale-[0.98]
                      disabled:bg-neutral-100 disabled:text-gray-400
                      disabled:cursor-not-allowed
                      text-white text-sm font-semibold
                      px-5 py-3 rounded-xl
                      transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                    "
                  >
                    <MdOutlineInstallDesktop size={17} />
                    {canInstall
                      ? "Install app"
                      : "Not available in this browser"}
                  </button>
                )}

                {/* Divider */}
                <div className="mt-5 pt-4 border-t border-neutral-100">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
                    Supported on
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: FaChrome, label: "Chrome (desktop)" },
                      { icon: FaEdge, label: "Edge (desktop)" },
                      {
                        icon: MdOutlinePhoneAndroid,
                        label: "Chrome (Android)",
                      },
                    ].map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-neutral-50 border border-neutral-200 px-2.5 py-1 rounded-full"
                      >
                        <Icon size={11} className="text-gray-400" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
                  Quick routes
                </p>
                <p className="text-xs text-gray-500 leading-snug">
                  Home feed, search, and services are available as shortcuts on
                  Android and Windows after install. Sign-in state is preserved
                  across app launches.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

InstallPage.displayName = "InstallPage";

export default InstallPage;
