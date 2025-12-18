import { useProjectContext } from '../context/ProjectContext';
import type { Project } from '../types/project';

/**
 * Hook for accessing and managing the current project
 */
export function useProject() {
  const {
    currentProject,
    updateProject,
    setCurrentStep,
  } = useProjectContext();

  const updateCurrentProject = (data: Partial<Project>) => {
    if (!currentProject) return;
    updateProject(currentProject.id, data);
  };

  return {
    project: currentProject,
    updateProject: updateCurrentProject,
    setCurrentStep,
    isLoaded: currentProject !== null,
  };
}

/**
 * Hook for managing the projects list
 */
export function useProjects() {
  const {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    refreshProjects,
  } = useProjectContext();

  const draftProjects = projects.filter(p => p.status === 'draft');
  const buildingProjects = projects.filter(p => p.status === 'building');
  const liveProjects = projects.filter(p => p.status === 'live');

  return {
    projects,
    draftProjects,
    buildingProjects,
    liveProjects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    refreshProjects,
  };
}
