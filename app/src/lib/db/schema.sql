-- OCTOmatiz D1 Database Schema
-- Cloudflare D1 (SQLite-based)

-- Devices table (for device-based access without authentication)
CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  link_code TEXT UNIQUE,
  linked_to TEXT REFERENCES devices(id)
);

-- Projects table (main data storage)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES devices(id),
  business_name TEXT,
  whatsapp TEXT,
  category TEXT,
  location TEXT,
  photo_url TEXT,
  headline TEXT,
  storytelling TEXT,
  template TEXT DEFAULT 'simple',
  color_theme TEXT DEFAULT 'green',
  current_step INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft',
  deployed_url TEXT,
  short_url TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Events table (for metrics and analytics)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL REFERENCES devices(id),
  event_type TEXT NOT NULL,
  event_data TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_device_id ON projects(device_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
