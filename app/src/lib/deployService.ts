import type { Project } from '../types/project';
import { generateLandingPage, generateDomain } from './landingPageGenerator';

export type DeploymentStage = 'generating' | 'uploading' | 'building' | 'success' | 'error';

export interface DeploymentProgress {
  stage: DeploymentStage;
  progress: number;
  message: string;
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  domain?: string;
  html?: string;
  error?: string;
}

/**
 * Simulate deployment stages with progress callbacks
 * In production, this would integrate with Cloudflare Pages API
 */
export async function deployProject(
  project: Project,
  onProgress?: (progress: DeploymentProgress) => void
): Promise<DeploymentResult> {
  try {
    // Stage 1: Generate landing page
    onProgress?.({
      stage: 'generating',
      progress: 10,
      message: 'Membuat halaman landing...',
    });
    
    await delay(800);
    
    const { html } = generateLandingPage(project);
    
    onProgress?.({
      stage: 'generating',
      progress: 30,
      message: 'Halaman landing dibuat',
    });
    
    await delay(500);

    // Stage 2: Upload assets (simulated)
    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Mengupload foto produk...',
    });
    
    await delay(1000);
    
    onProgress?.({
      stage: 'uploading',
      progress: 65,
      message: 'Foto berhasil diupload',
    });
    
    await delay(500);

    // Stage 3: Build and deploy (simulated)
    onProgress?.({
      stage: 'building',
      progress: 75,
      message: 'Cloudflare sedang building...',
    });
    
    await delay(1500);
    
    onProgress?.({
      stage: 'building',
      progress: 90,
      message: 'Hampir selesai...',
    });
    
    await delay(800);

    // Stage 4: Success
    const domain = generateDomain(project.businessName);
    const url = `https://${domain}`;
    
    onProgress?.({
      stage: 'success',
      progress: 100,
      message: 'Website berhasil dipublish!',
    });

    return {
      success: true,
      url,
      domain,
      html,
    };
  } catch (error) {
    onProgress?.({
      stage: 'error',
      progress: 0,
      message: 'Gagal mempublish website',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper function for delays
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get stage display info
 */
export function getStageInfo(stage: DeploymentStage): { label: string; icon: string } {
  switch (stage) {
    case 'generating':
      return { label: 'Membuat Halaman', icon: 'code' };
    case 'uploading':
      return { label: 'Upload Foto', icon: 'cloud_upload' };
    case 'building':
      return { label: 'Building', icon: 'construction' };
    case 'success':
      return { label: 'Selesai', icon: 'check_circle' };
    case 'error':
      return { label: 'Gagal', icon: 'error' };
    default:
      return { label: 'Processing', icon: 'hourglass_empty' };
  }
}
