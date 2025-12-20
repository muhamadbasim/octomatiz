# Design Document: Cloudflare D1 Migration

## Overview

Migrasi penyimpanan data project dari localStorage ke Cloudflare D1 untuk persistensi data yang lebih reliable. Arsitektur menggunakan API routes di Astro yang berkomunikasi dengan D1 database, dengan device ID sebagai identifier user tanpa memerlukan authentication.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │  React Islands  │    │  Device ID      │                     │
│  │  (Dashboard,    │    │  (localStorage) │                     │
│  │   Step Forms)   │    │                 │                     │
│  └────────┬────────┘    └────────┬────────┘                     │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      ▼                                           │
│           ┌─────────────────────┐                               │
│           │   API Client        │                               │
│           │   (fetch wrapper)   │                               │
│           └──────────┬──────────┘                               │
└──────────────────────┼──────────────────────────────────────────┘
                       │ HTTP
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Workers (Edge)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Astro API Routes                       │   │
│  │  /api/projects      - CRUD operations                    │   │
│  │  /api/projects/[id] - Single project operations          │   │
│  │  /api/migrate       - localStorage migration             │   │
│  │  /api/device/link   - Device linking                     │   │
│  └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Cloudflare D1                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  projects   │  │  devices    │  │  metrics    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Database Schema

```sql
-- Devices table (for device-based access)
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  link_code TEXT UNIQUE,
  linked_to TEXT REFERENCES devices(id)
);

-- Projects table
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(id),
  business_name TEXT,
  whatsapp TEXT,
  category TEXT,
  location TEXT,
  photo_url TEXT,
  headline TEXT,
  storytelling TEXT,
  template TEXT,
  color_theme TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  deployed_url TEXT,
  short_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Metrics/Events table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT REFERENCES projects(id),
  device_id TEXT NOT NULL REFERENCES devices(id),
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX idx_projects_device_id ON projects(device_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_events_project_id ON events(project_id);
CREATE INDEX idx_events_created_at ON events(created_at);
```

### API Routes

```
app/src/pages/api/
├── projects/
│   ├── index.ts          # GET (list), POST (create)
│   └── [id].ts           # GET, PUT, DELETE single project
├── device/
│   ├── register.ts       # POST - register new device
│   └── link.ts           # POST - link devices
├── migrate.ts            # POST - migrate localStorage data
└── admin/
    └── metrics.ts        # GET - dashboard metrics (existing)
```

### File Structure

```
app/src/
├── lib/
│   ├── db/
│   │   ├── client.ts         # D1 client wrapper
│   │   ├── projects.ts       # Project CRUD operations
│   │   ├── devices.ts        # Device operations
│   │   └── events.ts         # Event logging
│   └── api/
│       └── projectsApi.ts    # Client-side API wrapper
├── hooks/
│   ├── useProjects.ts        # React hook for projects (replaces useProject)
│   └── useDevice.ts          # React hook for device ID
└── types/
    └── database.ts           # D1 types
```

### Component Interfaces

```typescript
// Database types
interface DBProject {
  id: string;
  device_id: string;
  business_name: string | null;
  whatsapp: string | null;
  category: string | null;
  location: string | null;
  photo_url: string | null;
  headline: string | null;
  storytelling: string | null;
  template: string | null;
  color_theme: string | null;
  status: 'draft' | 'building' | 'live';
  deployed_url: string | null;
  short_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DBDevice {
  id: string;
  created_at: string;
  last_seen_at: string;
  link_code: string | null;
  linked_to: string | null;
}

interface DBEvent {
  id: number;
  project_id: string | null;
  device_id: string;
  event_type: string;
  event_data: string | null;
  created_at: string;
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ProjectsListResponse {
  projects: DBProject[];
  total: number;
}

// Client-side API
interface ProjectsApi {
  list(deviceId: string): Promise<ApiResponse<ProjectsListResponse>>;
  get(id: string): Promise<ApiResponse<DBProject>>;
  create(deviceId: string, data: Partial<DBProject>): Promise<ApiResponse<DBProject>>;
  update(id: string, data: Partial<DBProject>): Promise<ApiResponse<DBProject>>;
  delete(id: string): Promise<ApiResponse<void>>;
}

// Migration types
interface MigrationPayload {
  deviceId: string;
  projects: LocalStorageProject[];
}

interface LocalStorageProject {
  id: string;
  businessName?: string;
  whatsapp?: string;
  category?: string;
  location?: string;
  photoUrl?: string;
  headline?: string;
  storytelling?: string;
  template?: string;
  colorTheme?: string;
  status?: string;
  deployedUrl?: string;
  shortUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

## Data Models

### Device ID Generation

```typescript
// Generate unique device ID using crypto API
function generateDeviceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Store in localStorage with key 'octomatiz_device_id'
const DEVICE_ID_KEY = 'octomatiz_device_id';
```

### Project Status Flow

```
draft → building → live
  ↑         │
  └─────────┘ (can go back to draft)
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Project CRUD Consistency
*For any* project created via the API, fetching that project by ID SHALL return the same data that was saved
**Validates: Requirements 1.1, 1.2**

### Property 2: Device Isolation
*For any* device ID, listing projects SHALL return only projects associated with that device ID (or linked devices)
**Validates: Requirements 2.2, 2.3**

### Property 3: Migration Data Integrity
*For any* localStorage project data, after migration the D1 database SHALL contain equivalent data with matching field values
**Validates: Requirements 4.2**

### Property 4: Metrics Aggregation Accuracy
*For any* set of projects with various statuses, the metrics query SHALL return counts that match the actual number of projects per status
**Validates: Requirements 3.4**

### Property 5: Device ID Uniqueness
*For any* two generated device IDs, they SHALL be different (collision probability < 1 in 2^128)
**Validates: Requirements 2.1**

## Error Handling

### API Errors
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Missing or invalid device ID
- 404 Not Found: Project not found
- 500 Internal Server Error: Database error

### Client-Side Error Handling
```typescript
interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

// Error codes
const ERROR_CODES = {
  NETWORK_ERROR: { code: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server', retryable: true },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Data tidak ditemukan', retryable: false },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Data tidak valid', retryable: false },
  SERVER_ERROR: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan server', retryable: true },
};
```

## Testing Strategy

### Unit Testing (Vitest)
- Test D1 client wrapper functions
- Test device ID generation uniqueness
- Test data transformation between localStorage and D1 format

### Property-Based Testing (fast-check)
- Test CRUD operations maintain data integrity
- Test device isolation (projects only visible to correct device)
- Test migration preserves all data fields
- Test metrics aggregation accuracy

### Integration Testing
- Test full API flow: create → read → update → delete
- Test migration flow with various localStorage data shapes
- Test device linking flow

