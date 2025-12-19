/**
 * Internal URL Shortener using Cloudflare KV
 * Creates short codes like /s/abc123 that redirect to /p/slug
 * No external dependencies - 100% reliable
 */

export interface ShortUrlResult {
  success: boolean;
  shortUrl?: string;
  shortCode?: string;
  error?: string;
}

/**
 * Generate a random short code (6 chars alphanumeric)
 */
export function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create internal short URL
 * @param baseUrl - Base URL of the site (e.g., https://octomatiz.pages.dev)
 * @param slug - The landing page slug
 * @returns Short URL result with code
 */
export function createInternalShortUrl(baseUrl: string, slug: string): ShortUrlResult {
  try {
    const shortCode = generateShortCode();
    const shortUrl = `${baseUrl}/s/${shortCode}`;
    
    return {
      success: true,
      shortUrl,
      shortCode,
    };
  } catch (error) {
    console.error('Short URL generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate short URL',
    };
  }
}
