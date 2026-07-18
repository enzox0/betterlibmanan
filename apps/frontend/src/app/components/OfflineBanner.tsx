import { FiRefreshCw, FiWifiOff } from "react-icons/fi";

type OfflineBannerProps = {
  isOnline: boolean;
  isChecking: boolean;
  onRetry: () => Promise<boolean>;
};

export function OfflineBanner({
  isOnline,
  isChecking,
  onRetry,
}: OfflineBannerProps) {
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-8 text-center shadow-2xl shadow-slate-950/40">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/12 text-red-300 ring-1 ring-red-400/20">
          <FiWifiOff className="h-10 w-10" aria-hidden="true" />
        </div>

        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-white">
          No internet connection
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
          Your device appears to be offline. Reconnect to the internet to keep
          using BetterLibmanan normally.
        </p>

        <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          We&apos;ll automatically dismiss this message as soon as your
          connection is restored.
        </div>

        <button
          type="button"
          onClick={() => void onRetry()}
          disabled={isChecking}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {isChecking ? "Checking connection..." : "Retry"}
        </button>
      </div>
    </div>
  );
}
