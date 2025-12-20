/**
 * Security Utilities Property Tests
 * **Feature: security-hardening, Property 5: Admin Endpoint Authentication**
 * **Feature: security-hardening, Property 6: Rate Limit Enforcement**
 * **Validates: Requirements 2.1, 2.2, 2.3, 3.1**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
  checkRateLimit,
  rateLimitResponse,
  unauthorizedResponse,
  addSecurityHeaders,
  sanitizeInput,
  isValidSlug,
  getClientIP,
} from './security';

describe('Security Utilities - Property Tests', () => {
  /**
   * Property 5: Admin Endpoint Authentication
   * For any request to admin endpoints without a valid Authorization header,
   * the system should return HTTP 401 status.
   */
  describe('Authentication', () => {
    it('unauthorizedResponse should return 401 status', () => {
      const response = unauthorizedResponse();
      expect(response.status).toBe(401);
    });

    it('unauthorizedResponse should return JSON with error message', async () => {
      const response = unauthorizedResponse();
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBeDefined();
    });
  });

  /**
   * Property 6: Rate Limit Enforcement
   * For any client making more requests than the configured limit within
   * the time window, subsequent requests should receive HTTP 429 status.
   */
  describe('Rate Limiting', () => {
    beforeEach(() => {
      // Clear rate limit map between tests by using unique keys
    });

    it('should allow requests within limit', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1000, max: 60000 }),
          (maxRequests, windowMs) => {
            const uniqueKey = `test-${Date.now()}-${Math.random()}`;
            
            // First request should always be allowed
            const result = checkRateLimit(uniqueKey, maxRequests, windowMs);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(maxRequests - 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should block requests exceeding limit', () => {
      const uniqueKey = `block-test-${Date.now()}`;
      const maxRequests = 5;
      const windowMs = 60000;

      // Make maxRequests requests
      for (let i = 0; i < maxRequests; i++) {
        const result = checkRateLimit(uniqueKey, maxRequests, windowMs);
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const blockedResult = checkRateLimit(uniqueKey, maxRequests, windowMs);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it('rateLimitResponse should return 429 status with Retry-After header', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1000, max: 60000 }), (resetIn) => {
          const response = rateLimitResponse(resetIn);
          expect(response.status).toBe(429);
          expect(response.headers.get('Retry-After')).toBe(Math.ceil(resetIn / 1000).toString());
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 8: Security Headers Presence
   * For any API response, the response headers should include security headers.
   * **Feature: security-hardening, Property 8: Security Headers Presence**
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
   */
  describe('Security Headers', () => {
    it('should add all required security headers', () => {
      const originalResponse = new Response('test', { status: 200 });
      const securedResponse = addSecurityHeaders(originalResponse);

      expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY');
      expect(securedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(securedResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(securedResponse.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should preserve original response status', () => {
      // Test with common HTTP status codes (avoiding 204 which requires no body)
      const validStatuses = [200, 201, 400, 401, 403, 404, 500, 502, 503];
      
      validStatuses.forEach(status => {
        const originalResponse = new Response('test', { status });
        const securedResponse = addSecurityHeaders(originalResponse);
        expect(securedResponse.status).toBe(status);
      });
    });

    /**
     * Property 8: For any response with any valid status code and body,
     * addSecurityHeaders should add all four required security headers
     */
    it('property: security headers are added for any response', () => {
      // Valid HTTP status codes that work with Response constructor (no body restrictions)
      const validStatuses = [200, 201, 400, 401, 403, 404, 500, 502, 503];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...validStatuses),
          fc.string(),
          (status, body) => {
            const originalResponse = new Response(body, { status });
            const securedResponse = addSecurityHeaders(originalResponse);
            
            // All four security headers must be present
            expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY');
            expect(securedResponse.headers.get('X-Content-Type-Options')).toBe('nosniff');
            expect(securedResponse.headers.get('X-XSS-Protection')).toBe('1; mode=block');
            expect(securedResponse.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
            
            // Status should be preserved
            expect(securedResponse.status).toBe(status);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 8: Security headers should not overwrite existing custom headers
     */
    it('property: preserves existing headers while adding security headers', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9-]{0,20}$/),
          fc.stringMatching(/^[a-zA-Z0-9-_.]+$/),
          (headerName, headerValue) => {
            // Avoid collision with security headers
            const safeHeaderName = `X-Custom-${headerName}`;
            
            const originalResponse = new Response('test', {
              status: 200,
              headers: { [safeHeaderName]: headerValue },
            });
            const securedResponse = addSecurityHeaders(originalResponse);
            
            // Custom header should be preserved
            expect(securedResponse.headers.get(safeHeaderName)).toBe(headerValue);
            
            // Security headers should still be present
            expect(securedResponse.headers.get('X-Frame-Options')).toBe('DENY');
            
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Input Sanitization', () => {
    it('sanitizeInput should escape HTML special characters', () => {
      expect(sanitizeInput('&')).toBe('&amp;');
      expect(sanitizeInput('<')).toBe('&lt;');
      expect(sanitizeInput('>')).toBe('&gt;');
      expect(sanitizeInput('"')).toBe('&quot;');
      expect(sanitizeInput("'")).toBe('&#x27;');
    });

    it('sanitizeInput should handle null/undefined', () => {
      expect(sanitizeInput(null as unknown as string)).toBe('');
      expect(sanitizeInput(undefined as unknown as string)).toBe('');
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('Slug Validation', () => {
    it('should accept valid slugs', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-z0-9-]{1,100}$/),
          (slug) => {
            expect(isValidSlug(slug)).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        'UPPERCASE',
        'with spaces',
        'special@chars',
        'a'.repeat(101), // Too long
        '',
      ];

      invalidSlugs.forEach(slug => {
        expect(isValidSlug(slug)).toBe(false);
      });
    });
  });

  describe('Client IP Extraction', () => {
    it('should extract IP from cf-connecting-ip header', () => {
      const request = new Request('http://test.com', {
        headers: { 'cf-connecting-ip': '1.2.3.4' },
      });
      expect(getClientIP(request)).toBe('1.2.3.4');
    });

    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://test.com', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
      });
      expect(getClientIP(request)).toBe('1.2.3.4');
    });

    it('should return unknown when no IP headers present', () => {
      const request = new Request('http://test.com');
      expect(getClientIP(request)).toBe('unknown');
    });
  });
});
