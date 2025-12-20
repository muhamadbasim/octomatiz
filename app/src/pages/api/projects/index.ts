// Projects list and create API endpoint
import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { listProjects, createProject, type CreateProjectInput } from '../../../lib/db/projects';
import { deviceExists } from '../../../lib/db/devices';
import { logEvent } from '../../../lib/db/events';
import type { ApiResponse, DBProject, ProjectsListResponse } from '../../../types/database';

// GET /api/projects - List projects for a device
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDB(locals);
    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    
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
    
    // Verify device exists
    const exists = await deviceExists(db, deviceId);
    if (!exists) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Device tidak terdaftar',
      };
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const projects = await listProjects(db, deviceId);
    
    const response: ApiResponse<ProjectsListResponse> = {
      success: true,
      data: {
        projects,
        total: projects.length,
      },
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('List projects error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal mengambil daftar project',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/projects - Create new project
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDB(locals);
    const body = await request.json();
    const { deviceId, ...projectData } = body as { deviceId: string } & Partial<CreateProjectInput>;
    
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
    
    // Verify device exists
    const exists = await deviceExists(db, deviceId);
    if (!exists) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Device tidak terdaftar',
      };
      return new Response(JSON.stringify(response), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const input: CreateProjectInput = {
      device_id: deviceId,
      business_name: projectData.business_name,
      whatsapp: projectData.whatsapp,
      category: projectData.category,
      location: projectData.location,
      photo_url: projectData.photo_url,
      headline: projectData.headline,
      storytelling: projectData.storytelling,
      template: projectData.template,
      color_theme: projectData.color_theme,
      current_step: projectData.current_step,
      status: projectData.status,
    };
    
    const project = await createProject(db, input);
    
    // Log event
    await logEvent(db, {
      project_id: project.id,
      device_id: deviceId,
      event_type: 'project_created',
    });
    
    const response: ApiResponse<DBProject> = {
      success: true,
      data: project,
    };
    
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create project error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal membuat project',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
