# Design Document: Landing Page Generation & Deployment

## Overview

This feature generates static landing pages from project data and deploys them to Cloudflare Pages. The system uses a template-based approach where HTML templates are populated with user content, styled according to selected themes, and deployed as static files.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Step 4/5 UI   │────▶│  Landing Page    │────▶│   Cloudflare    │
│   (React)       │     │  Generator       │     │   Pages API     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  HTML Templates  │
                        │  + CSS Themes    │
                        └──────────────────┘
```

## Components and Interfaces

### 1. Landing Page Generator (`src/lib/landingPageGenerator.ts`)

```typescript
interface LandingPageData {
  businessName: string;
  category: BusinessCategory;
  headline: string;
  storytelling: string;
  productImage: string; // Base64 or URL
  whatsapp: string;
  location: string;
  template: TemplateStyle;
  colorTheme: ColorTheme;
}

interface GeneratedPage {
  html: string;
  css: string;
  assets: { name: string; data: string }[];
}

function generateLandingPage(data: LandingPageData): GeneratedPage;
```

### 2. Template Engine (`src/lib/templates/`)

Each template provides:
- HTML structure with placeholders
- CSS styles with theme variables
- Responsive mobile-first design

Templates:
- `simple.ts` - Clean minimal design
- `warm.ts` - Warm colors for culinary businesses
- `modern.ts` - Modern blue professional look

### 3. Deployment Service (`src/lib/deployService.ts`)

```typescript
interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
}

async function deployToCloudflare(
  projectId: string,
  html: string,
  assets: { name: string; data: string }[]
): Promise<DeploymentResult>;
```

### 4. API Route (`src/pages/api/deploy.ts`)

Handles deployment requests from the frontend:
- Receives project ID
- Generates landing page
- Deploys to Cloudflare Pages
- Returns deployment URL

## Data Models

### Color Theme Configuration

```typescript
const COLOR_THEMES = {
  green: { primary: '#36e27b', secondary: '#2dd36f', accent: '#1a1a2e' },
  blue: { primary: '#2563eb', secondary: '#3b82f6', accent: '#1e3a5f' },
  amber: { primary: '#f59e0b', secondary: '#fbbf24', accent: '#451a03' },
  pink: { primary: '#ec4899', secondary: '#f472b6', accent: '#500724' },
};
```

### Template Structure

```typescript
interface TemplateConfig {
  id: TemplateStyle;
  name: string;
  layout: 'hero-top' | 'hero-side' | 'hero-full';
  sections: ('hero' | 'features' | 'story' | 'cta' | 'contact')[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Content Inclusion
*For any* valid project data, the generated HTML SHALL contain the business name, headline, and storytelling text.
**Validates: Requirements 1.1**

### Property 2: Template Application
*For any* template style selection, the generated HTML SHALL contain CSS classes or structure specific to that template.
**Validates: Requirements 1.2**

### Property 3: Color Theme Application
*For any* color theme selection, the generated CSS SHALL contain the correct primary color value for that theme.
**Validates: Requirements 1.3**

### Property 4: WhatsApp Link Generation
*For any* valid WhatsApp number, the generated HTML SHALL contain a correctly formatted WhatsApp link (wa.me/{number}).
**Validates: Requirements 1.4**

### Property 5: Minimal JavaScript
*For any* generated landing page, the HTML SHALL contain zero or at most one script tag (for analytics only).
**Validates: Requirements 2.1**

### Property 6: Meta Tags Inclusion
*For any* generated landing page, the HTML SHALL contain title, description, and og:image meta tags.
**Validates: Requirements 2.4**

### Property 7: WhatsApp Share URL Format
*For any* deployment URL and business name, the WhatsApp share URL SHALL be correctly formatted with encoded message.
**Validates: Requirements 4.2**

## Error Handling

| Error Type | Handling Strategy |
|------------|-------------------|
| Invalid project data | Return validation error before generation |
| Template not found | Fall back to 'simple' template |
| Image processing failure | Use placeholder image |
| Deployment API failure | Return error with retry option |
| Rate limit exceeded | Queue deployment and notify user |

## Testing Strategy

### Unit Tests
- Template rendering with mock data
- Color theme CSS generation
- WhatsApp link formatting
- Meta tag generation

### Property-Based Tests
- Use fast-check library for TypeScript
- Generate random project data
- Verify HTML output contains required elements
- Verify CSS contains correct color values

### Integration Tests
- End-to-end deployment flow (mocked Cloudflare API)
- Project status update after deployment
