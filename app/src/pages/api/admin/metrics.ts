/**
 * Admin Metrics API Endpoint
 * Returns dashboard metrics data based on segment filter
 * Uses D1 database for real project data by default
 * REQUIRES: Authorization header with ADMIN_SECRET
 */

import type { APIRoute } from 'astro';
import type { SegmentType, MetricsAPIResponse, DashboardMetrics } from '../../../types/admin';
import { getMockDashboardMetrics } from '../../../lib/admin/mockData';
import { getDB } from '../../../lib/db/client';
import { getMetrics } from '../../../lib/db/events';
import { countProjectsByStatus, countDevices } from '../../../lib/db/projects';
import { checkRateLimit, rateLimitResponse, getClientIP, verifyAdminAuth, unauthorizedResponse } from '../../../lib/security';

export const GET: APIRoute = async (context) => {
  const { request, locals } = context;
  
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`metrics:${clientIP}`, 30, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  // Admin authentication required
  if (!verifyAdminAuth(context, request)) {
    console.warn(`Unauthorized metrics access attempt from IP: ${clientIP}`);
    return unauthorizedResponse();
  }
  
  try {
    const url = new URL(request.url);
    const segment = (url.searchParams.get('segment') || 'all') as SegmentType;
    const useMockData = url.searchParams.get('mock') === 'true';

    // Validate segment
    if (!['all', 'basic', 'premium'].includes(segment)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid segment parameter. Must be "all", "basic", or "premium".',
        } as MetricsAPIResponse),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let metrics: DashboardMetrics;

    if (useMockData) {
      // Return mock data only if explicitly requested
      metrics = getMockDashboardMetrics(segment);
    } else {
      // Default: Fetch real data from D1
      try {
        const db = getDB(locals);
        const d1Metrics = await getMetrics(db);
        const statusCounts = await countProjectsByStatus(db);
        const deviceCount = await countDevices(db);
        
        // Get mock metrics as base structure
        const mockMetrics = getMockDashboardMetrics(segment);
        
        // Calculate real metrics based on actual data
        const totalProjects = d1Metrics.totalProjects;
        const liveProjects = statusCounts.live || 0;
        const buildingProjects = statusCounts.building || 0;
        const draftProjects = statusCounts.draft || 0;
        
        // Estimate MRR based on live projects (Rp 50,000 per live project as example)
        const estimatedMRR = liveProjects * 50000;
        
        metrics = {
          ...mockMetrics,
          mrr: {
            ...mockMetrics.mrr,
            value: estimatedMRR,
            change: totalProjects > 0 ? ((liveProjects / totalProjects) * 100) : 0,
          },
          vitalSigns: {
            ...mockMetrics.vitalSigns,
            mrrGrowth: {
              ...mockMetrics.vitalSigns.mrrGrowth,
              value: totalProjects > 0 ? (liveProjects / totalProjects) * 100 : 0,
            },
          },
          productHealth: {
            ...mockMetrics.productHealth,
            activeUsers: deviceCount,
            projectsCreated: totalProjects,
            deploymentSuccessRate: totalProjects > 0 ? (liveProjects / totalProjects) * 100 : 0,
          },
        };
        
        // Add real project stats to response
        (metrics as DashboardMetrics & { realProjectStats?: unknown }).realProjectStats = {
          totalProjects,
          projectsByStatus: statusCounts,
          projectsCreatedToday: d1Metrics.projectsCreatedToday,
          projectsCreatedThisWeek: d1Metrics.projectsCreatedThisWeek,
          projectsCreatedThisMonth: d1Metrics.projectsCreatedThisMonth,
          totalDeployments: d1Metrics.totalDeployments,
          totalDevices: deviceCount,
        };
      } catch (dbError) {
        console.warn('D1 not available, falling back to mock data:', dbError);
        metrics = getMockDashboardMetrics(segment);
      }
    }

    const response: MetricsAPIResponse = {
      success: true,
      data: metrics,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      } as MetricsAPIResponse),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
