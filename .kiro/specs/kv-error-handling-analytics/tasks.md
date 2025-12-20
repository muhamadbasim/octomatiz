# Implementation Plan

- [x] 1. Create KV Error Handler module

  - [x] 1.1 Create `app/src/lib/kvErrorHandler.ts` with error types and helper functions


    - Implement `isKVAvailable` function
    - Implement `safeKVGet` with error handling
    - Implement `safeKVPut` with retry logic (1 retry)
    - Implement `generateErrorPage` for branded error pages


    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 1.2 Write property test for KV error handling

    - **Property 1: KV unavailable returns branded error page**
    - **Property 2: Deployment without KV returns storage error**

    - **Property 3: KV read failure returns 503**


    - **Property 4: KV write retry on failure**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [x] 2. Create Analytics Service module


  - [x] 2.1 Create `app/src/lib/analytics.ts` with link click tracking

    - Implement `recordLinkClick` with fire-and-forget pattern


    - Implement `incrementViewCounter` for KV counter
    - Implement `getSlugAnalytics` for single slug stats

    - Implement `getAllAnalytics` for all landing pages


    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_
  - [x] 2.2 Write property test for analytics recording

    - **Property 5: Successful access records link_click event**
    - **Property 6: Link click event contains required fields**
    - **Validates: Requirements 2.1, 2.2**


  - [x] 2.3 Write property test for analytics aggregation

    - **Property 9: Analytics API returns correct totals**
    - **Property 10: Analytics groups by day correctly**
    - **Validates: Requirements 3.1, 3.2**



- [x] 3. Update Landing Page Handler



  - [x] 3.1 Update `app/src/pages/p/[slug].ts` to use KV error handler


    - Replace direct KV access with `safeKVGet`
    - Return branded error pages for different error conditions
    - _Requirements: 1.1, 1.3_
  - [x] 3.2 Add analytics tracking to landing page handler

    - Call `recordLinkClick` in fire-and-forget manner (no await)
    - Extract referrer and user-agent from request headers
    - _Requirements: 2.1, 2.2, 4.1_
  - [x] 3.3 Write property test for non-blocking analytics

    - **Property 7: D1 failure does not block page response**
    - **Property 11: Analytics non-blocking pattern**
    - **Property 12: Analytics failure does not affect response**
    - **Validates: Requirements 2.3, 4.1, 4.2**

- [x] 4. Update Deploy API

  - [x] 4.1 Update `app/src/pages/api/deploy.ts` to use KV error handler


    - Replace direct KV.put with `safeKVPut` for retry logic
    - Return clear error when KV unavailable
    - _Requirements: 1.2, 1.4_
  - [x] 4.2 Write property test for view counter

    - **Property 8: View counter increments on access**
    - **Validates: Requirements 2.4**

- [x] 5. Create Analytics API Endpoint

  - [x] 5.1 Create `app/src/pages/api/admin/analytics.ts`


    - GET endpoint with optional slug and days query params
    - Return AnalyticsSummary or AnalyticsSummary[]
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 5.2 Write unit tests for analytics API


    - Test response structure
    - Test filtering by slug
    - Test day range parameter
    - _Requirements: 3.1, 3.2_

- [x] 6. Update database types


  - [x] 6.1 Add `link_click` event type to `app/src/types/database.ts`


    - Add to EventType union
    - Document event_data structure for link_click
    - _Requirements: 2.1, 2.2_

- [x] 7. Checkpoint - Make sure all tests are passing


  - Ensure all tests pass, ask the user if questions arise.
