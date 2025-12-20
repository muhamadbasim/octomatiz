# Requirements Document

## Introduction

Migrasi penyimpanan data project UMKM dari localStorage (browser-side) ke Cloudflare D1 (server-side SQLite database). Tujuannya adalah agar data project tidak hilang saat user clear cache, ganti device, atau ganti browser. Fitur ini juga menjadi fondasi untuk multi-user support dan analytics dashboard yang akurat.

## Glossary

- **D1**: Cloudflare D1 adalah serverless SQLite database yang berjalan di edge
- **Project**: Data landing page UMKM yang dibuat user (nama bisnis, WhatsApp, foto, konten, dll)
- **Freelancer**: User yang menggunakan OCTOmatiz untuk membuat landing page klien UMKM
- **Device ID**: Identifier unik per device untuk tracking project tanpa auth

## Requirements

### Requirement 1

**User Story:** As a freelancer, I want my project data to persist across devices and browser sessions, so that I don't lose my work when clearing cache or switching devices.

#### Acceptance Criteria

1. WHEN a user creates a new project THEN the system SHALL save the project to Cloudflare D1 database
2. WHEN a user updates project data THEN the system SHALL save changes to D1 immediately
3. WHEN a user opens the app on a new device THEN the system SHALL retrieve existing projects from D1
4. WHEN a user deletes a project THEN the system SHALL remove it from D1 database

### Requirement 2

**User Story:** As a freelancer, I want to access my projects without creating an account, so that I can start working immediately without friction.

#### Acceptance Criteria

1. WHEN a user first opens the app THEN the system SHALL generate a unique device ID and store it locally
2. WHEN a user creates a project THEN the system SHALL associate the project with the device ID
3. WHEN a user returns to the app THEN the system SHALL load projects associated with their device ID
4. WHERE a user wants to link devices THEN the system SHALL provide a shareable link code for device linking

### Requirement 3

**User Story:** As a system administrator, I want to track project creation and deployment metrics, so that I can monitor platform usage and health.

#### Acceptance Criteria

1. WHEN a project is created THEN the system SHALL record creation timestamp and device ID
2. WHEN a project status changes THEN the system SHALL log the status transition with timestamp
3. WHEN a landing page is deployed THEN the system SHALL record deployment timestamp and URL
4. WHEN querying metrics THEN the system SHALL return aggregated counts by status and time period

### Requirement 4

**User Story:** As a developer, I want a clean migration path from localStorage to D1, so that existing users don't lose their data.

#### Acceptance Criteria

1. WHEN an existing user opens the updated app THEN the system SHALL detect localStorage data
2. WHEN localStorage data exists THEN the system SHALL migrate it to D1 automatically
3. WHEN migration completes THEN the system SHALL clear localStorage data
4. IF migration fails THEN the system SHALL show error message and allow retry

### Requirement 5

**User Story:** As a freelancer, I want to see loading states when data is being fetched, so that I know the app is working.

#### Acceptance Criteria

1. WHEN fetching projects from D1 THEN the system SHALL display a loading skeleton
2. WHEN saving project data THEN the system SHALL show a saving indicator
3. IF an API error occurs THEN the system SHALL display a user-friendly error message with retry option

