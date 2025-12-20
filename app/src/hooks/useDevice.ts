// Hook for device ID management
import { useState, useEffect, useCallback } from 'react';
import { registerDevice } from '../lib/api/projectsApi';

const DEVICE_ID_KEY = 'octomatiz_device_id';

interface UseDeviceResult {
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDevice(): UseDeviceResult {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initDevice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check localStorage for existing device ID
      const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      
      // Register or verify device with server
      const response = await registerDevice(storedDeviceId || undefined);
      
      if (response.success && response.data) {
        const newDeviceId = response.data.id;
        
        // Store device ID locally
        localStorage.setItem(DEVICE_ID_KEY, newDeviceId);
        setDeviceId(newDeviceId);
      } else {
        // If server is unavailable, use stored ID if available
        if (storedDeviceId) {
          setDeviceId(storedDeviceId);
        } else {
          setError(response.error || 'Gagal mendaftarkan device');
        }
      }
    } catch (err) {
      console.error('Device init error:', err);
      
      // Fallback to stored device ID
      const storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
      if (storedDeviceId) {
        setDeviceId(storedDeviceId);
      } else {
        setError('Gagal menginisialisasi device');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initDevice();
  }, [initDevice]);

  return {
    deviceId,
    isLoading,
    error,
    refresh: initDevice,
  };
}

// Helper to get device ID synchronously (for non-hook contexts)
export function getStoredDeviceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

// Helper to check if device ID exists
export function hasStoredDeviceId(): boolean {
  return getStoredDeviceId() !== null;
}
