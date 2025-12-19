/**
 * URL Shortener Service - tries multiple providers
 * Fallback chain: clck.ru (Yandex) -> v.gd -> internal
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  shortCode?: string;
  provider?: string;
  error?: string;
}

/**
 * Try clck.ru (Yandex) - Russian service, usually not blocked
 */
async function tryClckRu(longUrl: string): Promise<ShortUrlResult> {
  const apiUrl = `https://clck.ru/--?url=${encodeURIComponent(longUrl)}`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`clck.ru error: ${response.status}`);
  }
  
  const shortUrl = await response.text();
  if (!shortUrl.trim().startsWith('https://clck.ru/')) {
    throw new Error('Invalid clck.ru response');
  }
  
  return { success: true, shortUrl: shortUrl.trim(), provider: 'clck.ru' };
}

/**
 * Try v.gd (sister of is.gd)
 */
async function tryVgd(longUrl: string): Promise<ShortUrlResult> {
  const apiUrl = `https://v.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`;
  const response = await fetch(apiUrl);
  
  if (!response.ok) {
    throw new Error(`v.gd error: ${response.status}`);
  }
  
  const shortUrl = await response.text();
  if (!shortUrl.trim().startsWith('https://v.gd/')) {
    throw new Error('Invalid v.gd response');
  }
  
  return { success: true, shortUrl: shortUrl.trim(), provider: 'v.gd' };
}

/**
 * Generate internal short code as fallback
 */
function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create internal short URL (always works)
 */
export function createInternalShortUrl(baseUrl: string, slug: string): ShortUrlResult {
  const shortCode = generateShortCode();
  return {
    success: true,
    shortUrl: `${baseUrl}/s/${shortCode}`,
    shortCode,
    provider: 'internal',
  };
}

/**
 * Shorten URL - tries external services first, falls back to internal
 */
export async function shortenUrl(longUrl: string, baseUrl?: string, slug?: string): Promise<ShortUrlResult> {
  // Try external services first
  const providers = [tryClckRu, tryVgd];
  
  for (const provider of providers) {
    try {
      const result = await provider(longUrl);
      if (result.success) {
        console.log(`URL shortened with ${result.provider}: ${result.shortUrl}`);
        return result;
      }
    } catch (error) {
      console.log(`Provider failed:`, error);
      // Continue to next provider
    }
  }
  
  // Fallback to internal shortener if baseUrl and slug provided
  if (baseUrl && slug) {
    console.log('All external providers failed, using internal shortener');
    return createInternalShortUrl(baseUrl, slug);
  }
  
  return {
    success: false,
    error: 'All URL shortener providers failed',
  };
}
