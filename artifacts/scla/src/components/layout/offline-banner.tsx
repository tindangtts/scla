import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Tell SW to clear stale API cache so fresh data loads
      navigator.serviceWorker?.controller?.postMessage({ type: 'CLEAR_API_CACHE' });
      // Hide "back online" banner after 3 seconds
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-all ${
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
      data-testid="offline-banner"
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>You're offline — showing cached data</span>
        </>
      )}
    </div>
  );
}
