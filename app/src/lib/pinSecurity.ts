/**
 * PIN Security for Dashboard
 * Simple PIN-based protection for user dashboard
 */

const PIN_KEY = 'octomatiz_user_pin';
const PIN_ENABLED_KEY = 'octomatiz_pin_enabled';
const PIN_LOCKED_UNTIL_KEY = 'octomatiz_pin_locked_until';
const PIN_ATTEMPTS_KEY = 'octomatiz_pin_attempts';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Simple hash function for PIN (not cryptographically secure, but sufficient for local storage)
 */
function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

/**
 * Check if PIN security is enabled
 */
export function isPinEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(PIN_ENABLED_KEY) === 'true';
}

/**
 * Check if PIN is set
 */
export function hasPinSet(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(PIN_KEY);
}

/**
 * Set a new PIN
 */
export function setPin(pin: string): boolean {
  if (typeof window === 'undefined') return false;
  if (pin.length < 4 || pin.length > 6) return false;
  if (!/^\d+$/.test(pin)) return false;
  
  localStorage.setItem(PIN_KEY, hashPin(pin));
  localStorage.setItem(PIN_ENABLED_KEY, 'true');
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
  localStorage.removeItem(PIN_LOCKED_UNTIL_KEY);
  return true;
}

/**
 * Verify PIN
 */
export function verifyPin(pin: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const storedHash = localStorage.getItem(PIN_KEY);
  if (!storedHash) return false;
  
  return hashPin(pin) === storedHash;
}

/**
 * Check if account is locked due to too many attempts
 */
export function isLocked(): { locked: boolean; remainingTime: number } {
  if (typeof window === 'undefined') return { locked: false, remainingTime: 0 };
  
  const lockedUntil = localStorage.getItem(PIN_LOCKED_UNTIL_KEY);
  if (!lockedUntil) return { locked: false, remainingTime: 0 };
  
  const lockTime = parseInt(lockedUntil, 10);
  const now = Date.now();
  
  if (now >= lockTime) {
    localStorage.removeItem(PIN_LOCKED_UNTIL_KEY);
    localStorage.removeItem(PIN_ATTEMPTS_KEY);
    return { locked: false, remainingTime: 0 };
  }
  
  return { locked: true, remainingTime: Math.ceil((lockTime - now) / 1000) };
}

/**
 * Record a failed attempt
 */
export function recordFailedAttempt(): { locked: boolean; attemptsLeft: number } {
  if (typeof window === 'undefined') return { locked: false, attemptsLeft: MAX_ATTEMPTS };
  
  const attempts = parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) || '0', 10) + 1;
  localStorage.setItem(PIN_ATTEMPTS_KEY, attempts.toString());
  
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(PIN_LOCKED_UNTIL_KEY, (Date.now() + LOCKOUT_DURATION).toString());
    return { locked: true, attemptsLeft: 0 };
  }
  
  return { locked: false, attemptsLeft: MAX_ATTEMPTS - attempts };
}

/**
 * Reset attempts on successful login
 */
export function resetAttempts(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
  localStorage.removeItem(PIN_LOCKED_UNTIL_KEY);
}

/**
 * Disable PIN security
 */
export function disablePin(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PIN_KEY);
  localStorage.removeItem(PIN_ENABLED_KEY);
  localStorage.removeItem(PIN_ATTEMPTS_KEY);
  localStorage.removeItem(PIN_LOCKED_UNTIL_KEY);
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(): number {
  if (typeof window === 'undefined') return MAX_ATTEMPTS;
  const attempts = parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) || '0', 10);
  return Math.max(0, MAX_ATTEMPTS - attempts);
}
