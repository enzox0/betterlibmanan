import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/app/router";
import { OfflineBanner, ScrollToTop } from "@/app/components";
import {
  SplashScreen,
  hasSplashBeenShown,
} from "@/app/components/SplashScreen";
import { ToastProvider } from "@/context/ToastContext";
import { useNetworkStatus } from "@/shared/hooks";

export function App() {
  // If splash already ran this session, skip it entirely and mount the router right away.
  const [splashDone, setSplashDone] = useState(() => hasSplashBeenShown());
  const { isOnline, isChecking, retryCheck } = useNetworkStatus();

  return (
    <ToastProvider>
      {!splashDone && (
        <SplashScreen duration={2000} onFinish={() => setSplashDone(true)} />
      )}
      {splashDone && (
        <BrowserRouter>
          <ScrollToTop />
          <AppRouter />
        </BrowserRouter>
      )}
      <OfflineBanner
        isOnline={isOnline}
        isChecking={isChecking}
        onRetry={retryCheck}
      />
    </ToastProvider>
  );
}
