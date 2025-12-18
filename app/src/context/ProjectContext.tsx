import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Project } from '../types/project';
import { createNewProject } from '../types/project';
import {
  getProjects,
  saveProject as saveProjectToStorage,
  deleteProject as deleteProjectFromStorage,
  getProject,
  getCurrentProjectId,
  setCurrentProjectId,
  clearCurrentProjectId,
} from '../lib/storage';

interface ProjectContextValue {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;

  // Actions
  createProject: () => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
  setCurrentStep: (step: number) => void;
  clearCurrentProject: () => void;
  refreshProjects: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);

    // Load current project if exists
    const currentId = getCurrentProjectId();
    if (currentId) {
      const project = getProject(currentId);
      if (project) {
        setCurrentProject(project);
      }
    }

    setIsLoading(false);
  }, []);

  const refreshProjects = useCallback(() => {
    const loadedProjects = getProjects();
    setProjects(loadedProjects);
  }, []);

  const createProjectAction = useCallback(() => {
    const newProject = createNewProject();
    saveProjectToStorage(newProject);
    setCurrentProjectId(newProject.id);
    setCurrentProject(newProject);
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProjectAction = useCallback((id: string, data: Partial<Project>) => {
    // Get current project from storage to ensure we have latest data
    const existingProject = getProject(id);
    if (!existingProject) return;

    const updated = {
      ...existingProject,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage FIRST (synchronous)
    saveProjectToStorage(updated);

    // Then update React state
    setProjects(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index < 0) return [...prev, updated];

      const newProjects = [...prev];
      newProjects[index] = updated;
      return newProjects;
    });

    // Update current project if it's the one being updated
    if (currentProject?.id === id) {
      setCurrentProject(updated);
    }
  }, [currentProject]);

  const deleteProjectAction = useCallback((id: string) => {
    deleteProjectFromStorage(id);
    setProjects(prev => prev.filter(p => p.id !== id));

    if (currentProject?.id === id) {
      setCurrentProject(null);
      clearCurrentProjectId();
    }
  }, [currentProject]);

  const loadProjectAction = useCallback((id: string) => {
    const project = getProject(id);
    if (project) {
      setCurrentProject(project);
      setCurrentProjectId(id);
    }
  }, []);

  const setCurrentStepAction = useCallback((step: number) => {
    if (!currentProject) return;

    const updated = {
      ...currentProject,
      currentStep: step,
      updatedAt: new Date().toISOString(),
    };

    saveProjectToStorage(updated);
    setCurrentProject(updated);
    setProjects(prev =>
      prev.map(p => (p.id === updated.id ? updated : p))
    );
  }, [currentProject]);

  const clearCurrentProjectAction = useCallback(() => {
    setCurrentProject(null);
    clearCurrentProjectId();
  }, []);

  const value: ProjectContextValue = {
    projects,
    currentProject,
    isLoading,
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
