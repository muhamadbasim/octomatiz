/**
 * Security Property Tests for HTML Sanitization
 * **Feature: security-hardening, Property 1: HTML Escaping Completeness**
 * **Feature: security-hardening, Property 3: URL Protocol Blocking**
 * **Validates: Requirements 1.1, 1.3**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { escapeHtml, escapeAttribute, sanitizeUrl } from './types';

describe('HTML Sanitization - Property Tests', () => {
  /**
   * Property 1: HTML Escaping Completeness
   * For any string containing HTML special characters (&, <, >, ", '),
   * the escapeHtml function should return a string where all special
   * characters are replaced with their HTML entity equivalents.
   */
  describe('escapeHtml', () => {
    it('should escape all HTML special characters', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = escapeHtml(input);
          
          // Result should not contain unescaped angle brackets
          expect(result).not.toContain('<');
          expect(result).not.toContain('>');
          expect(result).not.toContain('"');
          expect(result).not.toContain("'");
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve alphanumeric characters', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^[a-zA-Z0-9 ]*$/), (input) => {
          const result = escapeHtml(input);
          expect(result).toBe(input);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty and null-like inputs', () => {
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });

    it('should escape script tags making them non-executable', () => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        '"><script>alert(1)</script>',
        '<svg onload=alert(1)>',
      ];

      xssPayloads.forEach(payload => {
        const result = escapeHtml(payload);
        // After escaping, < and > should be converted to entities
        expect(result).not.toContain('<script');
        expect(result).not.toContain('<img');
        expect(result).not.toContain('<svg');
        // The escaped version should contain the entity
        expect(result).toContain('&lt;');
      });
    });

    it('should correctly escape specific characters', () => {
      expect(escapeHtml('&')).toBe('&amp;');
      expect(escapeHtml('<')).toBe('&lt;');
      expect(escapeHtml('>')).toBe('&gt;');
      expect(escapeHtml('"')).toBe('&quot;');
      expect(escapeHtml("'")).toBe('&#x27;');
      expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });
  });

  /**
   * Property 2: Attribute Escaping Safety
   * For any string containing newlines or special characters,
   * the escapeAttribute function should return a string safe for
   * use in HTML attributes.
   */
  describe('escapeAttribute', () => {
    it('should remove newlines and escape special chars', () => {
      fc.assert(
        fc.property(fc.string(), (input) => {
          const result = escapeAttribute(input);
          
          // Should not contain newlines or tabs
          expect(result).not.toContain('\n');
          expect(result).not.toContain('\r');
          expect(result).not.toContain('\t');
          
          // Should not contain unescaped special chars
          expect(result).not.toContain('<');
          expect(result).not.toContain('>');
          expect(result).not.toContain('"');
          expect(result).not.toContain("'");
        }),
        { numRuns: 100 }
      );
    });

    it('should handle multiline strings', () => {
      // \r is removed (not replaced), so line2 and line3 are adjacent
      const multiline = 'line1\nline2\rline3\tline4';
      const result = escapeAttribute(multiline);
      expect(result).toBe('line1 line2line3 line4');
    });
  });

  /**
   * Property 3: URL Protocol Blocking
   * For any URL string starting with javascript:, data:text, or vbscript:,
   * the sanitizeUrl function should return an empty string.
   */
  describe('sanitizeUrl', () => {
    it('should block dangerous protocols', () => {
      const dangerousProtocols = ['javascript:', 'JAVASCRIPT:', 'JavaScript:', 'data:text', 'DATA:TEXT', 'vbscript:', 'VBSCRIPT:'];
      
      fc.assert(
        fc.property(
          fc.constantFrom(...dangerousProtocols),
          fc.string(),
          (protocol, suffix) => {
            const url = protocol + suffix;
            const result = sanitizeUrl(url);
            expect(result).toBe('');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow safe protocols', () => {
      const safeUrls = [
        'https://example.com',
        'http://example.com',
        '/path/to/resource',
        './relative/path',
        'data:image/png;base64,abc123', // data:image is allowed
      ];

      safeUrls.forEach(url => {
        expect(sanitizeUrl(url)).toBe(url);
      });
    });

    it('should handle whitespace padding', () => {
      expect(sanitizeUrl('  javascript:alert(1)  ')).toBe('');
      expect(sanitizeUrl('  https://safe.com  ')).toBe('  https://safe.com  ');
    });

    it('should handle empty and null-like inputs', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeUrl(null as unknown as string)).toBe('');
      expect(sanitizeUrl(undefined as unknown as string)).toBe('');
    });
  });
});
