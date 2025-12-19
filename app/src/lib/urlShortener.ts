/**
 * URL Shortener Service using da.gd API
 * Free, no API key required, no ads, direct redirect
 * Shortest domain available (da.gd/xxxxx)
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

/**
 * Shorten URL using da.gd API
 * @param longUrl - The original long URL to shorten
 * @returns Promise with short URL result
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResult> {
  try {
    // da.gd API endpoint (free, no auth required, no ads, shortest domain)
    const apiUrl = `https://da.gd/shorten?url=${encodeURIComponent(longUrl)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`da.gd API error: ${response.status}`);
    }

    const shortUrl = await response.text();

    // Validate response is a valid URL
    if (!shortUrl.trim().startsWith('https://da.gd/')) {
      throw new Error('Invalid response from da.gd');
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
