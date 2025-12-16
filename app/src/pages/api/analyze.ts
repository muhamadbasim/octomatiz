import type { APIRoute } from 'astro';
import { analyzeImageWithGemini, type GeminiResult } from '../../lib/gemini';
import { analyzeImageWithGroq } from '../../lib/groq';
import type { BusinessCategory } from '../../types/project';

export const prerender = false;

// Helper function to retry with delay
async function retryWithDelay<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }
  throw lastError;
}

interface AnalyzeRequestBody {
  image: string;
  category: BusinessCategory;
  businessName: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get API keys from environment
    const geminiKey = import.meta.env.GEMINI_API_KEY;
    const groqKey = import.meta.env.GROQ_API_KEY;
    
    if (!geminiKey && !groqKey) {
      console.error('No AI API keys configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Layanan AI belum dikonfigurasi. Hubungi administrator.',
          },
        } as GeminiResult),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: AnalyzeRequestBody = await request.json();
    
    if (!body.image) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'Foto produk tidak ditemukan',
          },
        } as GeminiResult),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }


    // Validate category
    const validCategories: BusinessCategory[] = ['kuliner', 'fashion', 'jasa', 'kerajinan'];
    if (!validCategories.includes(body.category)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Kategori bisnis tidak valid',
          },
        } as GeminiResult),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let result: GeminiResult;

    // Try Gemini first if available
    if (geminiKey) {
      console.log('Trying Gemini API...');
      result = await analyzeImageWithGemini(
        geminiKey,
        body.image,
        body.category,
        body.businessName || ''
      );

      // If Gemini succeeds, return result
      if (result.success) {
        console.log('Gemini API success');
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // If Gemini fails (rate limit or other), try Groq
      if (groqKey) {
        console.log('Gemini failed, falling back to Groq...');
        
        // Retry Groq up to 2 times with delay
        result = await retryWithDelay(async () => {
          const groqResult = await analyzeImageWithGroq(
            groqKey,
            body.image,
            body.category,
            body.businessName || ''
          );
          if (!groqResult.success && groqResult.error?.code === 'PARSE_ERROR') {
            throw new Error('Parse error, retrying...');
          }
          return groqResult;
        }, 2, 500);

        if (result.success) {
          console.log('Groq API success (fallback)');
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } else if (groqKey) {
      // No Gemini key, use Groq directly with retry
      console.log('Using Groq API (primary)...');
      result = await retryWithDelay(async () => {
        const groqResult = await analyzeImageWithGroq(
          groqKey,
          body.image,
          body.category,
          body.businessName || ''
        );
        if (!groqResult.success && groqResult.error?.code === 'PARSE_ERROR') {
          throw new Error('Parse error, retrying...');
        }
        return groqResult;
      }, 2, 500);

      if (result.success) {
        console.log('Groq API success');
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      result = {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Tidak ada API key yang dikonfigurasi',
        },
      };
    }

    // Return error result
    return new Response(JSON.stringify(result), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Terjadi kesalahan. Coba lagi nanti.',
        },
      } as GeminiResult),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
