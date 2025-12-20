import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Project } from '../types/project';
import type { DBProject } from '../types/database';
import * as api from '../lib/api/projectsApi';
import { hasLocalStorageData, isMigrationDone, performMigration } from '../lib/migration';

// Device ID storage key
const DEVICE_ID_KEY = 'octomatiz_device_id';
const CURRENT_PROJECT_KEY = 'octomatiz_current_project';

interface ProjectContextValue {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  isMigrating: boolean;
  error: string | null;
  deviceId: string | null;

  // Actions
  createProject: () => Promise<Project | null>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  loadProject: (id: string) => void;
  setCurrentStep: (step: number) => Promise<void>;
  clearCurrentProject: () => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
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

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Initialize device and load projects
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get or create device ID
        let storedDeviceId = localStorage.getItem(DEVICE_ID_KEY);
        
        // Register device with server
        const deviceResponse = await api.registerDevice(storedDeviceId || undefined);
        
        if (deviceResponse.success && deviceResponse.data) {
          storedDeviceId = deviceResponse.data.id;
          localStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
          setDeviceId(storedDeviceId);
          
          // Check for localStorage migration
          if (hasLocalStorageData() && !isMigrationDone()) {
            setIsMigrating(true);
            const migrationResult = await performMigration(storedDeviceId);
            setIsMigrating(false);
            
            if (!migrationResult.success) {
              console.warn('Migration failed:', migrationResult.error);
            }
          }
          
          // Load projects from D1
          const projectsResponse = await api.listProjects(storedDeviceId);
          
          if (projectsResponse.success && projectsResponse.data) {
            const loadedProjects = projectsResponse.data.projects.map(dbToProject);
            setProjects(loadedProjects);
            
            // Load current project if exists
            const currentId = localStorage.getItem(CURRENT_PROJECT_KEY);
            if (currentId) {
              const project = loadedProjects.find(p => p.id === currentId);
              if (project) {
                setCurrentProject(project);
              }
            }
          } else {
            setError(projectsResponse.error || 'Gagal memuat proyek');
          }
        } else {
          setError(deviceResponse.error || 'Gagal mendaftarkan device');
        }
      } catch (err) {
        console.error('Init error:', err);
        setError('Terjadi kesalahan saat memuat data');
      } finally {
        setIsLoading(false);
      }
    };
    
    init();
  }, []);

  const refreshProjects = useCallback(async () => {
    if (!deviceId) return;
    
    setIsLoading(true);
    try {
      const response = await api.listProjects(deviceId);
      if (response.success && response.data) {
        setProjects(response.data.projects.map(dbToProject));
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  const createProjectAction = useCallback(async (): Promise<Project | null> => {
    if (!deviceId) {
      setError('Device ID tidak tersedia');
      return null;
    }
    
    try {
      const response = await api.createProject(deviceId, {});
      
      if (response.success && response.data) {
        const newProject = dbToProject(response.data);
        localStorage.setItem(CURRENT_PROJECT_KEY, newProject.id);
        setCurrentProject(newProject);
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      } else {
        setError(response.error || 'Gagal membuat proyek');
        return null;
      }
    } catch (err) {
      console.error('Create project error:', err);
      setError('Gagal membuat proyek');
      return null;
    }
  }, [deviceId]);

  const updateProjectAction = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      const dbInput = projectToDbInput(data);
      const response = await api.updateProject(id, dbInput);
      
      if (response.success && response.data) {
        const updatedProject = dbToProject(response.data);
        
        setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
        
        if (currentProject?.id === id) {
          setCurrentProject(updatedProject);
        }
      } else {
        setError(response.error || 'Gagal mengupdate proyek');
      }
    } catch (err) {
      console.error('Update project error:', err);
      setError('Gagal mengupdate proyek');
    }
  }, [currentProject]);

  const deleteProjectAction = useCallback(async (id: string) => {
    try {
      const response = await api.deleteProject(id);
      
      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        
        if (currentProject?.id === id) {
          setCurrentProject(null);
          localStorage.removeItem(CURRENT_PROJECT_KEY);
        }
      } else {
        setError(response.error || 'Gagal menghapus proyek');
      }
    } catch (err) {
      console.error('Delete project error:', err);
      setError('Gagal menghapus proyek');
    }
  }, [currentProject]);

  const loadProjectAction = useCallback((id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      localStorage.setItem(CURRENT_PROJECT_KEY, id);
    }
  }, [projects]);

  const setCurrentStepAction = useCallback(async (step: number) => {
    if (!currentProject) return;
    
    await updateProjectAction(currentProject.id, { currentStep: step });
  }, [currentProject, updateProjectAction]);

  const clearCurrentProjectAction = useCallback(() => {
    setCurrentProject(null);
    localStorage.removeItem(CURRENT_PROJECT_KEY);
  }, []);

  const value: ProjectContextValue = {
    projects,
    currentProject,
    isLoading,
    isMigrating,
    error,
    deviceId,
    createProject: createProjectAction,
    updateProject: updateProjectAction,
    deleteProject: deleteProjectAction,
    loadProject: loadProjectAction,
    setCurrentStep: setCurrentStepAction,
    clearCurrentProject: clearCurrentProjectAction,
    refreshProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
