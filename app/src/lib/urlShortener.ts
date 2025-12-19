/**
 * URL Shortener Service using TinyURL API
 * Free, no API key required
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

/**
 * Shorten URL using TinyURL API
 * @param longUrl - The original long URL to shorten
 * @returns Promise with short URL result
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResult> {
  try {
    // TinyURL API endpoint (free, no auth required)
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`TinyURL API error: ${response.status}`);
    }

    const shortUrl = await response.text();

    // Validate response is a valid URL
    if (!shortUrl.startsWith('https://tinyurl.com/')) {
      throw new Error('Invalid response from TinyURL');
    }

    return {
      success: true,
      shortUrl: shortUrl.trim(),
    };
  } catch (error) {
    console.error('URL shortening failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL',
    };
  }
}
