// Event logging for D1 (metrics and analytics)
import type { DBEvent, EventType } from '../../types/database';
import { nowISO, toArray } from './client';

export interface LogEventInput {
  project_id?: string;
  device_id: string;
  event_type: EventType;
  event_data?: Record<string, unknown>;
}

export async function logEvent(db: D1Database, input: LogEventInput): Promise<DBEvent> {
  const now = nowISO();
  const eventData = input.event_data ? JSON.stringify(input.event_data) : null;
  
  const result = await db.prepare(`
    INSERT INTO events (project_id, device_id, event_type, event_data, created_at)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    input.project_id || null,
    input.device_id,
    input.event_type,
    eventData,
    now
  ).first<DBEvent>();
  
  return result!;
}

export async function getProjectEvents(db: D1Database, projectId: string): Promise<DBEvent[]> {
  const result = await db.prepare(`
    SELECT * FROM events WHERE project_id = ? ORDER BY created_at DESC
  `).bind(projectId).all<DBEvent>();
  
  return toArray(result);
}

export async function getDeviceEvents(db: D1Database, deviceId: string, limit = 100): Promise<DBEvent[]> {
  const result = await db.prepare(`
    SELECT * FROM events WHERE device_id = ? ORDER BY created_at DESC LIMIT ?
  `).bind(deviceId, limit).all<DBEvent>();
  
  return toArray(result);
}

export interface MetricsSummary {
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  totalDeployments: number;
  recentEvents: DBEvent[];
  projectsCreatedToday: number;
  projectsCreatedThisWeek: number;
  projectsCreatedThisMonth: number;
}

export async function getMetrics(db: D1Database): Promise<MetricsSummary> {
  // Get project counts by status
  const statusCounts = await db.prepare(`
    SELECT status, COUNT(*) as count FROM projects GROUP BY status
  `).all<{ status: string; count: number }>();
  
  const projectsByStatus: Record<string, number> = { draft: 0, building: 0, live: 0 };
  let totalProjects = 0;
  for (const row of toArray(statusCounts)) {
    projectsByStatus[row.status] = row.count;
    totalProjects += row.count;
  }
  
  // Get deployment count
  const deploymentCount = await db.prepare(`
    SELECT COUNT(*) as count FROM events WHERE event_type = 'deployed'
  `).first<{ count: number }>();
  
  // Get recent events
  const recentEvents = await db.prepare(`
    SELECT * FROM events ORDER BY created_at DESC LIMIT 20
  `).all<DBEvent>();
  
  // Get projects created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();
  
  const createdToday = await db.prepare(`
    SELECT COUNT(*) as count FROM projects WHERE created_at >= ?
  `).bind(todayISO).first<{ count: number }>();
  
  // Get projects created this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoISO = weekAgo.toISOString();
  
  const createdThisWeek = await db.prepare(`
    SELECT COUNT(*) as count FROM projects WHERE created_at >= ?
  `).bind(weekAgoISO).first<{ count: number }>();
  
  // Get projects created this month
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthAgoISO = monthAgo.toISOString();
  
  const createdThisMonth = await db.prepare(`
    SELECT COUNT(*) as count FROM projects WHERE created_at >= ?
  `).bind(monthAgoISO).first<{ count: number }>();
  
  return {
    totalProjects,
    projectsByStatus,
    totalDeployments: deploymentCount?.count || 0,
    recentEvents: toArray(recentEvents),
    projectsCreatedToday: createdToday?.count || 0,
    projectsCreatedThisWeek: createdThisWeek?.count || 0,
    projectsCreatedThisMonth: createdThisMonth?.count || 0,
  };
}
