# Requirements Document

## Introduction

This feature implements form handling and state management for the project creation flow in OCTOmatiz. It enables data persistence across steps (Step 1 → Step 5) using localStorage, allowing users to resume incomplete projects and ensuring data is not lost during navigation or app refresh.

## Glossary

- **Project:** A single UMKM landing page being created by the user
- **Draft:** An incomplete project that has not been published
- **localStorage:** Browser storage API for persisting data locally
- **Form State:** The current values of all form inputs in a step

## Requirements

### Requirement 1

**User Story:** As a freelancer, I want my form data to be saved automatically, so that I don't lose my progress if I navigate away or refresh the page.

#### Acceptance Criteria

1. WHEN a user enters data in Step 1 form fields THEN the System SHALL save the data to localStorage within 500ms of the last input
2. WHEN a user returns to Step 1 after navigating away THEN the System SHALL restore the previously entered data from localStorage
3. WHEN a user refreshes the page THEN the System SHALL restore all form data from localStorage

### Requirement 2

**User Story:** As a freelancer, I want to create multiple projects for different clients, so that I can manage several UMKM landing pages.

#### Acceptance Criteria

1. WHEN a user clicks the FAB (add) button THEN the System SHALL create a new project with a unique ID
2. WHEN a user has multiple draft projects THEN the System SHALL display all drafts in the dashboard
3. WHEN a user selects a draft project THEN the System SHALL load that project's data into the form

### Requirement 3

**User Story:** As a freelancer, I want to see validation feedback on my form inputs, so that I know if I've entered incorrect data.

#### Acceptance Criteria

1. WHEN a user submits Step 1 with empty required fields THEN the System SHALL display inline error messages for each empty field
2. WHEN a user enters an invalid WhatsApp number format THEN the System SHALL display a validation error
3. WHEN all required fields are valid THEN the System SHALL enable the submit button and allow navigation to Step 2

### Requirement 4

**User Story:** As a freelancer, I want my project data to flow through all steps, so that the final landing page contains all the information I entered.

#### Acceptance Criteria

1. WHEN a user completes Step 1 and proceeds to Step 2 THEN the System SHALL carry the project data forward
2. WHEN a user navigates back from Step 3 to Step 1 THEN the System SHALL display the previously entered data
3. WHEN a user reaches Step 5 (deployment) THEN the System SHALL have access to all data from Steps 1-4

### Requirement 5

**User Story:** As a freelancer, I want to delete draft projects I no longer need, so that my dashboard stays organized.

#### Acceptance Criteria

1. WHEN a user long-presses or swipes a draft project card THEN the System SHALL show a delete option
2. WHEN a user confirms deletion THEN the System SHALL remove the project from localStorage and the dashboard
