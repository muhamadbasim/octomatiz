import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

interface UseNetworkStatusReturn extends NetworkStatus {
  executeOnline: <T>(action: () => Promise<T>, offlineMessage?: string) => Promise<T | null>;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
  });

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ isOnline: true, wasOffline: !prev.isOnline }));
    };

    const handleOffline = () => {
      setStatus({ isOnline: false, wasOffline: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const executeOnline = useCallback(async <T>(
    action: () => Promise<T>,
    offlineMessage = 'Aksi ini membutuhkan koneksi internet'
  ): Promise<T | null> => {
    if (!navigator.onLine) {
      // Dispatch custom event for toast notification
      window.dispatchEvent(new CustomEvent('offline-action', {
        detail: { message: offlineMessage }
      }));
      return null;
    }

    try {
      return await action();
    } catch (error) {
      // Check if error is due to network
      if (!navigator.onLine) {
        window.dispatchEvent(new CustomEvent('offline-action', {
          detail: { message: offlineMessage }
        }));
        return null;
      }
      throw error;
    }
  }, []);

  return {
    ...status,
    executeOnline,
  };
}
