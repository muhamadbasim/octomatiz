import type { APIRoute, APIContext } from 'astro';
import { safeKVGet, generateErrorPage, getStatusCodeForError } from '../../lib/kvErrorHandler';
import { recordLinkClick, extractLinkClickEvent } from '../../lib/analytics';

export const prerender = false;

// Landing page data structure stored in KV
interface LandingPageData {
  html: string;
  businessName: string;
  projectId?: string;
}

// Helper to get KV binding
function getKV(context: APIContext): KVNamespace | undefined {
  const runtime = (context.locals as { runtime?: { env?: { LANDING_PAGES?: KVNamespace } } }).runtime;
  return runtime?.env?.LANDING_PAGES;
}

// Helper to get D1 binding
function getD1(context: APIContext): D1Database | undefined {
  const runtime = (context.locals as { runtime?: { env?: { DB?: D1Database } } }).runtime;
  return runtime?.env?.DB;
}

export const GET: APIRoute = async (context) => {
  const { params, request } = context;
  const slug = params.slug;

  if (!slug) {
    return new Response(generateErrorPage('NOT_FOUND'), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const kv = getKV(context);
  const db = getD1(context);

  // Check KV availability
  if (!kv) {
    // Return branded error page for KV unavailable
    return new Response(generateErrorPage('KV_UNAVAILABLE', slug), {
      status: getStatusCodeForError('KV_UNAVAILABLE'),
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Safe KV get with error handling
  const result = await safeKVGet<LandingPageData>(kv, `landing:${slug}`);

  // Handle KV errors
  if (result.error) {
    return new Response(generateErrorPage(result.error.errorCode || 'KV_READ_ERROR', slug), {
      status: getStatusCodeForError(result.error.errorCode || 'KV_READ_ERROR'),
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Handle not found
  if (!result.data || !result.data.html) {
    return new Response(generateErrorPage('NOT_FOUND', slug), {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // Record analytics (fire-and-forget - does not block response)
  const linkClickEvent = extractLinkClickEvent(slug, request, result.data.projectId);
  recordLinkClick(db, kv, linkClickEvent);

  // Return the landing page HTML
  return new Response(result.data.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
