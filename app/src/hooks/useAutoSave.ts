import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave?: () => void;
  enabled?: boolean;
}

/**
 * Hook for auto-saving data with debounce
 * @param data - The data to save
 * @param saveFunction - Function to call when saving
 * @param options - Configuration options
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void,
  options: UseAutoSaveOptions = {}
): void {
  const { debounceMs = 500, onSave, enabled = true } = options;
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const previousDataRef = useRef<string>('');

  const save = useCallback(() => {
    saveFunction(data);
    onSave?.();
  }, [data, saveFunction, onSave]);

  useEffect(() => {
    // Skip first render to avoid saving initial/loaded data
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = JSON.stringify(data);
      return;
    }

    if (!enabled) return;

    // Check if data actually changed
    const currentDataString = JSON.stringify(data);
    if (currentDataString === previousDataRef.current) {
      return;
    }
    previousDataRef.current = currentDataString;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, save]);

  // Save immediately on unmount if there are pending changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        // Don't save on unmount to avoid issues with navigation
      }
    };
  }, []);
}

/**
 * Hook for manual save with debounce
 */
export function useDebouncedSave<T>(
  saveFunction: (data: T) => void,
  debounceMs: number = 500
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSave = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveFunction(data);
    }, debounceMs);
  }, [saveFunction, debounceMs]);

  const saveImmediately = useCallback((data: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveFunction(data);
  }, [saveFunction]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedSave, saveImmediately };
}
