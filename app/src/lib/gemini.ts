import type { BusinessCategory } from '../types/project';

// Gemini API configuration
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Category-specific prompt templates
const CATEGORY_PROMPTS: Record<BusinessCategory, string> = {
  kuliner: 'makanan/minuman dengan penekanan pada rasa, kesegaran, dan selera makan',
  fashion: 'produk fashion dengan penekanan pada gaya, kualitas bahan, dan tren terkini',
  jasa: 'layanan jasa dengan penekanan pada keandalan, keahlian profesional, dan kepuasan pelanggan',
  kerajinan: 'kerajinan tangan dengan penekanan pada keunikan, kualitas pengerjaan, dan nilai seni',
};

export interface GeneratedContent {
  productType: string;
  features: string[];
  headline: string;
  storytelling: string;
}

export interface GeminiError {
  code: 'NETWORK_ERROR' | 'INVALID_IMAGE' | 'API_ERROR' | 'RATE_LIMIT' | 'PARSE_ERROR';
  message: string;
}

export interface GeminiResult {
  success: boolean;
  data?: GeneratedContent;
  error?: GeminiError;
}

/**
 * Build the prompt for Gemini API based on category and business name
 */
export function buildPrompt(category: BusinessCategory, businessName: string): string {
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
 * Parse Gemini API response to extract generated content
 */
export function parseGeminiResponse(responseText: string): GeneratedContent {
  // Clean up response - remove markdown code blocks if present
  let cleanText = responseText.trim();
  
  // Remove ```json and ``` markers
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
  
  // Validate required fields
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
 * Call Gemini Vision API to analyze image and generate content
 */
export async function analyzeImageWithGemini(
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
        message: 'API key tidak dikonfigurasi',
      },
    };
  }

  const prompt = buildPrompt(category, businessName);
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
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
            message: 'API key tidak valid',
          },
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: `API error: ${response.status}`,
        },
      };
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      // Check if image was blocked or unclear
      const blockReason = data.candidates?.[0]?.finishReason;
      if (blockReason === 'SAFETY' || blockReason === 'OTHER') {
        return {
          success: false,
          error: {
            code: 'INVALID_IMAGE',
            message: 'Foto tidak dapat diproses. Coba foto produk yang lebih jelas.',
          },
        };
      }
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Tidak ada response dari AI',
        },
      };
    }

    const content = parseGeminiResponse(textContent);
    
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
    
    // Network error
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Koneksi gagal. Periksa internet dan coba lagi.',
      },
    };
  }
}
