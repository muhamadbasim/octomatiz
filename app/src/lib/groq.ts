import type { BusinessCategory } from '../types/project';
import type { GeneratedContent, GeminiError, GeminiResult } from './gemini';

// Groq API configuration
// Using meta-llama/llama-4-scout-17b-16e-instruct for vision tasks
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Category-specific prompt templates (same as Gemini)
const CATEGORY_PROMPTS: Record<BusinessCategory, string> = {
  kuliner: 'makanan/minuman dengan penekanan pada rasa, kesegaran, dan selera makan',
  fashion: 'produk fashion dengan penekanan pada gaya, kualitas bahan, dan tren terkini',
  jasa: 'layanan jasa dengan penekanan pada keandalan, keahlian profesional, dan kepuasan pelanggan',
  kerajinan: 'kerajinan tangan dengan penekanan pada keunikan, kualitas pengerjaan, dan nilai seni',
};

/**
 * Build the prompt for Groq API based on category and business name
 */
export function buildGroqPrompt(category: BusinessCategory, businessName: string): string {
  const categoryContext = CATEGORY_PROMPTS[category];
  
  return `Kamu adalah copywriter profesional untuk UMKM Indonesia.
Analisis foto produk ini dan buat konten marketing dalam Bahasa Indonesia yang menarik.

Konteks:
- Nama bisnis: ${businessName || 'UMKM'}
- Kategori: ${category}
- Fokus konten: ${categoryContext}

PENTING:
- Headline HARUS maksimal 60 karakter
- Storytelling HARUS 100-200 kata
- Gunakan bahasa yang mudah dipahami dan menarik
- Sertakan call-to-action di akhir storytelling

Berikan response dalam format JSON yang valid (tanpa markdown code block):
{
  "productType": "jenis produk yang terdeteksi dari foto",
  "features": ["fitur/keunggulan 1", "fitur/keunggulan 2", "fitur/keunggulan 3"],
  "headline": "headline menarik maksimal 60 karakter",
  "storytelling": "cerita produk 100-200 kata dengan emotional appeal dan call-to-action"
}`;
}

/**
 * Parse Groq API response to extract generated content
 */
export function parseGroqResponse(responseText: string): GeneratedContent {
  let cleanText = responseText.trim();
  
  // Remove markdown code blocks if present
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.slice(7);
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.slice(3);
  }
  if (cleanText.endsWith('```')) {
    cleanText = cleanText.slice(0, -3);
  }
  cleanText = cleanText.trim();

  const parsed = JSON.parse(cleanText);
  
  if (!parsed.productType || !parsed.headline || !parsed.storytelling) {
    throw new Error('Missing required fields in response');
  }

  return {
    productType: String(parsed.productType),
    features: Array.isArray(parsed.features) ? parsed.features.map(String) : [],
    headline: String(parsed.headline),
    storytelling: String(parsed.storytelling),
  };
}


/**
 * Call Groq Vision API to analyze image and generate content
 */
export async function analyzeImageWithGroq(
  apiKey: string,
  imageBase64: string,
  category: BusinessCategory,
  businessName: string
): Promise<GeminiResult> {
  if (!apiKey) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Groq API key tidak dikonfigurasi',
      },
    };
  }

  const prompt = buildGroqPrompt(category, businessName);
  
  // Ensure proper data URL format
  let imageUrl = imageBase64;
  if (!imageBase64.startsWith('data:')) {
    imageUrl = `data:image/jpeg;base64,${imageBase64}`;
  }

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq API error:', response.status, errorData);
      
      if (response.status === 429) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT',
            message: 'Batas penggunaan API tercapai. Coba lagi nanti.',
          },
        };
      }
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: {
            code: 'API_ERROR',
            message: 'Groq API key tidak valid',
          },
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: errorData?.error?.message || `Groq API error: ${response.status}`,
        },
      };
    }

    const data = await response.json();
    const textContent = data.choices?.[0]?.message?.content;
    
    if (!textContent) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Tidak ada response dari Groq AI',
        },
      };
    }

    const content = parseGroqResponse(textContent);
    
    return {
      success: true,
      data: content,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: {
          code: 'PARSE_ERROR',
          message: 'Gagal memproses response AI. Coba lagi.',
        },
      };
    }
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Koneksi gagal. Periksa internet dan coba lagi.',
      },
    };
  }
}
