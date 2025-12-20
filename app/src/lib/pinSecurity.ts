/**
 * PIN Security for Dashboard
 * Hardcoded PIN protection for user dashboard
 */

const PIN_LOCKED_UNTIL_KEY = 'octomatiz_pin_locked_until';
const PIN_ATTEMPTS_KEY = 'octomatiz_pin_attempts';

// Hardcoded PIN - change this to update the access code
const HARDCODED_PIN = '778899';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if PIN security is enabled (always true with hardcoded PIN)
 */
export function isPinEnabled(): boolean {
  return true;
}

/**
 * Check if PIN is set (always true with hardcoded PIN)
 */
export function hasPinSet(): boolean {
  return true;
}

/**
 * Set a new PIN - disabled for hardcoded mode
 */
export function setPin(_pin: string): boolean {
  // Disabled - PIN is hardcoded
  return false;
}

/**
 * Verify PIN against hardcoded value
 */
export function verifyPin(pin: string): boolean {
  return pin === HARDCODED_PIN;
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
 * Disable PIN security - disabled for hardcoded mode
 */
export function disablePin(): void {
  // Disabled - PIN is hardcoded
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(): number {
  if (typeof window === 'undefined') return MAX_ATTEMPTS;
  const attempts = parseInt(localStorage.getItem(PIN_ATTEMPTS_KEY) || '0', 10);
  return Math.max(0, MAX_ATTEMPTS - attempts);
}
