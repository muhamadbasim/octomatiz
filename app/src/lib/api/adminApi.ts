/**
 * Admin API Helper
 * Handles authentication for admin endpoints
 */

const ADMIN_TOKEN_KEY = 'octomatiz_admin_token';

/**
 * Get stored admin token from localStorage
 */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

/**
 * Set admin token in localStorage
 */
export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

/**
 * Clear admin token from localStorage
 */
export function clearAdminToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Check if admin token is set
 */
export function hasAdminToken(): boolean {
  return !!getAdminToken();
}

/**
 * Fetch with admin authentication
 * Automatically adds Authorization header if token is available
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Prompt user for admin token if not set
 * Returns true if token was set, false if cancelled
 */
export function promptForAdminToken(): boolean {
  if (hasAdminToken()) return true;
  
  const token = window.prompt(
    'Masukkan Admin Secret untuk mengakses dashboard admin:',
    ''
  );
  
  if (token) {
    setAdminToken(token);
    return true;
  }
  
  return false;
}
