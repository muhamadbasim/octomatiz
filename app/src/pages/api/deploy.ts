import type { APIRoute, APIContext } from 'astro';
import type { Project } from '../../types/project';
import { generateLandingPage } from '../../lib/landingPageGenerator';

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

    // Generate landing page HTML
    const { html } = generateLandingPage(project);
    
    // Generate unique slug
    const kv = getKV(context);
    const baseSlug = generateSlug(project.businessName);
    const slug = await getUniqueSlug(kv, baseSlug);
    
    // Determine base URL from request (supports preview branches)
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    
    const url = `${baseUrl}/p/${slug}`;
    const domain = `${requestUrl.host}/p/${slug}`;

    // Store to KV if available
    if (kv) {
      const kvData = {
        html,
        businessName: project.businessName,
        projectId: project.id,
        createdAt: new Date().toISOString(),
        template: project.template,
        colorTheme: project.colorTheme,
      };
      
      await kv.put(`landing:${slug}`, JSON.stringify(kvData));
      console.log(`Landing page deployed to KV: ${slug}`);
    } else {
      console.log('KV not available, returning simulated deployment');
    }

    return new Response(
      JSON.stringify({
        success: true,
        url,
        domain,
        slug,
        html, // Include HTML for preview
        isReal: !!kv, // Indicate if this was a real deployment
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
