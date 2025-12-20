/**
 * Mock Data for Admin Dashboard Development
 * Realistic sample data for SaaS metrics
 */

import type {
  DashboardMetrics,
  VitalMetrics,
  EfficiencyMetrics,
  SustainabilityMetrics,
  ProductMetrics,
  MRRTrendData,
  CohortAnalysis,
  CohortData,
  LTVCACChartData,
  DangerAlert,
} from '../../types/admin';

// ============================================
// Vital Signs Mock Data
// ============================================

export const mockVitalMetrics: VitalMetrics = {
  mrr: 125_500_000,           // Rp 125.5M
  mrrGrowth: 12.3,            // +12.3% MoM
  customerChurn: 3.2,         // 3.2% customer churn
  revenueChurn: 2.8,          // 2.8% revenue churn
  nrr: 108.5,                 // 108.5% NRR (expansion)
};

// ============================================
// Efficiency Mock Data
// ============================================

export const mockEfficiencyMetrics: EfficiencyMetrics = {
  cac: 450_000,               // Rp 450K CAC
  ltv: 2_700_000,             // Rp 2.7M LTV
  ltvCacRatio: 6.0,           // 6:1 ratio (healthy)
  cacTrend: 5.2,              // +5.2% WoW (within threshold)
};

// Warning scenario - CAC spike
export const mockEfficiencyMetricsWarning: EfficiencyMetrics = {
  cac: 580_000,               // Rp 580K CAC (increased)
  ltv: 2_700_000,             // Rp 2.7M LTV
  ltvCacRatio: 4.65,          // 4.65:1 ratio (amber)
  cacTrend: 28.9,             // +28.9% WoW (ALERT!)
};

// Critical scenario - Low LTV:CAC
export const mockEfficiencyMetricsCritical: EfficiencyMetrics = {
  cac: 1_200_000,             // Rp 1.2M CAC (very high)
  ltv: 2_400_000,             // Rp 2.4M LTV
  ltvCacRatio: 2.0,           // 2:1 ratio (critical - red)
  cacTrend: 45.0,             // +45% WoW (CRITICAL!)
};

// ============================================
// Sustainability Mock Data
// ============================================

export const mockSustainabilityMetrics: SustainabilityMetrics = {
  paybackPeriod: 8,           // 8 months payback (healthy)
  burnRate: 45_000_000,       // Rp 45M/month burn
  cashRunway: 18,             // 18 months runway (healthy)
  burnRateTrend: [42_000_000, 44_000_000, 45_000_000],
};

// Warning scenario - Long payback
export const mockSustainabilityMetricsWarning: SustainabilityMetrics = {
  paybackPeriod: 14,          // 14 months payback (warning)
  burnRate: 65_000_000,       // Rp 65M/month burn
  cashRunway: 8,              // 8 months runway
  burnRateTrend: [55_000_000, 60_000_000, 65_000_000],
};

// Critical scenario - Low runway
export const mockSustainabilityMetricsCritical: SustainabilityMetrics = {
  paybackPeriod: 18,          // 18 months payback (critical)
  burnRate: 85_000_000,       // Rp 85M/month burn
  cashRunway: 4,              // 4 months runway (CRITICAL!)
  burnRateTrend: [70_000_000, 78_000_000, 85_000_000],
};

// ============================================
// Product Health Mock Data
// ============================================

export const mockProductMetrics: ProductMetrics = {
  arpu: 185_000,              // Rp 185K ARPU
  arpuBySegment: {
    basic: 99_000,            // Rp 99K for Basic
    premium: 349_000,         // Rp 349K for Premium
  },
  dauMauRatio: 32,            // 32% DAU/MAU (healthy)
  arpuChange: 4.5,            // +4.5% change
};

// Warning scenario - Low engagement
export const mockProductMetricsWarning: ProductMetrics = {
  arpu: 165_000,
  arpuBySegment: {
    basic: 89_000,
    premium: 329_000,
  },
  dauMauRatio: 15,            // 15% DAU/MAU (warning - below 20%)
  arpuChange: -8.2,           // -8.2% change
};

// ============================================
// MRR Trend Mock Data (12 months)
// ============================================

export const mockMRRTrend: MRRTrendData[] = [
  { month: '2024-01', monthLabel: 'Jan', mrr: 78_000_000, growth: 0 },
  { month: '2024-02', monthLabel: 'Feb', mrr: 82_500_000, growth: 5.8 },
  { month: '2024-03', monthLabel: 'Mar', mrr: 88_200_000, growth: 6.9 },
  { month: '2024-04', monthLabel: 'Apr', mrr: 91_800_000, growth: 4.1 },
  { month: '2024-05', monthLabel: 'Mei', mrr: 96_500_000, growth: 5.1 },
  { month: '2024-06', monthLabel: 'Jun', mrr: 99_200_000, growth: 2.8 },
  { month: '2024-07', monthLabel: 'Jul', mrr: 102_800_000, growth: 3.6 },
  { month: '2024-08', monthLabel: 'Agu', mrr: 108_500_000, growth: 5.5 },
  { month: '2024-09', monthLabel: 'Sep', mrr: 112_300_000, growth: 3.5 },
  { month: '2024-10', monthLabel: 'Okt', mrr: 118_900_000, growth: 5.9 },
  { month: '2024-11', monthLabel: 'Nov', mrr: 111_800_000, growth: -6.0 }, // Dip
  { month: '2024-12', monthLabel: 'Des', mrr: 125_500_000, growth: 12.3 },
];

// ============================================
// Cohort Analysis Mock Data
// ============================================

export const mockCohortAnalysis: CohortAnalysis = {
  months: ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  cohorts: [
    {
      cohortMonth: '2024-06',
      cohortLabel: 'Jun 2024',
      userCount: 245,
      retentionByMonth: [100, 82, 71, 65, 61, 58, 55],
    },
    {
      cohortMonth: '2024-07',
      cohortLabel: 'Jul 2024',
      userCount: 312,
      retentionByMonth: [100, 85, 74, 68, 63, 60],
    },
    {
      cohortMonth: '2024-08',
      cohortLabel: 'Agu 2024',
      userCount: 287,
      retentionByMonth: [100, 78, 65, 58, 54], // Warning: <50% at M4
    },
    {
      cohortMonth: '2024-09',
      cohortLabel: 'Sep 2024',
      userCount: 356,
      retentionByMonth: [100, 88, 79, 72],
    },
    {
      cohortMonth: '2024-10',
      cohortLabel: 'Okt 2024',
      userCount: 298,
      retentionByMonth: [100, 75, 62], // Warning: lower retention
    },
    {
      cohortMonth: '2024-11',
      cohortLabel: 'Nov 2024',
      userCount: 423,
      retentionByMonth: [100, 91],
    },
    {
      cohortMonth: '2024-12',
      cohortLabel: 'Des 2024',
      userCount: 389,
      retentionByMonth: [100],
    },
  ],
};

// Bad cohort scenario (for testing highlight)
export const mockCohortWithBadRetention: CohortData = {
  cohortMonth: '2024-08',
  cohortLabel: 'Agu 2024',
  userCount: 287,
  retentionByMonth: [100, 65, 48, 42, 38], // <50% at M2 and M3
};

// ============================================
// LTV:CAC by Segment Mock Data
// ============================================

export const mockLTVCACBySegment: LTVCACChartData[] = [
  {
    segment: 'all',
    segmentLabel: 'Semua',
    ltv: 2_700_000,
    cac: 450_000,
    ratio: 6.0,
    status: 'healthy',
  },
  {
    segment: 'basic',
    segmentLabel: 'Basic',
    ltv: 1_188_000,
    cac: 380_000,
    ratio: 3.13,
    status: 'warning', // Amber zone
  },
  {
    segment: 'premium',
    segmentLabel: 'Premium',
    ltv: 4_188_000,
    cac: 520_000,
    ratio: 8.05,
    status: 'healthy',
  },
];

// ============================================
// Danger Zone Alerts Mock Data
// ============================================

export const mockAlertsEmpty: DangerAlert[] = [];

export const mockAlertsWarning: DangerAlert[] = [
  {
    id: 'alert-1',
    metric: 'CAC',
    metricLabel: 'Customer Acquisition Cost',
    currentValue: 580_000,
    previousValue: 450_000,
    changePercent: 28.9,
    threshold: 20,
    severity: 'warning',
    timestamp: new Date('2024-12-18T10:30:00'),
    message: 'CAC naik 28.9% dalam 1 minggu terakhir',
  },
];

export const mockAlertsCritical: DangerAlert[] = [
  {
    id: 'alert-1',
    metric: 'CAC',
    metricLabel: 'Customer Acquisition Cost',
    currentValue: 580_000,
    previousValue: 450_000,
    changePercent: 28.9,
    threshold: 20,
    severity: 'warning',
    timestamp: new Date('2024-12-18T10:30:00'),
    message: 'CAC naik 28.9% dalam 1 minggu terakhir',
  },
  {
    id: 'alert-2',
    metric: 'Churn',
    metricLabel: 'Customer Churn Rate',
    currentValue: 5.8,
    previousValue: 3.2,
    changePercent: 2.6,
    threshold: 2,
    severity: 'critical',
    timestamp: new Date('2024-12-19T08:15:00'),
    message: 'Churn naik 2.6% dalam 1 minggu terakhir',
  },
  {
    id: 'alert-3',
    metric: 'Cash Runway',
    metricLabel: 'Cash Runway',
    currentValue: 4,
    previousValue: 6,
    changePercent: -33.3,
    threshold: 6,
    severity: 'critical',
    timestamp: new Date('2024-12-19T09:00:00'),
    message: 'Cash runway tersisa 4 bulan (di bawah 6 bulan)',
  },
];

// ============================================
// Complete Dashboard Mock Data
// ============================================

export const mockDashboardMetrics: DashboardMetrics = {
  vital: mockVitalMetrics,
  efficiency: mockEfficiencyMetrics,
  sustainability: mockSustainabilityMetrics,
  product: mockProductMetrics,
  mrrTrend: mockMRRTrend,
  cohortAnalysis: mockCohortAnalysis,
  ltvCacBySegment: mockLTVCACBySegment,
  alerts: mockAlertsEmpty,
  lastUpdated: new Date(),
};

// Dashboard with warnings
export const mockDashboardMetricsWithWarnings: DashboardMetrics = {
  vital: mockVitalMetrics,
  efficiency: mockEfficiencyMetricsWarning,
  sustainability: mockSustainabilityMetricsWarning,
  product: mockProductMetricsWarning,
  mrrTrend: mockMRRTrend,
  cohortAnalysis: mockCohortAnalysis,
  ltvCacBySegment: mockLTVCACBySegment,
  alerts: mockAlertsWarning,
  lastUpdated: new Date(),
};

// Dashboard with critical alerts
export const mockDashboardMetricsCritical: DashboardMetrics = {
  vital: {
    ...mockVitalMetrics,
    customerChurn: 5.8,
    revenueChurn: 5.2,
    nrr: 94.5, // Contraction
  },
  efficiency: mockEfficiencyMetricsCritical,
  sustainability: mockSustainabilityMetricsCritical,
  product: mockProductMetricsWarning,
  mrrTrend: mockMRRTrend,
  cohortAnalysis: mockCohortAnalysis,
  ltvCacBySegment: mockLTVCACBySegment,
  alerts: mockAlertsCritical,
  lastUpdated: new Date(),
};

// ============================================
// Helper: Get mock data by segment
// ============================================

export function getMockDataBySegment(segment: 'all' | 'basic' | 'premium'): DashboardMetrics {
  const baseData = { ...mockDashboardMetrics };
  
  if (segment === 'basic') {
    return {
      ...baseData,
      vital: {
        ...baseData.vital,
        mrr: 45_200_000,
        mrrGrowth: 8.5,
        customerChurn: 4.1,
        revenueChurn: 3.8,
        nrr: 102.3,
      },
      efficiency: {
        cac: 380_000,
        ltv: 1_188_000,
        ltvCacRatio: 3.13,
        cacTrend: 3.2,
      },
      product: {
        arpu: 99_000,
        arpuBySegment: { basic: 99_000, premium: 0 },
        dauMauRatio: 28,
        arpuChange: 2.1,
      },
    };
  }
  
  if (segment === 'premium') {
    return {
      ...baseData,
      vital: {
        ...baseData.vital,
        mrr: 80_300_000,
        mrrGrowth: 15.2,
        customerChurn: 2.1,
        revenueChurn: 1.8,
        nrr: 115.8,
      },
      efficiency: {
        cac: 520_000,
        ltv: 4_188_000,
        ltvCacRatio: 8.05,
        cacTrend: 6.8,
      },
      product: {
        arpu: 349_000,
        arpuBySegment: { basic: 0, premium: 349_000 },
        dauMauRatio: 38,
        arpuChange: 6.2,
      },
    };
  }
  
  return baseData;
}

/**
 * Get mock dashboard metrics for API endpoint
 * Alias for getMockDataBySegment with updated timestamp
 */
export function getMockDashboardMetrics(segment: 'all' | 'basic' | 'premium' = 'all'): DashboardMetrics {
  const data = getMockDataBySegment(segment);
  return {
    ...data,
    lastUpdated: new Date(),
  };
}
