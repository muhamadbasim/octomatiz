// Hook for projects management with D1 backend
import { useState, useEffect, useCallback } from 'react';
import type { DBProject } from '../types/database';
import type { Project } from '../types/project';
import * as api from '../lib/api/projectsApi';

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createProject: (data?: Partial<Project>) => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  getProject: (id: string) => Project | undefined;
}

// Transform DBProject to Project (client-side format)
function dbToProject(db: DBProject): Project {
  return {
    id: db.id,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    currentStep: db.current_step,
    businessName: db.business_name || '',
    whatsapp: db.whatsapp || '',
    category: (db.category as Project['category']) || 'kuliner',
    location: db.location || '',
    productImage: db.photo_url || undefined,
    headline: db.headline || '',
    storytelling: db.storytelling || '',
    template: (db.template as Project['template']) || 'simple',
    colorTheme: (db.color_theme as Project['colorTheme']) || 'green',
    deployedUrl: db.deployed_url || undefined,
  };
}

// Transform Project to DBProject format for API
function projectToDbInput(project: Partial<Project>): Partial<DBProject> {
  const input: Partial<DBProject> = {};
  
  if (project.businessName !== undefined) input.business_name = project.businessName;
  if (project.whatsapp !== undefined) input.whatsapp = project.whatsapp;
  if (project.category !== undefined) input.category = project.category;
  if (project.location !== undefined) input.location = project.location;
  if (project.productImage !== undefined) input.photo_url = project.productImage;
  if (project.headline !== undefined) input.headline = project.headline;
  if (project.storytelling !== undefined) input.storytelling = project.storytelling;
  if (project.template !== undefined) input.template = project.template;
  if (project.colorTheme !== undefined) input.color_theme = project.colorTheme;
  if (project.currentStep !== undefined) input.current_step = project.currentStep;
  if (project.status !== undefined) input.status = project.status;
  if (project.deployedUrl !== undefined) input.deployed_url = project.deployedUrl;
  
  return input;
}

export function useProjects(deviceId: string | null): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!deviceId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.listProjects(deviceId);
      
      if (response.success && response.data) {
        const transformed = response.data.projects.map(dbToProject);
        setProjects(transformed);
      } else {
        setError(response.error || 'Gagal mengambil daftar project');
      }
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError('Gagal mengambil daftar project');
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data?: Partial<Project>): Promise<Project | null> => {
    if (!deviceId) {
      setError('Device ID tidak tersedia');
      return null;
    }
    
    try {
      const dbInput = data ? projectToDbInput(data) : {};
      const response = await api.createProject(deviceId, dbInput);
      
      if (response.success && response.data) {
        const newProject = dbToProject(response.data);
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      } else {
        setError(response.error || 'Gagal membuat project');
        return null;
      }
    } catch (err) {
      console.error('Create project error:', err);
      setError('Gagal membuat project');
      return null;
    }
  }, [deviceId]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>): Promise<Project | null> => {
    try {
      const dbInput = projectToDbInput(data);
      const response = await api.updateProject(id, dbInput);
      
      if (response.success && response.data) {
        const updatedProject = dbToProject(response.data);
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        return updatedProject;
      } else {
        setError(response.error || 'Gagal mengupdate project');
        return null;
      }
    } catch (err) {
      console.error('Update project error:', err);
      setError('Gagal mengupdate project');
      return null;
    }
  }, []);

  const deleteProjectFn = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await api.deleteProject(id);
      
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        return true;
      } else {
        setError(response.error || 'Gagal menghapus project');
        return false;
      }
    } catch (err) {
      console.error('Delete project error:', err);
      setError('Gagal menghapus project');
      return false;
    }
  }, []);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  return {
    projects,
    isLoading,
    error,
    refresh: fetchProjects,
    createProject,
    updateProject,
    deleteProject: deleteProjectFn,
    getProject,
  };
}
