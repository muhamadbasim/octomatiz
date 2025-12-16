# Coding Standards

## Astro Guidelines
- Use `.astro` components for static/server-rendered content
- Use React components (`.tsx`) only for interactive "islands"
- Prefer Astro components over React when no client-side JS is needed
- Use `client:*` directives sparingly and intentionally

## Client Directives (Islands)
```astro
<!-- Load immediately, hydrate when idle -->
<ReactComponent client:idle />

<!-- Load and hydrate when visible -->
<ReactComponent client:visible />

<!-- Load immediately (use sparingly) -->
<ReactComponent client:load />
```

## React Guidelines (for Islands)
- Use functional components with hooks
- Prefer named exports over default exports
- Keep components small and focused (single responsibility)
- Use TypeScript for type safety

## File Naming
- Astro components: PascalCase (e.g., `ProjectCard.astro`)
- React islands: PascalCase with `.tsx` (e.g., `CameraCapture.tsx`)
- Utilities: camelCase (e.g., `imageCompressor.ts`)
- Constants: SCREAMING_SNAKE_CASE

## Styling
- Use Tailwind CSS utility classes
- Mobile-first responsive design (start with mobile, add `md:` and `lg:` breakpoints)
- Keep consistent spacing using Tailwind's spacing scale
- Use `@apply` sparingly in global styles

## Performance
- Default to Astro components (0 JS)
- Use `client:visible` for below-fold interactive components
- Compress images with `astro:assets` or client-side before upload
- Leverage Cloudflare's edge caching

## PWA Requirements
- Service worker via `@vite-pwa/astro` or Workbox
- Proper manifest.json configuration
- Cache-first strategy for static assets
- Offline fallback page

## API Integration
- Use Astro API routes (`src/pages/api/`) for server-side logic
- Handle errors gracefully with user-friendly messages
- Show loading states during async operations
- Implement retry logic for failed requests

## Cloudflare Deployment
- Use `@astrojs/cloudflare` adapter
- Configure `output: 'hybrid'` for mixed static/SSR
- Environment variables via Cloudflare dashboard or wrangler
