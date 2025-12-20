/**
 * Metrics Calculator Module
 * Business logic for SaaS unit economics calculations
 */

import type {
  ColorIndicator,
  MetricStatus,
  ThresholdConfig,
  DEFAULT_THRESHOLDS,
} from '../../types/admin';

// Re-export default thresholds
export { DEFAULT_THRESHOLDS } from '../../types/admin';

// ============================================
// LTV:CAC Ratio Color Indicator
// ============================================

/**
 * Get color indicator for LTV:CAC ratio
 * - Red: ratio < 3 (unhealthy)
 * - Amber: 3 <= ratio < 5 (acceptable)
 * - Green: ratio >= 5 (healthy)
 * 
 * @param ratio - LTV:CAC ratio value
 * @returns ColorIndicator ('red' | 'amber' | 'green')
 */
export function getLTVCACColorIndicator(ratio: number): ColorIndicator {
  if (ratio < 3) {
    return 'red';
  }
  if (ratio < 5) {
    return 'amber';
  }
  return 'green';
}

/**
 * Get metric status for LTV:CAC ratio
 */
export function getLTVCACStatus(ratio: number): MetricStatus {
  const color = getLTVCACColorIndicator(ratio);
  if (color === 'red') return 'critical';
  if (color === 'amber') return 'warning';
  return 'healthy';
}

// ============================================
// NRR Health Indicator
// ============================================

/**
 * Get color indicator for Net Revenue Retention
 * - Green: NRR > 100% (expansion)
 * - Red: NRR <= 100% (contraction)
 * 
 * @param nrr - Net Revenue Retention percentage
 * @returns ColorIndicator ('red' | 'green')
 */
export function getNRRColorIndicator(nrr: number): ColorIndicator {
  return nrr > 100 ? 'green' : 'red';
}

/**
 * Get metric status for NRR
 */
export function getNRRStatus(nrr: number): MetricStatus {
  return nrr > 100 ? 'healthy' : 'critical';
}

// ============================================
// MRR Change Direction
// ============================================

/**
 * Get direction indicator for MRR change
 * - 'up': positive change (green)
 * - 'down': negative change (red)
 * - 'neutral': no change
 * 
 * @param change - MRR change percentage
 * @returns Direction string
 */
export function getMRRChangeDirection(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Get color for MRR change
 */
export function getMRRChangeColor(change: number): ColorIndicator {
  if (change > 0) return 'green';
  if (change < 0) return 'red';
  return 'amber';
}

// ============================================
// DAU/MAU Ratio Health
// ============================================

/**
 * Get health indicator for DAU/MAU ratio
 * - Green: ratio >= 20% (healthy engagement)
 * - Amber: ratio < 20% (low engagement)
 * 
 * @param ratio - DAU/MAU ratio percentage
 * @returns MetricStatus
 */
export function getDAUMAUStatus(ratio: number): MetricStatus {
  return ratio >= 20 ? 'healthy' : 'warning';
}

/**
 * Get color for DAU/MAU ratio
 */
export function getDAUMAUColorIndicator(ratio: number): ColorIndicator {
  return ratio >= 20 ? 'green' : 'amber';
}

// ============================================
// Payback Period Health
// ============================================

/**
 * Get health indicator for Payback Period
 * - Green: <= 12 months (healthy)
 * - Amber: > 12 months (warning)
 * 
 * @param months - Payback period in months
 * @returns MetricStatus
 */
export function getPaybackPeriodStatus(months: number): MetricStatus {
  return months <= 12 ? 'healthy' : 'warning';
}

/**
 * Get color for Payback Period
 */
export function getPaybackPeriodColorIndicator(months: number): ColorIndicator {
  return months <= 12 ? 'green' : 'amber';
}

// ============================================
// Cash Runway Health
// ============================================

/**
 * Get health indicator for Cash Runway
 * - Green: >= 12 months (healthy)
 * - Amber: 6-12 months (warning)
 * - Red: < 6 months (critical)
 * 
 * @param months - Cash runway in months
 * @returns MetricStatus
 */
export function getCashRunwayStatus(months: number): MetricStatus {
  if (months < 6) return 'critical';
  if (months < 12) return 'warning';
  return 'healthy';
}

/**
 * Get color for Cash Runway
 */
export function getCashRunwayColorIndicator(months: number): ColorIndicator {
  if (months < 6) return 'red';
  if (months < 12) return 'amber';
  return 'green';
}

// ============================================
// Cohort Retention Color Gradient
// ============================================

/**
 * Get color for cohort retention percentage
 * Uses a gradient from red (0%) to green (100%)
 * 
 * @param retention - Retention percentage (0-100)
 * @returns HSL color string
 */
export function getCohortRetentionColor(retention: number): string {
  // Clamp retention between 0 and 100
  const clampedRetention = Math.max(0, Math.min(100, retention));
  
  // Map retention to hue: 0 (red) to 120 (green)
  // Lower retention = more red, higher retention = more green
  const hue = (clampedRetention / 100) * 120;
  
  // Use fixed saturation and lightness for consistency
  const saturation = 70;
  const lightness = 45;
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get opacity for cohort retention (for heatmap intensity)
 * 
 * @param retention - Retention percentage (0-100)
 * @returns Opacity value (0.3-1.0)
 */
export function getCohortRetentionOpacity(retention: number): number {
  const clampedRetention = Math.max(0, Math.min(100, retention));
  // Map 0-100 to 0.3-1.0 opacity
  return 0.3 + (clampedRetention / 100) * 0.7;
}

/**
 * Check if cohort has bad retention (< 50% at month 3)
 * 
 * @param retentionByMonth - Array of retention percentages
 * @returns boolean
 */
export function hasBadRetentionAtMonth3(retentionByMonth: number[]): boolean {
  // Month 3 is index 3 (M0, M1, M2, M3)
  if (retentionByMonth.length < 4) return false;
  return retentionByMonth[3] < 50;
}

// ============================================
// Metric Calculations
// ============================================

/**
 * Calculate MRR Growth percentage
 * 
 * @param currentMRR - Current month MRR
 * @param previousMRR - Previous month MRR
 * @returns Growth percentage
 */
export function calculateMRRGrowth(currentMRR: number, previousMRR: number): number {
  if (previousMRR === 0) return currentMRR > 0 ? 100 : 0;
  return ((currentMRR - previousMRR) / previousMRR) * 100;
}

/**
 * Calculate Customer Churn Rate
 * 
 * @param churnedCustomers - Number of churned customers
 * @param totalCustomersAtStart - Total customers at start of period
 * @returns Churn rate percentage
 */
export function calculateCustomerChurn(
  churnedCustomers: number,
  totalCustomersAtStart: number
): number {
  if (totalCustomersAtStart === 0) return 0;
  return (churnedCustomers / totalCustomersAtStart) * 100;
}

/**
 * Calculate Revenue Churn Rate
 * 
 * @param churnedRevenue - Revenue lost from churned customers
 * @param totalRevenueAtStart - Total revenue at start of period
 * @returns Revenue churn rate percentage
 */
export function calculateRevenueChurn(
  churnedRevenue: number,
  totalRevenueAtStart: number
): number {
  if (totalRevenueAtStart === 0) return 0;
  return (churnedRevenue / totalRevenueAtStart) * 100;
}

/**
 * Calculate Net Revenue Retention (NRR)
 * NRR = (Starting MRR + Expansion - Contraction - Churn) / Starting MRR * 100
 * 
 * @param startingMRR - MRR at start of period
 * @param expansion - Revenue from upsells/cross-sells
 * @param contraction - Revenue lost from downgrades
 * @param churn - Revenue lost from churned customers
 * @returns NRR percentage
 */
export function calculateNRR(
  startingMRR: number,
  expansion: number,
  contraction: number,
  churn: number
): number {
  if (startingMRR === 0) return 0;
  return ((startingMRR + expansion - contraction - churn) / startingMRR) * 100;
}

/**
 * Calculate LTV:CAC Ratio
 * 
 * @param ltv - Lifetime Value
 * @param cac - Customer Acquisition Cost
 * @returns LTV:CAC ratio
 */
export function calculateLTVCACRatio(ltv: number, cac: number): number {
  if (cac === 0) return ltv > 0 ? Infinity : 0;
  return ltv / cac;
}

/**
 * Calculate ARPU (Average Revenue Per User)
 * 
 * @param totalRevenue - Total revenue
 * @param totalUsers - Total active users
 * @returns ARPU
 */
export function calculateARPU(totalRevenue: number, totalUsers: number): number {
  if (totalUsers === 0) return 0;
  return totalRevenue / totalUsers;
}

/**
 * Calculate DAU/MAU Ratio
 * 
 * @param dau - Daily Active Users
 * @param mau - Monthly Active Users
 * @returns DAU/MAU ratio percentage
 */
export function calculateDAUMAURatio(dau: number, mau: number): number {
  if (mau === 0) return 0;
  return (dau / mau) * 100;
}

/**
 * Calculate Payback Period (in months)
 * 
 * @param cac - Customer Acquisition Cost
 * @param monthlyRevenue - Monthly revenue per customer (ARPU)
 * @param grossMargin - Gross margin percentage (0-100)
 * @returns Payback period in months
 */
export function calculatePaybackPeriod(
  cac: number,
  monthlyRevenue: number,
  grossMargin: number = 80
): number {
  const marginDecimal = grossMargin / 100;
  const monthlyGrossProfit = monthlyRevenue * marginDecimal;
  if (monthlyGrossProfit === 0) return Infinity;
  return cac / monthlyGrossProfit;
}

/**
 * Calculate Cash Runway
 * 
 * @param cashBalance - Current cash balance
 * @param monthlyBurnRate - Monthly burn rate
 * @returns Runway in months
 */
export function calculateCashRunway(
  cashBalance: number,
  monthlyBurnRate: number
): number {
  if (monthlyBurnRate <= 0) return Infinity;
  return cashBalance / monthlyBurnRate;
}

// ============================================
// Formatting Utilities
// ============================================

/**
 * Format currency in Indonesian Rupiah
 * 
 * @param value - Currency value
 * @param compact - Use compact notation (e.g., 125.5M)
 * @returns Formatted string
 */
export function formatCurrency(value: number, compact: boolean = false): string {
  if (compact) {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(1)}K`;
    }
  }
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage
 * 
 * @param value - Percentage value
 * @param decimals - Number of decimal places
 * @returns Formatted string with % suffix
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format percentage change with sign
 * 
 * @param value - Change percentage
 * @returns Formatted string with +/- prefix
 */
export function formatPercentageChange(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format months
 * 
 * @param months - Number of months
 * @returns Formatted string
 */
export function formatMonths(months: number): string {
  if (months === Infinity) return '∞';
  return `${months.toFixed(0)} bulan`;
}

/**
 * Format ratio
 * 
 * @param ratio - Ratio value
 * @returns Formatted string (e.g., "6.0:1")
 */
export function formatRatio(ratio: number): string {
  if (ratio === Infinity) return '∞:1';
  return `${ratio.toFixed(1)}:1`;
}
