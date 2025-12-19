import type { APIRoute } from 'astro';
import { createInternalShortUrl, generateShortCode } from '../../lib/urlShortener';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const testSlug = 'test-business';
  
  console.log('Testing internal URL shortener');
  
  try {
    const result = createInternalShortUrl(baseUrl, testSlug);
    const sampleCode = generateShortCode();
    
    return new Response(
      JSON.stringify({
        baseUrl,
        testSlug,
        result,
        sampleCode,
        explanation: 'Internal shortener uses KV to map /s/{code} -> /p/{slug}',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Shortener test error:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
