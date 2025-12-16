import type { APIRoute } from 'astro';
import type { Project } from '../../types/project';
import { generateLandingPage, generateDomain } from '../../lib/landingPageGenerator';

export const prerender = false;

interface DeployRequestBody {
  project: Project;
}

export const POST: APIRoute = async ({ request }) => {
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

    // Generate landing page
    const { html } = generateLandingPage(project);
    const domain = generateDomain(project.businessName);
    const url = `https://${domain}`;

    // In production, this would:
    // 1. Upload HTML to Cloudflare Pages
    // 2. Configure custom domain
    // 3. Return actual deployed URL
    
    // For MVP, we return simulated success
    return new Response(
      JSON.stringify({
        success: true,
        url,
        domain,
        html, // Include HTML for preview
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
