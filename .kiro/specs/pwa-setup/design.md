# Design Document: PWA Setup

## Overview

This design implements Progressive Web App capabilities for QuickLaunch, enabling installation on user devices and offline functionality. The implementation uses `@vite-pwa/astro` plugin for service worker generation and manifest configuration.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser                               │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   App UI    │  │  Install    │  │ Offline         │ │
│  │             │  │  Prompt     │  │ Indicator       │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                  Service Worker                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Cache     │  │   Fetch     │  │   Background    │ │
│  │   Manager   │  │   Handler   │  │   Sync          │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                    Cache Storage                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Static    │  │   Runtime   │  │   Offline       │ │
│  │   Assets    │  │   Cache     │  │   Fallback      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Web App Manifest (`manifest.webmanifest`)

Configuration file for PWA installation:

```json
{
  "name": "OCTOmatiz - UMKM Landing Page Builder",
  "short_name": "OCTOmatiz",
  "description": "Buat landing page UMKM dalam 10 menit",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#112117",
  "theme_color": "#36e27b",
  "icons": [
    { "src": "/octopus-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/octopus-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/octopus-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### Icon Design Guidelines

The OCTOmatiz icon features a stylized octopus representing:
- **8 tentacles** = Multiple capabilities (AI, deploy, templates, etc.)
- **Primary color** = #36e27b (green) matching the app theme
- **Style** = Modern, friendly, tech-forward

Required icon files:
- `octopus-192x192.png` - Standard icon
- `octopus-512x512.png` - High-res icon
- `octopus-maskable-512x512.png` - Maskable icon with safe zone padding
- `favicon.svg` - Vector favicon

### 2. Service Worker Strategy

Using Workbox via `@vite-pwa/astro`:

- **Precache:** HTML pages, CSS, JS bundles, fonts, icons
- **Runtime Cache:** Images, API responses
- **Offline Fallback:** `/offline` page for uncached routes

### 3. Install Prompt Component (`InstallPrompt.tsx`)

React island for handling PWA installation:

```typescript
interface InstallPromptProps {
  delayMs?: number; // Default: 30000 (30 seconds)
}

// State
interface InstallState {
  showPrompt: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
}
```

### 4. Offline Indicator Component (`OfflineIndicator.tsx`)

React island for connection status:

```typescript
interface ConnectionState {
  isOnline: boolean;
  wasOffline: boolean; // For showing "back online" message
}
```

### 5. Offline Page (`/offline`)

Static Astro page shown when user is offline and page is not cached.

## Data Models

### Cache Configuration

```typescript
interface CacheConfig {
  staticAssets: string[];      // Precached on install
  runtimePatterns: RegExp[];   // Cached on first request
  maxAge: number;              // Cache expiration (seconds)
  maxEntries: number;          // Max items per cache
}

const defaultConfig: CacheConfig = {
  staticAssets: [
    '/',
    '/create/step-1',
    '/create/step-2',
    '/create/step-3',
    '/create/step-4',
    '/create/step-5',
    '/offline'
  ],
  runtimePatterns: [/\.(?:png|jpg|jpeg|svg|gif|webp)$/],
  maxAge: 60 * 60 * 24 * 30, // 30 days
  maxEntries: 50
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Manifest contains required PWA fields
*For any* valid PWA manifest, the manifest SHALL contain name, short_name, start_url, display, icons with at least 192x192 and 512x512 sizes, theme_color, and background_color fields.
**Validates: Requirements 1.3**

### Property 2: Critical assets are precached
*For any* asset in the precache list, after service worker activation, that asset SHALL be available in the cache storage.
**Validates: Requirements 2.1**

### Property 3: Cached pages served offline
*For any* URL that exists in the cache, when fetched while offline, the service worker SHALL return the cached response.
**Validates: Requirements 2.2**

### Property 4: Uncached pages show offline fallback
*For any* URL that does not exist in the cache, when fetched while offline, the service worker SHALL return the offline fallback page.
**Validates: Requirements 2.3**

### Property 5: Offline indicator reflects connection state
*For any* connection state change (online to offline or vice versa), the OfflineIndicator component SHALL render the correct status within 1 second.
**Validates: Requirements 3.1, 3.2**

### Property 6: Network actions show offline message
*For any* action that requires network connectivity, when executed while offline, the system SHALL display an appropriate error message instead of failing silently.
**Validates: Requirements 3.3**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Service worker registration fails | Log error, app continues without offline support |
| Cache storage full | Remove oldest entries, log warning |
| Install prompt not supported | Hide install button, no error shown |
| Offline with uncached page | Show offline fallback page |
| Background sync fails | Queue for retry, notify user on success |

## Testing Strategy

### Unit Tests
- Manifest validation (required fields present)
- Cache configuration validation
- Component rendering (InstallPrompt, OfflineIndicator)

### Property-Based Tests
Using `fast-check` library:
- Property 1: Generate random manifest objects, verify required fields
- Property 2: Generate random asset lists, verify all are cached
- Property 5: Generate random online/offline sequences, verify indicator state

### Integration Tests
- Service worker registration and activation
- Cache population on first load
- Offline fallback behavior
- Install prompt flow

### Manual Tests
- Install on Android Chrome
- Install on iOS Safari (Add to Home Screen)
- Offline navigation
- Update notification
