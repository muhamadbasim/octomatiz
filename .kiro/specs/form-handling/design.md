# Design Document: Form Handling & State Management

## Overview

This design implements a centralized state management system for the project creation flow using localStorage for persistence. It provides auto-save functionality, form validation, and data flow across all steps.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Context                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              ProjectProvider                      │   │
│  │  - currentProject: Project                       │   │
│  │  - projects: Project[]                           │   │
│  │  - createProject()                               │   │
│  │  - updateProject()                               │   │
│  │  - deleteProject()                               │   │
│  │  - loadProject()                                 │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    localStorage                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Key: "octomatiz_projects"                       │   │
│  │  Value: Project[]                                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Key: "octomatiz_current_project"                │   │
│  │  Value: string (project ID)                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Project Data Model

```typescript
interface Project {
  id: string;
  status: 'draft' | 'building' | 'live';
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  
  // Step 1: Basic Info
  businessName: string;
  whatsapp: string;
  category: 'kuliner' | 'fashion' | 'jasa' | 'kerajinan';
  location: string;
  
  // Step 2: AI Capture
  productImage?: string; // Base64 or URL
  
  // Step 3: Content Review
  headline: string;
  storytelling: string;
  
  // Step 4: Design & Theme
  template: string;
  colorTheme: string;
  
  // Step 5: Deployment
  deployedUrl?: string;
  domain?: string;
}
```

### 2. ProjectContext

```typescript
interface ProjectContextValue {
  // State
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  
  // Actions
  createProject: () => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  loadProject: (id: string) => void;
  setCurrentStep: (step: number) => void;
}
```

### 3. Form Validation

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface Step1FormData {
  businessName: string;
  whatsapp: string;
  category: string;
  location: string;
}

// Validation rules
const step1Validation = {
  businessName: { required: true, minLength: 2, maxLength: 100 },
  whatsapp: { required: true, pattern: /^8[0-9]{8,12}$/ },
  category: { required: true },
  location: { required: false }
};
```

### 4. useAutoSave Hook

```typescript
interface UseAutoSaveOptions {
  debounceMs?: number; // Default: 500
  onSave?: () => void;
}

function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void,
  options?: UseAutoSaveOptions
): void;
```

## Data Models

### localStorage Schema

```typescript
// Key: "octomatiz_projects"
type StoredProjects = Project[];

// Key: "octomatiz_current_project"
type CurrentProjectId = string | null;
```

### Default Project Values

```typescript
const defaultProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  status: 'draft',
  currentStep: 1,
  businessName: '',
  whatsapp: '',
  category: 'kuliner',
  location: '',
  headline: '',
  storytelling: '',
  template: 'simple',
  colorTheme: '#36e27b',
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auto-save persists data
*For any* valid form data entered by the user, after the debounce period (500ms), the data SHALL be present in localStorage.
**Validates: Requirements 1.1**

### Property 2: Data restoration on load
*For any* project data stored in localStorage, when the form component mounts, it SHALL populate all fields with the stored values.
**Validates: Requirements 1.2**

### Property 3: Unique project IDs
*For any* number of existing projects, creating a new project SHALL result in an ID that does not match any existing project ID.
**Validates: Requirements 2.1**

### Property 4: All drafts displayed
*For any* list of projects with status 'draft' in localStorage, the dashboard SHALL render a card for each draft project.
**Validates: Requirements 2.2**

### Property 5: Required field validation
*For any* form submission where one or more required fields are empty, the validation result SHALL contain an error message for each empty required field.
**Validates: Requirements 3.1**

### Property 6: WhatsApp format validation
*For any* string that does not match the Indonesian phone number pattern (8xxxxxxxxx), the WhatsApp validation SHALL return an error.
**Validates: Requirements 3.2**

### Property 7: Project deletion removes from storage
*For any* project ID, after deletion, the project SHALL not exist in localStorage and SHALL not appear in the projects list.
**Validates: Requirements 5.2**

## Error Handling

| Scenario | Handling |
|----------|----------|
| localStorage full | Show toast, continue without saving |
| Invalid JSON in localStorage | Reset to empty array, log warning |
| Project not found | Redirect to dashboard, show error toast |
| Validation error | Show inline error, disable submit |

## Testing Strategy

### Unit Tests
- Validation functions for each field type
- Project CRUD operations
- localStorage read/write utilities

### Property-Based Tests
Using `fast-check` library:
- Property 1: Generate random form data, verify persistence
- Property 3: Generate random project lists, verify ID uniqueness
- Property 5: Generate random form states, verify validation errors
- Property 6: Generate random strings, verify phone validation

### Integration Tests
- Full form flow from Step 1 to Step 5
- Navigation back and forth between steps
- Multiple project management
