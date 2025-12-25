import type { APIRoute, APIContext } from 'astro';
import type { Project } from '../../types/project';
import { generateLandingPage } from '../../lib/landingPageGenerator';
import { shortenUrl } from '../../lib/urlShortener';
import { isKVAvailable, safeKVPut } from '../../lib/kvErrorHandler';
import { checkRateLimit, rateLimitResponse, getClientIP } from '../../lib/security';

export const prerender = false;

// Helper to get KV binding
function getKV(context: APIContext): KVNamespace | undefined {
  const runtime = (context.locals as { runtime?: { env?: { LANDING_PAGES?: KVNamespace } } }).runtime;
  return runtime?.env?.LANDING_PAGES;
}

// Generate URL-safe slug from business name
function generateSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
    .replace(/^-|-$/g, '');
}

// Check if slug exists and generate unique one
async function getUniqueSlug(kv: KVNamespace | undefined, baseSlug: string): Promise<string> {
  if (!kv) return baseSlug;
  
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const existing = await kv.get(`landing:${slug}`);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
    if (counter > 100) break; // Safety limit
  }
  
  return slug;
}

interface DeployRequestBody {
  project: Project;
}

export const POST: APIRoute = async (context) => {
  const { request } = context;
  
  // Rate limiting - 10 deploys per minute per IP
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`deploy:${clientIP}`, 10, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }
  
  try {
    const body: DeployRequestBody = await request.json();
    
    if (!body.project) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Project data tidak ditemukan',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { project } = body;

    // Validate required fields
    if (!project.businessName || !project.headline || !project.whatsapp) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Data project tidak lengkap',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log received project data for debugging
    console.log('Deploy API received project:', {
      id: project.id,
      businessName: project.businessName,
      template: project.template,
      colorTheme: project.colorTheme,
    });

    // Check KV availability
    const kv = getKV(context);
    
    if (!isKVAvailable(kv)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Storage tidak tersedia. Silakan coba lagi nanti.',
          errorCode: 'KV_UNAVAILABLE',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate landing page HTML
    const { html } = generateLandingPage(project);
    
    // Generate unique slug
    const baseSlug = generateSlug(project.businessName);
    const slug = await getUniqueSlug(kv, baseSlug);
    
    // Determine base URL from request (supports preview branches)
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    const url = `${baseUrl}/p/${slug}`;
    const domain = `${requestUrl.host}/p/${slug}`;

    // Store to KV with retry logic
    const kvData = {
      html,
      businessName: project.businessName,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      template: project.template,
      colorTheme: project.colorTheme,
    };
    
    const putResult = await safeKVPut(kv, `landing:${slug}`, JSON.stringify(kvData));
    
    if (!putResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: putResult.error || 'Gagal menyimpan halaman',
          errorCode: putResult.errorCode,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log(`Landing page deployed to KV: ${slug}`);

    // Generate short URL (tries external services, falls back to internal)
    let shortUrl: string | undefined;
    try {
      const shortResult = await shortenUrl(url, baseUrl, slug);
      if (shortResult.success && shortResult.shortUrl) {
        shortUrl = shortResult.shortUrl;
        console.log(`Short URL generated via ${shortResult.provider}: ${shortUrl}`);
        
        // If internal shortener was used, store mapping in KV
        if (shortResult.provider === 'internal' && shortResult.shortCode) {
          await safeKVPut(kv, `short:${shortResult.shortCode}`, slug);
          console.log(`Internal short mapping stored: ${shortResult.shortCode} -> ${slug}`);
        }
      }
    } catch (err) {
      console.error('Failed to generate short URL:', err);
      // Continue without short URL - not critical
    }

    return new Response(
      JSON.stringify({
        success: true,
        url,
        shortUrl,
        domain,
        slug,
        html,
        isReal: true,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Deploy API error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Terjadi kesalahan saat deploy',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
