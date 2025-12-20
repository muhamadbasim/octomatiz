/**
 * Property-Based Tests for Metrics Calculator
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getLTVCACColorIndicator,
  getLTVCACStatus,
  getNRRColorIndicator,
  getNRRStatus,
  getMRRChangeDirection,
  getMRRChangeColor,
  getCashRunwayStatus,
  getCashRunwayColorIndicator,
  getCohortRetentionColor,
  hasBadRetentionAtMonth3,
  calculateLTVCACRatio,
  calculateMRRGrowth,
} from './metricsCalculator';

describe('Metrics Calculator', () => {
  /**
   * Feature: admin-dashboard, Property 1: LTV:CAC Ratio Color Indicator Consistency
   * *For any* LTV:CAC ratio value, the color indicator displayed SHALL be 
   * red if ratio < 3, amber if 3 <= ratio < 5, and green if ratio >= 5
   * **Validates: Requirements 3.1, 3.2, 3.5**
   */
  describe('Property 1: LTV:CAC Ratio Color Indicator', () => {
    it('should return red for any ratio less than 3', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 2.99, noNaN: true }),
          (ratio) => {
            const color = getLTVCACColorIndicator(ratio);
            expect(color).toBe('red');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return amber for any ratio between 3 and 5 (exclusive)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 3, max: 4.99, noNaN: true }),
          (ratio) => {
            const color = getLTVCACColorIndicator(ratio);
            expect(color).toBe('amber');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return green for any ratio 5 or greater', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 5, max: 100, noNaN: true }),
          (ratio) => {
            const color = getLTVCACColorIndicator(ratio);
            expect(color).toBe('green');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return correct status for any ratio', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (ratio) => {
            const status = getLTVCACStatus(ratio);
            if (ratio < 3) {
              expect(status).toBe('critical');
            } else if (ratio < 5) {
              expect(status).toBe('warning');
            } else {
              expect(status).toBe('healthy');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Edge cases
    it('should handle boundary value 3 as amber', () => {
      expect(getLTVCACColorIndicator(3)).toBe('amber');
    });

    it('should handle boundary value 5 as green', () => {
      expect(getLTVCACColorIndicator(5)).toBe('green');
    });

    it('should handle zero ratio as red', () => {
      expect(getLTVCACColorIndicator(0)).toBe('red');
    });
  });

  /**
   * Feature: admin-dashboard, Property 7: NRR Health Indicator Accuracy
   * *For any* NRR value, the indicator SHALL be green if NRR > 100% and red if NRR <= 100%
   * **Validates: Requirements 2.3, 2.4**
   */
  describe('Property 7: NRR Health Indicator', () => {
    it('should return green for any NRR greater than 100', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 100.01, max: 200, noNaN: true }),
          (nrr) => {
            const color = getNRRColorIndicator(nrr);
            expect(color).toBe('green');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return red for any NRR 100 or less', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (nrr) => {
            const color = getNRRColorIndicator(nrr);
            expect(color).toBe('red');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return correct status for any NRR', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 200, noNaN: true }),
          (nrr) => {
            const status = getNRRStatus(nrr);
            if (nrr > 100) {
              expect(status).toBe('healthy');
            } else {
              expect(status).toBe('critical');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Edge cases
    it('should handle boundary value 100 as red (contraction)', () => {
      expect(getNRRColorIndicator(100)).toBe('red');
    });

    it('should handle 100.01 as green (expansion)', () => {
      expect(getNRRColorIndicator(100.01)).toBe('green');
    });
  });

  /**
   * Feature: admin-dashboard, Property 4: MRR Change Direction Indicator
   * *For any* MRR comparison, the arrow direction SHALL match the mathematical sign
   * **Validates: Requirements 1.3, 1.4**
   */
  describe('Property 4: MRR Change Direction Indicator', () => {
    it('should return up for any positive change', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 1000, noNaN: true }),
          (change) => {
            const direction = getMRRChangeDirection(change);
            expect(direction).toBe('up');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return down for any negative change', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -0.01, noNaN: true }),
          (change) => {
            const direction = getMRRChangeDirection(change);
            expect(direction).toBe('down');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return neutral for zero change', () => {
      expect(getMRRChangeDirection(0)).toBe('neutral');
    });

    it('should return green color for positive change', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.01, max: 1000, noNaN: true }),
          (change) => {
            const color = getMRRChangeColor(change);
            expect(color).toBe('green');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return red color for negative change', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1000, max: -0.01, noNaN: true }),
          (change) => {
            const color = getMRRChangeColor(change);
            expect(color).toBe('red');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: admin-dashboard, Property 8: Cash Runway Critical Alert
   * *For any* Cash Runway value less than 6 months, the dashboard SHALL display critical alert
   * **Validates: Requirements 4.4**
   */
  describe('Property 8: Cash Runway Critical Alert', () => {
    it('should return critical for any runway less than 6 months', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 5.99, noNaN: true }),
          (months) => {
            const status = getCashRunwayStatus(months);
            expect(status).toBe('critical');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return red color for any runway less than 6 months', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 5.99, noNaN: true }),
          (months) => {
            const color = getCashRunwayColorIndicator(months);
            expect(color).toBe('red');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return warning for runway between 6 and 12 months', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 6, max: 11.99, noNaN: true }),
          (months) => {
            const status = getCashRunwayStatus(months);
            expect(status).toBe('warning');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return healthy for runway 12 months or more', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 12, max: 100, noNaN: true }),
          (months) => {
            const status = getCashRunwayStatus(months);
            expect(status).toBe('healthy');
          }
        ),
        { numRuns: 100 }
      );
    });

    // Edge cases
    it('should handle boundary value 6 as warning', () => {
      expect(getCashRunwayStatus(6)).toBe('warning');
    });

    it('should handle boundary value 12 as healthy', () => {
      expect(getCashRunwayStatus(12)).toBe('healthy');
    });
  });

  /**
   * Feature: admin-dashboard, Property 5: Cohort Retention Heatmap Color Gradient
   * *For any* retention percentage, lower values produce redder colors, higher produce greener
   * **Validates: Requirements 6.2**
   */
  describe('Property 5: Cohort Retention Heatmap Color Gradient', () => {
    it('should produce monotonically increasing hue for increasing retention', () => {
      // Test that the hue increases as retention increases
      const retentionValues = [0, 25, 50, 75, 100];
      const hues = retentionValues.map(r => {
        const color = getCohortRetentionColor(r);
        return parseFloat(color.match(/hsl\((\d+\.?\d*)/)?.[1] || '0');
      });
      
      // Each hue should be greater than or equal to the previous
      for (let i = 1; i < hues.length; i++) {
        expect(hues[i]).toBeGreaterThanOrEqual(hues[i - 1]);
      }
    });

    it('should return red (hue 0) for 0% retention', () => {
      const color = getCohortRetentionColor(0);
      expect(color).toContain('hsl(0');
    });

    it('should return green (hue 120) for 100% retention', () => {
      const color = getCohortRetentionColor(100);
      expect(color).toContain('hsl(120');
    });

    it('should clamp values outside 0-100 range', () => {
      const colorNegative = getCohortRetentionColor(-10);
      const colorOver = getCohortRetentionColor(150);
      
      expect(colorNegative).toContain('hsl(0'); // Clamped to 0
      expect(colorOver).toContain('hsl(120');   // Clamped to 100
    });
    
    it('should produce valid HSL colors for any retention value', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 100, noNaN: true }),
          (retention) => {
            const color = getCohortRetentionColor(retention);
            // Should be a valid HSL string (allowing scientific notation for very small numbers)
            expect(color).toMatch(/^hsl\([0-9.e+-]+, \d+%, \d+%\)$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property tests for cohort bad retention detection
   */
  describe('Cohort Bad Retention Detection', () => {
    it('should detect bad retention when month 3 is below 50%', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 49.99, noNaN: true }),
          (month3Retention) => {
            const retentionByMonth = [100, 80, 60, month3Retention];
            expect(hasBadRetentionAtMonth3(retentionByMonth)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not flag as bad when month 3 is 50% or above', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 50, max: 100, noNaN: true }),
          (month3Retention) => {
            const retentionByMonth = [100, 80, 60, month3Retention];
            expect(hasBadRetentionAtMonth3(retentionByMonth)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false if data does not have month 3', () => {
      expect(hasBadRetentionAtMonth3([100, 80, 60])).toBe(false);
      expect(hasBadRetentionAtMonth3([100])).toBe(false);
      expect(hasBadRetentionAtMonth3([])).toBe(false);
    });
  });

  /**
   * Unit tests for calculation functions
   */
  describe('Calculation Functions', () => {
    it('should calculate LTV:CAC ratio correctly', () => {
      expect(calculateLTVCACRatio(3000000, 500000)).toBe(6);
      expect(calculateLTVCACRatio(1500000, 500000)).toBe(3);
      expect(calculateLTVCACRatio(1000000, 500000)).toBe(2);
    });

    it('should handle zero CAC in LTV:CAC calculation', () => {
      expect(calculateLTVCACRatio(1000000, 0)).toBe(Infinity);
      expect(calculateLTVCACRatio(0, 0)).toBe(0);
    });

    it('should calculate MRR growth correctly', () => {
      expect(calculateMRRGrowth(110, 100)).toBe(10);
      expect(calculateMRRGrowth(90, 100)).toBe(-10);
      expect(calculateMRRGrowth(100, 100)).toBe(0);
    });

    it('should handle zero previous MRR in growth calculation', () => {
      expect(calculateMRRGrowth(100, 0)).toBe(100);
      expect(calculateMRRGrowth(0, 0)).toBe(0);
    });
  });
});
