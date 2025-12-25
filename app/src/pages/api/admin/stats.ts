/**
 * Admin Stats API - Simple D1 stats endpoint
 * Returns real project counts from D1 database
 * REQUIRES: Authorization header with ADMIN_SECRET
 */

import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { countProjectsByStatus, countDevices } from '../../../lib/db/projects';
import { getMetrics } from '../../../lib/db/events';
import { checkRateLimit, rateLimitResponse, getClientIP, verifyAdminAuth, unauthorizedResponse, addSecurityHeaders } from '../../../lib/security';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const { locals, request } = context;
  
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`stats:${clientIP}`, 30, 60000); // 30 requests per minute
  if (!rateLimit.allowed) {
    return addSecurityHeaders(rateLimitResponse(rateLimit.resetIn));
  }

  // Admin authentication required
  if (!verifyAdminAuth(context, request)) {
    console.warn(`Unauthorized stats access attempt from IP: ${clientIP}`);
    return addSecurityHeaders(unauthorizedResponse());
  }

  try {
    const db = getDB(locals);
    
    // If no D1 available (local dev), return mock data
    if (!db) {
      return addSecurityHeaders(new Response(JSON.stringify({
        success: true,
        data: {
          totalProjects: 15,
          projectsByStatus: { draft: 5, building: 3, live: 7 },
          totalDevices: 12,
          projectsCreatedToday: 2,
          projectsCreatedThisWeek: 8,
          projectsCreatedThisMonth: 15,
          totalDeployments: 7,
          _mock: true
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
    
    const [statusCounts, deviceCount, metrics] = await Promise.all([
      countProjectsByStatus(db),
      countDevices(db),
      getMetrics(db),
    ]);
    
    const totalProjects = (statusCounts.draft || 0) + (statusCounts.building || 0) + (statusCounts.live || 0);
    
    return addSecurityHeaders(new Response(JSON.stringify({
      success: true,
      data: {
        totalProjects,
        projectsByStatus: statusCounts,
        totalDevices: deviceCount,
        projectsCreatedToday: metrics.projectsCreatedToday,
        projectsCreatedThisWeek: metrics.projectsCreatedThisWeek,
        projectsCreatedThisMonth: metrics.projectsCreatedThisMonth,
        totalDeployments: metrics.totalDeployments,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (error) {
    console.error('Stats API error:', error);
    return addSecurityHeaders(new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
};
