// Property-based tests for KV Error Handler
// **Feature: kv-error-handling-analytics**

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  isKVAvailable,
  safeKVGet,
  safeKVPut,
  generateErrorPage,
  getStatusCodeForError,
  type KVErrorCode,
} from './kvErrorHandler';

// Mock KV namespace for testing
function createMockKV(options?: {
  getData?: unknown;
  getThrows?: boolean;
  putThrows?: boolean;
  putFailsOnce?: boolean;
}): KVNamespace {
  let putAttempts = 0;
  
  return {
    get: vi.fn().mockImplementation(async () => {
      if (options?.getThrows) {
        throw new Error('KV read error');
      }
      return options?.getData ?? null;
    }),
    put: vi.fn().mockImplementation(async () => {
      putAttempts++;
      if (options?.putThrows) {
        throw new Error('KV write error');
      }
      if (options?.putFailsOnce && putAttempts === 1) {
        throw new Error('KV write error (first attempt)');
      }
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

describe('KV Error Handler', () => {
  describe('isKVAvailable', () => {
    it('returns false for undefined', () => {
      expect(isKVAvailable(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isKVAvailable(null as unknown as undefined)).toBe(false);
    });

    it('returns true for valid KV namespace', () => {
      const kv = createMockKV();
      expect(isKVAvailable(kv)).toBe(true);
    });
  });

  /**
   * **Property 1: KV unavailable returns branded error page**
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: KV unavailable returns branded error page', () => {
    it('generateErrorPage contains OCTOmatiz branding for any error code', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<KVErrorCode | 'GENERIC'>('KV_UNAVAILABLE', 'KV_READ_ERROR', 'KV_WRITE_ERROR', 'NOT_FOUND', 'GENERIC'),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          (errorCode, slug) => {
            const html = generateErrorPage(errorCode, slug);
            
            // Must contain OCTOmatiz branding
            expect(html).toContain('OCTOmatiz');
            expect(html).toContain('🐙');
            
            // Must be valid HTML
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('</html>');
            
            // Must contain error messaging
            expect(html).toContain('<h1>');
            expect(html).toContain('</h1>');
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Property 2: Deployment without KV returns storage error**
   * **Validates: Requirements 1.2**
   */
  describe('Property 2: Deployment without KV returns storage error', () => {
    it('safeKVPut returns KV_UNAVAILABLE when KV is undefined', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 1000 }),
          async (key, value) => {
            const result = await safeKVPut(undefined, key, value);
            
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('KV_UNAVAILABLE');
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Property 3: KV read failure returns 503**
   * **Validates: Requirements 1.3**
   */
  describe('Property 3: KV read failure returns 503', () => {
    it('safeKVGet returns KV_READ_ERROR when KV.get throws', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (key) => {
            const kv = createMockKV({ getThrows: true });
            const result = await safeKVGet(kv, key);
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.errorCode).toBe('KV_READ_ERROR');
            
            // Verify status code mapping
            const statusCode = getStatusCodeForError('KV_READ_ERROR');
            expect(statusCode).toBe(503);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('safeKVGet returns KV_UNAVAILABLE error when KV is undefined', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          async (key) => {
            const result = await safeKVGet(undefined, key);
            
            expect(result.data).toBeNull();
            expect(result.error).toBeDefined();
            expect(result.error?.errorCode).toBe('KV_UNAVAILABLE');
            
            // Verify status code mapping
            const statusCode = getStatusCodeForError('KV_UNAVAILABLE');
            expect(statusCode).toBe(503);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Property 4: KV write retry on failure**
   * **Validates: Requirements 1.4**
   */
  describe('Property 4: KV write retry on failure', () => {
    it('safeKVPut succeeds when first attempt fails but retry succeeds', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 1000 }),
          async (key, value) => {
            const kv = createMockKV({ putFailsOnce: true });
            const result = await safeKVPut(kv, key, value);
            
            // Should succeed after retry
            expect(result.success).toBe(true);
            expect(result.errorCode).toBeUndefined();
            
            // Verify put was called twice
            expect(kv.put).toHaveBeenCalledTimes(2);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('safeKVPut returns error when both attempts fail', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 1000 }),
          async (key, value) => {
            const kv = createMockKV({ putThrows: true });
            const result = await safeKVPut(kv, key, value);
            
            expect(result.success).toBe(false);
            expect(result.errorCode).toBe('KV_WRITE_ERROR');
            
            // Verify put was called twice (initial + retry)
            expect(kv.put).toHaveBeenCalledTimes(2);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('safeKVPut succeeds on first attempt without retry', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 1000 }),
          async (key, value) => {
            const kv = createMockKV();
            const result = await safeKVPut(kv, key, value);
            
            expect(result.success).toBe(true);
            
            // Verify put was called only once
            expect(kv.put).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('getStatusCodeForError', () => {
    it('returns correct status codes for all error types', () => {
      expect(getStatusCodeForError('NOT_FOUND')).toBe(404);
      expect(getStatusCodeForError('KV_UNAVAILABLE')).toBe(503);
      expect(getStatusCodeForError('KV_READ_ERROR')).toBe(503);
      expect(getStatusCodeForError('KV_WRITE_ERROR')).toBe(500);
    });
  });

  describe('safeKVGet success cases', () => {
    it('returns data when KV.get succeeds', async () => {
      const testData = { html: '<html></html>', businessName: 'Test' };
      const kv = createMockKV({ getData: testData });
      
      const result = await safeKVGet<typeof testData>(kv, 'test-key');
      
      expect(result.data).toEqual(testData);
      expect(result.error).toBeUndefined();
    });

    it('returns null data when key not found', async () => {
      const kv = createMockKV({ getData: null });
      
      const result = await safeKVGet(kv, 'nonexistent-key');
      
      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });
});
