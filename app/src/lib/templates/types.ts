import type { BusinessCategory, TemplateStyle, ColorTheme } from '../../types/project';

// Color theme configuration
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
}

export const COLOR_THEMES: Record<ColorTheme, ThemeColors> = {
  green: {
    primary: '#36e27b',
    primaryLight: '#5eea96',
    primaryDark: '#2bc066',
    accent: '#1a1a2e',
    background: '#ffffff',
    text: '#1a1a2e',
    textMuted: '#6b7280',
  },
  blue: {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    accent: '#1e3a5f',
    background: '#ffffff',
    text: '#1e3a5f',
    textMuted: '#6b7280',
  },
  amber: {
    primary: '#f59e0b',
    primaryLight: '#fbbf24',
    primaryDark: '#d97706',
    accent: '#451a03',
    background: '#fffbeb',
    text: '#451a03',
    textMuted: '#78716c',
  },
  pink: {
    primary: '#ec4899',
    primaryLight: '#f472b6',
    primaryDark: '#db2777',
    accent: '#500724',
    background: '#fdf2f8',
    text: '#500724',
    textMuted: '#9ca3af',
  },
};

// Template configuration
export interface TemplateConfig {
  id: TemplateStyle;
  name: string;
  description: string;
}

export const TEMPLATE_CONFIGS: Record<TemplateStyle, TemplateConfig> = {
  simple: {
    id: 'simple',
    name: 'Simple Clean',
    description: 'Desain bersih dan minimalis untuk semua jenis bisnis',
  },
  warm: {
    id: 'warm',
    name: 'Warm Culinary',
    description: 'Desain hangat cocok untuk bisnis kuliner dan makanan',
  },
  modern: {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Desain modern dan profesional untuk jasa dan kerajinan',
  },
};

// Landing page data interface
export interface LandingPageData {
  businessName: string;
  category: BusinessCategory;
  headline: string;
  storytelling: string;
  productImage: string;
  whatsapp: string;
  location: string;
  template: TemplateStyle;
  colorTheme: ColorTheme;
}

// Generated page output
export interface GeneratedPage {
  html: string;
}

// Template render function type
export type TemplateRenderer = (data: LandingPageData, colors: ThemeColors) => string;
