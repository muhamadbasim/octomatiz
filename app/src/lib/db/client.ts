// D1 Client wrapper for OCTOmatiz
import type { DBDevice, DBProject, DBEvent } from '../../types/database';

// Get D1 binding from Astro context
export function getDB(locals: App.Locals): D1Database {
  const runtime = locals.runtime;
  if (!runtime?.env?.DB) {
    throw new Error('D1 database binding not found');
  }
  return runtime.env.DB;
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
