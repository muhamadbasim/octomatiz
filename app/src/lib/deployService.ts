import type { Project } from '../types/project';

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
  slug?: string;
  html?: string;
  error?: string;
  isReal?: boolean;
}

/**
 * Deploy landing page to Cloudflare KV via API
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
    
    await delay(500);
    
    onProgress?.({
      stage: 'generating',
      progress: 30,
      message: 'Halaman landing dibuat',
    });

    // Stage 2: Upload to KV
    onProgress?.({
      stage: 'uploading',
      progress: 50,
      message: 'Menyimpan ke server...',
    });

    // Call deploy API
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Deployment failed');
    }

    onProgress?.({
      stage: 'uploading',
      progress: 70,
      message: 'Berhasil disimpan',
    });

    // Stage 3: Finalize
    onProgress?.({
      stage: 'building',
      progress: 85,
      message: 'Mengaktifkan website...',
    });
    
    await delay(500);
    
    onProgress?.({
      stage: 'building',
      progress: 95,
      message: 'Hampir selesai...',
    });
    
    await delay(300);

    // Stage 4: Success
    onProgress?.({
      stage: 'success',
      progress: 100,
      message: 'Website berhasil dipublish!',
    });

    return {
      success: true,
      url: result.url,
      domain: result.domain,
      slug: result.slug,
      html: result.html,
      isReal: result.isReal,
    };
  } catch (error) {
    console.error('Deploy error:', error);
    
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
      return { label: 'Menyimpan', icon: 'cloud_upload' };
    case 'building':
      return { label: 'Mengaktifkan', icon: 'rocket_launch' };
    case 'success':
      return { label: 'Selesai', icon: 'check_circle' };
    case 'error':
      return { label: 'Gagal', icon: 'error' };
    default:
      return { label: 'Processing', icon: 'hourglass_empty' };
  }
}
