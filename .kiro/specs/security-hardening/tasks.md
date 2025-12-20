# Implementation Plan

- [x] 1. XSS Prevention - HTML Sanitization
  - [x] 1.1 Add escapeHtml, escapeAttribute, sanitizeUrl functions to templates/types.ts
    - Implement HTML entity escaping for special characters
    - Implement attribute-safe escaping with newline removal
    - Implement URL protocol validation
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Update simple.ts template to use sanitization
    - Sanitize businessName, headline, storytelling, category, location
    - Sanitize productImage URL
    - _Requirements: 1.4_
  - [x] 1.3 Update modern.ts template to use sanitization
    - Apply same sanitization as simple.ts
    - _Requirements: 1.4_
  - [x] 1.4 Update warm.ts template to use sanitization
    - Apply same sanitization as simple.ts
    - _Requirements: 1.4_
  - [x] 1.5 Write property test for HTML escaping


    - **Property 1: HTML Escaping Completeness**


    - **Validates: Requirements 1.1**
  - [x] 1.6 Write property test for URL sanitization
    - **Property 3: URL Protocol Blocking**
    - **Validates: Requirements 1.3**

- [x] 2. Admin Authentication
  - [x] 2.1 Add verifyAdminAuth to /api/admin/analytics.ts
    - Import and call verifyAdminAuth before processing
    - Return 401 on failure
    - _Requirements: 2.1, 2.4_
  - [x] 2.2 Add verifyAdminAuth to /api/admin/stats.ts
    - Import and call verifyAdminAuth before processing
    - Return 401 on failure
    - _Requirements: 2.2, 2.4_
  - [x] 2.3 Add verifyAdminAuth to /api/admin/metrics.ts

    - Import and call verifyAdminAuth before processing


    - Return 401 on failure
    - _Requirements: 2.3, 2.4_
  - [x] 2.4 Write property test for admin authentication
    - **Property 5: Admin Endpoint Authentication**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 3. Rate Limiting
  - [x] 3.1 Add rate limiting to /api/projects/index.ts
    - GET: 60 requests/minute
    - POST: 20 requests/minute
    - _Requirements: 3.2, 3.3_
  - [x] 3.2 Add rate limiting to /api/projects/[id].ts
    - GET: 60 requests/minute
    - PUT: 30 requests/minute
    - DELETE: 10 requests/minute
    - _Requirements: 3.4_

  - [x] 3.3 Add rate limiting to /api/device/register.ts
    - 10 requests/minute

    - _Requirements: 3.5_

  - [x] 3.4 Add rate limiting to /api/migrate.ts
    - 5 requests/minute


    - _Requirements: 3.6_



  - [x] 3.5 Write property test for rate limiting
    - **Property 6: Rate Limit Enforcement**




    - **Validates: Requirements 3.1**








- [x] 4. IDOR Protection - Ownership Verification





  - [x] 4.1 Add verifyProjectOwnership function to db/projects.ts
    - Check if device_id matches project owner or linked devices


    - Return boolean


    - _Requirements: 4.1, 4.2_
  - [x] 4.2 Update PUT /api/projects/[id] to verify ownership
    - Call verifyProjectOwnership before update
    - Return 403 on failure
    - _Requirements: 4.1, 4.3_
  - [x] 4.3 Update DELETE /api/projects/[id] to verify ownership
    - Call verifyProjectOwnership before delete
    - Return 403 on failure
    - _Requirements: 4.2, 4.3_
  - [x] 4.4 Write property test for ownership verification
    - **Property 7: Project Ownership Verification**
    - **Validates: Requirements 4.1, 4.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - All tests passing

- [x] 6. Security Headers
  - [x] 6.1 Create middleware wrapper for adding security headers
    - Wrap response with addSecurityHeaders
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 6.2 Apply security headers to admin endpoints
    - Update analytics, stats, metrics to use wrapper
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [x] 6.3 Write property test for security headers
    - **Property 8: Security Headers Presence**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 7. Image Validation
  - [x] 7.1 Create imageValidation.ts utility
    - Implement validateBase64Image function
    - Check for valid image magic bytes (JPEG, PNG, GIF, WebP)
    - Implement checkImageSize function
    - _Requirements: 6.1, 6.3_
  - [x] 7.2 Update /api/analyze.ts to validate images
    - Call validateBase64Image before processing
    - Return 400 on invalid format
    - Check size limit (10MB)
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 7.3 Write property test for image validation
    - **Property 9: Image Format Validation**
    - **Validates: Requirements 6.1**

- [x] 8. Secure Error Handling
  - [x] 8.1 Create production-safe error response utility
    - Strip stack traces and internal details
    - Return generic error messages
    - _Requirements: 7.2, 7.3_
  - [x] 8.2 Update API endpoints to use safe error responses
    - Replace detailed error messages with generic ones in production
    - _Requirements: 7.2, 7.3_
  - [x] 8.3 Write property test for error response safety
    - **Property 10: Error Response Safety**
    - **Validates: Requirements 7.2**

- [x] 9. Final Checkpoint - Ensure all tests pass
  - All 227 tests passing
