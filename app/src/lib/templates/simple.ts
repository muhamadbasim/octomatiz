import type { LandingPageData, ThemeColors, TemplateRenderer } from './types';
import { escapeHtml, escapeAttribute, sanitizeUrl } from './types';

/**
 * Simple Clean Template
 * Minimalist design suitable for all business types
 */
/**
 * Format phone number with Indonesia country code
 */
function formatWhatsAppNumber(phoneNumber: string): string {
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  } else if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }
  return cleanNumber;
}

export const renderSimpleTemplate: TemplateRenderer = (
  data: LandingPageData,
  colors: ThemeColors
): string => {
  // Sanitize all user inputs
  const businessName = escapeHtml(data.businessName);
  const headline = escapeHtml(data.headline);
  const storytelling = escapeHtml(data.storytelling);
  const category = escapeHtml(data.category);
  const location = escapeHtml(data.location || '');
  const productImage = sanitizeUrl(data.productImage);
  
  const whatsappLink = `https://wa.me/${formatWhatsAppNumber(data.whatsapp)}?text=${encodeURIComponent(`Halo ${data.businessName}, saya tertarik dengan produk Anda!`)}`;
  
  return `<!DOCTYPE html>
<html lang="id" data-template="simple">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="template" content="simple">
  <title>${businessName} - ${headline}</title>
  <meta name="description" content="${escapeAttribute(data.storytelling.substring(0, 160))}">
  <meta property="og:title" content="${escapeAttribute(data.businessName)}">
  <meta property="og:description" content="${escapeAttribute(data.headline)}">
  <meta property="og:image" content="${escapeAttribute(data.productImage)}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${colors.background};
      color: ${colors.text};
      line-height: 1.6;
    }
    .container { max-width: 480px; margin: 0 auto; }
    
    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.9); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
    .delay-3 { animation-delay: 0.3s; opacity: 0; }
    .delay-4 { animation-delay: 0.4s; opacity: 0; }
    
    /* Hero Section */
    .hero {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      overflow: hidden;
    }
    .hero img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.5rem;
    }
    .hero h1 {
      color: white;
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .badge {
      display: inline-block;
      background: ${colors.primary}20;
      color: ${colors.primary};
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    /* Content Section */
    .content {
      padding: 1.5rem;
    }
    .headline {
      font-size: 1.25rem;
      font-weight: 700;
      color: ${colors.text};
      margin-bottom: 1rem;
    }
    .story {
      color: ${colors.textMuted};
      font-size: 0.9375rem;
      line-height: 1.7;
      margin-bottom: 1.5rem;
      white-space: pre-line;
    }
    .location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: ${colors.textMuted};
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    .location svg {
      width: 1rem;
      height: 1rem;
      fill: ${colors.primary};
    }
    
    /* CTA Button */
    .cta-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: linear-gradient(to top, ${colors.background} 80%, transparent);
    }
    .cta-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
      max-width: 480px;
      margin: 0 auto;
      padding: 1rem 1.5rem;
      background: ${colors.primary};
      color: white;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 9999px;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 20px ${colors.primary}40;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px ${colors.primary}50;
    }
    .cta-btn:active { transform: scale(0.98); }
    .cta-btn svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }
    
    /* Footer spacing */
    .footer-space { height: 5rem; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero Section -->
    <section class="hero animate-fade-in">
      <img src="${productImage}" alt="${businessName}" loading="eager">
      <div class="hero-overlay">
        <span class="badge animate-scale-in delay-2">${category}</span>
        <h1 class="animate-fade-in-up delay-3">${businessName}</h1>
      </div>
    </section>
    
    <!-- Content Section -->
    <section class="content">
      <h2 class="headline animate-fade-in-up delay-2">${headline}</h2>
      <p class="story animate-fade-in-up delay-3">${storytelling}</p>
      
      ${location ? `
      <div class="location animate-fade-in-up delay-4">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
        <span>${location}</span>
      </div>
      ` : ''}
    </section>
    
    <div class="footer-space"></div>
  </div>
  
  <!-- WhatsApp CTA -->
  <div class="cta-container animate-fade-in-up delay-4">
    <a href="${whatsappLink}" class="cta-btn animate-pulse" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
      <span>Hubungi via WhatsApp</span>
    </a>
  </div>
</body>
</html>`;
};
