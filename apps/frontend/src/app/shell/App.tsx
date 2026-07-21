import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { appRoutes } from "@/app/router";
import { OfflineBanner, ScrollToTop, PWAInstallBanner } from "@/app/components";
import {
  SplashScreen,
  hasSplashBeenShown,
} from "@/app/components/SplashScreen";
import { ToastProvider } from "@/context/ToastContext";
import { useNetworkStatus } from "@/shared/hooks";
import { SessionExpiredModal } from "@/modules/admin/components/auth/SessionExpiredModal";

const router = createBrowserRouter(appRoutes, {
  future: {
    v7_relativeSplatPath: true,
  },
});

export function App() {
  // If splash already ran this session, skip it entirely and mount the router right away.
  const [splashDone, setSplashDone] = useState(() => hasSplashBeenShown());
  const { isOnline, isChecking, retryCheck } = useNetworkStatus();

  return (
    <ToastProvider>
      {!splashDone && (
        <SplashScreen duration={2000} onFinish={() => setSplashDone(true)} />
      )}
      {splashDone && <RouterProvider router={router} />}
      <OfflineBanner
        isOnline={isOnline}
        isChecking={isChecking}
        onRetry={retryCheck}
      />
      <SessionExpiredModal />
      {/* PWA install banner — desktop only, works on all platforms */}
      <PWAInstallBanner />
    </ToastProvider>
  );
}
