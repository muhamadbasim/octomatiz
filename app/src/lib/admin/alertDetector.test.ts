/**
 * Property-Based Tests for Alert Detector
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  shouldTriggerCACAlert,
  shouldTriggerChurnAlert,
  shouldTriggerRunwayAlert,
  createCACAlert,
  createChurnAlert,
  createRunwayAlert,
  sortAlertsBySeverity,
  detectAllAlerts,
  calculateCACChange,
  calculateChurnChange,
} from './alertDetector';
import type { DangerAlert } from '../../types/admin';

describe('Alert Detector', () => {
  /**
   * Feature: admin-dashboard, Property 2: Danger Zone Alert Threshold Accuracy (CAC)
   * *For any* CAC increase greater than 20% within one week, 
   * the Danger Zone SHALL contain an alert for that metric
   * **Validates: Requirements 7.1**
   */
  describe('Property 2: CAC Alert Threshold', () => {
    it('should trigger alert for any CAC increase greater than 20%', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 100, max: 10000, noNaN: true }), // previousCAC
          fc.double({ min: 1.201, max: 3, noNaN: true }),   // multiplier > 1.2 (>20% increase)
          (previousCAC, multiplier) => {
            const currentCAC = previousCAC * multiplier;
            const shouldAlert = shouldTriggerCACAlert(currentCAC, previousCAC, 20);
            expect(shouldAlert).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert for CAC increase of 20% or less', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 100, max: 10000, noNaN: true }), // previousCAC
          fc.double({ min: 0.5, max: 1.2, noNaN: true }),   // multiplier <= 1.2 (<=20% increase)
          (previousCAC, multiplier) => {
            const currentCAC = previousCAC * multiplier;
            const shouldAlert = shouldTriggerCACAlert(currentCAC, previousCAC, 20);
            expect(shouldAlert).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create alert with correct data when threshold exceeded', () => {
      const previousCAC = 500000;
      const currentCAC = 650000; // 30% increase
      
      const alert = createCACAlert(currentCAC, previousCAC, 20);
      
      expect(alert).not.toBeNull();
      expect(alert?.metric).toBe('CAC');
      expect(alert?.currentValue).toBe(currentCAC);
      expect(alert?.previousValue).toBe(previousCAC);
      expect(alert?.changePercent).toBeCloseTo(30, 1);
      expect(alert?.threshold).toBe(20);
    });

    it('should return null when threshold not exceeded', () => {
      const previousCAC = 500000;
      const currentCAC = 550000; // 10% increase
      
      const alert = createCACAlert(currentCAC, previousCAC, 20);
      
      expect(alert).toBeNull();
    });

    it('should handle zero previous CAC gracefully', () => {
      expect(shouldTriggerCACAlert(100, 0, 20)).toBe(false);
      expect(createCACAlert(100, 0, 20)).toBeNull();
    });

    it('should calculate CAC change correctly', () => {
      expect(calculateCACChange(120, 100)).toBeCloseTo(20, 1);
      expect(calculateCACChange(150, 100)).toBeCloseTo(50, 1);
      expect(calculateCACChange(80, 100)).toBeCloseTo(-20, 1);
    });
  });

  /**
   * Feature: admin-dashboard, Property 3: Churn Alert Threshold Accuracy
   * *For any* Churn Rate increase greater than 2% within one week,
   * the Danger Zone SHALL contain an alert for that metric
   * **Validates: Requirements 7.2**
   */
  describe('Property 3: Churn Alert Threshold', () => {
    it('should trigger alert for any Churn increase greater than 2 percentage points', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 10, noNaN: true }),      // previousChurn
          fc.double({ min: 2.01, max: 10, noNaN: true }),   // increase > 2 points
          (previousChurn, increase) => {
            const currentChurn = previousChurn + increase;
            const shouldAlert = shouldTriggerChurnAlert(currentChurn, previousChurn, 2);
            expect(shouldAlert).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert for Churn increase of 2 percentage points or less', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 10, noNaN: true }),      // previousChurn
          fc.double({ min: -5, max: 2, noNaN: true }),      // increase <= 2 points
          (previousChurn, increase) => {
            const currentChurn = Math.max(0, previousChurn + increase);
            const shouldAlert = shouldTriggerChurnAlert(currentChurn, previousChurn, 2);
            expect(shouldAlert).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create alert with correct data when threshold exceeded', () => {
      const previousChurn = 3.0;
      const currentChurn = 5.5; // 2.5 point increase
      
      const alert = createChurnAlert(currentChurn, previousChurn, 2);
      
      expect(alert).not.toBeNull();
      expect(alert?.metric).toBe('Churn');
      expect(alert?.currentValue).toBe(currentChurn);
      expect(alert?.previousValue).toBe(previousChurn);
      expect(alert?.changePercent).toBeCloseTo(2.5, 1);
      expect(alert?.threshold).toBe(2);
    });

    it('should return null when threshold not exceeded', () => {
      const previousChurn = 3.0;
      const currentChurn = 4.5; // 1.5 point increase
      
      const alert = createChurnAlert(currentChurn, previousChurn, 2);
      
      expect(alert).toBeNull();
    });

    it('should calculate Churn change correctly', () => {
      expect(calculateChurnChange(5, 3)).toBeCloseTo(2, 1);
      expect(calculateChurnChange(8, 3)).toBeCloseTo(5, 1);
      expect(calculateChurnChange(2, 3)).toBeCloseTo(-1, 1);
    });
  });

  /**
   * Feature: admin-dashboard, Property 8: Cash Runway Critical Alert
   * *For any* Cash Runway value less than 6 months, 
   * the dashboard SHALL display a critical alert indicator
   * **Validates: Requirements 4.4**
   */
  describe('Property 8: Cash Runway Alert', () => {
    it('should trigger alert for any runway less than 6 months', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 5.99, noNaN: true }),
          (runwayMonths) => {
            const shouldAlert = shouldTriggerRunwayAlert(runwayMonths, 6);
            expect(shouldAlert).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert for runway of 6 months or more', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 6, max: 100, noNaN: true }),
          (runwayMonths) => {
            const shouldAlert = shouldTriggerRunwayAlert(runwayMonths, 6);
            expect(shouldAlert).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create alert with correct data when below threshold', () => {
      const runwayMonths = 4;
      
      const alert = createRunwayAlert(runwayMonths, 6, 6);
      
      expect(alert).not.toBeNull();
      expect(alert?.metric).toBe('Cash Runway');
      expect(alert?.currentValue).toBe(runwayMonths);
      expect(alert?.threshold).toBe(6);
    });

    it('should return null when above threshold', () => {
      const runwayMonths = 8;
      
      const alert = createRunwayAlert(runwayMonths, 10, 6);
      
      expect(alert).toBeNull();
    });

    it('should mark runway < 3 months as critical severity', () => {
      const alert = createRunwayAlert(2, 4, 6);
      expect(alert?.severity).toBe('critical');
    });

    it('should mark runway 3-6 months as warning severity', () => {
      const alert = createRunwayAlert(4, 6, 6);
      expect(alert?.severity).toBe('warning');
    });
  });

  /**
   * Alert Sorting Tests
   */
  describe('Alert Sorting', () => {
    it('should sort critical alerts before warning alerts', () => {
      const alerts: DangerAlert[] = [
        {
          id: '1',
          metric: 'CAC',
          metricLabel: 'CAC',
          currentValue: 100,
          previousValue: 80,
          changePercent: 25,
          threshold: 20,
          severity: 'warning',
          timestamp: new Date('2024-12-20T10:00:00'),
          message: 'Warning',
        },
        {
          id: '2',
          metric: 'Churn',
          metricLabel: 'Churn',
          currentValue: 8,
          previousValue: 3,
          changePercent: 5,
          threshold: 2,
          severity: 'critical',
          timestamp: new Date('2024-12-20T09:00:00'),
          message: 'Critical',
        },
      ];
      
      const sorted = sortAlertsBySeverity(alerts);
      
      expect(sorted[0].severity).toBe('critical');
      expect(sorted[1].severity).toBe('warning');
    });

    it('should sort by timestamp within same severity (newest first)', () => {
      const alerts: DangerAlert[] = [
        {
          id: '1',
          metric: 'CAC',
          metricLabel: 'CAC',
          currentValue: 100,
          previousValue: 80,
          changePercent: 25,
          threshold: 20,
          severity: 'warning',
          timestamp: new Date('2024-12-20T08:00:00'),
          message: 'Older',
        },
        {
          id: '2',
          metric: 'Churn',
          metricLabel: 'Churn',
          currentValue: 5,
          previousValue: 3,
          changePercent: 2.5,
          threshold: 2,
          severity: 'warning',
          timestamp: new Date('2024-12-20T10:00:00'),
          message: 'Newer',
        },
      ];
      
      const sorted = sortAlertsBySeverity(alerts);
      
      expect(sorted[0].id).toBe('2'); // Newer
      expect(sorted[1].id).toBe('1'); // Older
    });
  });

  /**
   * Detect All Alerts Integration Test
   */
  describe('Detect All Alerts', () => {
    it('should detect multiple alerts when multiple thresholds exceeded', () => {
      const alerts = detectAllAlerts({
        currentCAC: 650000,
        previousCAC: 500000,  // 30% increase
        currentChurn: 6,
        previousChurn: 3,     // 3 point increase
        cashRunway: 4,        // Below 6 months
      });
      
      expect(alerts.length).toBe(3);
      expect(alerts.some(a => a.metric === 'CAC')).toBe(true);
      expect(alerts.some(a => a.metric === 'Churn')).toBe(true);
      expect(alerts.some(a => a.metric === 'Cash Runway')).toBe(true);
    });

    it('should return empty array when no thresholds exceeded', () => {
      const alerts = detectAllAlerts({
        currentCAC: 510000,
        previousCAC: 500000,  // 2% increase
        currentChurn: 3.5,
        previousChurn: 3,     // 0.5 point increase
        cashRunway: 12,       // Above 6 months
      });
      
      expect(alerts.length).toBe(0);
    });

    it('should return alerts sorted by severity', () => {
      const alerts = detectAllAlerts({
        currentCAC: 650000,
        previousCAC: 500000,  // Warning
        currentChurn: 3.5,
        previousChurn: 3,     // No alert
        cashRunway: 2,        // Critical
      });
      
      expect(alerts.length).toBe(2);
      expect(alerts[0].severity).toBe('critical'); // Runway first
      expect(alerts[1].severity).toBe('warning');  // CAC second
    });
  });
});
