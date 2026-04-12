"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Thin status banner that surfaces the network state.
 * Hidden by default; appears when offline and briefly when reconnecting.
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(window.navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_API_CACHE" });
      const t = setTimeout(() => setShowBackOnline(false), 3000);
      return () => clearTimeout(t);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white transition-colors ${
        isOnline ? "bg-emerald-500" : "bg-amber-500"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>You&apos;re offline — showing cached data</span>
        </>
      )}
    </div>
  );
}
