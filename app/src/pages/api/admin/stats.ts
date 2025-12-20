/**
 * Admin Stats API - Simple D1 stats endpoint
 * Returns real project counts from D1 database
 */

import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { countProjectsByStatus, countDevices } from '../../../lib/db/projects';
import { getMetrics } from '../../../lib/db/events';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const db = getDB(locals);
    
    const [statusCounts, deviceCount, metrics] = await Promise.all([
      countProjectsByStatus(db),
      countDevices(db),
      getMetrics(db),
    ]);
    
    const totalProjects = (statusCounts.draft || 0) + (statusCounts.building || 0) + (statusCounts.live || 0);
    
    return new Response(JSON.stringify({
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
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stats',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
