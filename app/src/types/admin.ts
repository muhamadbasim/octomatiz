/**
 * Admin Dashboard Types
 * Types for SaaS unit economics and truth metrics
 */

// ============================================
// Metric Status Types
// ============================================

export type MetricStatus = 'healthy' | 'warning' | 'critical';
export type AlertSeverity = 'warning' | 'critical';
export type SegmentType = 'all' | 'basic' | 'premium';

// ============================================
// Vital Signs Metrics
// ============================================

export interface VitalMetrics {
  mrr: number;                    // Monthly Recurring Revenue (currency)
  mrrGrowth: number;              // MRR growth percentage (MoM)
  customerChurn: number;          // Customer churn rate (percentage)
  revenueChurn: number;           // Revenue churn rate (percentage)
  nrr: number;                    // Net Revenue Retention (percentage, >100 = expansion)
}

// ============================================
// Efficiency Metrics
// ============================================

export interface EfficiencyMetrics {
  cac: number;                    // Customer Acquisition Cost (currency)
  ltv: number;                    // Lifetime Value (currency)
  ltvCacRatio: number;            // LTV:CAC ratio (healthy if >= 3)
  cacTrend: number;               // CAC change percentage (week over week)
}

// ============================================
// Sustainability Metrics
// ============================================

export interface SustainabilityMetrics {
  paybackPeriod: number;          // Months to recover CAC
  burnRate: number;               // Monthly cash outflow (currency)
  cashRunway: number;             // Months of runway remaining
  burnRateTrend: number[];        // Last 3 months burn rate
}

// ============================================
// Product Health Metrics
// ============================================

export interface ProductMetrics {
  arpu: number;                   // Average Revenue Per User (currency)
  arpuBySegment: {
    basic: number;
    premium: number;
  };
  dauMauRatio: number;            // DAU/MAU ratio (percentage, healthy if >= 20%)
  arpuChange: number;             // ARPU change percentage
}

// ============================================
// Cohort Analysis
// ============================================

export interface CohortData {
  cohortMonth: string;            // Format: "2024-01"
  cohortLabel: string;            // Display label: "Jan 2024"
  userCount: number;              // Users in this cohort
  retentionByMonth: number[];     // [100, 85, 72, 65, ...] percentages
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  months: string[];               // Column headers: ["M0", "M1", "M2", ...]
}

// ============================================
// Danger Zone Alerts
// ============================================

export interface DangerAlert {
  id: string;
  metric: string;                 // "CAC", "Churn", "Cash Runway"
  metricLabel: string;            // Display label
  currentValue: number;
  previousValue: number;
  changePercent: number;
  threshold: number;              // The threshold that was exceeded
  severity: AlertSeverity;
  timestamp: Date;
  message: string;                // Human-readable alert message
}

// ============================================
// MRR Trend Data
// ============================================

export interface MRRTrendData {
  month: string;                  // Format: "2024-01"
  monthLabel: string;             // Display: "Jan"
  mrr: number;
  growth: number;                 // Growth from previous month
}

// ============================================
// LTV:CAC Chart Data
// ============================================

export interface LTVCACChartData {
  segment: string;
  segmentLabel: string;
  ltv: number;
  cac: number;
  ratio: number;
  status: MetricStatus;
}

// ============================================
// Segment Filter
// ============================================

export interface SegmentFilter {
  type: SegmentType;
  label: string;
}

export const SEGMENT_OPTIONS: SegmentFilter[] = [
  { type: 'all', label: 'Semua' },
  { type: 'basic', label: 'Basic' },
  { type: 'premium', label: 'Premium' },
];

// ============================================
// Dashboard State
// ============================================

export interface DashboardMetrics {
  vital: VitalMetrics;
  efficiency: EfficiencyMetrics;
  sustainability: SustainabilityMetrics;
  product: ProductMetrics;
  mrrTrend: MRRTrendData[];
  cohortAnalysis: CohortAnalysis;
  ltvCacBySegment: LTVCACChartData[];
  alerts: DangerAlert[];
  lastUpdated: Date;
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  selectedSegment: SegmentType;
}

// ============================================
// API Response Types
// ============================================

export interface MetricsAPIResponse {
  success: boolean;
  data?: DashboardMetrics;
  error?: string;
}

// ============================================
// Component Props Types
// ============================================

export interface MetricCardProps {
  title: string;
  value: string | number;
  formattedValue?: string;
  change?: number;
  changeLabel?: string;
  status?: MetricStatus;
  tooltip?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  prefix?: string;
  suffix?: string;
}

export interface MRRHeaderProps {
  mrr: number;
  mrrGrowth: number;
  lastUpdated: Date | string;
  isLoading?: boolean;
}

export interface DangerZoneProps {
  alerts: DangerAlert[];
  isLoading?: boolean;
}

export interface SegmentFilterProps {
  selected: SegmentType;
  onChange: (segment: SegmentType) => void;
}

export interface VitalSignsSectionProps {
  metrics: VitalMetrics;
  isLoading?: boolean;
}

export interface EfficiencySectionProps {
  metrics: EfficiencyMetrics;
  isLoading?: boolean;
}

export interface SustainabilitySectionProps {
  metrics: SustainabilityMetrics;
  isLoading?: boolean;
}

export interface ProductHealthSectionProps {
  metrics: ProductMetrics;
  isLoading?: boolean;
}

export interface MRRTrendChartProps {
  data: MRRTrendData[];
  isLoading?: boolean;
}

export interface LTVCACBarChartProps {
  data: LTVCACChartData[];
  isLoading?: boolean;
}

export interface CohortHeatmapProps {
  data: CohortAnalysis;
  isLoading?: boolean;
}

// ============================================
// Utility Types
// ============================================

export type ColorIndicator = 'red' | 'amber' | 'green';

export interface ThresholdConfig {
  ltvCacHealthy: number;          // >= 5 is green
  ltvCacWarning: number;          // >= 3 is amber
  nrrHealthy: number;             // > 100 is green
  dauMauHealthy: number;          // >= 20 is healthy
  paybackWarning: number;         // > 12 months is warning
  runwayCritical: number;         // < 6 months is critical
  cacAlertThreshold: number;      // > 20% increase triggers alert
  churnAlertThreshold: number;    // > 2% increase triggers alert
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  ltvCacHealthy: 5,
  ltvCacWarning: 3,
  nrrHealthy: 100,
  dauMauHealthy: 20,
  paybackWarning: 12,
  runwayCritical: 6,
  cacAlertThreshold: 20,
  churnAlertThreshold: 2,
};
