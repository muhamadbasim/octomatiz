// Client-side API wrapper for projects
import type { ApiResponse, DBProject, ProjectsListResponse } from '../../types/database';

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API fetch error:', error);
    return {
      success: false,
      error: 'Tidak dapat terhubung ke server',
    };
  }
}

// Device API
export async function registerDevice(existingDeviceId?: string): Promise<ApiResponse<{ id: string }>> {
  return apiFetch(`${API_BASE}/device/register`, {
    method: 'POST',
    body: JSON.stringify({ deviceId: existingDeviceId }),
  });
}

// Projects API
export async function listProjects(deviceId: string): Promise<ApiResponse<ProjectsListResponse>> {
  return apiFetch(`${API_BASE}/projects?deviceId=${encodeURIComponent(deviceId)}`);
}

export async function getProject(id: string): Promise<ApiResponse<DBProject>> {
  return apiFetch(`${API_BASE}/projects/${encodeURIComponent(id)}`);
}

export async function createProject(
  deviceId: string,
  data: Partial<Omit<DBProject, 'id' | 'device_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<DBProject>> {
  return apiFetch(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify({ deviceId, ...data }),
  });
}

export async function updateProject(
  id: string,
  data: Partial<Omit<DBProject, 'id' | 'device_id' | 'created_at' | 'updated_at'>>
): Promise<ApiResponse<DBProject>> {
  return apiFetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProject(id: string): Promise<ApiResponse<void>> {
  return apiFetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// Migration API
export async function migrateLocalStorage(
  deviceId: string,
  projects: unknown[]
): Promise<ApiResponse<{ migratedCount: number; skippedCount: number }>> {
  return apiFetch(`${API_BASE}/migrate`, {
    method: 'POST',
    body: JSON.stringify({ deviceId, projects }),
  });
}
