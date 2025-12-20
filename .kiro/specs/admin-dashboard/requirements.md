# Requirements Document

## Introduction

Admin Dashboard untuk OCTOmatiz yang berfokus pada unit economics dan pertumbuhan jangka panjang bisnis SaaS. Dashboard ini dirancang untuk menampilkan "truth metrics" yang memberikan gambaran akurat tentang kesehatan bisnis, menghindari "vanity metrics" yang menyesatkan. Tujuan utama adalah menjawab pertanyaan: "Apakah bisnis saya sedang sehat, atau saya hanya membakar uang untuk pertumbuhan semu?"

## Glossary

- **MRR (Monthly Recurring Revenue)**: Pendapatan berulang bulanan dari subscription
- **Churn Rate**: Persentase pelanggan atau revenue yang hilang dalam periode tertentu
- **NRR (Net Revenue Retention)**: Persentase revenue yang dipertahankan termasuk expansion dan contraction
- **CAC (Customer Acquisition Cost)**: Biaya untuk mendapatkan satu pelanggan baru
- **LTV (Lifetime Value)**: Total nilai yang dihasilkan pelanggan selama berlangganan
- **ARPU (Average Revenue Per User)**: Rata-rata pendapatan per pengguna
- **DAU/MAU Ratio**: Rasio pengguna aktif harian terhadap bulanan (stickiness)
- **Payback Period**: Waktu yang dibutuhkan untuk mengembalikan CAC
- **Burn Rate**: Kecepatan pengeluaran kas bulanan
- **Cash Runway**: Berapa lama kas tersisa dapat bertahan
- **Cohort**: Kelompok pengguna berdasarkan waktu bergabung
- **Admin Dashboard**: Halaman khusus admin untuk monitoring metrics bisnis

## Requirements

### Requirement 1: Header dengan Real-time MRR

**User Story:** As an admin, I want to see real-time MRR and its month-over-month change prominently, so that I can quickly assess current revenue health.

#### Acceptance Criteria

1. WHEN the admin opens the dashboard THEN the Admin_Dashboard SHALL display current MRR value in prominent position at the header
2. WHEN MRR data is loaded THEN the Admin_Dashboard SHALL show percentage change compared to previous month with color indicator (green for positive, red for negative)
3. WHEN MRR increases compared to last month THEN the Admin_Dashboard SHALL display an upward arrow icon with green color
4. WHEN MRR decreases compared to last month THEN the Admin_Dashboard SHALL display a downward arrow icon with red color
5. WHEN data is being fetched THEN the Admin_Dashboard SHALL display a loading skeleton to indicate data retrieval in progress

### Requirement 2: Vital Signs Metrics Display

**User Story:** As an admin, I want to monitor vital business metrics (MRR Growth, Churn Rate, NRR), so that I can track the fundamental health of my subscription business.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the Admin_Dashboard SHALL display MRR Growth rate as percentage with month-over-month comparison
2. WHEN displaying Churn Rate THEN the Admin_Dashboard SHALL show both Customer Churn and Revenue Churn separately
3. WHEN NRR is above 100% THEN the Admin_Dashboard SHALL display it with green indicator showing expansion
4. WHEN NRR is below 100% THEN the Admin_Dashboard SHALL display it with red indicator showing contraction
5. WHEN any vital metric changes significantly THEN the Admin_Dashboard SHALL highlight the change with appropriate visual emphasis

### Requirement 3: Efficiency Metrics with LTV:CAC Ratio

**User Story:** As an admin, I want to see CAC, LTV, and their ratio with clear health indicators, so that I can evaluate customer acquisition efficiency.

#### Acceptance Criteria

1. WHEN displaying LTV:CAC ratio THEN the Admin_Dashboard SHALL show red color indicator if ratio is less than 3
2. WHEN displaying LTV:CAC ratio THEN the Admin_Dashboard SHALL show green color indicator if ratio is 3 or greater
3. WHEN displaying CAC THEN the Admin_Dashboard SHALL show the value in currency format with trend indicator
4. WHEN displaying LTV THEN the Admin_Dashboard SHALL show the value in currency format with calculation breakdown available on hover
5. WHEN LTV:CAC ratio is between 3 and 5 THEN the Admin_Dashboard SHALL show yellow/amber indicator as acceptable range

### Requirement 4: Sustainability Metrics

**User Story:** As an admin, I want to track Payback Period and Cash Runway, so that I can assess long-term business sustainability.

#### Acceptance Criteria

1. WHEN displaying Payback Period THEN the Admin_Dashboard SHALL show the value in months with industry benchmark comparison
2. WHEN Payback Period exceeds 12 months THEN the Admin_Dashboard SHALL display warning indicator
3. WHEN displaying Cash Runway THEN the Admin_Dashboard SHALL calculate and show remaining months based on current burn rate
4. WHEN Cash Runway is less than 6 months THEN the Admin_Dashboard SHALL display critical alert in red
5. WHEN displaying Burn Rate THEN the Admin_Dashboard SHALL show monthly cash outflow with trend over last 3 months

### Requirement 5: Product Health Metrics

**User Story:** As an admin, I want to monitor ARPU and DAU/MAU ratio, so that I can understand product engagement and monetization health.

#### Acceptance Criteria

1. WHEN displaying ARPU THEN the Admin_Dashboard SHALL show average revenue per user with segmentation by plan type
2. WHEN displaying DAU/MAU ratio THEN the Admin_Dashboard SHALL show the percentage with industry benchmark (20%+ is healthy)
3. WHEN DAU/MAU ratio drops below 20% THEN the Admin_Dashboard SHALL display warning indicator for low engagement
4. WHEN ARPU changes by more than 10% THEN the Admin_Dashboard SHALL highlight the change with trend arrow
5. WHEN hovering over ARPU THEN the Admin_Dashboard SHALL show breakdown by customer segment

### Requirement 6: Cohort Analysis Heatmap

**User Story:** As an admin, I want to see cohort-based retention analysis, so that I can identify when users typically churn and take action.

#### Acceptance Criteria

1. WHEN displaying Cohort Analysis THEN the Admin_Dashboard SHALL render a heatmap showing retention by signup month
2. WHEN rendering heatmap cells THEN the Admin_Dashboard SHALL use color gradient from red (low retention) to green (high retention)
3. WHEN a cohort shows retention below 50% at month 3 THEN the Admin_Dashboard SHALL highlight that cohort row
4. WHEN hovering over a heatmap cell THEN the Admin_Dashboard SHALL display exact retention percentage and user count
5. WHEN cohort data spans more than 12 months THEN the Admin_Dashboard SHALL provide horizontal scroll with sticky first column

### Requirement 7: Danger Zone Alerts

**User Story:** As an admin, I want automatic alerts when critical metrics deteriorate, so that I can respond quickly to business threats.

#### Acceptance Criteria

1. WHEN CAC increases by more than 20% in one week THEN the Admin_Dashboard SHALL display alert in Danger Zone sidebar
2. WHEN Churn Rate increases by more than 2% in one week THEN the Admin_Dashboard SHALL display alert in Danger Zone sidebar
3. WHEN multiple danger conditions exist THEN the Admin_Dashboard SHALL list all alerts sorted by severity
4. WHEN an alert is displayed THEN the Admin_Dashboard SHALL show the metric name, current value, and percentage change
5. WHEN no danger conditions exist THEN the Admin_Dashboard SHALL display "All Clear" status with green indicator

### Requirement 8: Customer Segment Filtering

**User Story:** As an admin, I want to filter all metrics by customer segment, so that I can identify which segments are most profitable.

#### Acceptance Criteria

1. WHEN the admin selects a segment filter THEN the Admin_Dashboard SHALL recalculate all displayed metrics for that segment
2. WHEN filtering by plan type THEN the Admin_Dashboard SHALL provide options for Basic, Premium, and All segments
3. WHEN a filter is active THEN the Admin_Dashboard SHALL display clear indicator showing current filter selection
4. WHEN switching between segments THEN the Admin_Dashboard SHALL preserve the current view layout while updating data
5. WHEN comparing segments THEN the Admin_Dashboard SHALL allow side-by-side comparison mode for two segments

### Requirement 9: Chart Visualizations

**User Story:** As an admin, I want appropriate chart types for different metrics, so that I can quickly understand trends and comparisons.

#### Acceptance Criteria

1. WHEN displaying MRR trend THEN the Admin_Dashboard SHALL use line chart with 12-month historical data
2. WHEN displaying LTV:CAC comparison THEN the Admin_Dashboard SHALL use horizontal bar chart with color-coded health indicators
3. WHEN displaying Cohort Analysis THEN the Admin_Dashboard SHALL use heatmap with percentage values in cells
4. WHEN any chart is rendered THEN the Admin_Dashboard SHALL include axis labels, legend, and tooltips
5. WHEN chart data is empty THEN the Admin_Dashboard SHALL display appropriate empty state message

### Requirement 10: Dashboard Layout and Responsiveness

**User Story:** As an admin, I want a clean, professional dashboard layout, so that I can efficiently monitor all metrics without visual clutter.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the Admin_Dashboard SHALL display header with MRR at top, main content in center, and Danger Zone in sidebar
2. WHEN viewed on desktop THEN the Admin_Dashboard SHALL use three-column layout with sidebar visible
3. WHEN viewed on tablet THEN the Admin_Dashboard SHALL collapse sidebar into expandable panel
4. WHEN viewed on mobile THEN the Admin_Dashboard SHALL stack all sections vertically with collapsible cards
5. WHEN using high-contrast mode THEN the Admin_Dashboard SHALL maintain readability with sufficient color contrast ratios
