/**
 * Error Handler Property Tests
 * **Feature: security-hardening, Property 10: Error Response Safety**
 * **Validates: Requirements 7.2**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  sanitizeErrorMessage,
  createSafeErrorResponse,
  getSafeErrorMessage,
  logErrorSafely,
} from './errorHandler';

// Mock import.meta.env for testing
const originalEnv = { ...import.meta.env };

describe('Error Handler - Property Tests', () => {
  beforeEach(() => {
    vi.stubGlobal('import.meta.env', { ...originalEnv });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /**
   * Property 10: Error Response Safety
   * For any error response in production mode, the response body should not
   * contain stack traces, internal paths, or debug information.
   */
  describe('sanitizeErrorMessage', () => {
    it('should remove stack traces', () => {
      const errorWithStack = `Error: Something failed
        at Object.<anonymous> (C:/Users/dev/project/src/lib/api.ts:42:15)
        at Module._compile (node:internal/modules/cjs/loader:1254:14)`;

      const sanitized = sanitizeErrorMessage(errorWithStack);
      expect(sanitized).not.toContain('C:/Users');
      expect(sanitized).not.toContain(':42:15');
    });

    it('should remove Windows paths', () => {
      const message = 'Error loading file C:\\Users\\admin\\secrets\\config.json';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('C:\\Users');
      expect(sanitized).not.toContain('secrets');
    });

    it('should remove Unix paths', () => {
      const message = 'Error loading /home/user/app/node_modules/secret/index.js';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('/home/user');
      expect(sanitized).not.toContain('node_modules');
    });

    it('should remove credentials', () => {
      const message = 'Connection failed: password=secret123 api_key=abc123xyz';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('secret123');
      expect(sanitized).not.toContain('abc123xyz');
    });

    it('should remove email addresses', () => {
      const message = 'User admin@company.com failed to authenticate';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('admin@company.com');
    });

    it('should remove IP addresses', () => {
      const message = 'Connection from 192.168.1.100 was rejected';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('192.168.1.100');
    });

    it('should remove Bearer tokens', () => {
      const message = 'Auth failed with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const sanitized = sanitizeErrorMessage(message);
      expect(sanitized).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    });

    it('should handle empty/null input', () => {
      expect(sanitizeErrorMessage('')).toBe('Terjadi kesalahan. Coba lagi nanti.');
      expect(sanitizeErrorMessage(null as unknown as string)).toBe(
        'Terjadi kesalahan. Coba lagi nanti.'
      );
    });

    /**
     * Property 10: For any string containing sensitive patterns,
     * sanitization should replace them with [REDACTED]
     */
    it('property: sensitive patterns are always redacted', () => {
      const sensitivePatterns = [
        'at func (C:/path/file.ts:10:5)',
        '/home/user/secret/file.js',
        'password=mysecret',
        'api_key: abc123',
        'user@example.com',
        '10.0.0.1',
        'Bearer token123',
      ];

      sensitivePatterns.forEach((pattern) => {
        const message = `Error occurred: ${pattern}`;
        const sanitized = sanitizeErrorMessage(message);
        expect(sanitized).toContain('[REDACTED]');
      });
    });
  });

  describe('createSafeErrorResponse', () => {
    it('should return generic message in production', async () => {
      // Simulate production environment
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const error = new Error('Database connection failed at /var/db/secret.db');
      const response = createSafeErrorResponse(error, 500);

      expect(response.status).toBe(500);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.message).not.toContain('/var/db');
      expect(body.error.message).not.toContain('secret.db');
      expect(body.error.stack).toBeUndefined();
    });

    it('should categorize database errors correctly', async () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const error = new Error('D1 query failed');
      const response = createSafeErrorResponse(error, 500);
      const body = await response.json();

      expect(body.error.code).toBe('DATABASE');
      expect(body.error.message).toContain('database');
    });

    it('should categorize auth errors correctly', async () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const error = new Error('Unauthorized access attempt');
      const response = createSafeErrorResponse(error, 401);
      const body = await response.json();

      expect(body.error.code).toBe('AUTH');
    });

    it('should categorize validation errors correctly', async () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const error = new Error('Invalid format for field');
      const response = createSafeErrorResponse(error, 400);
      const body = await response.json();

      expect(body.error.code).toBe('VALIDATION');
    });

    /**
     * Property 10: Production responses never contain stack traces
     */
    it('property: production responses never contain stack traces', () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1, maxLength: 500 }), async (errorMessage) => {
          const error = new Error(errorMessage);
          error.stack = `Error: ${errorMessage}\n    at test (/path/to/file.ts:10:5)`;

          const response = createSafeErrorResponse(error, 500);
          const body = await response.json();

          // Stack should never be present in production
          expect(body.error.stack).toBeUndefined();

          // Response should not contain file paths
          const bodyStr = JSON.stringify(body);
          expect(bodyStr).not.toMatch(/\/path\/to/);
          expect(bodyStr).not.toMatch(/:\d+:\d+\)/);

          return true;
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property 10: Production responses use generic messages
     */
    it('property: production responses use generic Indonesian messages', () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const genericMessages = [
        'Terjadi kesalahan database',
        'Koneksi bermasalah',
        'Data tidak valid',
        'Akses tidak diizinkan',
        'Data tidak ditemukan',
        'Terlalu banyak permintaan',
        'Terjadi kesalahan',
      ];

      fc.assert(
        fc.asyncProperty(fc.string({ minLength: 1, maxLength: 200 }), async (errorMessage) => {
          const error = new Error(errorMessage);
          const response = createSafeErrorResponse(error, 500);
          const body = await response.json();

          // Message should be one of the generic Indonesian messages
          const isGeneric = genericMessages.some((msg) => body.error.message.includes(msg));
          expect(isGeneric).toBe(true);

          return true;
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('getSafeErrorMessage', () => {
    it('should return generic message in production', () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const error = new Error('Secret database at /var/secrets failed');
      const message = getSafeErrorMessage(error);

      expect(message).not.toContain('/var/secrets');
      expect(message).toContain('database');
    });

    it('should handle non-Error objects', () => {
      vi.stubGlobal('import.meta.env', { DEV: 'false', MODE: 'production' });

      const message = getSafeErrorMessage('String error with path /home/user');
      expect(message).not.toContain('/home/user');
    });
  });

  describe('logErrorSafely', () => {
    it('should sanitize error before logging', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Failed at C:\\Users\\admin\\secret.js');
      logErrorSafely(error, 'TestContext');

      expect(consoleSpy).toHaveBeenCalled();
      const loggedMessage = consoleSpy.mock.calls[0].join(' ');
      expect(loggedMessage).not.toContain('C:\\Users');
      expect(loggedMessage).toContain('[REDACTED]');

      consoleSpy.mockRestore();
    });
  });
});
