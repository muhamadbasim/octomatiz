/**
 * Unit tests for Analytics API
 * **Feature: kv-error-handling-analytics**
 * **Validates: Requirements 3.1, 3.2**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the analytics module
vi.mock('../../../lib/analytics', () => ({
  getSlugAnalytics: vi.fn(),
  getAllAnalytics: vi.fn(),
}));

// Mock the db client
vi.mock('../../../lib/db/client', () => ({
  getDB: vi.fn(),
}));

import { getSlugAnalytics, getAllAnalytics } from '../../../lib/analytics';
import { getDB } from '../../../lib/db/client';

// Import the handler after mocks are set up
import { GET } from './analytics';

// Helper to create mock Astro context
function createMockContext(searchParams: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/analytics');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  // Create mock request with headers for rate limiting
  const mockRequest = {
    headers: new Headers({
      'x-forwarded-for': '127.0.0.1',
    }),
  };
  
  return {
    locals: {
      runtime: {
        env: {
          DB: {} as D1Database,
        },
      },
    },
    url,
    request: mockRequest,
  };
}

describe('Analytics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getDB as ReturnType<typeof vi.fn>).mockReturnValue({} as D1Database);
  });

  describe('Response structure', () => {
    it('returns success response with data array for all analytics', async () => {
      const mockData = [
        { slug: 'test-1', totalClicks: 10, clicksByDay: [] },
        { slug: 'test-2', totalClicks: 5, clicksByDay: [] },
      ];
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
      
      const context = createMockContext();
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toEqual(mockData);
      expect(json.meta).toBeDefined();
      expect(json.meta.days).toBe(30);
    });

    it('returns success response with single summary for slug filter', async () => {
      const mockData = { slug: 'test-slug', totalClicks: 15, clicksByDay: [] };
      (getSlugAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
      
      const context = createMockContext({ slug: 'test-slug' });
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual(mockData);
      expect(json.data.slug).toBe('test-slug');
    });
  });

  describe('Filtering by slug', () => {
    it('calls getSlugAnalytics when slug param is provided', async () => {
      (getSlugAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue({
        slug: 'my-page',
        totalClicks: 20,
        clicksByDay: [],
      });
      
      const context = createMockContext({ slug: 'my-page' });
      await GET(context as any);
      
      expect(getSlugAnalytics).toHaveBeenCalledWith(expect.anything(), 'my-page', 30);
      expect(getAllAnalytics).not.toHaveBeenCalled();
    });

    it('calls getAllAnalytics when no slug param', async () => {
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      
      const context = createMockContext();
      await GET(context as any);
      
      expect(getAllAnalytics).toHaveBeenCalledWith(expect.anything(), 30);
      expect(getSlugAnalytics).not.toHaveBeenCalled();
    });
  });

  describe('Day range parameter', () => {
    it('uses default 30 days when no days param', async () => {
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      
      const context = createMockContext();
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(getAllAnalytics).toHaveBeenCalledWith(expect.anything(), 30);
      expect(json.meta.days).toBe(30);
    });

    it('uses custom days param when provided', async () => {
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      
      const context = createMockContext({ days: '7' });
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(getAllAnalytics).toHaveBeenCalledWith(expect.anything(), 7);
      expect(json.meta.days).toBe(7);
    });

    it('returns 400 for invalid days param', async () => {
      const context = createMockContext({ days: 'invalid' });
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(response.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error).toContain('days');
    });

    it('returns 400 for days out of range (0)', async () => {
      const context = createMockContext({ days: '0' });
      const response = await GET(context as any);
      
      expect(response.status).toBe(400);
    });

    it('returns 400 for days out of range (>365)', async () => {
      const context = createMockContext({ days: '400' });
      const response = await GET(context as any);
      
      expect(response.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('returns 500 on database error', async () => {
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));
      
      const context = createMockContext();
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });
  });

  describe('Response metadata', () => {
    it('includes responseTimeMs in meta', async () => {
      (getAllAnalytics as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      
      const context = createMockContext();
      const response = await GET(context as any);
      const json = await response.json();
      
      expect(json.meta.responseTimeMs).toBeDefined();
      expect(typeof json.meta.responseTimeMs).toBe('number');
    });
  });
});
