import type { LandingPageData, ThemeColors, TemplateRenderer } from './types';

/**
 * Warm Culinary Template
 * Warm design suitable for food and culinary businesses
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

export const renderWarmTemplate: TemplateRenderer = (
  data: LandingPageData,
  colors: ThemeColors
): string => {
  const whatsappLink = `https://wa.me/${formatWhatsAppNumber(data.whatsapp)}?text=${encodeURIComponent(`Halo ${data.businessName}, saya mau pesan!`)}`;
  
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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
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
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-3deg); }
      75% { transform: rotate(3deg); }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.5s ease-out forwards; }
    .animate-bounce-in { animation: bounceIn 0.6s ease-out forwards; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-wiggle { animation: wiggle 0.5s ease-in-out; }
    .delay-1 { animation-delay: 0.1s; opacity: 0; }
    .delay-2 { animation-delay: 0.2s; opacity: 0; }
    .delay-3 { animation-delay: 0.3s; opacity: 0; }
    .delay-4 { animation-delay: 0.4s; opacity: 0; }
    .delay-5 { animation-delay: 0.5s; opacity: 0; }
    
    /* Header */
    .header {
      text-align: center;
      padding: 1.5rem 1rem;
      background: linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primaryLight}10 100%);
    }
    .logo {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: ${colors.primary};
    }
    
    /* Hero Image */
    .hero {
      position: relative;
      margin: 1rem;
      border-radius: 1.5rem;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
    .hero img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
    }
    .hero-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: ${colors.primary};
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    /* Content */
    .content {
      padding: 1.5rem;
      text-align: center;
    }
    .headline {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: ${colors.text};
      margin-bottom: 1rem;
      line-height: 1.3;
    }
    .divider {
      width: 3rem;
      height: 3px;
      background: ${colors.primary};
      margin: 0 auto 1rem;
      border-radius: 2px;
    }
    .story {
      color: ${colors.textMuted};
      font-size: 0.9375rem;
      line-height: 1.8;
      margin-bottom: 1.5rem;
      white-space: pre-line;
    }
    
    /* Info Cards */
    .info-cards {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .info-card {
      flex: 1;
      background: ${colors.primary}10;
      padding: 1rem;
      border-radius: 1rem;
      text-align: center;
    }
    .info-card svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: ${colors.primary};
      margin-bottom: 0.5rem;
    }
    .info-card span {
      display: block;
      font-size: 0.75rem;
      color: ${colors.textMuted};
    }
    
    /* CTA */
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
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);
      color: white;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 1rem;
      cursor: pointer;
      text-decoration: none;
      box-shadow: 0 4px 20px ${colors.primary}40;
    }
    .cta-btn svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }
    .cta-btn:active { transform: scale(0.98); }
    
    .footer-space { height: 5rem; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header animate-fade-in">
      <div class="logo">${data.businessName}</div>
    </header>
    
    <!-- Hero -->
    <section class="hero animate-bounce-in delay-1">
      <img src="${data.productImage}" alt="${data.businessName}" loading="eager">
      <span class="hero-badge animate-scale-in delay-3">${data.category}</span>
    </section>
    
    <!-- Content -->
    <section class="content">
      <h1 class="headline animate-fade-in-up delay-2">${data.headline}</h1>
      <div class="divider animate-scale-in delay-3"></div>
      <p class="story animate-fade-in-up delay-3">${data.storytelling}</p>
      
      <div class="info-cards">
        <div class="info-card animate-scale-in delay-4">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          <span>${data.location || 'Indonesia'}</span>
        </div>
        <div class="info-card animate-scale-in delay-5">
          <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          <span>WhatsApp</span>
        </div>
      </div>
    </section>
    
    <div class="footer-space"></div>
  </div>
  
  <!-- WhatsApp CTA -->
  <div class="cta-container animate-fade-in-up delay-5">
    <a href="${whatsappLink}" class="cta-btn animate-pulse" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
      <span>Pesan Sekarang</span>
    </a>
  </div>
</body>
</html>`;
};
