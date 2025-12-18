import type { APIRoute, APIContext } from 'astro';

export const prerender = false;

// Helper to get KV binding
function getKV(context: APIContext): KVNamespace | undefined {
  const runtime = (context.locals as { runtime?: { env?: { LANDING_PAGES?: KVNamespace } } }).runtime;
  return runtime?.env?.LANDING_PAGES;
}

export const GET: APIRoute = async (context) => {
  const { params } = context;
  const slug = params.slug;

  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  const kv = getKV(context);
  
  if (!kv) {
    // Fallback for local development - return a placeholder
    return new Response(
      `<!DOCTYPE html>
<html>
<head>
  <title>Landing Page - ${slug}</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #112117; color: white; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #36e27b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🐙 OCTOmatiz</h1>
    <p>Landing page untuk: <strong>${slug}</strong></p>
    <p style="color: #888; font-size: 0.875rem;">KV tidak tersedia di local development</p>
  </div>
</body>
</html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  try {
    // Get landing page data from KV
    const data = await kv.get(`landing:${slug}`, 'json') as { html: string; businessName: string } | null;

    if (!data || !data.html) {
      return new Response(
        `<!DOCTYPE html>
<html>
<head>
  <title>Halaman Tidak Ditemukan</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #112117; color: white; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #36e27b; font-size: 4rem; margin-bottom: 1rem; }
    a { color: #36e27b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>Halaman tidak ditemukan</p>
    <p style="margin-top: 2rem;"><a href="/">← Kembali ke OCTOmatiz</a></p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
    }

    // Return the landing page HTML
    return new Response(data.html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
