/**
 * Admin Analytics API - Link click analytics endpoint
 * GET /api/admin/analytics
 * Query params:
 *   - slug (optional): Filter by specific landing page slug
 *   - days (optional, default: 30): Number of days to include in clicksByDay
 * 
 * Returns: AnalyticsSummary or AnalyticsSummary[]
 * _Requirements: 3.1, 3.2, 3.3, 3.4_
 */

import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { getSlugAnalytics, getAllAnalytics, type AnalyticsSummary } from '../../../lib/analytics';

export const prerender = false;

export const GET: APIRoute = async ({ locals, url }) => {
  const startTime = Date.now();
  
  try {
    const db = getDB(locals);
    
    // Parse query params
    const slug = url.searchParams.get('slug');
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;
    
    // Validate days parameter
    if (isNaN(days) || days < 1 || days > 365) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Parameter days harus antara 1-365',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let data: AnalyticsSummary | AnalyticsSummary[];
    
    if (slug) {
      // Get analytics for specific slug
      data = await getSlugAnalytics(db, slug, days);
    } else {
      // Get analytics for all landing pages
      data = await getAllAnalytics(db, days);
    }
    
    const responseTime = Date.now() - startTime;
    
    // Requirement 3.4: Return data within 2 seconds
    if (responseTime > 2000) {
      console.warn(`Analytics API slow response: ${responseTime}ms`);
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      meta: {
        days,
        responseTimeMs: responseTime,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mengambil data analytics',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
