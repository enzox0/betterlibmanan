import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/app/router";
import {
  SplashScreen,
  hasSplashBeenShown,
} from "@/app/components/SplashScreen";
import { ScrollToTop } from "@/app/components";
import { ToastProvider } from "@/context/ToastContext";

export function App() {
  // If splash already ran this session, skip it entirely and mount the router right away.
  const [splashDone, setSplashDone] = useState(() => hasSplashBeenShown());

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
    </ToastProvider>
  );
}
