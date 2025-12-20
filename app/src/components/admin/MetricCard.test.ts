/**
 * MetricCard Property Tests
 * Property-based tests for MRR direction indicator
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getChangeDirection } from './MetricCard';
import { getMRRChangeDirection, getMRRChangeColor } from '../../lib/admin/metricsCalculator';

// Use integer-based approach for more reliable property testing
const positiveChangeArb = fc.integer({ min: 1, max: 100000 }).map(n => n / 100);
const negativeChangeArb = fc.integer({ min: -100000, max: -1 }).map(n => n / 100);
const anyChangeArb = fc.integer({ min: -100000, max: 100000 }).map(n => n / 100);

describe('MetricCard - MRR Direction Indicator', () => {
  /**
   * Property 4: MRR Change Direction Indicator
   * For any MRR comparison between current and previous month,
   * the arrow direction SHALL match the mathematical sign of the difference
   * (up for positive, down for negative)
   * 
   * Validates: Requirements 1.3, 1.4
   */
  describe('Property 4: MRR Change Direction Indicator', () => {
    it('should return "up" for any positive change value', () => {
      fc.assert(
        fc.property(positiveChangeArb, (positiveChange) => {
          const direction = getChangeDirection(positiveChange);
          expect(direction).toBe('up');
        }),
        { numRuns: 100 }
      );
    });

    it('should return "down" for any negative change value', () => {
      fc.assert(
        fc.property(negativeChangeArb, (negativeChange) => {
          const direction = getChangeDirection(negativeChange);
          expect(direction).toBe('down');
        }),
        { numRuns: 100 }
      );
    });

    it('should return "neutral" for zero change', () => {
      const direction = getChangeDirection(0);
      expect(direction).toBe('neutral');
    });

    it('should be consistent with metricsCalculator getMRRChangeDirection', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const cardDirection = getChangeDirection(change);
          const calcDirection = getMRRChangeDirection(change);
          expect(cardDirection).toBe(calcDirection);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases near zero', () => {
      // Very small positive
      expect(getChangeDirection(0.0001)).toBe('up');
      expect(getChangeDirection(Number.MIN_VALUE)).toBe('up');
      
      // Very small negative
      expect(getChangeDirection(-0.0001)).toBe('down');
      expect(getChangeDirection(-Number.MIN_VALUE)).toBe('down');
      
      // Exact zero
      expect(getChangeDirection(0)).toBe('neutral');
      expect(getChangeDirection(-0)).toBe('neutral');
    });

    it('should handle large values', () => {
      // Large positive values
      fc.assert(
        fc.property(
          fc.integer({ min: 1000000, max: 100000000 }),
          (largePositive) => {
            expect(getChangeDirection(largePositive)).toBe('up');
          }
        ),
        { numRuns: 50 }
      );

      // Large negative values
      fc.assert(
        fc.property(
          fc.integer({ min: -100000000, max: -1000000 }),
          (largeNegative) => {
            expect(getChangeDirection(largeNegative)).toBe('down');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('MRR Change Color Indicator', () => {
    it('should return green for positive changes', () => {
      fc.assert(
        fc.property(positiveChangeArb, (positiveChange) => {
          const color = getMRRChangeColor(positiveChange);
          expect(color).toBe('green');
        }),
        { numRuns: 100 }
      );
    });

    it('should return red for negative changes', () => {
      fc.assert(
        fc.property(negativeChangeArb, (negativeChange) => {
          const color = getMRRChangeColor(negativeChange);
          expect(color).toBe('red');
        }),
        { numRuns: 100 }
      );
    });

    it('should return amber for zero change', () => {
      const color = getMRRChangeColor(0);
      expect(color).toBe('amber');
    });
  });

  describe('Direction and Color Consistency', () => {
    it('should have consistent direction and color for any change value', () => {
      fc.assert(
        fc.property(anyChangeArb, (change) => {
          const direction = getChangeDirection(change);
          const color = getMRRChangeColor(change);
          
          // Verify consistency
          if (direction === 'up') {
            expect(color).toBe('green');
          } else if (direction === 'down') {
            expect(color).toBe('red');
          } else {
            expect(color).toBe('amber');
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
