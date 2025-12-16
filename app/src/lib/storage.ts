import type { Project } from '../types/project';

const STORAGE_KEYS = {
  PROJECTS: 'octomatiz_projects',
  CURRENT_PROJECT: 'octomatiz_current_project',
} as const;

// Check if localStorage is available
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Projects CRUD
export function getProjects(): Project[] {
  if (!isStorageAvailable()) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid projects data in localStorage, resetting');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Error reading projects from localStorage:', error);
    return [];
  }
}

export function saveProjects(projects: Project[]): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('Error saving projects to localStorage:', error);
    // Handle quota exceeded
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      window.dispatchEvent(new CustomEvent('storage-error', {
        detail: { message: 'Penyimpanan penuh. Hapus beberapa project untuk melanjutkan.' }
      }));
    }
    return false;
  }
}

export function getProject(id: string): Project | null {
  const projects = getProjects();
  return projects.find(p => p.id === id) || null;
}

export function saveProject(project: Project): boolean {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === project.id);
  
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };
  
  if (index >= 0) {
    projects[index] = updatedProject;
  } else {
    projects.push(updatedProject);
  }
  
  return saveProjects(projects);
}

export function deleteProject(id: string): boolean {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  if (filtered.length === projects.length) {
    return false; // Project not found
  }
  
  // Clear current project if it's the one being deleted
  if (getCurrentProjectId() === id) {
    clearCurrentProjectId();
  }
  
  return saveProjects(filtered);
}

// Current Project ID
export function getCurrentProjectId(): string | null {
  if (!isStorageAvailable()) return null;
  return localStorage.getItem(STORAGE_KEYS.CURRENT_PROJECT);
}

export function setCurrentProjectId(id: string): void {
  if (!isStorageAvailable()) return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROJECT, id);
}

export function clearCurrentProjectId(): void {
  if (!isStorageAvailable()) return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
}
