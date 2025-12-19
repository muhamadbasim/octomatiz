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

// Category-specific content
export interface CategoryContent {
  ctaText: string;
  ctaMessage: string;
  features: { icon: string; label: string }[];
  badgeIcon: string;
}

export const CATEGORY_CONTENT: Record<BusinessCategory, CategoryContent> = {
  kuliner: {
    ctaText: 'Pesan Sekarang',
    ctaMessage: 'Halo, saya mau pesan!',
    features: [
      { icon: '<path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>', label: 'Fresh & Halal' },
      { icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>', label: 'Respon Cepat' },
      { icon: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>', label: 'Delivery' },
      { icon: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>', label: 'Harga Terjangkau' },
    ],
    badgeIcon: '<path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
  },
  fashion: {
    ctaText: 'Lihat Koleksi',
    ctaMessage: 'Halo, saya tertarik dengan koleksi Anda!',
    features: [
      { icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>', label: 'Trendy' },
      { icon: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', label: 'Kualitas Premium' },
      { icon: '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 12.5l2.5 3.01L14.5 12l4.5 6H5l4.5-6z"/>', label: 'Size Guide' },
      { icon: '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>', label: 'Free Ongkir' },
    ],
    badgeIcon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
  },
  jasa: {
    ctaText: 'Konsultasi Gratis',
    ctaMessage: 'Halo, saya ingin konsultasi.',
    features: [
      { icon: '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>', label: 'Profesional' },
      { icon: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>', label: 'Bergaransi' },
      { icon: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>', label: 'Respon Cepat' },
      { icon: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>', label: 'Berpengalaman' },
    ],
    badgeIcon: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
  },
  kerajinan: {
    ctaText: 'Custom Order',
    ctaMessage: 'Halo, saya ingin custom order!',
    features: [
      { icon: '<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>', label: 'Handmade' },
      { icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>', label: 'Unik & Eksklusif' },
      { icon: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>', label: 'Bisa Custom' },
      { icon: '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>', label: 'Pembayaran Aman' },
    ],
    badgeIcon: '<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>',
  },
};

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
