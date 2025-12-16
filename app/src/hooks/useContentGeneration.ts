import { useState, useCallback } from 'react';
import type { BusinessCategory } from '../types/project';
import type { GeneratedContent, GeminiResult } from '../lib/gemini';

const MAX_REGENERATE_ATTEMPTS = 3;

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

  const generate = useCallback(
    async (image: string) => {
      setIsGenerating(true);
      setError(null);
      setLastImage(image);
      setRegenerateCount(0);

      try {
        const result = await callAnalyzeAPI(image);

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
    [callAnalyzeAPI]
  );

  const regenerate = useCallback(async () => {
    if (!canRegenerate || !lastImage) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setRegenerateCount((prev) => prev + 1);

    try {
      const result = await callAnalyzeAPI(lastImage);

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
  }, [canRegenerate, lastImage, callAnalyzeAPI]);

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
