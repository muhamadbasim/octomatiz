// D1 Client wrapper for OCTOmatiz
import type { DBDevice, DBProject, DBEvent } from '../../types/database';

// Get D1 binding from Astro context
// Returns null if D1 is not available (local dev without wrangler)
export function getDB(locals: App.Locals): D1Database | null {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    console.warn('D1 database binding not found - using mock data');
    return null;
  }
  return runtime.env.DB;
}

// Check if D1 is available
export function hasDB(locals: App.Locals): boolean {
  return !!locals.runtime?.env?.DB;
}

// Helper to convert D1 result to typed array
export function toArray<T>(result: D1Result<T>): T[] {
  return result.results || [];
}

// Helper to get first result or null
export function firstOrNull<T>(result: D1Result<T>): T | null {
  return result.results?.[0] || null;
}

// Generate unique device ID using crypto
export function generateDeviceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Generate short link code (6 chars)
export function generateLinkCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate project ID
export function generateProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get current ISO timestamp
export function nowISO(): string {
  return new Date().toISOString();
}
