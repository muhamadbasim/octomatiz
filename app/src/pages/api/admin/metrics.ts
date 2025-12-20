/**
 * Admin Metrics API Endpoint
 * Returns dashboard metrics data based on segment filter
 * Now uses D1 database for real project data
 */

import type { APIRoute } from 'astro';
import type { SegmentType, MetricsAPIResponse, DashboardMetrics } from '../../../types/admin';
import { getMockDashboardMetrics } from '../../../lib/admin/mockData';
import { getDB } from '../../../lib/db/client';
import { getMetrics } from '../../../lib/db/events';
import { countProjectsByStatus } from '../../../lib/db/projects';

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const segment = (url.searchParams.get('segment') || 'all') as SegmentType;
    const useRealData = url.searchParams.get('real') === 'true';

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

    if (useRealData) {
      // Fetch real data from D1
      try {
        const db = getDB(locals);
        const d1Metrics = await getMetrics(db);
        const statusCounts = await countProjectsByStatus(db);
        
        // Get mock metrics as base, then enhance with real data
        const mockMetrics = getMockDashboardMetrics(segment);
        
        // Calculate real ARPU based on actual project counts
        // For now, we estimate based on project activity
        const totalProjects = d1Metrics.totalProjects;
        const liveProjects = statusCounts.live || 0;
        
        metrics = {
          ...mockMetrics,
          // We can add real project metrics to the response
          // The financial metrics (MRR, LTV, etc.) remain mock for now
          // as they require payment integration
        };
        
        // Add real project stats to response (as custom field)
        (metrics as DashboardMetrics & { realProjectStats?: unknown }).realProjectStats = {
          totalProjects,
          projectsByStatus: statusCounts,
          projectsCreatedToday: d1Metrics.projectsCreatedToday,
          projectsCreatedThisWeek: d1Metrics.projectsCreatedThisWeek,
          projectsCreatedThisMonth: d1Metrics.projectsCreatedThisMonth,
          totalDeployments: d1Metrics.totalDeployments,
        };
      } catch (dbError) {
        console.warn('D1 not available, falling back to mock data:', dbError);
        metrics = getMockDashboardMetrics(segment);
      }
    } else {
      // Return mock data (default for now)
      metrics = getMockDashboardMetrics(segment);
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
