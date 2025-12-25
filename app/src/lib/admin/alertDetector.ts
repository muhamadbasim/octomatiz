/**
 * Alert Detector Module
 * Logic for detecting danger zone alerts based on metric thresholds
 */

import type {
  DangerAlert,
  AlertSeverity,
  ThresholdConfig,
  DEFAULT_THRESHOLDS,
} from '../../types/admin';

// Re-export default thresholds
export { DEFAULT_THRESHOLDS } from '../../types/admin';

// ============================================
// Alert ID Generator
// ============================================

let alertIdCounter = 0;

function generateAlertId(): string {
  alertIdCounter += 1;
  return `alert-${Date.now()}-${alertIdCounter}`;
}

// ============================================
// CAC Alert Detection
// ============================================

/**
 * Check if CAC increase exceeds threshold
 * Alert triggered when CAC increases by more than 20% in one week
 * 
 * @param currentCAC - Current CAC value
 * @param previousCAC - CAC value from one week ago
 * @param threshold - Percentage threshold (default 20%)
 * @returns boolean indicating if alert should be triggered
 */
export function shouldTriggerCACAlert(
  currentCAC: number,
  previousCAC: number,
  threshold: number = 20
): boolean {
  if (previousCAC <= 0) return false;
  
  const changePercent = ((currentCAC - previousCAC) / previousCAC) * 100;
  return changePercent > threshold;
}

/**
 * Calculate CAC change percentage
 * 
 * @param currentCAC - Current CAC value
 * @param previousCAC - Previous CAC value
 * @returns Change percentage
 */
export function calculateCACChange(
  currentCAC: number,
  previousCAC: number
): number {
  if (previousCAC <= 0) return 0;
  return ((currentCAC - previousCAC) / previousCAC) * 100;
}

/**
 * Create CAC alert if threshold exceeded
 * 
 * @param currentCAC - Current CAC value
 * @param previousCAC - Previous CAC value
 * @param threshold - Percentage threshold
 * @returns DangerAlert or null
 */
export function createCACAlert(
  currentCAC: number,
  previousCAC: number,
  threshold: number = 20
): DangerAlert | null {
  if (!shouldTriggerCACAlert(currentCAC, previousCAC, threshold)) {
    return null;
  }
  
  const changePercent = calculateCACChange(currentCAC, previousCAC);
  
  return {
    id: generateAlertId(),
    metric: 'CAC',
    metricLabel: 'Customer Acquisition Cost',
    currentValue: currentCAC,
    previousValue: previousCAC,
    changePercent,
    threshold,
    severity: changePercent > 40 ? 'critical' : 'warning',
    timestamp: new Date(),
    message: `CAC naik ${changePercent.toFixed(1)}% dalam 1 minggu terakhir`,
  };
}

// ============================================
// Churn Alert Detection
// ============================================

/**
 * Check if Churn increase exceeds threshold
 * Alert triggered when Churn increases by more than 2% in one week
 * 
 * @param currentChurn - Current churn rate (percentage)
 * @param previousChurn - Churn rate from one week ago (percentage)
 * @param threshold - Percentage point threshold (default 2%)
 * @returns boolean indicating if alert should be triggered
 */
export function shouldTriggerChurnAlert(
  currentChurn: number,
  previousChurn: number,
  threshold: number = 2
): boolean {
  // Churn alert is based on percentage point increase, not percentage change
  const changePoints = currentChurn - previousChurn;
  return changePoints > threshold;
}

/**
 * Calculate Churn change in percentage points
 * 
 * @param currentChurn - Current churn rate
 * @param previousChurn - Previous churn rate
 * @returns Change in percentage points
 */
export function calculateChurnChange(
  currentChurn: number,
  previousChurn: number
): number {
  return currentChurn - previousChurn;
}

/**
 * Create Churn alert if threshold exceeded
 * 
 * @param currentChurn - Current churn rate
 * @param previousChurn - Previous churn rate
 * @param threshold - Percentage point threshold
 * @returns DangerAlert or null
 */
export function createChurnAlert(
  currentChurn: number,
  previousChurn: number,
  threshold: number = 2
): DangerAlert | null {
  if (!shouldTriggerChurnAlert(currentChurn, previousChurn, threshold)) {
    return null;
  }
  
  const changePoints = calculateChurnChange(currentChurn, previousChurn);
  
  return {
    id: generateAlertId(),
    metric: 'Churn',
    metricLabel: 'Customer Churn Rate',
    currentValue: currentChurn,
    previousValue: previousChurn,
    changePercent: changePoints,
    threshold,
    severity: changePoints > 5 ? 'critical' : 'warning',
    timestamp: new Date(),
    message: `Churn naik ${changePoints.toFixed(1)}% dalam 1 minggu terakhir`,
  };
}

// ============================================
// Cash Runway Alert Detection
// ============================================

/**
 * Check if Cash Runway is critically low
 * Alert triggered when runway is less than 6 months
 * 
 * @param runwayMonths - Cash runway in months
 * @param threshold - Months threshold (default 6)
 * @returns boolean indicating if alert should be triggered
 */
export function shouldTriggerRunwayAlert(
  runwayMonths: number,
  threshold: number = 6
): boolean {
  return runwayMonths < threshold;
}

/**
 * Create Cash Runway alert if below threshold
 * 
 * @param runwayMonths - Current runway in months
 * @param previousRunway - Previous runway (optional, for change calculation)
 * @param threshold - Months threshold
 * @returns DangerAlert or null
 */
export function createRunwayAlert(
  runwayMonths: number,
  previousRunway: number = runwayMonths,
  threshold: number = 6
): DangerAlert | null {
  if (!shouldTriggerRunwayAlert(runwayMonths, threshold)) {
    return null;
  }
  
  const changePercent = previousRunway > 0 
    ? ((runwayMonths - previousRunway) / previousRunway) * 100 
    : 0;
  
  return {
    id: generateAlertId(),
    metric: 'Cash Runway',
    metricLabel: 'Cash Runway',
    currentValue: runwayMonths,
    previousValue: previousRunway,
    changePercent,
    threshold,
    severity: runwayMonths < 3 ? 'critical' : 'warning',
    timestamp: new Date(),
    message: `Cash runway tersisa ${runwayMonths} bulan (di bawah ${threshold} bulan)`,
  };
}

// ============================================
// Alert Collection and Sorting
// ============================================

/**
 * Sort alerts by severity (critical first) then by timestamp (newest first)
 * 
 * @param alerts - Array of alerts to sort
 * @returns Sorted array of alerts
 */
export function sortAlertsBySeverity(alerts: DangerAlert[]): DangerAlert[] {
  return [...alerts].sort((a, b) => {
    // Critical alerts first
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    
    // Then by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
}

/**
 * Detect all alerts based on current and previous metrics
 * 
 * @param metrics - Object containing current and previous metric values
 * @param thresholds - Custom thresholds (optional)
 * @returns Array of detected alerts, sorted by severity
 */
export function detectAllAlerts(
  metrics: {
    currentCAC: number;
    previousCAC: number;
    currentChurn: number;
    previousChurn: number;
    cashRunway: number;
    previousRunway?: number;
  },
  thresholds: Partial<ThresholdConfig> = {}
): DangerAlert[] {
  const alerts: DangerAlert[] = [];
  
  // Check CAC alert
  const cacAlert = createCACAlert(
    metrics.currentCAC,
    metrics.previousCAC,
    thresholds.cacAlertThreshold ?? 20
  );
  if (cacAlert) alerts.push(cacAlert);
  
  // Check Churn alert
  const churnAlert = createChurnAlert(
    metrics.currentChurn,
    metrics.previousChurn,
    thresholds.churnAlertThreshold ?? 2
  );
  if (churnAlert) alerts.push(churnAlert);
  
  // Check Cash Runway alert
  const runwayAlert = createRunwayAlert(
    metrics.cashRunway,
    metrics.previousRunway ?? metrics.cashRunway,
    thresholds.runwayCritical ?? 6
  );
  if (runwayAlert) alerts.push(runwayAlert);
  
  return sortAlertsBySeverity(alerts);
}

/**
 * Check if there are any active alerts
 * 
 * @param alerts - Array of alerts
 * @returns boolean
 */
export function hasActiveAlerts(alerts: DangerAlert[]): boolean {
  return alerts.length > 0;
}

/**
 * Get count of critical alerts
 * 
 * @param alerts - Array of alerts
 * @returns Number of critical alerts
 */
export function getCriticalAlertCount(alerts: DangerAlert[]): number {
  return alerts.filter(a => a.severity === 'critical').length;
}

/**
 * Get count of warning alerts
 * 
 * @param alerts - Array of alerts
 * @returns Number of warning alerts
 */
export function getWarningAlertCount(alerts: DangerAlert[]): number {
  return alerts.filter(a => a.severity === 'warning').length;
}
