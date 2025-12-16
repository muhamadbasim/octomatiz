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
 * Format phone number with Indonesia country code
 */
export function formatWhatsAppNumber(phoneNumber: string): string {
  // Remove all non-digits
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // If starts with 0, replace with 62 (Indonesia)
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }
  // If doesn't start with country code, add 62
  else if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }
  
  return cleanNumber;
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
  const formattedNumber = formatWhatsAppNumber(phoneNumber);
  return `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message)}`;
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
