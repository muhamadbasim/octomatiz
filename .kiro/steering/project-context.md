# Project Context - OCTOmatiz PWA

## Overview
**OCTOmatiz** is a mobile-first Progressive Web App (PWA) for freelance digital marketers to build and deploy landing pages for MSMEs (UMKM) in under 10 minutes. The octopus branding represents the app's multiple capabilities working together seamlessly.

## Tech Stack

### PWA Dashboard (Main App)
- **Framework:** Astro with React Islands
- **Styling:** Tailwind CSS
- **Build Tool:** Astro (Vite-based)
- **PWA:** Vite PWA plugin / Workbox

### Generated Landing Pages
- **Framework:** Astro (static output, 0 JS by default)
- **Styling:** Tailwind CSS (purged for minimal size)
- **Output:** Static HTML optimized for Cloudflare Pages

### Backend & APIs
- **AI:** Google Gemini API (Vision)
- **Hosting:** Cloudflare Pages with `@astrojs/cloudflare` adapter
- **Version Control:** GitHub API (headless, platform-managed)
- **Edge Functions:** Cloudflare Workers (for API routes if needed)

## Why Astro?
1. **Ultra-fast output** - Generated landing pages ship 0 JS by default
2. **Partial hydration** - Only interactive components load JavaScript
3. **Native Cloudflare support** - First-class adapter for Pages
4. **React compatibility** - Use React components as "islands" where needed
5. **Built-in image optimization** - `astro:assets` for automatic compression

## Key Principles
- Mobile-first design - must work on mid-to-low-range Android devices
- Offline-first approach for intermittent connectivity
- Simple UI - target users are non-technical
- Fast performance - Time-to-Publish target < 10 minutes
- Minimal JavaScript - leverage Astro's partial hydration

## Project Structure
```
app/
├── src/
│   ├── components/      # Astro UI components
│   │   ├── Header.astro
│   │   ├── FAB.astro
│   │   ├── ProjectCard.astro
│   │   └── StatsCard.astro
│   ├── layouts/         # Page layouts
│   │   └── BaseLayout.astro
│   ├── pages/           # Astro pages (file-based routing)
│   │   ├── index.astro  # Dashboard
│   │   └── create/      # Project creation flow
│   │       ├── step-1.astro  # Basic Info
│   │       ├── step-2.astro  # AI Capture
│   │       ├── step-3.astro  # Content Review
│   │       ├── step-4.astro  # Design & Theme
│   │       └── step-5.astro  # Deployment
│   └── styles/          # Global styles
│       └── global.css
├── public/              # Static assets, PWA icons
├── astro.config.mjs     # Astro configuration
├── tailwind.config.mjs  # Tailwind configuration
└── package.json
```

## App Flow
1. **Dashboard** - List of UMKM projects (Live, Building, Draft)
2. **Step 1: Basic Info** - Business name, WhatsApp, category, location
3. **Step 2: AI Capture** - Camera/gallery to capture product photo
4. **Step 3: Content Review** - Review AI-generated headline & storytelling
5. **Step 4: Design & Theme** - Choose template and color theme
6. **Step 5: Deployment** - Build progress and success screen

## Language
- Code: English
- UI/UX: Bahasa Indonesia (target market)
- Comments: English preferred
