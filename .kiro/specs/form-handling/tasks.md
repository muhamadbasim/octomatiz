# Implementation Plan

- [x] 1. Create Project data types and utilities

  - [x] 1.1 Create Project type definitions
    - Create `src/types/project.ts` with Project interface
    - Define all fields for Steps 1-5
    - _Requirements: 4.1, 4.3_
  - [x] 1.2 Create localStorage utilities

    - Create `src/lib/storage.ts` with read/write functions
    - Handle JSON parsing errors gracefully
    - _Requirements: 1.1, 1.2_
  - [ ]* 1.3 Write property test for unique IDs
    - **Property 3: Unique project IDs**
    - **Validates: Requirements 2.1**

- [x] 2. Implement ProjectContext provider



  - [x] 2.1 Create ProjectContext and provider

    - Create `src/context/ProjectContext.tsx`
    - Implement createProject, updateProject, deleteProject, loadProject
    - _Requirements: 2.1, 2.2, 5.2_

  - [x] 2.2 Create useProject hook

    - Create `src/hooks/useProject.ts` for easy context access
    - _Requirements: 2.3, 4.1_
  - [ ]* 2.3 Write property test for project deletion
    - **Property 7: Project deletion removes from storage**
    - **Validates: Requirements 5.2**

- [x] 3. Implement form validation

  - [x] 3.1 Create validation utilities
    - Create `src/lib/validation.ts` with validation functions
    - Implement required, minLength, maxLength, pattern validators
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Create Step 1 validation schema
    - Define validation rules for businessName, whatsapp, category
    - _Requirements: 3.1, 3.2_
  - [ ]* 3.3 Write property tests for validation
    - **Property 5: Required field validation**
    - **Property 6: WhatsApp format validation**
    - **Validates: Requirements 3.1, 3.2**

- [x] 4. Implement useAutoSave hook


  - [x] 4.1 Create useAutoSave hook


    - Create `src/hooks/useAutoSave.ts`
    - Implement debounced save with 500ms delay
    - _Requirements: 1.1_
  - [ ]* 4.2 Write property test for auto-save
    - **Property 1: Auto-save persists data**
    - **Validates: Requirements 1.1**

- [x] 5. Update Step 1 form with state management


  - [x] 5.1 Convert Step 1 to use ProjectContext


    - Update `src/pages/create/step-1.astro` to use React form component
    - Create `src/components/interactive/Step1Form.tsx`
    - _Requirements: 1.1, 1.2, 3.1_
  - [x] 5.2 Implement form validation UI

    - Show inline error messages
    - Disable submit button when invalid
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.3 Implement auto-save in Step 1
    - Use useAutoSave hook to persist form data
    - _Requirements: 1.1_


- [x] 6. Checkpoint - Verify form handling

  - Ensure all tests pass, ask the user if questions arise.
  - Test form data persistence
  - Test validation feedback

- [x] 7. Update dashboard with project management
  - [x] 7.1 Update dashboard to use ProjectContext
    - Load projects from localStorage on mount
    - Display all draft projects
    - _Requirements: 2.2_
  - [x] 7.2 Implement create new project flow
    - FAB button creates new project and navigates to Step 1
    - _Requirements: 2.1_
  - [x] 7.3 Implement project selection
    - Clicking draft card loads project and navigates to current step
    - _Requirements: 2.3_
  - [ ]* 7.4 Write property test for drafts display
    - **Property 4: All drafts displayed**
    - **Validates: Requirements 2.2**

- [x] 8. Implement project deletion
  - [x] 8.1 Add delete functionality to project cards
    - Add delete button or swipe action
    - Show confirmation dialog
    - _Requirements: 5.1, 5.2_

- [x] 9. Wire up remaining steps
  - [x] 9.1 Update Step 2 to use ProjectContext
    - Load and save productImage to current project
    - _Requirements: 4.1_
  - [x] 9.2 Update Step 3 to use ProjectContext
    - Load and save headline, storytelling
    - _Requirements: 4.1, 4.2_
  - [x] 9.3 Update Step 4 to use ProjectContext
    - Load and save template, colorTheme
    - _Requirements: 4.1_
  - [x] 9.4 Update Step 5 to use ProjectContext
    - Access all project data for deployment
    - _Requirements: 4.3_

- [x] 10. Final Checkpoint - Form handling complete
  - All steps wired to ProjectContext
  - Data persists in localStorage
  - Navigation between steps works
