# Implementation Plan

- [x] 1. Set up project structure and types


  - [x] 1.1 Create admin dashboard types and interfaces


    - Create `app/src/types/admin.ts` with all metric interfaces (VitalMetrics, EfficiencyMetrics, etc.)
    - Define DangerAlert, CohortData, and SegmentFilter types
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_
  - [x] 1.2 Create mock data for development


    - Create `app/src/lib/admin/mockData.ts` with realistic sample data
    - Include 12 months of MRR trend data, cohort data, and alert scenarios
    - _Requirements: 9.1, 6.1_

- [x] 2. Implement core metric calculation logic


  - [x] 2.1 Create metrics calculator module


    - Create `app/src/lib/admin/metricsCalculator.ts`
    - Implement MRR growth calculation, churn rate calculation, NRR calculation
    - Implement LTV, CAC, and LTV:CAC ratio calculations
    - Implement ARPU and DAU/MAU ratio calculations
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 5.1, 5.2_
  - [x] 2.2 Write property test for LTV:CAC color indicator


    - **Property 1: LTV:CAC Ratio Color Indicator Consistency**
    - Test that ratio < 3 returns red, 3-5 returns amber, >= 5 returns green
    - **Validates: Requirements 3.1, 3.2, 3.5**
  - [x] 2.3 Write property test for NRR health indicator

    - **Property 7: NRR Health Indicator Accuracy**
    - Test that NRR > 100% returns green, NRR < 100% returns red
    - **Validates: Requirements 2.3, 2.4**
  - [x] 2.4 Create alert detector module


    - Create `app/src/lib/admin/alertDetector.ts`
    - Implement CAC increase detection (>20% threshold)
    - Implement Churn increase detection (>2% threshold)
    - Implement Cash Runway critical alert (<6 months)
    - _Requirements: 7.1, 7.2, 4.4_
  - [x] 2.5 Write property test for danger zone alerts


    - **Property 2: Danger Zone Alert Threshold Accuracy (CAC)**
    - **Property 3: Churn Alert Threshold Accuracy**
    - Test that alerts are generated when thresholds are exceeded
    - **Validates: Requirements 7.1, 7.2**
  - [x] 2.6 Write property test for Cash Runway alert

    - **Property 8: Cash Runway Critical Alert**
    - Test that runway < 6 months triggers critical alert
    - **Validates: Requirements 4.4**

- [x] 3. Checkpoint - Ensure all calculation tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build reusable UI components
  - [x] 4.1 Create MetricCard component
    - Create `app/src/components/admin/MetricCard.tsx`
    - Support title, value, change percentage, status indicator (healthy/warning/critical)
    - Include tooltip support and loading skeleton state
    - _Requirements: 1.5, 2.5, 3.3, 3.4_
  - [x] 4.2 Write property test for MRR direction indicator
    - **Property 4: MRR Change Direction Indicator**
    - Test that positive change shows up arrow, negative shows down arrow
    - **Validates: Requirements 1.3, 1.4**
  - [x] 4.3 Create MRRHeader component
    - Create `app/src/components/admin/MRRHeader.tsx`
    - Display MRR value prominently with currency formatting
    - Show percentage change with color-coded arrow indicator
    - Include last updated timestamp
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 4.4 Create DangerZone component
    - Create `app/src/components/admin/DangerZone.tsx`
    - Display list of active alerts sorted by severity
    - Show "All Clear" state when no alerts
    - Include alert details: metric name, value, percentage change
    - _Requirements: 7.3, 7.4, 7.5_
  - [x] 4.5 Create SegmentFilter component
    - Create `app/src/components/admin/SegmentFilter.tsx`
    - Provide radio buttons for All, Basic, Premium segments
    - Show active filter indicator
    - _Requirements: 8.2, 8.3_
  - [x] 4.6 Write property test for segment filter isolation
    - **Property 6: Segment Filter Data Isolation**
    - Test that filtered data only contains records from selected segment
    - **Validates: Requirements 8.1**

- [x] 5. Build metric section components
  - [x] 5.1 Create VitalSignsSection component
    - Create `app/src/components/admin/VitalSignsSection.tsx`
    - Display MRR Growth, Customer Churn, Revenue Churn, NRR as cards
    - Apply color indicators based on metric health
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 5.2 Create EfficiencySection component
    - Create `app/src/components/admin/EfficiencySection.tsx`
    - Display CAC, LTV, LTV:CAC Ratio with color-coded health indicators
    - Include hover tooltip for LTV calculation breakdown
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 5.3 Create SustainabilitySection component
    - Create `app/src/components/admin/SustainabilitySection.tsx`
    - Display Payback Period, Burn Rate, Cash Runway
    - Show warning for Payback > 12 months, critical for Runway < 6 months
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  - [x] 5.4 Create ProductHealthSection component
    - Create `app/src/components/admin/ProductHealthSection.tsx`
    - Display ARPU with segment breakdown on hover
    - Display DAU/MAU ratio with 20% benchmark indicator
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Build chart components
  - [x] 6.1 Create MRRTrendChart component
    - Create `app/src/components/admin/MRRTrendChart.tsx`
    - Implement line chart with 12-month historical data
    - Include axis labels, tooltips, and responsive sizing
    - Use lightweight chart library (Chart.js or Recharts)
    - _Requirements: 9.1, 9.4, 9.5_
  - [x] 6.2 Create LTVCACBarChart component
    - Create `app/src/components/admin/LTVCACBarChart.tsx`
    - Implement horizontal bar chart comparing LTV and CAC by segment
    - Color-code bars based on ratio health (red/amber/green)
    - _Requirements: 9.2, 9.4_
  - [x] 6.3 Create CohortHeatmap component
    - Create `app/src/components/admin/CohortHeatmap.tsx`
    - Implement heatmap grid with retention percentages
    - Apply color gradient from red (low) to green (high)
    - Highlight cohorts with <50% retention at month 3
    - Include hover tooltips with exact values
    - Support horizontal scroll for >12 months data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - [x] 6.4 Write property test for cohort heatmap color gradient
    - **Property 5: Cohort Retention Heatmap Color Gradient**
    - Test that lower percentages produce redder colors, higher produce greener
    - **Validates: Requirements 6.2**

- [x] 7. Checkpoint - Ensure all component tests pass
  - All 95 tests passing

- [x] 8. Build main dashboard and API
  - [x] 8.1 Create AdminDashboard wrapper component
    - Create `app/src/components/admin/AdminDashboard.tsx`
    - Compose all section components with proper layout
    - Implement segment filter state management
    - Handle loading and error states
    - _Requirements: 8.1, 8.4, 10.1_
  - [x] 8.2 Create metrics API endpoint
    - Create `app/src/pages/api/admin/metrics.ts`
    - Return all metrics data based on segment filter
    - Include mock data fallback for development
    - _Requirements: 8.1_
  - [x] 8.3 Create admin dashboard page
    - Create `app/src/pages/admin/index.astro`
    - Use BaseLayout with admin-specific styling
    - Mount AdminDashboard as React Island with client:load
    - _Requirements: 10.1_

- [x] 9. Implement responsive layout
  - [x] 9.1 Add responsive styles for dashboard
    - Implement three-column layout for desktop (>1024px)
    - Collapse sidebar to expandable panel for tablet (768-1024px)
    - Stack all sections vertically for mobile (<768px)
    - Ensure high-contrast colors for accessibility
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  - [x] 9.2 Add collapsible card behavior for mobile
    - Make metric sections collapsible on mobile
    - Preserve expanded/collapsed state
    - _Requirements: 10.4_

- [x] 10. Final Checkpoint - Ensure all tests pass
  - All 95 tests passing
