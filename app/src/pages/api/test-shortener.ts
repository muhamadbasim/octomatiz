import type { APIRoute } from 'astro';
import { shortenUrl } from '../../lib/urlShortener';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const requestUrl = new URL(request.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  const testUrl = `${baseUrl}/p/test-business`;
  const testSlug = 'test-business';
  
  console.log('Testing URL shortener with:', testUrl);
  
  try {
    // Test with fallback to internal
    const result = await shortenUrl(testUrl, baseUrl, testSlug);
    
    console.log('Shortener result:', result);
    
    return new Response(
      JSON.stringify({
        testUrl,
        result,
        providers: ['clck.ru (Yandex)', 'v.gd', 'internal (fallback)'],
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
        testUrl,
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
