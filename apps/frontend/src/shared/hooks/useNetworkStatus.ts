import { useCallback, useEffect, useState } from "react";

type UseNetworkStatusResult = {
  isOnline: boolean;
  isChecking: boolean;
  retryCheck: () => Promise<boolean>;
};

const NETWORK_CHECK_TIMEOUT_MS = 4000;

function getNavigatorOnlineStatus() {
  if (typeof navigator === "undefined") {
    return true;
  }

  return navigator.onLine;
}

async function verifyConnection() {
  if (!getNavigatorOnlineStatus()) {
    return false;
  }

  if (typeof window === "undefined" || typeof fetch !== "function") {
    return true;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => {
    controller.abort();
  }, NETWORK_CHECK_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${window.location.origin}/favicon.ico?network-check=${Date.now()}`,
      {
        cache: "no-store",
        signal: controller.signal,
      },
    );

    return response.type === "opaque" || response.ok || response.status >= 400;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useNetworkStatus(): UseNetworkStatusResult {
  const [isOnline, setIsOnline] = useState(() => getNavigatorOnlineStatus());
  const [isChecking, setIsChecking] = useState(false);

  const retryCheck = useCallback(async () => {
    setIsChecking(true);

    try {
      const online = await verifyConnection();
      setIsOnline(online);
      return online;
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(getNavigatorOnlineStatus());

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, isChecking, retryCheck };
}
