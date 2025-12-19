import type { LandingPageData, ThemeColors, TemplateRenderer } from './types';
import { CATEGORY_CONTENT } from './types';

/**
 * Modern Professional Template
 * Clean modern design for services and professional businesses
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

export const renderModernTemplate: TemplateRenderer = (
  data: LandingPageData,
  colors: ThemeColors
): string => {
  const categoryContent = CATEGORY_CONTENT[data.category] || CATEGORY_CONTENT.kuliner;
  const whatsappLink = `https://wa.me/${formatWhatsAppNumber(data.whatsapp)}?text=${encodeURIComponent(`Halo ${data.businessName}, ${categoryContent.ctaMessage}`)}`;
  
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName} - ${data.headline}</title>
  <meta name="description" content="${data.storytelling.substring(0, 160)}">
  <meta property="og:title" content="${data.businessName}">
  <meta property="og:description" content="${data.headline}">
  <meta property="og:image" content="${data.productImage}">
  <meta property="og:type" content="website">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #f8fafc;
      color: ${colors.text};
      line-height: 1.6;
    }
    .container { max-width: 480px; margin: 0 auto; background: white; min-height: 100vh; }
    
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
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
    .animate-slide-right { animation: slideInRight 0.5s ease-out forwards; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
    .delay-3 { animation-delay: 0.3s; opacity: 0; }
    .delay-4 { animation-delay: 0.4s; opacity: 0; }
    .delay-5 { animation-delay: 0.5s; opacity: 0; }
    
    /* Hero Full */
    .hero {
      position: relative;
      width: 100%;
      height: 50vh;
      min-height: 300px;
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
      background: linear-gradient(180deg, transparent 30%, ${colors.accent}ee 100%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 2rem 1.5rem;
    }
    .hero-content {
      color: white;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: ${colors.primary};
      color: white;
      padding: 0.375rem 0.875rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    .hero h1 {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.5rem;
    }
    .hero-location {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }
    .hero-location svg {
      width: 1rem;
      height: 1rem;
      fill: currentColor;
    }
    
    /* Content Card */
    .content-card {
      margin: -2rem 1rem 0;
      position: relative;
      z-index: 10;
      background: white;
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .headline {
      font-size: 1.125rem;
      font-weight: 700;
      color: ${colors.text};
      margin-bottom: 1rem;
      padding-left: 1rem;
      border-left: 3px solid ${colors.primary};
    }
    .story {
      color: ${colors.textMuted};
      font-size: 0.9375rem;
      line-height: 1.8;
      white-space: pre-line;
    }
    
    /* Features */
    .features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      margin: 1.5rem 1rem;
    }
    .feature {
      background: ${colors.primary}08;
      border: 1px solid ${colors.primary}20;
      border-radius: 1rem;
      padding: 1rem;
      text-align: center;
    }
    .feature svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: ${colors.primary};
      margin-bottom: 0.5rem;
    }
    .feature span {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      color: ${colors.text};
    }
    
    /* CTA */
    .cta-container {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: linear-gradient(to top, white 80%, transparent);
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
      border-radius: 0.75rem;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 15px ${colors.primary}30;
      transition: all 0.2s;
    }
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px ${colors.primary}40;
    }
    .cta-btn svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }
    .cta-btn:active { transform: scale(0.98); }
    
    .footer-space { height: 6rem; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero -->
    <section class="hero animate-fade-in">
      <img src="${data.productImage}" alt="${data.businessName}" loading="eager" class="animate-float">
      <div class="hero-overlay">
        <div class="hero-content">
          <span class="hero-badge animate-scale-in delay-2">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">${categoryContent.badgeIcon}</svg>
            ${data.category.charAt(0).toUpperCase() + data.category.slice(1)}
          </span>
          <h1 class="animate-fade-in-up delay-3">${data.businessName}</h1>
          ${data.location ? `
          <div class="hero-location animate-fade-in-up delay-4">
            <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
            <span>${data.location}</span>
          </div>
          ` : ''}
        </div>
      </div>
    </section>
    
    <!-- Content Card -->
    <div class="content-card animate-fade-in-up delay-3">
      <h2 class="headline">${data.headline}</h2>
      <p class="story">${data.storytelling}</p>
    </div>
    
    <!-- Features -->
    <div class="features">
      ${categoryContent.features.map((feature, index) => `
      <div class="feature animate-scale-in delay-${index + 1}">
        <svg viewBox="0 0 24 24">${feature.icon}</svg>
        <span>${feature.label}</span>
      </div>`).join('')}
    </div>
    
    <div class="footer-space"></div>
  </div>
  
  <!-- WhatsApp CTA -->
  <div class="cta-container animate-fade-in-up delay-5">
    <a href="${whatsappLink}" class="cta-btn animate-pulse" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
      <span>${categoryContent.ctaText}</span>
    </a>
  </div>
</body>
</html>`;
};
