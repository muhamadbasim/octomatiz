/**
 * URL Shortener Service using CleanURI API
 * Free, no API key required, no ads, direct redirect
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  error?: string;
}

interface CleanURIResponse {
  result_url?: string;
  error?: string;
}

/**
 * Shorten URL using CleanURI API
 * @param longUrl - The original long URL to shorten
 * @returns Promise with short URL result
 */
export async function shortenUrl(longUrl: string): Promise<ShortUrlResult> {
  try {
    // CleanURI API endpoint (free, no auth required, no ads)
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `url=${encodeURIComponent(longUrl)}`,
    });

    if (!response.ok) {
      throw new Error(`CleanURI API error: ${response.status}`);
    }

    const data: CleanURIResponse = await response.json();

    // Validate response
    if (!data.result_url) {
      throw new Error(data.error || 'Invalid response from CleanURI');
    }

    return {
      success: true,
      shortUrl: data.result_url,
    };
  } catch (error) {
    console.error('URL shortening failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to shorten URL',
    };
  }
}
