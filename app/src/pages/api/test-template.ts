import type { APIRoute } from 'astro';
import type { Project } from '../../types/project';
import { generateLandingPage } from '../../lib/landingPageGenerator';

export const prerender = false;

/**
 * Test endpoint to verify template selection works correctly
 * GET /api/test-template?template=modern&colorTheme=blue
 */
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const template = url.searchParams.get('template') || 'simple';
  const colorTheme = url.searchParams.get('colorTheme') || 'green';

  // Create mock project with specified template
  const mockProject: Project = {
    id: 'test-' + Date.now(),
    businessName: 'Test Business',
    category: 'Kuliner',
    whatsapp: '081234567890',
    location: 'Jakarta',
    headline: 'Test Headline untuk Template ' + template.toUpperCase(),
    storytelling: 'Ini adalah test storytelling untuk memastikan template ' + template + ' berfungsi dengan benar.',
    productImage: 'https://via.placeholder.com/800x600/1a1a2e/36e27b?text=Test+Image',
    template: template as Project['template'],
    colorTheme: colorTheme as Project['colorTheme'],
    status: 'building',
    currentStep: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log('Test template generation:', {
    template: mockProject.template,
    colorTheme: mockProject.colorTheme,
  });

  // Generate landing page
  const { html } = generateLandingPage(mockProject);

  // Return HTML directly for visual testing
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};

/**
 * POST endpoint to test with actual project data
 * POST /api/test-template with { project: {...} }
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const project = body.project as Project;

    console.log('Received project for template test:', {
      id: project.id,
      businessName: project.businessName,
      template: project.template,
      colorTheme: project.colorTheme,
    });

    if (!project.template) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Template is missing from project data!',
          receivedProject: {
            id: project.id,
            template: project.template,
            colorTheme: project.colorTheme,
          },
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { html } = generateLandingPage(project);

    return new Response(
      JSON.stringify({
        success: true,
        template: project.template,
        colorTheme: project.colorTheme,
        htmlLength: html.length,
        htmlPreview: html.substring(0, 500) + '...',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
