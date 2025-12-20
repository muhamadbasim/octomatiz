// Project CRUD operations for D1
import type { DBProject } from '../../types/database';
import { generateProjectId, nowISO, toArray } from './client';
import { getLinkedDeviceIds } from './devices';

export interface CreateProjectInput {
  device_id: string;
  business_name?: string;
  whatsapp?: string;
  category?: string;
  location?: string;
  photo_url?: string;
  headline?: string;
  storytelling?: string;
  template?: string;
  color_theme?: string;
  current_step?: number;
  status?: 'draft' | 'building' | 'live';
}

export interface UpdateProjectInput {
  business_name?: string;
  whatsapp?: string;
  category?: string;
  location?: string;
  photo_url?: string;
  headline?: string;
  storytelling?: string;
  template?: string;
  color_theme?: string;
  current_step?: number;
  status?: 'draft' | 'building' | 'live';
  deployed_url?: string;
  short_url?: string;
}

export async function createProject(db: D1Database, input: CreateProjectInput): Promise<DBProject> {
  const id = generateProjectId();
  const now = nowISO();
  
  const project: DBProject = {
    id,
    device_id: input.device_id,
    business_name: input.business_name || null,
    whatsapp: input.whatsapp || null,
    category: input.category || null,
    location: input.location || null,
    photo_url: input.photo_url || null,
    headline: input.headline || null,
    storytelling: input.storytelling || null,
    template: input.template || 'simple',
    color_theme: input.color_theme || 'green',
    current_step: input.current_step || 1,
    status: input.status || 'draft',
    deployed_url: null,
    short_url: null,
    created_at: now,
    updated_at: now,
  };
  
  await db.prepare(`
    INSERT INTO projects (
      id, device_id, business_name, whatsapp, category, location,
      photo_url, headline, storytelling, template, color_theme,
      current_step, status, deployed_url, short_url, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    project.id, project.device_id, project.business_name, project.whatsapp,
    project.category, project.location, project.photo_url, project.headline,
    project.storytelling, project.template, project.color_theme,
    project.current_step, project.status, project.deployed_url,
    project.short_url, project.created_at, project.updated_at
  ).run();
  
  return project;
}

export async function getProject(db: D1Database, id: string): Promise<DBProject | null> {
  return await db.prepare(`
    SELECT * FROM projects WHERE id = ?
  `).bind(id).first<DBProject>();
}

export async function updateProject(db: D1Database, id: string, input: UpdateProjectInput): Promise<DBProject | null> {
  const existing = await getProject(db, id);
  if (!existing) return null;
  
  const updated: DBProject = {
    ...existing,
    business_name: input.business_name !== undefined ? input.business_name || null : existing.business_name,
    whatsapp: input.whatsapp !== undefined ? input.whatsapp || null : existing.whatsapp,
    category: input.category !== undefined ? input.category || null : existing.category,
    location: input.location !== undefined ? input.location || null : existing.location,
    photo_url: input.photo_url !== undefined ? input.photo_url || null : existing.photo_url,
    headline: input.headline !== undefined ? input.headline || null : existing.headline,
    storytelling: input.storytelling !== undefined ? input.storytelling || null : existing.storytelling,
    template: input.template !== undefined ? input.template || null : existing.template,
    color_theme: input.color_theme !== undefined ? input.color_theme || null : existing.color_theme,
    current_step: input.current_step !== undefined ? input.current_step : existing.current_step,
    status: input.status !== undefined ? input.status : existing.status,
    deployed_url: input.deployed_url !== undefined ? input.deployed_url || null : existing.deployed_url,
    short_url: input.short_url !== undefined ? input.short_url || null : existing.short_url,
    updated_at: nowISO(),
  };
  
  await db.prepare(`
    UPDATE projects SET
      business_name = ?, whatsapp = ?, category = ?, location = ?,
      photo_url = ?, headline = ?, storytelling = ?, template = ?,
      color_theme = ?, current_step = ?, status = ?, deployed_url = ?,
      short_url = ?, updated_at = ?
    WHERE id = ?
  `).bind(
    updated.business_name, updated.whatsapp, updated.category, updated.location,
    updated.photo_url, updated.headline, updated.storytelling, updated.template,
    updated.color_theme, updated.current_step, updated.status, updated.deployed_url,
    updated.short_url, updated.updated_at, id
  ).run();
  
  return updated;
}

export async function deleteProject(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(`
    DELETE FROM projects WHERE id = ?
  `).bind(id).run();
  
  return result.meta.changes > 0;
}

export async function listProjects(db: D1Database, deviceId: string): Promise<DBProject[]> {
  // Get all linked device IDs
  const deviceIds = await getLinkedDeviceIds(db, deviceId);
  
  // Build placeholders for IN clause
  const placeholders = deviceIds.map(() => '?').join(', ');
  
  const result = await db.prepare(`
    SELECT * FROM projects 
    WHERE device_id IN (${placeholders})
    ORDER BY updated_at DESC
  `).bind(...deviceIds).all<DBProject>();
  
  return toArray(result);
}

export async function listProjectsByStatus(db: D1Database, deviceId: string, status: string): Promise<DBProject[]> {
  const deviceIds = await getLinkedDeviceIds(db, deviceId);
  const placeholders = deviceIds.map(() => '?').join(', ');
  
  const result = await db.prepare(`
    SELECT * FROM projects 
    WHERE device_id IN (${placeholders}) AND status = ?
    ORDER BY updated_at DESC
  `).bind(...deviceIds, status).all<DBProject>();
  
  return toArray(result);
}

export async function countProjectsByStatus(db: D1Database): Promise<Record<string, number>> {
  const result = await db.prepare(`
    SELECT status, COUNT(*) as count FROM projects GROUP BY status
  `).all<{ status: string; count: number }>();
  
  const counts: Record<string, number> = { draft: 0, building: 0, live: 0 };
  for (const row of toArray(result)) {
    counts[row.status] = row.count;
  }
  return counts;
}


export async function countDevices(db: D1Database): Promise<number> {
  const result = await db.prepare(`
    SELECT COUNT(*) as count FROM devices
  `).first<{ count: number }>();
  
  return result?.count || 0;
}
