// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';
import AstroPWA from '@vite-pwa/astro';

// https://astro.build/config
// Note: In Astro 5.x, 'hybrid' is removed. Use 'server' for SSR with prerender on static pages
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    tailwind(),
    AstroPWA({
      registerType: 'prompt',
      manifest: {
        name: 'OCTOmatiz - UMKM Landing Page Builder',
        short_name: 'OCTOmatiz',
        description: 'Buat landing page UMKM dalam 10 menit',
        start_url: '/',
        display: 'standalone',
        background_color: '#112117',
        theme_color: '#36e27b',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
          {
            src: '/octopus-192x192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/octopus-192x192.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
          {
            src: '/octopus-192x192.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache all static pages
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,woff,woff2}'],
        // Exclude landing pages from service worker
        navigateFallbackDenylist: [/^\/p\//, /^\/api\//],
        // Runtime caching for images
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
        // Note: navigateFallback disabled to prevent false offline detection on mobile
        // Browser will show default error page if truly offline
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
