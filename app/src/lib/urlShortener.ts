/**
 * URL Shortener Service using is.gd API
 * Free, no API key required, no ads, direct redirect
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

/**
 * Shorten URL using is.gd API
 * @param longUrl - The original long URL to shorten
 * @returns Promise with short URL result
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResult> {
  try {
    // is.gd API endpoint (free, no auth required, no ads)
    const apiUrl = `https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`is.gd API error: ${response.status}`);
    }

    const shortUrl = await response.text();

    // Validate response is a valid URL
    if (!shortUrl.startsWith('https://is.gd/')) {
      throw new Error('Invalid response from is.gd');
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
