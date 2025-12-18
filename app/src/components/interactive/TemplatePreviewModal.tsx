import { useEffect } from 'react';
import type { TemplateStyle, ColorTheme } from '../../types/project';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: TemplateStyle;
  colorTheme: ColorTheme;
  businessName: string;
  headline: string;
  storytelling: string;
  productImage: string;
  whatsapp: string;
  onClose: () => void;
  onSelect: () => void;
}

const COLORS: Record<ColorTheme, string> = {
  green: '#36e27b',
  blue: '#2563EB',
  amber: '#F59E0B',
  pink: '#EC4899',
};

const TEMPLATE_NAMES: Record<TemplateStyle, string> = {
  simple: 'Simple Clean',
  warm: 'Warm Culinary',
  modern: 'Modern Blue',
};

export function TemplatePreviewModal({
  isOpen,
  template,
  colorTheme,
  businessName,
  headline,
  storytelling,
  productImage,
  onClose,
  onSelect,
}: TemplatePreviewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const color = COLORS[colorTheme];
  const templateName = TEMPLATE_NAMES[template];

  // Generate preview HTML based on template
  const previewHtml = generatePreviewHtml(template, {
    businessName,
    headline,
    storytelling,
    productImage,
    color,
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface-dark border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div>
            <h3 className="text-white font-medium">Preview Template</h3>
            <p className="text-gray-400 text-xs">{templateName}</p>
          </div>
        </div>
        <button
          onClick={onSelect}
          className="px-4 py-2 rounded-full bg-primary text-black text-sm font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">check</span>
          Pilih Template
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden">
        <iframe
          srcDoc={previewHtml}
          className="w-full h-full bg-white"
          title="Template Preview"
        />
      </div>
    </div>
  );
}

function generatePreviewHtml(
  template: TemplateStyle,
  data: {
    businessName: string;
    headline: string;
    storytelling: string;
    productImage: string;
    color: string;
  }
): string {
  const { businessName, headline, storytelling, productImage, color } = data;

  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; }
    .container { max-width: 480px; margin: 0 auto; }
  `;

  if (template === 'simple') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${baseStyles}
          body { background: #fff; color: #1a1a1a; }
          .hero { position: relative; }
          .hero img { width: 100%; height: 280px; object-fit: cover; }
          .hero-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); }
          .hero h1 { color: white; font-size: 28px; font-weight: 700; }
          .content { padding: 24px; }
          .badge { display: inline-block; padding: 6px 12px; background: ${color}20; color: ${color}; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          .headline { font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #1a1a1a; }
          .story { color: #666; line-height: 1.7; font-size: 15px; }
          .cta { position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background: white; border-top: 1px solid #eee; }
          .cta button { width: 100%; padding: 16px; background: ${color}; color: white; border: none; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <img src="${productImage}" alt="${businessName}">
            <div class="hero-overlay">
              <h1>${businessName}</h1>
            </div>
          </div>
          <div class="content">
            <span class="badge">✨ Produk Unggulan</span>
            <h2 class="headline">${headline || 'Headline produk Anda'}</h2>
            <p class="story">${storytelling || 'Cerita produk akan muncul di sini...'}</p>
          </div>
          <div class="cta">
            <button>💬 Hubungi via WhatsApp</button>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  if (template === 'warm') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${baseStyles}
          body { background: #fef7ed; color: #451a03; }
          .hero { padding: 20px; }
          .hero img { width: 100%; height: 260px; object-fit: cover; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
          .content { padding: 24px; text-align: center; }
          .brand { font-size: 28px; font-weight: 700; color: #92400e; margin-bottom: 8px; }
          .tagline { color: #b45309; font-size: 14px; margin-bottom: 20px; }
          .headline { font-size: 22px; font-weight: 600; margin-bottom: 16px; color: #451a03; }
          .story { color: #78350f; line-height: 1.8; font-size: 15px; }
          .cta { position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background: #fef7ed; }
          .cta button { width: 100%; padding: 16px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 30px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(245,158,11,0.4); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="hero">
            <img src="${productImage}" alt="${businessName}">
          </div>
          <div class="content">
            <h1 class="brand">${businessName}</h1>
            <p class="tagline">🍽️ Cita Rasa Istimewa</p>
            <h2 class="headline">${headline || 'Headline produk Anda'}</h2>
            <p class="story">${storytelling || 'Cerita produk akan muncul di sini...'}</p>
          </div>
          <div class="cta">
            <button>🛒 Pesan Sekarang</button>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Modern template
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>${baseStyles}
        body { background: #0f172a; color: white; }
        .hero { position: relative; }
        .hero img { width: 100%; height: 320px; object-fit: cover; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, #0f172a 20%, transparent 80%); }
        .hero-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; }
        .hero h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
        .hero p { color: #94a3b8; font-size: 14px; }
        .content { padding: 24px; }
        .card { background: #1e293b; border-radius: 16px; padding: 20px; margin-bottom: 16px; }
        .headline { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: ${color}; }
        .story { color: #94a3b8; line-height: 1.7; font-size: 14px; }
        .cta { position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, #0f172a); }
        .cta button { width: 100%; padding: 16px; background: ${color}; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="hero">
          <img src="${productImage}" alt="${businessName}">
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <h1>${businessName}</h1>
            <p>🚀 Premium Quality</p>
          </div>
        </div>
        <div class="content">
          <div class="card">
            <h2 class="headline">${headline || 'Headline produk Anda'}</h2>
            <p class="story">${storytelling || 'Cerita produk akan muncul di sini...'}</p>
          </div>
        </div>
        <div class="cta">
          <button>Hubungi Kami →</button>
        </div>
      </div>
    </body>
    </html>
  `;
}
