import type { APIRoute, APIContext } from 'astro';

export const prerender = false;

// Helper to get KV binding
function getKV(context: APIContext): KVNamespace | undefined {
  const runtime = (context.locals as { runtime?: { env?: { LANDING_PAGES?: KVNamespace } } }).runtime;
  return runtime?.env?.LANDING_PAGES;
}

export const GET: APIRoute = async (context) => {
  const { params, request } = context;
  const code = params.code;

  if (!code) {
    return new Response('Short code not found', { status: 404 });
  }

  const kv = getKV(context);
  
  if (!kv) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/' },
    });
  }

  try {
    const slug = await kv.get(`short:${code}`);
    
    if (!slug) {
      return new Response('Link tidak ditemukan', { status: 404 });
    }

    const requestUrl = new URL(request.url);
    const targetUrl = `${requestUrl.protocol}//${requestUrl.host}/p/${slug}`;

    return new Response(null, {
      status: 302,
      headers: { Location: targetUrl },
    });
  } catch (error) {
    console.error('Short URL redirect error:', error);
    return new Response('Terjadi kesalahan', { status: 500 });
  }
};
