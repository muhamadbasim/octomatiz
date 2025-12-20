/**
 * CohortHeatmap Property Tests
 * Property-based tests for cohort retention color gradient
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getCohortRetentionColor,
  getCohortRetentionOpacity,
  hasBadRetentionAtMonth3,
} from '../../lib/admin/metricsCalculator';

/**
 * Parse HSL color string to extract hue value
 */
function parseHSLHue(hslString: string): number {
  const match = hslString.match(/hsl\((\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : -1;
}

describe('CohortHeatmap - Color Gradient', () => {
  /**
   * Property 5: Cohort Retention Heatmap Color Gradient
   * For any retention percentage in cohort heatmap, the cell color SHALL be
   * on a gradient where lower percentages are redder and higher percentages are greener
   * 
   * Validates: Requirements 6.2
   */
  describe('Property 5: Cohort Retention Heatmap Color Gradient', () => {
    it('should produce redder colors (lower hue) for lower retention values', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 49 }),
          fc.integer({ min: 51, max: 100 }),
          (lowerRetention, higherRetention) => {
            const lowerColor = getCohortRetentionColor(lowerRetention);
            const higherColor = getCohortRetentionColor(higherRetention);
            
            const lowerHue = parseHSLHue(lowerColor);
            const higherHue = parseHSLHue(higherColor);
            
            // Lower retention should have lower hue (more red)
            // Higher retention should have higher hue (more green)
            expect(lowerHue).toBeLessThan(higherHue);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return hue 0 (red) for 0% retention', () => {
      const color = getCohortRetentionColor(0);
      const hue = parseHSLHue(color);
      expect(hue).toBe(0);
    });

    it('should return hue 120 (green) for 100% retention', () => {
      const color = getCohortRetentionColor(100);
      const hue = parseHSLHue(color);
      expect(hue).toBe(120);
    });

    it('should return hue 60 (yellow) for 50% retention', () => {
      const color = getCohortRetentionColor(50);
      const hue = parseHSLHue(color);
      expect(hue).toBe(60);
    });

    it('should clamp values below 0 to 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000, max: -1 }),
          (negativeRetention) => {
            const color = getCohortRetentionColor(negativeRetention);
            const hue = parseHSLHue(color);
            expect(hue).toBe(0); // Should be clamped to 0% = red
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should clamp values above 100 to 100', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 1000 }),
          (overRetention) => {
            const color = getCohortRetentionColor(overRetention);
            const hue = parseHSLHue(color);
            expect(hue).toBe(120); // Should be clamped to 100% = green
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should produce monotonically increasing hue as retention increases', () => {
      // Test that hue increases monotonically from 0 to 100
      let previousHue = -1;
      for (let retention = 0; retention <= 100; retention += 5) {
        const color = getCohortRetentionColor(retention);
        const hue = parseHSLHue(color);
        expect(hue).toBeGreaterThanOrEqual(previousHue);
        previousHue = hue;
      }
    });

    it('should produce valid HSL color strings', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (retention) => {
            const color = getCohortRetentionColor(retention);
            // Should match HSL format
            expect(color).toMatch(/^hsl\(\d+(?:\.\d+)?, \d+(?:\.\d+)?%, \d+(?:\.\d+)?%\)$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Cohort Retention Opacity', () => {
    it('should return higher opacity for higher retention', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 49 }),
          fc.integer({ min: 51, max: 100 }),
          (lowerRetention, higherRetention) => {
            const lowerOpacity = getCohortRetentionOpacity(lowerRetention);
            const higherOpacity = getCohortRetentionOpacity(higherRetention);
            
            expect(lowerOpacity).toBeLessThan(higherOpacity);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return opacity between 0.3 and 1.0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          (retention) => {
            const opacity = getCohortRetentionOpacity(retention);
            expect(opacity).toBeGreaterThanOrEqual(0.3);
            expect(opacity).toBeLessThanOrEqual(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 0.3 for 0% retention', () => {
      const opacity = getCohortRetentionOpacity(0);
      expect(opacity).toBe(0.3);
    });

    it('should return 1.0 for 100% retention', () => {
      const opacity = getCohortRetentionOpacity(100);
      expect(opacity).toBe(1.0);
    });
  });

  describe('Bad Retention Detection', () => {
    it('should detect bad retention when M3 < 50%', () => {
      // M3 is index 3: [M0, M1, M2, M3]
      const badRetention = [100, 80, 60, 40]; // M3 = 40% < 50%
      expect(hasBadRetentionAtMonth3(badRetention)).toBe(true);
    });

    it('should not flag good retention when M3 >= 50%', () => {
      const goodRetention = [100, 85, 70, 55]; // M3 = 55% >= 50%
      expect(hasBadRetentionAtMonth3(goodRetention)).toBe(false);
    });

    it('should return false for arrays shorter than 4 elements', () => {
      expect(hasBadRetentionAtMonth3([100])).toBe(false);
      expect(hasBadRetentionAtMonth3([100, 80])).toBe(false);
      expect(hasBadRetentionAtMonth3([100, 80, 60])).toBe(false);
    });

    it('should correctly identify boundary case at exactly 50%', () => {
      const boundaryRetention = [100, 80, 60, 50]; // M3 = 50% exactly
      expect(hasBadRetentionAtMonth3(boundaryRetention)).toBe(false); // 50% is not < 50%
    });

    it('should correctly identify boundary case just below 50%', () => {
      const justBelowRetention = [100, 80, 60, 49.9]; // M3 = 49.9% < 50%
      expect(hasBadRetentionAtMonth3(justBelowRetention)).toBe(true);
    });

    it('should work with property-based testing', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 4, maxLength: 12 }),
          (retentionArray) => {
            const result = hasBadRetentionAtMonth3(retentionArray);
            const expected = retentionArray[3] < 50;
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
