# OCTOmatiz - Quick Launch Mobile Web

## Project Documentation

> Generated: 2025-12-25  
> Status: Active Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Arsitektur Sistem](#2-arsitektur-sistem)
3. [Struktur Folder & File](#3-struktur-folder--file)
4. [Admin Dashboard Components](#4-admin-dashboard-components)
5. [API Endpoints](#5-api-endpoints)
6. [Project Status Report](#6-project-status-report)
7. [Recommendations](#7-recommendations--next-steps)
8. [Development Guide](#8-development-guide)

---

## 1. Project Overview

**Nama Project:** OCTOmatiz - Quick Launch Mobile Web

**Tujuan:**
PWA (Progressive Web App) untuk membantu UMKM membuat landing page bisnis dengan cepat, dilengkapi admin dashboard untuk analytics SaaS metrics.

**Target Users:**
1. **End Users:** Pemilik UMKM yang ingin membuat landing page
2. **Admin:** Tim internal untuk monitoring business metrics

### Tech Stack

| Layer            | Teknologi                             |
| ---------------- | ------------------------------------- |
| Framework        | Astro 5.x + React Islands             |
| Styling          | Tailwind CSS v4                       |
| State Management | React Context                         |
| Backend          | Cloudflare Workers (Astro API Routes) |
| Database         | Cloudflare D1 (SQLite)                |
| Cache/KV         | Cloudflare KV                         |
| Charts           | Custom SVG + Recharts                 |
| AI               | Groq + Gemini (content generation)    |
| URL Shortener    | clck.ru → v.gd → internal fallback    |

### Fitur Utama

1. **Landing Page Wizard** - 5 langkah pembuatan (business info → product → content → template → deploy)
2. **Admin Dashboard** - SaaS metrics (MRR, Churn, NRR, CAC, LTV, dll)
3. **PWA Support** - Offline mode dengan service worker
4. **Analytics** - Link click tracking, view counter
5. **URL Shortening** - Auto-shorten deployed URLs

---

## 2. Arsitektur Sistem

### Diagram High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Astro SSR  │    │  D1 Database │    │   KV Store   │       │
│  │   (Workers)  │◄──►│   (SQLite)   │    │  (Metrics)   │       │
│  └──────┬───────┘    └──────────────┘    └──────────────┘       │
│         │                                                        │
└─────────┼────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (PWA)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │  Astro Pages │    │ React Islands│    │Service Worker│       │
│  │  (Static)    │    │ (Interactive)│    │  (Offline)   │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → React Component → Context API → API Endpoint → D1/KV → Response
```

### Database Schema (D1)

| Table      | Columns                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `devices`  | id, created_at, last_seen_at, link_code, linked_to                                                                                                                              |
| `projects` | id, device_id, business_name, whatsapp, category, location, photo_url, headline, storytelling, template, color_theme, current_step, status, deployed_url, short_url, timestamps |
| `events`   | id, project_id, device_id, event_type, event_data, created_at                                                                                                                   |

### KV Store Keys

| Key Pattern             | Purpose                  |
| ----------------------- | ------------------------ |
| `views:{slug}`          | View counter per project |
| `metrics:daily:{date}`  | Daily metrics snapshot   |
| `metrics:monthly:{month}` | Monthly metrics snapshot |
| `cohort:{month}`        | Cohort retention data    |
| `alerts:active`         | Active danger alerts     |

---

## 3. Struktur Folder & File

```
Quick Launch Mobile web/
├── app/
│   └── src/
│       ├── pages/
│       │   ├── index.astro              # Home dashboard
│       │   ├── admin/index.astro        # Admin dashboard
│       │   ├── create/
│       │   │   ├── step-1.astro         # Business info
│       │   │   ├── step-2.astro         # Product/photo
│       │   │   ├── step-3.astro         # Content generation
│       │   │   ├── step-4.astro         # Template selection
│       │   │   └── step-5.astro         # Preview & deploy
│       │   ├── p/[slug].astro           # Public landing page
│       │   ├── s/[code].astro           # Short URL redirect
│       │   ├── offline.astro            # Offline fallback
│       │   └── api/
│       │       ├── admin/
│       │       │   ├── metrics.ts       # Dashboard metrics
│       │       │   ├── stats.ts         # Project stats
│       │       │   └── analytics.ts     # Analytics data
│       │       ├── projects/
│       │       │   ├── index.ts         # CRUD projects
│       │       │   └── [id].ts          # Single project
│       │       ├── device/register.ts   # Device registration
│       │       ├── deploy.ts            # Deploy landing page
│       │       └── migrate.ts           # D1 migration
│       │
│       ├── components/
│       │   ├── admin/                   # 14 admin components
│       │   ├── common/                  # Shared components (ErrorBoundary)
│       │   ├── interactive/             # React islands
│       │   ├── Header.astro
│       │   ├── FAB.astro
│       │   └── ...
│       │
│       ├── lib/
│       │   ├── admin/metricsCalculator.ts
│       │   ├── api/adminApi.ts
│       │   ├── analytics.ts
│       │   ├── deployService.ts
│       │   ├── urlShortener.ts
│       │   └── ...
│       │
│       ├── context/ProjectContext.tsx
│       ├── hooks/                       # Custom hooks
│       └── types/                       # TypeScript types
│
└── .kiro/specs/                         # Requirements & designs
    └── admin-dashboard/
        ├── requirements.md
        └── design.md
```

---

## 4. Admin Dashboard Components

### 4.1 Component Hierarchy

```
AdminDashboard.tsx (Main Container)
├── PIN Authentication Layer
├── ErrorBoundary (graceful failure handling)
├── MRRHeader.tsx
├── SegmentFilter.tsx
├── ChartErrorBoundary
│   ├── MRRTrendChart.tsx
│   ├── CohortHeatmap.tsx
│   └── LTVCACBarChart.tsx
├── VitalSignsSection.tsx
│   └── MetricCard.tsx (×4)
├── EfficiencySection.tsx
│   └── MetricCard.tsx (×3)
├── SustainabilitySection.tsx
│   └── MetricCard.tsx (×3)
├── ProductHealthSection.tsx
└── DangerZone.tsx
```

### 4.2 Component Details

| Component               | Lines | Fungsi                               | Props Utama                                   |
| ----------------------- | ----- | ------------------------------------ | --------------------------------------------- |
| `AdminDashboard`        | 449   | Container utama, auth, data fetching | -                                             |
| `MRRHeader`             | 129   | Display MRR dengan trend arrow       | mrr, mrrGrowth, lastUpdated, isLoading        |
| `MetricCard`            | 141   | Reusable card untuk metric           | title, value, change, status, icon, isLoading |
| `VitalSignsSection`     | 102   | Grid: MRR Growth, Churn, NRR         | metrics (VitalMetrics), isLoading             |
| `EfficiencySection`     | 102   | Grid: CAC, LTV, LTV:CAC Ratio        | metrics (EfficiencyMetrics), isLoading        |
| `SustainabilitySection` | 110   | Grid: Payback, Burn Rate, Runway     | metrics (SustainabilityMetrics), isLoading    |
| `ProductHealthSection`  | 139   | ARPU by segment, DAU/MAU ratio       | metrics (ProductMetrics), isLoading           |
| `MRRTrendChart`         | 195   | Line chart 12 bulan (pure SVG)       | data (MRRTrendData[]), isLoading              |
| `CohortHeatmap`         | 179   | Retention heatmap grid               | data (CohortAnalysis), isLoading              |
| `LTVCACBarChart`        | 150   | Horizontal bar chart LTV vs CAC      | data (LTVCACChartData[]), isLoading           |
| `DangerZone`            | 164   | Alert sidebar (critical/warning)     | alerts (DangerAlert[]), isLoading             |
| `SegmentFilter`         | 77    | Filter: All / Basic / Premium        | selected (SegmentType), onChange              |

### 4.3 Status Colors

| Status     | Color      | Kondisi                                        |
| ---------- | ---------- | ---------------------------------------------- |
| `healthy`  | 🟢 Green   | LTV:CAC ≥5, NRR >100%, Churn ≤2%, Runway ≥12mo |
| `warning`  | 🟡 Amber   | LTV:CAC 3-5, Churn 2-5%, Runway 6-12mo         |
| `critical` | 🔴 Red     | LTV:CAC <3, NRR ≤100%, Churn >5%, Runway <6mo  |

---

## 5. API Endpoints

### 5.1 Admin APIs

| Endpoint                | Method | Auth         | Fungsi                       |
| ----------------------- | ------ | ------------ | ---------------------------- |
| `/api/admin/metrics`    | GET    | Bearer Token | Dashboard metrics by segment |
| `/api/admin/stats`      | GET    | Bearer Token | Real project counts          |
| `/api/admin/analytics`  | GET    | Bearer Token | Analytics data               |
| `/api/admin/reset-data` | POST   | Bearer Token | Reset test data              |

#### GET /api/admin/metrics

```typescript
// Query Params
segment?: 'all' | 'basic' | 'premium'
mock?: 'true'  // Force mock data

// Response
{
  success: boolean,
  data: {
    vital: VitalMetrics,
    efficiency: EfficiencyMetrics,
    sustainability: SustainabilityMetrics,
    product: ProductMetrics,
    mrrTrend: MRRTrendData[],
    cohort: CohortAnalysis,
    alerts: DangerAlert[],
    realProjectStats: { ... }
  }
}

// Rate Limit: 30 req/min
// Cache: 1 minute
```

#### GET /api/admin/stats

```typescript
// Response
{
  totalProjects: number,
  projectsByStatus: { draft, building, live },
  totalDevices: number,
  projectsCreatedToday: number,
  projectsCreatedThisWeek: number,
  projectsCreatedThisMonth: number,
  totalDeployments: number
}
```

### 5.2 Project APIs

| Endpoint             | Method | Auth      | Fungsi         |
| -------------------- | ------ | --------- | -------------- |
| `/api/projects`      | GET    | Device ID | List projects  |
| `/api/projects`      | POST   | Device ID | Create project |
| `/api/projects/[id]` | GET    | Device ID | Get project    |
| `/api/projects/[id]` | PUT    | Device ID | Update project |
| `/api/projects/[id]` | DELETE | Device ID | Delete project |

### 5.3 Other APIs

| Endpoint               | Method | Fungsi                    |
| ---------------------- | ------ | ------------------------- |
| `/api/device/register` | POST   | Register new device       |
| `/api/deploy`          | POST   | Deploy landing page       |
| `/api/migrate`         | POST   | Migrate localStorage → D1 |
| `/api/analyze`         | POST   | AI content analysis       |

---

## 6. Project Status Report

### 6.1 ✅ Sudah Diimplementasikan

| Kategori             | Item                                                                    | Status |
| -------------------- | ----------------------------------------------------------------------- | ------ |
| **Pages**            | Home, Admin, Create Steps 1-5, Landing (p/[slug]), Short URL, Offline   | ✅     |
| **Admin Components** | Semua 12 komponen (MRRHeader → DangerZone)                              | ✅     |
| **Metrics Calculator** | Semua kalkulasi (MRR, Churn, NRR, CAC, LTV, dll)                      | ✅     |
| **Charts**           | MRRTrendChart (SVG), CohortHeatmap, LTVCACBarChart                      | ✅     |
| **API Endpoints**    | 15+ endpoints (admin, projects, deploy, etc)                            | ✅     |
| **Database**         | D1 schema (devices, projects, events)                                   | ✅     |
| **Context/State**    | ProjectContext dengan full CRUD                                         | ✅     |
| **URL Shortener**    | 3-tier fallback (clck.ru → v.gd → internal)                             | ✅     |
| **Deploy Service**   | 4-stage deployment dengan progress                                      | ✅     |
| **Types**            | Comprehensive TypeScript types                                          | ✅     |

### 6.2 ✅ Recently Implemented (2025-12-25)

| Feature                    | Status | Details                                              |
| -------------------------- | ------ | ---------------------------------------------------- |
| **Error Boundaries**       | ✅     | ErrorBoundary.tsx, DashboardErrorBoundary.tsx        |
| **Cohort Real Data**       | ✅     | recordCohortSignup, getCohortAnalysis in analytics.ts |
| **Property-based Testing** | ✅     | 227 tests with Vitest + fast-check                   |
| **Tailwind v4 Migration**  | ✅     | app.css with @theme block                            |
| **D1 Fallback**            | ✅     | Mock data fallback for local development             |
| **Cloudflare Build**       | ✅     | Fixed rollup optional dependencies                   |

### 6.3 ⚠️ Perlu Verifikasi / Potensi Issues

| Area                   | Issue                                             | Severity    |
| ---------------------- | ------------------------------------------------- | ----------- |
| **Mock Data Fallback** | Admin dashboard falls back to mock jika D1 gagal  | 🟡 Medium   |
| **Real Metrics**       | Metrics masih calculated dari mock, bukan real data | 🟡 Medium |
| **PIN Auth**           | Menggunakan window.prompt (UX kurang baik)        | 🟡 Medium   |
| **KV Integration**     | Belum jelas apakah KV sudah setup                 | 🟡 Medium   |

### 6.4 ❌ Belum Diimplementasikan (Berdasarkan Specs)

| Feature dari requirements.md              | Status                               |
| ----------------------------------------- | ------------------------------------ |
| Real-time MRR dari actual revenue         | ❌ Masih mock (liveProjects × 50K)   |
| Segment filtering dengan real data        | ⚠️ UI ada, data mock                |
| Auto-refresh interval                     | ❓ Perlu verifikasi                  |

---

## 7. Recommendations & Next Steps

### 7.1 ✅ Completed (2025-12-25)

| #   | Issue                        | Resolution                                                      |
| --- | ---------------------------- | --------------------------------------------------------------- |
| 1   | Config files tidak di app/   | ✅ Created package.json, astro.config.mjs, vitest.config.ts     |
| 2   | Build/Run verification       | ✅ Build works, 227 tests passing                               |
| 8   | Cohort Real Data             | ✅ Implemented cohort tracking in analytics.ts                  |
| 9   | Property-based Testing       | ✅ 227 tests with Vitest + fast-check                           |
| 11  | Error Boundaries             | ✅ ErrorBoundary + DashboardErrorBoundary components            |

### 7.2 🟡 Medium Priority (Minggu Ini)

| #   | Issue               | Recommendation                                                 |
| --- | ------------------- | -------------------------------------------------------------- |
| 3   | D1 Connection       | Verifikasi koneksi D1 production, pastikan bukan selalu fallback |
| 4   | Real Metrics Data   | Implementasi pengumpulan real MRR dari payment/subscription data |
| 5   | PIN Auth UX         | Ganti window.prompt dengan proper login modal                  |
| 6   | KV Setup            | Verifikasi KV bindings di wrangler.toml, setup jika belum      |

### 7.3 🟢 Low Priority (Backlog)

| #   | Issue                    | Recommendation                                     |
| --- | ------------------------ | -------------------------------------------------- |
| 7   | Documentation            | Tambah README.md dan CONTRIBUTING.md               |
| 8   | Real-time MRR            | Integrate dengan payment/subscription system       |

### 7.4 Suggested Action Plan

```
Week 1: Verification & Fixes
├── Day 1-2: Locate configs, verify build works
├── Day 3-4: Test D1 connection, fix if needed
└── Day 5: Document findings

Week 2: Real Data Integration
├── Day 1-3: Implement real metrics collection
├── Day 4-5: Connect admin dashboard to real data
└── Weekend: Testing & QA

Week 3: Polish & Testing
├── Day 1-2: Add unit tests
├── Day 3-4: Improve auth UX
└── Day 5: Final documentation
```

---

## 8. Development Guide

### 8.1 Prerequisites

```
- Node.js 18+ 
- npm atau pnpm
- Wrangler CLI (untuk Cloudflare)
- Git
```

### 8.2 Setup Project

```bash
# Clone repository
git clone <repo-url>
cd "Quick Launch Mobile web"

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan:
# - ADMIN_SECRET (untuk admin auth)
# - GROQ_API_KEY (untuk AI)
# - GEMINI_API_KEY (untuk AI)

# Setup Cloudflare D1 (jika belum)
wrangler d1 create octomatiz-db
wrangler d1 execute octomatiz-db --file=./migrations/schema.sql

# Setup Cloudflare KV
wrangler kv:namespace create METRICS

# Run development server
npm run dev
```

### 8.3 Project Conventions

| Area            | Convention                                          |
| --------------- | --------------------------------------------------- |
| **File Naming** | kebab-case untuk files, PascalCase untuk components |
| **Components**  | React functional components dengan TypeScript       |
| **Styling**     | Tailwind CSS utility classes                        |
| **State**       | React Context untuk global state                    |
| **API Routes**  | Astro endpoints di `pages/api/`                     |
| **Types**       | Centralized di `types/` folder                      |
| **Async/Error** | Try-catch dengan fallback values                    |

### 8.4 Key Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run deploy     # Deploy ke Cloudflare
npm run test       # Run tests (jika ada)
npm run lint       # Linting
```

### 8.5 Adding New Features

```
1. Buat types di src/types/
2. Buat API endpoint di src/pages/api/
3. Buat component di src/components/
4. Tambah ke page yang relevan
5. Update context jika perlu state management
6. Test manual + tambah unit test
```

### 8.6 Admin Dashboard Flow

```
User → /admin → PIN Prompt → AdminDashboard
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            /api/admin/metrics  /api/admin/stats  SegmentFilter
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                            DashboardState
                                    │
                    ┌───────┬───────┼───────┬───────┐
                    ▼       ▼       ▼       ▼       ▼
                 MRRHeader Charts Sections DangerZone
```

---

## Changelog

| Date       | Version | Changes                                                              |
| ---------- | ------- | -------------------------------------------------------------------- |
| 2025-12-25 | 1.1.0   | Added Error Boundaries, Cohort tracking, Tailwind v4, 227 tests      |
| 2025-12-25 | 1.0.0   | Initial documentation                                                |

---

*Documentation generated with assistance from OpenCode AI*
