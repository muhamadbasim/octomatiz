/**
 * Security utilities for OCTOmatiz
 * Provides authentication, rate limiting, and CORS protection
 */

import type { APIContext } from 'astro';

// Simple in-memory rate limiter (for Cloudflare Workers, use KV or Durable Objects for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Simple rate limiter
 * @param key - Unique key for rate limiting (e.g., IP + endpoint)
 * @param maxRequests - Maximum requests allowed in window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) rateLimitMap.delete(k);
    }
  }

  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetIn: record.resetTime - now };
}

/**
 * Verify admin authentication
 * Uses ADMIN_SECRET environment variable
 */
export function verifyAdminAuth(context: APIContext, request: Request): boolean {
  const runtime = (context.locals as { runtime?: { env?: Record<string, string> } }).runtime;
  const adminSecret = runtime?.env?.ADMIN_SECRET || (import.meta.env as Record<string, string>).ADMIN_SECRET;
  
  // If no admin secret is configured, deny access in production
  if (!adminSecret) {
    // Allow in development mode only
    const isDev = (import.meta.env as Record<string, string>).DEV === 'true' || 
                  (import.meta.env as Record<string, string>).MODE === 'development';
    return isDev;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  // Support both "Bearer <token>" and just "<token>"
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  return token === adminSecret;
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitResponse(resetIn: number): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Terlalu banyak permintaan. Coba lagi nanti.',
      retryAfter: Math.ceil(resetIn / 1000),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
      },
    }
  );
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: 'Akses tidak diizinkan',
    }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Wrapper to add security headers to API route handlers
 * Use this to wrap your API route handler functions
 * @example
 * export const GET = withSecurityHeaders(async (context) => {
 *   return new Response(JSON.stringify({ data: 'test' }));
 * });
 */
export function withSecurityHeaders<T extends (...args: unknown[]) => Promise<Response>>(
  handler: T
): T {
  return (async (...args: Parameters<T>): Promise<Response> => {
    const response = await handler(...args);
    return addSecurityHeaders(response);
  }) as T;
}

/**
 * Sanitize string input to prevent XSS
 * Use for text content that will be displayed in HTML
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize for HTML attribute values
 * More strict - also escapes newlines and special chars
 */
export function sanitizeAttribute(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return sanitizeInput(input)
    .replace(/\n/g, ' ')
    .replace(/\r/g, '')
    .replace(/\t/g, ' ');
}

/**
 * Sanitize URL to prevent javascript: and data: injection
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().toLowerCase();
  // Block dangerous protocols
  if (trimmed.startsWith('javascript:') || 
      trimmed.startsWith('data:') || 
      trimmed.startsWith('vbscript:')) {
    return '';
  }
  return url;
}

/**
 * Validate slug format (alphanumeric and hyphens only)
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 100;
}
