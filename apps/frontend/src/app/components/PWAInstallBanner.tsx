import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MdOutlineInstallDesktop } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { usePWAInstall } from "@/shared/hooks";

export function PWAInstallBanner() {
  const { canInstall, isInstalled, promptInstall, dismiss } = usePWAInstall();

  const [ready, setReady] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    if (!canInstall || isInstalled) return;
    const t = setTimeout(() => setReady(true), 1800);
    return () => clearTimeout(t);
  }, [canInstall, isInstalled]);

  useEffect(() => {
    const threshold = window.innerHeight * 0.75;
    const onScroll = () => setPastHero(window.scrollY >= threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = ready && pastHero && !isInstalled;

  return (
    <div className="hidden lg:block">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="pwa-banner"
            initial={{ opacity: 0, y: 24, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 24, x: "-50%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            role="banner"
            aria-label="Install BetterLibmanan app"
            className="
              fixed bottom-5 left-1/2 z-[9999]
              flex items-center gap-2
              bg-[#1e3a8a] text-white
              px-3.5 py-2 rounded-xl shadow-xl
              w-max max-w-[420px]
            "
          >
            <MdOutlineInstallDesktop
              className="shrink-0 text-white/80"
              size={16}
              aria-hidden="true"
            />

            {/* Message */}
            <p className="text-xs font-medium leading-snug whitespace-nowrap">
              Install BetterLibmanan for quick access to services.
            </p>

            {/* Install button */}
            <button
              onClick={promptInstall}
              className="
                shrink-0 ml-0.5
                bg-white text-[#1e3a8a]
                text-xs font-semibold
                px-3 py-1 rounded-md
                hover:bg-blue-50 active:scale-95
                transition-all duration-150 focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-white/60
              "
            >
              Install
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss install prompt"
              className="
                shrink-0 p-0.5 rounded-full
                text-white/70 hover:text-white hover:bg-white/10
                active:scale-90 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60
              "
            >
              <IoClose size={14} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
