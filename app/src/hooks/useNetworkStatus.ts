import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

interface UseNetworkStatusReturn extends NetworkStatus {
  executeOnline: <T>(action: () => Promise<T>, offlineMessage?: string) => Promise<T | null>;
}

// Check actual connectivity by fetching a small resource
async function checkActualConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a tiny resource with cache-busting
    const response = await fetch('/favicon.svg', {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    // If fetch fails, fall back to navigator.onLine
    return navigator.onLine;
  }
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true, // Assume online initially to avoid false offline state
    wasOffline: false,
  });
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Initial connectivity check after mount
    const initialCheck = async () => {
      const isActuallyOnline = await checkActualConnectivity();
      setStatus(prev => ({ ...prev, isOnline: isActuallyOnline }));
    };
    
    // Delay initial check to let the page load
    const initTimeout = setTimeout(initialCheck, 1000);

    const handleOnline = async () => {
      // Verify actual connectivity before showing online
      const isActuallyOnline = await checkActualConnectivity();
      if (isActuallyOnline) {
        setStatus(prev => ({ isOnline: true, wasOffline: !prev.isOnline }));
      }
    };

    const handleOffline = () => {
      setStatus({ isOnline: false, wasOffline: false });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(initTimeout);
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
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
