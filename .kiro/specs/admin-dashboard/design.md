# Design Document: Admin Dashboard

## Overview

Admin Dashboard untuk OCTOmatiz yang menampilkan unit economics dan truth metrics untuk monitoring kesehatan bisnis SaaS. Dashboard ini menggunakan Astro dengan React Islands untuk interaktivitas, Tailwind CSS untuk styling, dan chart library untuk visualisasi data. Fokus utama adalah memberikan insight actionable tentang apakah bisnis sedang sehat atau hanya membakar uang untuk pertumbuhan semu.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    HEADER                                │   │
│  │  [MRR: Rp 125.5M] [+12.3% ↑] [Last updated: 2 min ago]  │   │
│  └─────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────┬──────────────────────┤
│              MAIN CONTENT                │    SIDEBAR           │
│  ┌────────────────────────────────────┐  │  ┌────────────────┐  │
│  │     VITAL SIGNS (3 cards)         │  │  │  DANGER ZONE   │  │
│  │  [MRR Growth] [Churn] [NRR]       │  │  │                │  │
│  └────────────────────────────────────┘  │  │  ⚠️ CAC +25%   │  │
│  ┌────────────────────────────────────┐  │  │  ⚠️ Churn +3%  │  │
│  │     EFFICIENCY (3 cards)          │  │  │                │  │
│  │  [CAC] [LTV] [LTV:CAC Ratio]      │  │  └────────────────┘  │
│  └────────────────────────────────────┘  │  ┌────────────────┐  │
│  ┌────────────────────────────────────┐  │  │  SEGMENT       │  │
│  │     MRR TREND (Line Chart)        │  │  │  FILTER        │  │
│  │     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │  │  │                │  │
│  │     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~   │  │  │  ○ All         │  │
│  └────────────────────────────────────┘  │  │  ● Basic       │  │
│  ┌────────────────────────────────────┐  │  │  ○ Premium     │  │
│  │     COHORT ANALYSIS (Heatmap)     │  │  │                │  │
│  │     [M1][M2][M3][M4][M5][M6]...   │  │  └────────────────┘  │
│  │  Jan ██ ██ ▓▓ ▒▒ ░░ ░░           │  │                      │
│  │  Feb ██ ██ ▓▓ ▒▒ ░░              │  │                      │
│  │  Mar ██ ██ ▓▓ ▒▒                 │  │                      │
│  └────────────────────────────────────┘  │                      │
│  ┌────────────────────────────────────┐  │                      │
│  │  SUSTAINABILITY & PRODUCT HEALTH  │  │                      │
│  │  [Payback] [Runway] [ARPU] [DAU]  │  │                      │
│  └────────────────────────────────────┘  │                      │
└──────────────────────────────────────────┴──────────────────────┘
```

## Components and Interfaces

### Page Structure

```
app/src/pages/admin/
├── index.astro              # Admin dashboard page
└── api/
    └── metrics.ts           # API endpoint for metrics data

app/src/components/admin/
├── AdminDashboard.tsx       # Main dashboard wrapper (React Island)
├── MetricCard.tsx           # Reusable metric card component
├── MRRHeader.tsx            # Header with MRR display
├── VitalSignsSection.tsx    # MRR Growth, Churn, NRR cards
├── EfficiencySection.tsx    # CAC, LTV, LTV:CAC cards
├── SustainabilitySection.tsx # Payback, Burn Rate, Runway
├── ProductHealthSection.tsx  # ARPU, DAU/MAU
├── MRRTrendChart.tsx        # Line chart for MRR trend
├── CohortHeatmap.tsx        # Heatmap for cohort analysis
├── DangerZone.tsx           # Alert sidebar component
├── SegmentFilter.tsx        # Customer segment filter
└── LTVCACBarChart.tsx       # Bar chart for LTV:CAC comparison

app/src/lib/admin/
├── metricsCalculator.ts     # Business logic for metric calculations
├── alertDetector.ts         # Logic for danger zone alerts
└── mockData.ts              # Mock data for development
```

### Component Interfaces

```typescript
// Types for metrics
interface VitalMetrics {
  mrr: number;
  mrrGrowth: number;           // percentage
  customerChurn: number;        // percentage
  revenueChurn: number;         // percentage
  nrr: number;                  // percentage (>100 = expansion)
}

interface EfficiencyMetrics {
  cac: number;                  // currency
  ltv: number;                  // currency
  ltvCacRatio: number;          // ratio (healthy if >= 3)
}

interface SustainabilityMetrics {
  paybackPeriod: number;        // months
  burnRate: number;             // currency per month
  cashRunway: number;           // months remaining
}

interface ProductMetrics {
  arpu: number;                 // currency
  dauMauRatio: number;          // percentage (healthy if >= 20%)
}

interface CohortData {
  cohortMonth: string;          // "2024-01"
  retentionByMonth: number[];   // [100, 85, 72, 65, ...]
  userCount: number;
}

interface DangerAlert {
  id: string;
  metric: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
}

interface SegmentFilter {
  type: 'all' | 'basic' | 'premium';
}

// MetricCard props
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;              // percentage change
  changeLabel?: string;
  status?: 'healthy' | 'warning' | 'critical';
  tooltip?: string;
  icon?: React.ReactNode;
}

// Chart data interfaces
interface MRRTrendData {
  month: string;
  mrr: number;
}

interface LTVCACChartData {
  segment: string;
  ltv: number;
  cac: number;
  ratio: number;
  status: 'healthy' | 'warning' | 'critical';
}
```

## Data Models

### Metrics Storage (Cloudflare KV)

```typescript
// KV key patterns
const KV_KEYS = {
  DAILY_METRICS: 'metrics:daily:{date}',      // metrics:daily:2024-12-20
  MONTHLY_METRICS: 'metrics:monthly:{month}', // metrics:monthly:2024-12
  COHORT_DATA: 'cohort:{month}',              // cohort:2024-01
  ALERTS: 'alerts:active',
};

// Daily metrics snapshot
interface DailyMetricsSnapshot {
  date: string;
  mrr: number;
  activeCustomers: number;
  newCustomers: number;
  churnedCustomers: number;
  revenue: number;
  expenses: number;
  dau: number;
  mau: number;
}

// Monthly aggregated metrics
interface MonthlyMetrics {
  month: string;
  mrr: number;
  mrrGrowth: number;
  customerChurn: number;
  revenueChurn: number;
  nrr: number;
  cac: number;
  ltv: number;
  arpu: number;
  newCustomers: number;
  churnedCustomers: number;
  totalCustomers: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: LTV:CAC Ratio Color Indicator Consistency
*For any* LTV:CAC ratio value, the color indicator displayed SHALL be red if ratio < 3, amber if 3 <= ratio < 5, and green if ratio >= 5
**Validates: Requirements 3.1, 3.2, 3.5**

### Property 2: Danger Zone Alert Threshold Accuracy
*For any* CAC increase greater than 20% within one week, the Danger Zone SHALL contain an alert for that metric
**Validates: Requirements 7.1**

### Property 3: Churn Alert Threshold Accuracy
*For any* Churn Rate increase greater than 2% within one week, the Danger Zone SHALL contain an alert for that metric
**Validates: Requirements 7.2**

### Property 4: MRR Change Direction Indicator
*For any* MRR comparison between current and previous month, the arrow direction SHALL match the mathematical sign of the difference (up for positive, down for negative)
**Validates: Requirements 1.3, 1.4**

### Property 5: Cohort Retention Heatmap Color Gradient
*For any* retention percentage in cohort heatmap, the cell color SHALL be on a gradient where lower percentages are redder and higher percentages are greener
**Validates: Requirements 6.2**

### Property 6: Segment Filter Data Isolation
*For any* segment filter selection, all displayed metrics SHALL be calculated using only data from that segment
**Validates: Requirements 8.1**

### Property 7: NRR Health Indicator Accuracy
*For any* NRR value, the indicator SHALL be green if NRR > 100% and red if NRR < 100%
**Validates: Requirements 2.3, 2.4**

### Property 8: Cash Runway Critical Alert
*For any* Cash Runway value less than 6 months, the dashboard SHALL display a critical alert indicator
**Validates: Requirements 4.4**

## Error Handling

### Data Loading Errors
- Display skeleton loaders during data fetch
- Show error toast with retry button on API failure
- Cache last successful data for offline viewing
- Graceful degradation: show available metrics even if some fail

### Calculation Errors
- Handle division by zero (e.g., CAC when no new customers)
- Display "N/A" for metrics that cannot be calculated
- Log calculation errors for debugging

### Alert System Errors
- Queue alerts if display fails
- Persist alerts to KV to prevent loss
- Rate limit alert generation to prevent spam

## Testing Strategy

### Unit Testing (Vitest)
- Test metric calculation functions in `metricsCalculator.ts`
- Test alert detection logic in `alertDetector.ts`
- Test color indicator logic for LTV:CAC ratio
- Test cohort retention calculations

### Property-Based Testing (fast-check)
- Test LTV:CAC color indicator for all possible ratio values
- Test alert threshold detection across range of metric changes
- Test segment filter isolation with generated data sets
- Test MRR direction indicator for all positive/negative/zero changes

### Integration Testing
- Test API endpoint returns correct data structure
- Test dashboard renders all sections correctly
- Test filter interactions update all components

### Visual Testing
- Verify chart rendering with different data sets
- Test responsive layout breakpoints
- Verify color contrast meets accessibility standards
