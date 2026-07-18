import React, { Suspense, useEffect, useRef, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import loadingLottie from "@/assets/lottiefiles/loading.lottie?url";
import { hasSplashBeenShown } from "@/app/components/SplashScreen";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <DotLottieReact
        src={loadingLottie}
        loop
        autoplay
        style={{ width: 180, height: 180 }}
      />
    </div>
  );
}

/**
 * On the very first mount after the splash screen, we suppress the lottie
 * fallback so the user doesn't see a loading animation immediately after
 * the splash finishes. On any subsequent lazy load the lottie shows normally.
 */
function useSuppressFirstFallback() {
  // True only when splash just ran — suppress the next fallback render.
  const [suppress, setSuppress] = useState(() => hasSplashBeenShown());
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // Once the component re-renders (lazy chunk loaded), lift suppression.
    if (suppress) setSuppress(false);
  });

  return suppress;
}

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyLoader({ children, fallback }: LazyLoaderProps) {
  const suppress = useSuppressFirstFallback();

  return (
    <Suspense fallback={suppress ? null : (fallback ?? <LoadingFallback />)}>
      {children}
    </Suspense>
  );
}

export function lazyLoad<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): React.LazyExoticComponent<T> {
  return React.lazy(factory);
}
