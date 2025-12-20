# Design Document - Security Hardening

## Overview

This design document outlines the security hardening implementation for OCTOmatiz PWA. The implementation focuses on preventing XSS attacks, enforcing authentication on admin endpoints, implementing rate limiting across all API endpoints, and adding IDOR protection for user resources.

## Architecture

The security layer is implemented as middleware utilities in `app/src/lib/security.ts` that are imported and used by API endpoints. The architecture follows a defense-in-depth approach:

```
┌─────────────────────────────────────────────────────────────┐
│                      API Request                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Rate Limiting Layer                       │
│              (checkRateLimit per IP + endpoint)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Authentication Layer                        │
│           (verifyAdminAuth for admin endpoints)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Authorization Layer                        │
│              (verifyOwnership for resources)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Input Validation Layer                      │
│           (sanitizeInput, validateImage, etc.)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Security Headers Layer                       │
│              (addSecurityHeaders on response)                │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. HTML Sanitization (XSS Prevention)

**Location:** `app/src/lib/security.ts` and `app/src/lib/templates/types.ts`

```typescript
// Escape HTML special characters for text content
function escapeHtml(input: string): string;

// Escape for HTML attribute values (stricter)
function escapeAttribute(input: string): string;

// Validate and sanitize URLs
function sanitizeUrl(url: string): string;
```

### 2. Authentication

**Location:** `app/src/lib/security.ts`

```typescript
// Verify admin authentication via ADMIN_SECRET
function verifyAdminAuth(context: APIContext, request: Request): boolean;

// Return 401 unauthorized response
function unauthorizedResponse(): Response;
```

### 3. Rate Limiting

**Location:** `app/src/lib/security.ts`

```typescript
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// Check rate limit for a key (IP + endpoint)
function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult;

// Return 429 rate limit response
function rateLimitResponse(resetIn: number): Response;
```

### 4. Ownership Verification (IDOR Protection)

**Location:** `app/src/lib/db/projects.ts`

```typescript
// Verify device owns the project
async function verifyProjectOwnership(
  db: D1Database,
  projectId: string,
  deviceId: string
): Promise<boolean>;
```

### 5. Security Headers

**Location:** `app/src/lib/security.ts`

```typescript
// Add security headers to response
function addSecurityHeaders(response: Response): Response;
```

### 6. Image Validation

**Location:** `app/src/lib/imageValidation.ts` (new file)

```typescript
interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
}

// Validate base64 image data
function validateBase64Image(base64Data: string): ImageValidationResult;

// Check image size
function checkImageSize(base64Data: string, maxSizeMB: number): boolean;
```

## Data Models

### Rate Limit Record

```typescript
interface RateLimitRecord {
  count: number;
  resetTime: number; // Unix timestamp
}

// In-memory storage (Map)
const rateLimitMap = new Map<string, RateLimitRecord>();
```

### Security Configuration

```typescript
interface SecurityConfig {
  rateLimits: {
    [endpoint: string]: {
      maxRequests: number;
      windowMs: number;
    };
  };
  adminSecret: string | undefined;
  isDevelopment: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: HTML Escaping Completeness
*For any* string containing HTML special characters (&, <, >, ", '), the escapeHtml function should return a string where all special characters are replaced with their HTML entity equivalents.
**Validates: Requirements 1.1**

### Property 2: Attribute Escaping Safety
*For any* string containing newlines or special characters, the escapeAttribute function should return a string safe for use in HTML attributes (no newlines, all special chars escaped).
**Validates: Requirements 1.2**

### Property 3: URL Protocol Blocking
*For any* URL string starting with javascript:, data:text, or vbscript:, the sanitizeUrl function should return an empty string.
**Validates: Requirements 1.3**

### Property 4: Landing Page XSS Prevention
*For any* project data containing XSS payloads in businessName, headline, storytelling, category, location, or productImage, the generated HTML should not contain executable script content.
**Validates: Requirements 1.4**

### Property 5: Admin Endpoint Authentication
*For any* request to admin endpoints without a valid Authorization header, the system should return HTTP 401 status.
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 6: Rate Limit Enforcement
*For any* client making more requests than the configured limit within the time window, subsequent requests should receive HTTP 429 status with Retry-After header.
**Validates: Requirements 3.1**

### Property 7: Project Ownership Verification
*For any* update or delete request where the requesting device does not own the project, the system should return HTTP 403 status.
**Validates: Requirements 4.1, 4.2**

### Property 8: Security Headers Presence
*For any* API response, the response headers should include X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, and Referrer-Policy.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 9: Image Format Validation
*For any* base64 data that is not a valid image format (JPEG, PNG, GIF, WebP), the validateBase64Image function should return valid: false.
**Validates: Requirements 6.1**

### Property 10: Error Response Safety
*For any* error response in production mode, the response body should not contain stack traces, internal paths, or debug information.
**Validates: Requirements 7.2**

## Error Handling

### Authentication Errors
- Missing Authorization header → 401 Unauthorized
- Invalid token → 401 Unauthorized
- No ADMIN_SECRET configured (production) → 401 Unauthorized

### Rate Limit Errors
- Rate limit exceeded → 429 Too Many Requests with Retry-After header

### Authorization Errors
- Device does not own resource → 403 Forbidden

### Validation Errors
- Invalid image format → 400 Bad Request
- Image too large → 400 Bad Request
- Invalid input data → 400 Bad Request

## Testing Strategy

### Unit Testing
- Test escapeHtml with various special character combinations
- Test escapeAttribute with newlines and special chars
- Test sanitizeUrl with dangerous protocols
- Test verifyAdminAuth with valid/invalid tokens
- Test checkRateLimit with various request counts

### Property-Based Testing
Using Vitest with fast-check library:

1. **HTML Escaping Property Test**: Generate random strings with special characters, verify all are escaped
2. **URL Sanitization Property Test**: Generate URLs with various protocols, verify dangerous ones blocked
3. **Rate Limit Property Test**: Simulate request sequences, verify limits enforced correctly
4. **Ownership Property Test**: Generate project/device combinations, verify ownership checks

### Integration Testing
- Test admin endpoints with/without auth headers
- Test rate limiting across multiple requests
- Test project CRUD with ownership verification
- Test landing page generation with XSS payloads

### Security Testing
- Attempt XSS injection in all user input fields
- Attempt IDOR attacks on project endpoints
- Attempt rate limit bypass techniques
- Verify security headers in responses
