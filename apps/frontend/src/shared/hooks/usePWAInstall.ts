import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallReturn {
  canInstall: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

// In development, Chrome fires beforeinstallprompt on localhost as long as:
//   1. A valid web manifest is linked
//   2. A service worker is registered (vite-plugin-pwa devOptions.enabled = true handles this)
//   3. The page was not already installed
//
// If the event still doesn't fire (e.g. Chrome has already dismissed it for
// this origin), you can force-reset it via:
//   DevTools → Application → Manifest → "Add to home screen" link
//
// For non-localhost IPs you'll need HTTPS. See vite.config.ts for notes.

const IS_DEV = import.meta.env.DEV;

/** Creates a fake deferred prompt for dev-only testing of the install UI. */
function makeFakePrompt(): BeforeInstallPromptEvent {
  return {
    type: "beforeinstallprompt",
    platforms: ["web"],
    userChoice: Promise.resolve({ outcome: "accepted" as const }),
    prompt: async () => {
      // eslint-disable-next-line no-console
      console.info(
        "[PWA Dev] Fake install prompt triggered. " +
          "In a real browser this would open the system install dialog.",
      );
    },
    preventDefault: () => {},
    stopPropagation: () => {},
    // satisfy the Event interface minimally
    bubbles: false,
    cancelBubble: false,
    cancelable: false,
    composed: false,
    currentTarget: null,
    defaultPrevented: false,
    eventPhase: 0,
    isTrusted: false,
    returnValue: true,
    srcElement: null,
    target: null,
    timeStamp: Date.now(),
    composedPath: () => [],
    initEvent: () => {},
    dispatchEvent: () => false,
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3,
    stopImmediatePropagation: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as BeforeInstallPromptEvent;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Only mark as installed if running in standalone mode (actually installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    // In dev, if Chrome hasn't fired the real event within 2 s (e.g. because
    // the PWA criteria haven't been met yet), fall back to a fake prompt so
    // the install UI is always exercisable during development.
    let devFallbackTimer: ReturnType<typeof setTimeout> | undefined;
    if (IS_DEV) {
      devFallbackTimer = setTimeout(() => {
        setDeferredPrompt((current) => {
          if (current === null) {
            // eslint-disable-next-line no-console
            console.info(
              "[PWA Dev] beforeinstallprompt did not fire. " +
                "Using a fake prompt so the install button is testable. " +
                "To get the real prompt: DevTools → Application → Manifest → 'Add to home screen'.",
            );
            return makeFakePrompt();
          }
          return current;
        });
      }, 2000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(devFallbackTimer);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
    // If dismissed, keep deferredPrompt so the button stays clickable
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    // Dismiss just hides the banner, does NOT mark as installed
    setDeferredPrompt(null);
  }, []);

  return {
    canInstall: deferredPrompt !== null,
    isInstalled,
    promptInstall,
    dismiss,
  };
}
