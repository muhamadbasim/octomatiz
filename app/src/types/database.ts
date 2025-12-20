// D1 Database Types for OCTOmatiz

export interface DBDevice {
  id: string;
  created_at: string;
  last_seen_at: string;
  link_code: string | null;
  linked_to: string | null;
}

export interface DBProject {
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
  current_step: number;
  status: 'draft' | 'building' | 'live';
  deployed_url: string | null;
  short_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBEvent {
  id: number;
  project_id: string | null;
  device_id: string;
  event_type: string;
  event_data: string | null;
  created_at: string;
}

// Event types for tracking
export type EventType = 
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'status_changed'
  | 'deployed'
  | 'migration_completed'
  | 'link_click';

/**
 * Event data structure for link_click events
 * Stored as JSON string in event_data column
 * 
 * @example
 * {
 *   "slug": "warung-makan-bu-sri",
 *   "referrer": "https://wa.me/...",
 *   "user_agent": "Mozilla/5.0...",
 *   "project_id": "proj_123..."
 * }
 */
export interface LinkClickEventData {
  slug: string;
  referrer: string | null;
  user_agent: string | null;
  project_id?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProjectsListResponse {
  projects: DBProject[];
  total: number;
}

// Migration types
export interface MigrationPayload {
  deviceId: string;
  projects: LocalStorageProject[];
}

export interface LocalStorageProject {
  id: string;
  businessName?: string;
  whatsapp?: string;
  category?: string;
  location?: string;
  productImage?: string;
  headline?: string;
  storytelling?: string;
  template?: string;
  colorTheme?: string;
  currentStep?: number;
  status?: string;
  deployedUrl?: string;
  shortUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Error handling
export interface ApiError {
  code: string;
  message: string;
  retryable: boolean;
}

export const ERROR_CODES = {
  NETWORK_ERROR: { code: 'NETWORK_ERROR', message: 'Tidak dapat terhubung ke server', retryable: true },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Data tidak ditemukan', retryable: false },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Data tidak valid', retryable: false },
  SERVER_ERROR: { code: 'SERVER_ERROR', message: 'Terjadi kesalahan server', retryable: true },
  DEVICE_NOT_FOUND: { code: 'DEVICE_NOT_FOUND', message: 'Device tidak terdaftar', retryable: false },
} as const;
