import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/betterlibmanan.png";

const SESSION_KEY = "splash_shown";

/** Returns true if the splash has already been shown this browser session. */
export function hasSplashBeenShown(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

interface SplashScreenProps {
  /** Duration (ms) before the splash fades out. Default: 2000 */
  duration?: number;
  onFinish?: () => void;
}

export function SplashScreen({ duration = 2000, onFinish }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  function handleExitComplete() {
    sessionStorage.setItem(SESSION_KEY, "true");
    onFinish?.();
  }

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          aria-label="Loading"
          role="status"
        >
          <motion.img
            src={logo}
            alt="BetterLibmanan"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-[clamp(120px,30vw,280px)] h-auto select-none pointer-events-none"
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
