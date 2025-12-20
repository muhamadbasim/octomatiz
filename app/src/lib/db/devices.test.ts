// Property tests for device operations
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateDeviceId, generateLinkCode } from './client';

describe('Device ID Generation', () => {
  /**
   * Property 5: Device ID Uniqueness
   * For any two generated device IDs, they SHALL be different
   * (collision probability < 1 in 2^128)
   */
  it('should generate unique device IDs', () => {
    fc.assert(
      fc.property(fc.integer({ min: 100, max: 1000 }), (count) => {
        const ids = new Set<string>();
        for (let i = 0; i < count; i++) {
          ids.add(generateDeviceId());
        }
        // All generated IDs should be unique
        return ids.size === count;
      }),
      { numRuns: 50 }
    );
  });

  it('should generate device IDs with correct format', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const id = generateDeviceId();
        // Should be 32 hex characters (16 bytes * 2)
        expect(id).toMatch(/^[0-9a-f]{32}$/);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should generate device IDs with sufficient entropy', () => {
    // Generate 1000 IDs and check they're all different
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generateDeviceId());
    }
    expect(ids.size).toBe(1000);
  });
});

describe('Link Code Generation', () => {
  it('should generate link codes with correct format', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const code = generateLinkCode();
        // Should be 6 uppercase alphanumeric characters (excluding confusing ones)
        expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should generate unique link codes', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateLinkCode());
    }
    // With 6 chars from 32 possible, collision in 100 is very unlikely
    expect(codes.size).toBeGreaterThanOrEqual(95);
  });
});
