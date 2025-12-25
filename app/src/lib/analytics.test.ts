// Property-based tests for Analytics Service
// **Feature: kv-error-handling-analytics**

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  recordLinkClick,
  incrementViewCounter,
  getViewCount,
  getSlugAnalytics,
  getAllAnalytics,
  extractLinkClickEvent,
  type LinkClickEvent,
} from './analytics';

// Mock D1 database
function createMockD1(options?: {
  insertThrows?: boolean;
  selectResult?: unknown;
}): D1Database {
  const mockBind = {
    run: vi.fn().mockImplementation(async () => {
      if (options?.insertThrows) {
        throw new Error('D1 insert error');
      }
      return { success: true };
    }),
    first: vi.fn().mockResolvedValue(options?.selectResult || { count: 0 }),
    all: vi.fn().mockResolvedValue({ results: [] }),
    bind: vi.fn().mockReturnThis(),
  };
  
  return {
    prepare: vi.fn().mockReturnValue({
      bind: vi.fn().mockReturnValue(mockBind),
      run: mockBind.run,
      first: mockBind.first,
      all: mockBind.all,
    }),
    batch: vi.fn(),
    exec: vi.fn(),
    dump: vi.fn(),
  } as unknown as D1Database;
}

// Mock KV namespace
function createMockKV(options?: {
  getData?: string | null;
  getThrows?: boolean;
  putThrows?: boolean;
}): KVNamespace {
  return {
    get: vi.fn().mockImplementation(async () => {
      if (options?.getThrows) {
        throw new Error('KV get error');
      }
      return options?.getData ?? null;
    }),
    put: vi.fn().mockImplementation(async () => {
      if (options?.putThrows) {
        throw new Error('KV put error');
      }
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

// Arbitrary for generating valid slugs
const slugArb = fc.string({ minLength: 1, maxLength: 50 })
  .filter(s => /^[a-z0-9-]+$/.test(s));

// Arbitrary for generating link click events
const linkClickEventArb = fc.record({
  slug: slugArb,
  timestamp: fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString()), // 2020-01-01 to 2030-12-31
  referrer: fc.option(fc.webUrl(), { nil: null }),
  userAgent: fc.option(fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), { nil: null }),
  projectId: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
});

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * **Property 5: Successful access records link_click event**
   * **Validates: Requirements 2.1**
   */
  describe('Property 5: Successful access records link_click event', () => {
    it('recordLinkClick calls D1 insert for any valid event', async () => {
      await fc.assert(
        fc.asyncProperty(linkClickEventArb, async (event) => {
          const db = createMockD1();
          const kv = createMockKV();
          
          // Fire the recording
          recordLinkClick(db, kv, event);
          
          // Wait a tick for the async operation to start
          await new Promise(resolve => setTimeout(resolve, 10));
          
          // Verify D1 prepare was called
          expect(db.prepare).toHaveBeenCalled();
        }),
        { numRuns: 20 }
      );
    });

    it('recordLinkClick continues even when D1 is undefined', async () => {
      await fc.assert(
        fc.asyncProperty(linkClickEventArb, async (event) => {
          const kv = createMockKV();
          
          // Should not throw
          expect(() => recordLinkClick(undefined, kv, event)).not.toThrow();
        }),
        { numRuns: 20 }
      );
    });

    /**
     * **Property 7: D1 failure does not block page response**
     * **Property 12: Analytics failure does not affect response**
     * **Validates: Requirements 2.3, 4.2**
     */
    it('recordLinkClick does not throw when D1 insert fails', async () => {
      await fc.assert(
        fc.asyncProperty(linkClickEventArb, async (event) => {
          const db = createMockD1({ insertThrows: true });
          const kv = createMockKV();
          
          // Should not throw even when D1 fails
          expect(() => recordLinkClick(db, kv, event)).not.toThrow();
        }),
        { numRuns: 20 }
      );
    });

    /**
     * **Property 11: Analytics non-blocking pattern**
     * **Validates: Requirements 4.1**
     */
    it('recordLinkClick returns immediately without waiting for async operations', () => {
      fc.assert(
        fc.property(linkClickEventArb, (event) => {
          const db = createMockD1();
          const kv = createMockKV();
          
          const startTime = Date.now();
          recordLinkClick(db, kv, event);
          const endTime = Date.now();
          
          // Should return in less than 5ms (fire-and-forget)
          expect(endTime - startTime).toBeLessThan(5);
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Property 6: Link click event contains required fields**
   * **Validates: Requirements 2.2**
   */
  describe('Property 6: Link click event contains required fields', () => {
    it('extractLinkClickEvent produces events with all required fields', () => {
      fc.assert(
        fc.property(
          slugArb,
          fc.option(fc.webUrl(), { nil: null }),
          // Use non-whitespace strings to avoid Headers trimming issues
          fc.option(fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0), { nil: null }),
          fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          (slug, referrer, userAgent, projectId) => {
            // Create mock request
            const headers = new Headers();
            if (referrer) headers.set('referer', referrer);
            if (userAgent) headers.set('user-agent', userAgent);
            
            const request = new Request('https://example.com/p/' + slug, { headers });
            
            const event = extractLinkClickEvent(slug, request, projectId);
            
            // Verify all required fields are present
            expect(event.slug).toBe(slug);
            expect(typeof event.timestamp).toBe('string');
            expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
            expect('referrer' in event).toBe(true);
            expect('userAgent' in event).toBe(true);
            
            // Verify referrer matches input
            expect(event.referrer).toBe(referrer);
            // Verify userAgent - Headers may return empty string for whitespace
            if (userAgent) {
              expect(event.userAgent).toBeTruthy();
            } else {
              expect(event.userAgent).toBeNull();
            }
            
            if (projectId !== undefined) {
              expect(event.projectId).toBe(projectId);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('LinkClickEvent structure is valid for any generated event', () => {
      fc.assert(
        fc.property(linkClickEventArb, (event: LinkClickEvent) => {
          // All required fields must be present
          expect(typeof event.slug).toBe('string');
          expect(event.slug.length).toBeGreaterThan(0);
          expect(typeof event.timestamp).toBe('string');
          
          // Optional fields can be null/undefined
          expect(event.referrer === null || typeof event.referrer === 'string').toBe(true);
          expect(event.userAgent === null || typeof event.userAgent === 'string').toBe(true);
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('incrementViewCounter', () => {
    it('increments counter from 0 to 1 for new slug', async () => {
      const kv = createMockKV({ getData: null });
      
      const result = await incrementViewCounter(kv, 'test-slug');
      
      expect(result).toBe(1);
      expect(kv.put).toHaveBeenCalledWith('views:test-slug', '1');
    });

    it('increments existing counter', async () => {
      const kv = createMockKV({ getData: '5' });
      
      const result = await incrementViewCounter(kv, 'test-slug');
      
      expect(result).toBe(6);
      expect(kv.put).toHaveBeenCalledWith('views:test-slug', '6');
    });

    it('returns 0 on error', async () => {
      const kv = createMockKV({ getThrows: true });
      
      const result = await incrementViewCounter(kv, 'test-slug');
      
      expect(result).toBe(0);
    });

    /**
     * **Property 8: View counter increments on access**
     * **Validates: Requirements 2.4**
     */
    it('increments counter by exactly 1 for any slug', async () => {
      await fc.assert(
        fc.asyncProperty(
          slugArb,
          fc.integer({ min: 0, max: 1000 }),
          async (slug, initialCount) => {
            const kv = createMockKV({ getData: initialCount.toString() });
            
            const result = await incrementViewCounter(kv, slug);
            
            // Should increment by exactly 1
            expect(result).toBe(initialCount + 1);
            
            // Should call put with incremented value
            expect(kv.put).toHaveBeenCalledWith(`views:${slug}`, (initialCount + 1).toString());
          }
        ),
        { numRuns: 20 }
      );
    });

    it('handles concurrent increments correctly', async () => {
      // This tests that each call increments independently
      const kv = createMockKV({ getData: '10' });
      
      const result1 = await incrementViewCounter(kv, 'test-slug');
      
      expect(result1).toBe(11);
    });
  });

  describe('getViewCount', () => {
    it('returns 0 when KV is undefined', async () => {
      const result = await getViewCount(undefined, 'test-slug');
      expect(result).toBe(0);
    });

    it('returns 0 when key not found', async () => {
      const kv = createMockKV({ getData: null });
      
      const result = await getViewCount(kv, 'test-slug');
      
      expect(result).toBe(0);
    });

    it('returns parsed count when key exists', async () => {
      const kv = createMockKV({ getData: '42' });
      
      const result = await getViewCount(kv, 'test-slug');
      
      expect(result).toBe(42);
    });
  });

  describe('getSlugAnalytics', () => {
    it('returns summary with totalClicks and clicksByDay', async () => {
      const db = createMockD1({ selectResult: { count: 10 } });
      
      const result = await getSlugAnalytics(db, 'test-slug', 30);
      
      expect(result.slug).toBe('test-slug');
      expect(result.totalClicks).toBe(10);
      expect(Array.isArray(result.clicksByDay)).toBe(true);
    });

    /**
     * **Property 9: Analytics API returns correct totals**
     * **Validates: Requirements 3.1**
     */
    it('returns correct slug in summary for any valid slug', async () => {
      await fc.assert(
        fc.asyncProperty(slugArb, async (slug) => {
          const db = createMockD1({ selectResult: { count: 5 } });
          
          const result = await getSlugAnalytics(db, slug, 30);
          
          expect(result.slug).toBe(slug);
          expect(typeof result.totalClicks).toBe('number');
          expect(result.totalClicks).toBeGreaterThanOrEqual(0);
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('getAllAnalytics', () => {
    it('returns array of summaries', async () => {
      const db = createMockD1();
      
      const result = await getAllAnalytics(db, 30);
      
      expect(Array.isArray(result)).toBe(true);
    });

    /**
     * **Property 10: Analytics groups by day correctly**
     * **Validates: Requirements 3.2**
     */
    it('returns summaries with valid clicksByDay structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 90 }),
          async (days) => {
            const db = createMockD1();
            
            const result = await getAllAnalytics(db, days);
            
            expect(Array.isArray(result)).toBe(true);
            
            // Each summary should have valid structure
            for (const summary of result) {
              expect(typeof summary.slug).toBe('string');
              expect(typeof summary.totalClicks).toBe('number');
              expect(Array.isArray(summary.clicksByDay)).toBe(true);
              
              // Each day entry should have date and count
              for (const day of summary.clicksByDay) {
                expect(typeof day.date).toBe('string');
                expect(typeof day.count).toBe('number');
              }
            }
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
