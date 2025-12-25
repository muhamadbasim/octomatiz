// localStorage to D1 migration utility
import type { Project } from '../types/project';
import type { LocalStorageProject } from '../types/database';
import { migrateLocalStorage } from './api/projectsApi';

const STORAGE_KEYS = {
  PROJECTS: 'octomatiz_projects',
  CURRENT_PROJECT: 'octomatiz_current_project',
  MIGRATION_DONE: 'octomatiz_migration_done',
} as const;

// Check if there's localStorage data to migrate
export function hasLocalStorageData(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return false;
    
    const projects = JSON.parse(data);
    return Array.isArray(projects) && projects.length > 0;
  } catch {
    return false;
  }
}

// Check if migration has already been done
export function isMigrationDone(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.MIGRATION_DONE) === 'true';
}

// Get localStorage projects
export function getLocalStorageProjects(): LocalStorageProject[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    const projects = JSON.parse(data);
    if (!Array.isArray(projects)) return [];
    
    // Transform to LocalStorageProject format
    return projects.map((p: Project) => ({
      id: p.id,
      businessName: p.businessName,
      whatsapp: p.whatsapp,
      category: p.category,
      location: p.location,
      productImage: p.productImage,
      headline: p.headline,
      storytelling: p.storytelling,
      template: p.template,
      colorTheme: p.colorTheme,
      currentStep: p.currentStep,
      status: p.status,
      deployedUrl: p.deployedUrl,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  } catch (error) {
    console.error('Error reading localStorage projects:', error);
    return [];
  }
}

// Perform migration
export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  skippedCount: number;
  error?: string;
}

export async function performMigration(deviceId: string): Promise<MigrationResult> {
  if (isMigrationDone()) {
    return { success: true, migratedCount: 0, skippedCount: 0 };
  }
  
  const projects = getLocalStorageProjects();
  
  if (projects.length === 0) {
    // No data to migrate, mark as done
    markMigrationDone();
    return { success: true, migratedCount: 0, skippedCount: 0 };
  }
  
  try {
    const response = await migrateLocalStorage(deviceId, projects);
    
    if (response.success && response.data) {
      // Clear localStorage after successful migration
      clearLocalStorageData();
      markMigrationDone();
      
      return {
        success: true,
        migratedCount: response.data.migratedCount,
        skippedCount: response.data.skippedCount,
      };
    } else {
      return {
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        error: response.error || 'Migrasi gagal',
      };
    }
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      migratedCount: 0,
      skippedCount: 0,
      error: 'Terjadi kesalahan saat migrasi',
    };
  }
}

// Clear localStorage data after migration
function clearLocalStorageData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROJECT);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Mark migration as done
function markMigrationDone(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MIGRATION_DONE, 'true');
}

// Reset migration flag (for testing)
export function resetMigrationFlag(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.MIGRATION_DONE);
}
