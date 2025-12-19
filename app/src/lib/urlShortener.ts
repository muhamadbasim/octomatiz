/**
 * URL Shortener Service using ulvis.net API
 * Free, no API key required, no ads, direct redirect
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

/**
 * Shorten URL using ulvis.net API
 * @param longUrl - The original long URL to shorten
 * @returns Promise with short URL result
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResult> {
  try {
    // ulvis.net API endpoint (free, no auth required, no ads)
    const apiUrl = `https://ulvis.net/api.php?url=${encodeURIComponent(longUrl)}&private=1`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`ulvis.net API error: ${response.status}`);
    }

    const shortUrl = await response.text();

    // Validate response is a valid URL
    if (!shortUrl.trim().startsWith('https://ulvis.net/')) {
      throw new Error('Invalid response from ulvis.net');
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
