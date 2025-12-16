import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      // Hide "back online" message after 3 seconds
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

  if (isOnline && !showBackOnline) {
    // Show normal online indicator
    return (
      <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="text-[10px] font-medium text-white/70 uppercase tracking-wide">Online</span>
      </div>
    );
  }

  if (showBackOnline) {
    // Show "back online" message
    return (
      <div className="flex items-center gap-1.5 bg-primary/20 px-2 py-1 rounded-full border border-primary/30 animate-in fade-in duration-300">
        <span className="material-symbols-outlined text-primary text-sm">wifi</span>
        <span className="text-[10px] font-medium text-primary uppercase tracking-wide">Kembali Online</span>
      </div>
    );
  }

  // Show offline indicator
  return (
    <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30 animate-in fade-in duration-300">
      <span className="material-symbols-outlined text-red-400 text-sm">cloud_off</span>
      <span className="text-[10px] font-medium text-red-400 uppercase tracking-wide">Offline</span>
    </div>
  );
}
