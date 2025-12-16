import type { APIRoute } from 'astro';
import { analyzeImageWithGemini, type GeminiResult } from '../../lib/gemini';
import type { BusinessCategory } from '../../types/project';

export const prerender = false;

interface AnalyzeRequestBody {
  image: string;
  category: BusinessCategory;
  businessName: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get API key from environment
    const apiKey = import.meta.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
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

    // Call Gemini API
    const result = await analyzeImageWithGemini(
      apiKey,
      body.image,
      body.category,
      body.businessName || ''
    );

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
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
