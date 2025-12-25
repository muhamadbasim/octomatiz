/**
 * Secure Error Handling Utilities
 * Strips sensitive information from error responses in production
 * **Feature: security-hardening, Task 8: Secure Error Handling**
 */

import type { APIContext } from 'astro';

/**
 * Check if running in development mode
 */
export function isDevelopment(context?: APIContext): boolean {
  // Check Cloudflare runtime env
  if (context) {
    const runtime = (context.locals as { runtime?: { env?: Record<string, string> } }).runtime;
    if (runtime?.env?.NODE_ENV === 'development') return true;
  }
  
  // Check import.meta.env
  const env = import.meta.env as Record<string, string>;
  return env.DEV === 'true' || env.MODE === 'development' || env.NODE_ENV === 'development';
}

/**
 * Patterns that indicate sensitive information in error messages
 */
const SENSITIVE_PATTERNS = [
  /at\s+[\w.]+\s+\([^)]+:\d+:\d+\)/gi, // Stack trace lines
  /\b[A-Za-z]:\\[^\s]+/gi, // Windows paths
  /\/(?:home|Users|var|etc|usr)\/[^\s]+/gi, // Unix paths
  /node_modules\/[^\s]+/gi, // Node modules paths
  /\b(?:password|secret|key|token|api[_-]?key)\s*[:=]\s*\S+/gi, // Credentials
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Email addresses
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, // IP addresses
  /Bearer\s+[A-Za-z0-9._-]+/gi, // Bearer tokens
  /\b[a-f0-9]{32,}\b/gi, // Long hex strings (potential secrets)
];

/**
 * Generic error messages for production
 */
const GENERIC_ERRORS: Record<string, string> = {
  database: 'Terjadi kesalahan database. Coba lagi nanti.',
  network: 'Koneksi bermasalah. Periksa internet Anda.',
  validation: 'Data tidak valid. Periksa input Anda.',
  auth: 'Akses tidak diizinkan.',
  notfound: 'Data tidak ditemukan.',
  ratelimit: 'Terlalu banyak permintaan. Tunggu sebentar.',
  default: 'Terjadi kesalahan. Coba lagi nanti.',
};

/**
 * Sanitize error message by removing sensitive information
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message || typeof message !== 'string') return GENERIC_ERRORS.default;
  
  let sanitized = message;
  
  // Remove sensitive patterns
  for (const pattern of SENSITIVE_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
}

/**
 * Determine error category from error object
 */
function categorizeError(error: unknown): keyof typeof GENERIC_ERRORS {
  if (!error) return 'default';
  
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  
  if (message.includes('database') || message.includes('d1') || message.includes('sql')) {
    return 'database';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }
  if (message.includes('valid') || message.includes('required') || message.includes('format')) {
    return 'validation';
  }
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'auth';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'notfound';
  }
  if (message.includes('rate') || message.includes('limit') || message.includes('429')) {
    return 'ratelimit';
  }
  
  return 'default';
}

/**
 * Create a production-safe error response
 * In development: includes full error details
 * In production: returns generic message without sensitive info
 */
export function createSafeErrorResponse(
  error: unknown,
  statusCode: number = 500,
  context?: APIContext
): Response {
  const isDev = isDevelopment(context);
  const category = categorizeError(error);
  
  let responseBody: Record<string, unknown>;
  
  if (isDev) {
    // Development: include full details for debugging
    responseBody = {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        category,
      },
    };
  } else {
    // Production: generic message only
    responseBody = {
      success: false,
      error: {
        message: GENERIC_ERRORS[category],
        code: category.toUpperCase(),
      },
    };
  }
  
  return new Response(JSON.stringify(responseBody), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Get safe error message for logging or response
 * Always sanitizes in production, optionally in development
 */
export function getSafeErrorMessage(error: unknown, context?: APIContext): string {
  const isDev = isDevelopment(context);
  const category = categorizeError(error);
  
  if (isDev) {
    // In dev, return sanitized but detailed message
    const message = error instanceof Error ? error.message : String(error);
    return sanitizeErrorMessage(message);
  }
  
  // In production, return generic message
  return GENERIC_ERRORS[category];
}

/**
 * Log error safely (sanitizes sensitive info even in logs)
 */
export function logErrorSafely(error: unknown, context?: string): void {
  const sanitizedMessage = error instanceof Error 
    ? sanitizeErrorMessage(error.message)
    : sanitizeErrorMessage(String(error));
  
  console.error(`[${context || 'Error'}]`, sanitizedMessage);
}
