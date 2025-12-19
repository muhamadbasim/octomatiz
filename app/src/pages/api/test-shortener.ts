import type { APIRoute } from 'astro';
import { shortenUrl } from '../../lib/urlShortener';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const testUrl = 'https://example.com';
  
  console.log('Testing URL shortener with:', testUrl);
  
  try {
    const result = await shortenUrl(testUrl);
    
    console.log('Shortener result:', result);
    
    return new Response(
      JSON.stringify({
        testUrl,
        result,
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
