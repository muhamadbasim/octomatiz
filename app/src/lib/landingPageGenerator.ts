import type { Project } from '../types/project';
import {
  type LandingPageData,
  type GeneratedPage,
  type TemplateRenderer,
  COLOR_THEMES,
  renderSimpleTemplate,
  renderWarmTemplate,
  renderModernTemplate,
} from './templates';

// Template renderer mapping
const TEMPLATE_RENDERERS: Record<string, TemplateRenderer> = {
  simple: renderSimpleTemplate,
  warm: renderWarmTemplate,
  modern: renderModernTemplate,
};

/**
 * Convert Project to LandingPageData
 */
export function projectToLandingPageData(project: Project): LandingPageData {
  return {
    businessName: project.businessName,
    category: project.category,
    headline: project.headline,
    storytelling: project.storytelling,
    productImage: project.productImage || '',
    whatsapp: project.whatsapp,
    location: project.location,
    template: project.template,
    colorTheme: project.colorTheme,
  };
}

/**
 * Generate a complete landing page HTML from project data
 */
export function generateLandingPage(project: Project): GeneratedPage {
  const data = projectToLandingPageData(project);
  const colors = COLOR_THEMES[data.colorTheme] || COLOR_THEMES.green;
  const renderer = TEMPLATE_RENDERERS[data.template] || renderSimpleTemplate;

  const html = renderer(data, colors);

  return { html };
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppShareUrl(
  phoneNumber: string,
  businessName: string,
  deployedUrl: string
): string {
  const message = `Hai! Website ${businessName} sudah online di ${deployedUrl}`;
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate domain from business name
 */
export function generateDomain(businessName: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  
  return `${slug}.octomatiz.site`;
}
