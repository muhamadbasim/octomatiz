# Implementation Plan

- [x] 1. Create Gemini API integration





  - [ ] 1.1 Create Gemini service utilities
    - Create `src/lib/gemini.ts` with API client
    - Implement prompt builder with category templates
    - Implement response parser
    - _Requirements: 1.2, 4.1_
  - [ ]* 1.2 Write property test for prompt builder
    - **Property 4: Category inclusion in prompt**
    - **Validates: Requirements 4.1**
  - [x]* 1.3 Write property test for response parser






    - **Property 5: API response parsing**
    - **Validates: Requirements 1.2**



- [x] 2. Create API route for image analysis

  - [ ] 2.1 Create `/api/analyze` endpoint
    - Create `src/pages/api/analyze.ts`



    - Handle POST requests with image and category
    - Call Gemini API securely

    - _Requirements: 5.2, 5.3_
  - [x] 2.2 Implement error handling

    - Handle network errors, invalid images, API errors
    - Return user-friendly error messages
    - _Requirements: 1.3, 1.4, 5.3_




- [ ] 3. Create content generation hook
  - [x] 3.1 Create useContentGeneration hook

    - Create `src/hooks/useContentGeneration.ts`
    - Manage generation state and regeneration count
    - Implement 3-attempt limit

    - _Requirements: 3.1, 3.3_
  - [ ]* 3.2 Write property test for regeneration limit
    - **Property 3: Regeneration limit enforcement**

    - **Validates: Requirements 3.3**









- [x] 4. Create content validation utilities


  - [x] 4.1 Create headline and storytelling validators

    - Create validation functions in `src/lib/contentValidation.ts`
    - Implement headline length check (max 60 chars)



    - Implement storytelling word count check (100-200 words)
    - _Requirements: 2.3, 2.4_
  - [x]* 4.2 Write property test for headline length

    - **Property 1: Headline length constraint**
    - **Validates: Requirements 2.3**
  - [x]* 4.3 Write property test for storytelling word count


    - **Property 2: Storytelling word count constraint**
    - **Validates: Requirements 2.4**

- [ ] 5. Checkpoint - Verify API integration
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update Step 2 to trigger AI analysis
  - [ ] 6.1 Integrate content generation in Step 2
    - Call analyze API after image capture
    - Show loading state during analysis
    - Handle errors with retry option
    - _Requirements: 1.1, 1.3_

- [ ] 7. Update Step 3 to use generated content
  - [ ] 7.1 Display AI-generated content
    - Show headline and storytelling from API
    - Allow editing of generated content
    - _Requirements: 2.1, 2.2_
  - [ ] 7.2 Implement regenerate functionality
    - Add regenerate button with counter
    - Disable after 3 attempts
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Final Checkpoint - AI content generation complete
  - Ensure all tests pass, ask the user if questions arise.
  - Test full flow from photo to generated content
