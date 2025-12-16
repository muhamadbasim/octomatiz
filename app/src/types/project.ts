export type ProjectStatus = 'draft' | 'building' | 'live';
export type BusinessCategory = 'kuliner' | 'fashion' | 'jasa' | 'kerajinan';
export type TemplateStyle = 'simple' | 'warm' | 'modern';
export type ColorTheme = 'green' | 'blue' | 'amber' | 'pink';

export interface Project {
  id: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  currentStep: number;

  // Step 1: Basic Info
  businessName: string;
  whatsapp: string;
  category: BusinessCategory;
  location: string;

  // Step 2: AI Capture
  productImage?: string; // Base64 or URL

  // Step 3: Content Review
  headline: string;
  storytelling: string;

  // Step 4: Design & Theme
  template: TemplateStyle;
  colorTheme: ColorTheme;

  // Step 5: Deployment
  deployedUrl?: string;
  domain?: string;
}

export const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  status: 'draft',
  currentStep: 1,
  businessName: '',
  whatsapp: '',
  category: 'kuliner',
  location: '',
  headline: '',
  storytelling: '',
  template: 'simple',
  colorTheme: 'green',
};

export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createNewProject(): Project {
  const now = new Date().toISOString();
  return {
    ...DEFAULT_PROJECT,
    id: generateProjectId(),
    createdAt: now,
    updatedAt: now,
  };
}
