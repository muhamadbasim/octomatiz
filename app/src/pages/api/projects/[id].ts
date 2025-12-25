// Single project API endpoint (GET, PUT, DELETE)
import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { getProject, updateProject, deleteProject, verifyProjectOwnership, type UpdateProjectInput } from '../../../lib/db/projects';
import { logEvent } from '../../../lib/db/events';
import { checkRateLimit, rateLimitResponse, getClientIP } from '../../../lib/security';
import type { ApiResponse, DBProject } from '../../../types/database';

// GET /api/projects/[id] - Get single project
export const GET: APIRoute = async ({ params, locals, request }) => {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`project-get:${clientIP}`, 60, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }
  
  try {
    const db = getDB(locals);
    const { id } = params;
    
    if (!id) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project ID diperlukan',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const project = await getProject(db, id);
    
    if (!project) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project tidak ditemukan',
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const response: ApiResponse<DBProject> = {
      success: true,
      data: project,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get project error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal mengambil project',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PUT /api/projects/[id] - Update project
export const PUT: APIRoute = async ({ params, request, locals }) => {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`project-update:${clientIP}`, 30, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }
  
  try {
    const db = getDB(locals);
    const { id } = params;
    
    if (!id) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project ID diperlukan',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const body = await request.json();
    const { deviceId, ...updateData } = body as { deviceId?: string } & UpdateProjectInput;
    
    // Get existing project to check ownership and track status changes
    const existing = await getProject(db, id);
    if (!existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project tidak ditemukan',
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // IDOR Protection: Verify device owns the project
    if (deviceId) {
      const isOwner = await verifyProjectOwnership(db, id, deviceId);
      if (!isOwner) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Anda tidak memiliki akses ke project ini',
        };
        return new Response(JSON.stringify(response), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    const input: UpdateProjectInput = {
      business_name: updateData.business_name,
      whatsapp: updateData.whatsapp,
      category: updateData.category,
      location: updateData.location,
      photo_url: updateData.photo_url,
      headline: updateData.headline,
      storytelling: updateData.storytelling,
      template: updateData.template,
      color_theme: updateData.color_theme,
      current_step: updateData.current_step,
      status: updateData.status,
      deployed_url: updateData.deployed_url,
      short_url: updateData.short_url,
    };
    
    const project = await updateProject(db, id, input);
    
    if (!project) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Gagal mengupdate project',
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Log status change event if status changed
    if (updateData.status && updateData.status !== existing.status) {
      await logEvent(db, {
        project_id: id,
        device_id: existing.device_id,
        event_type: 'status_changed',
        event_data: { from: existing.status, to: updateData.status },
      });
    }
    
    // Log deployment event if deployed_url is set
    if (updateData.deployed_url && !existing.deployed_url) {
      await logEvent(db, {
        project_id: id,
        device_id: existing.device_id,
        event_type: 'deployed',
        event_data: { url: updateData.deployed_url },
      });
    }
    
    // Log general update event
    await logEvent(db, {
      project_id: id,
      device_id: existing.device_id,
      event_type: 'project_updated',
    });
    
    const response: ApiResponse<DBProject> = {
      success: true,
      data: project,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Update project error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal mengupdate project',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// DELETE /api/projects/[id] - Delete project
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  // Rate limiting - stricter for delete operations
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`project-delete:${clientIP}`, 10, 60000);
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }
  
  try {
    const db = getDB(locals);
    const { id } = params;
    
    if (!id) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project ID diperlukan',
      };
      return new Response(JSON.stringify(response), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get deviceId from request body or query params
    let deviceId: string | null = null;
    try {
      const body = await request.json();
      deviceId = body.deviceId || null;
    } catch {
      // No body or invalid JSON, try query params
      const url = new URL(request.url);
      deviceId = url.searchParams.get('deviceId');
    }
    
    // Get project to log event
    const existing = await getProject(db, id);
    if (!existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Project tidak ditemukan',
      };
      return new Response(JSON.stringify(response), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // IDOR Protection: Verify device owns the project
    if (deviceId) {
      const isOwner = await verifyProjectOwnership(db, id, deviceId);
      if (!isOwner) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Anda tidak memiliki akses ke project ini',
        };
        return new Response(JSON.stringify(response), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Log delete event before deleting
    await logEvent(db, {
      project_id: id,
      device_id: existing.device_id,
      event_type: 'project_deleted',
      event_data: { business_name: existing.business_name },
    });
    
    const deleted = await deleteProject(db, id);
    
    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Gagal menghapus project',
      };
      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const response: ApiResponse<void> = {
      success: true,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Delete project error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Gagal menghapus project',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
