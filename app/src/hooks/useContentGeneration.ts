import { useState, useCallback } from 'react';
import type { BusinessCategory } from '../types/project';
import type { GeneratedContent, GeminiResult } from '../lib/gemini';

const MAX_REGENERATE_ATTEMPTS = 3;
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

interface UseContentGenerationOptions {
  category: BusinessCategory;
  businessName: string;
}

interface UseContentGenerationReturn {
  isGenerating: boolean;
  content: GeneratedContent | null;
  error: string | null;
  regenerateCount: number;
  generate: (image: string) => Promise<void>;
  regenerate: () => Promise<void>;
  canRegenerate: boolean;
  setContent: (content: GeneratedContent | null) => void;
  clearError: () => void;
}

/**
 * Delay helper for exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 * Attempt 1: 1s, Attempt 2: 2s, Attempt 3: 4s
 */
function getBackoffDelay(attempt: number): number {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1);
}

export function useContentGeneration(
  options: UseContentGenerationOptions
): UseContentGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [lastImage, setLastImage] = useState<string | null>(null);

  const canRegenerate = regenerateCount < MAX_REGENERATE_ATTEMPTS && lastImage !== null;

  const callAnalyzeAPI = useCallback(
    async (image: string): Promise<GeminiResult> => {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image,
          category: options.category,
          businessName: options.businessName,
        }),
      });

      return response.json();
    },
    [options.category, options.businessName]
  );

  /**
   * Call API with exponential backoff retry
   */
  const callWithRetry = useCallback(
    async (image: string): Promise<GeminiResult> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
        try {
          const result = await callAnalyzeAPI(image);
          
          // If successful or it's a non-retryable error, return immediately
          if (result.success) {
            return result;
          }
          
          // Check if error is retryable (rate limit, server error)
          const isRetryable = result.error?.code === 'RATE_LIMITED' || 
                              result.error?.code === 'SERVER_ERROR' ||
                              result.error?.message?.includes('rate') ||
                              result.error?.message?.includes('timeout');
          
          if (!isRetryable || attempt === MAX_RETRY_ATTEMPTS) {
            return result;
          }
          
          // Wait before retry with exponential backoff
          const backoffDelay = getBackoffDelay(attempt);
          console.log(`Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${backoffDelay}ms`);
          await delay(backoffDelay);
          
        } catch (err) {
          lastError = err as Error;
          
          // Network error - retry with backoff
          if (attempt < MAX_RETRY_ATTEMPTS) {
            const backoffDelay = getBackoffDelay(attempt);
            console.log(`Network error, retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${backoffDelay}ms`);
            await delay(backoffDelay);
          }
        }
      }

      // All retries failed
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: lastError?.message || 'Koneksi gagal setelah beberapa percobaan. Periksa internet dan coba lagi.',
        },
      };
    },
    [callAnalyzeAPI]
  );

  const generate = useCallback(
    async (image: string) => {
      setIsGenerating(true);
      setError(null);
      setLastImage(image);
      setRegenerateCount(0);

      try {
        const result = await callWithRetry(image);

        if (result.success && result.data) {
          setContent(result.data);
        } else {
          setError(result.error?.message || 'Gagal menganalisis foto');
        }
      } catch (err) {
        setError('Koneksi gagal. Periksa internet dan coba lagi.');
      } finally {
        setIsGenerating(false);
      }
    },
    [callWithRetry]
  );

  const regenerate = useCallback(async () => {
    if (!canRegenerate || !lastImage) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRegenerateCount((prev) => prev + 1);

    try {
      const result = await callWithRetry(lastImage);

      if (result.success && result.data) {
        setContent(result.data);
      } else {
        setError(result.error?.message || 'Gagal menghasilkan konten baru');
      }
    } catch (err) {
      setError('Koneksi gagal. Periksa internet dan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  }, [canRegenerate, lastImage, callWithRetry]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isGenerating,
    content,
    error,
    regenerateCount,
    generate,
    regenerate,
    canRegenerate,
    setContent,
    clearError,
  };
}
