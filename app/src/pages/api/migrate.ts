// Migration API endpoint - migrate localStorage data to D1
import type { APIRoute } from 'astro';
import { getDB, generateProjectId, nowISO } from '../../lib/db/client';
import { deviceExists, registerDevice } from '../../lib/db/devices';
import { logEvent } from '../../lib/db/events';
import type { ApiResponse, MigrationPayload, LocalStorageProject, DBProject } from '../../types/database';

interface MigrationResult {
  migratedCount: number;
  skippedCount: number;
  projects: DBProject[];
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDB(locals);
    const body = await request.json() as MigrationPayload;
    const { deviceId, projects } = body;
    
    if (!deviceId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Device ID diperlukan',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (!projects || !Array.isArray(projects)) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Data projects tidak valid',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Ensure device exists
    const exists = await deviceExists(db, deviceId);
    if (!exists) {
      // Register the device first
      await registerDevice(db);
    }
    
    const migratedProjects: DBProject[] = [];
    let skippedCount = 0;
    
    for (const localProject of projects) {
      try {
        // Check if project already exists (by ID)
        const existingCheck = await db.prepare(`
          SELECT id FROM projects WHERE id = ?
        `).bind(localProject.id).first();
        
        if (existingCheck) {
          skippedCount++;
          continue;
        }
        
        // Transform localStorage format to D1 format
        const now = nowISO();
        const dbProject: DBProject = {
          id: localProject.id || generateProjectId(),
          device_id: deviceId,
          business_name: localProject.businessName || null,
          whatsapp: localProject.whatsapp || null,
          category: localProject.category || null,
          location: localProject.location || null,
          photo_url: localProject.productImage || null,
          headline: localProject.headline || null,
          storytelling: localProject.storytelling || null,
          template: localProject.template || 'simple',
          color_theme: localProject.colorTheme || 'green',
          current_step: localProject.currentStep || 1,
          status: (localProject.status as 'draft' | 'building' | 'live') || 'draft',
          deployed_url: localProject.deployedUrl || null,
          short_url: localProject.shortUrl || null,
          created_at: localProject.createdAt || now,
          updated_at: localProject.updatedAt || now,
        };
        
        // Insert into D1
        await db.prepare(`
          INSERT INTO projects (
            id, device_id, business_name, whatsapp, category, location,
            photo_url, headline, storytelling, template, color_theme,
            current_step, status, deployed_url, short_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          dbProject.id, dbProject.device_id, dbProject.business_name, dbProject.whatsapp,
          dbProject.category, dbProject.location, dbProject.photo_url, dbProject.headline,
          dbProject.storytelling, dbProject.template, dbProject.color_theme,
          dbProject.current_step, dbProject.status, dbProject.deployed_url,
          dbProject.short_url, dbProject.created_at, dbProject.updated_at
        ).run();
        
        migratedProjects.push(dbProject);
      } catch (err) {
        console.error(`Failed to migrate project ${localProject.id}:`, err);
        skippedCount++;
      }
    }
    
    // Log migration event
    if (migratedProjects.length > 0) {
      await logEvent(db, {
        device_id: deviceId,
        event_type: 'migration_completed',
        event_data: {
          migratedCount: migratedProjects.length,
          skippedCount,
        },
      });
    }
    
    const response: ApiResponse<MigrationResult> = {
      success: true,
      data: {
        migratedCount: migratedProjects.length,
        skippedCount,
        projects: migratedProjects,
      },
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Migration error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal melakukan migrasi data',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
