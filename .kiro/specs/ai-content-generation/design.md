# Design Document: AI Content Generation

## Overview

This feature integrates Google Gemini Vision API to automatically analyze product photos and generate marketing content in Bahasa Indonesia. The system uses a server-side API route to securely call Gemini, processes the response, and provides headline and storytelling content tailored to the business category.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Step 2/3 UI   │────▶│  API Route       │────▶│  Gemini API     │
│   (React)       │◀────│  /api/analyze    │◀────│  (Vision)       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│  ProjectContext │     │  Environment     │
│  (State)        │     │  Variables       │
└─────────────────┘     └──────────────────┘
```

## Components and Interfaces

### 1. API Route: `/api/analyze`

Server-side endpoint that handles Gemini API calls.

```typescript
// POST /api/analyze
interface AnalyzeRequest {
  image: string; // Base64 encoded image
  category: BusinessCategory;
  businessName: string;
}

interface AnalyzeResponse {
  success: boolean;
  data?: {
    productType: string;
    features: string[];
    headline: string;
    storytelling: string;
  };
  error?: {
    code: 'NETWORK_ERROR' | 'INVALID_IMAGE' | 'API_ERROR' | 'RATE_LIMIT';
    message: string;
  };
}
```

### 2. AI Service: `src/lib/gemini.ts`

Utility functions for Gemini API interaction.

```typescript
interface GeminiConfig {
  apiKey: string;
  model: string; // 'gemini-1.5-flash'
}

interface GenerateContentParams {
  image: string;
  category: BusinessCategory;
  businessName: string;
}

interface GeneratedContent {
  productType: string;
  features: string[];
  headline: string;
  storytelling: string;
}
```

### 3. Content Generation Hook: `useContentGeneration`

React hook for managing content generation state.

```typescript
interface UseContentGenerationReturn {
  isGenerating: boolean;
  content: GeneratedContent | null;
  error: string | null;
  regenerateCount: number;
  generate: (image: string) => Promise<void>;
  regenerate: () => Promise<void>;
  canRegenerate: boolean; // false after 3 attempts
}
```

## Data Models

### Prompt Template

```typescript
const CATEGORY_PROMPTS: Record<BusinessCategory, string> = {
  kuliner: 'makanan/minuman dengan penekanan pada rasa, kesegaran, dan selera',
  fashion: 'produk fashion dengan penekanan pada gaya, kualitas, dan tren',
  jasa: 'layanan jasa dengan penekanan pada keandalan, keahlian, dan kepuasan',
  kerajinan: 'kerajinan tangan dengan penekanan pada keunikan, kualitas, dan seni',
};

const SYSTEM_PROMPT = `
Kamu adalah copywriter profesional untuk UMKM Indonesia.
Analisis foto produk ini dan buat konten marketing dalam Bahasa Indonesia.

Kategori bisnis: {category}
Nama bisnis: {businessName}

Berikan response dalam format JSON:
{
  "productType": "jenis produk yang terdeteksi",
  "features": ["fitur 1", "fitur 2", "fitur 3"],
  "headline": "headline menarik maksimal 60 karakter",
  "storytelling": "cerita produk 100-200 kata dengan emotional appeal"
}
`;
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Headline length constraint
*For any* generated headline, the character count SHALL be less than or equal to 60 characters.
**Validates: Requirements 2.3**

### Property 2: Storytelling word count constraint
*For any* generated storytelling content, the word count SHALL be between 100 and 200 words.
**Validates: Requirements 2.4**

### Property 3: Regeneration limit enforcement
*For any* session, after 3 regeneration attempts, the regenerate function SHALL be disabled and return without making API calls.
**Validates: Requirements 3.3**

### Property 4: Category inclusion in prompt
*For any* content generation request, the prompt sent to Gemini API SHALL include the business category from the project.
**Validates: Requirements 4.1**

### Property 5: API response parsing
*For any* valid JSON response from Gemini API, the parser SHALL extract productType, features, headline, and storytelling fields without error.
**Validates: Requirements 1.2**

## Error Handling

| Error Type | User Message | Action |
|------------|--------------|--------|
| NETWORK_ERROR | "Koneksi gagal. Coba lagi?" | Show retry button |
| INVALID_IMAGE | "Foto tidak jelas. Coba foto ulang?" | Navigate back to Step 2 |
| API_ERROR | "Terjadi kesalahan. Coba lagi nanti." | Show retry + manual entry |
| RATE_LIMIT | "Batas tercapai. Coba lagi nanti." | Disable regenerate |

## Testing Strategy

### Unit Tests
- Test prompt builder with different categories
- Test response parser with valid/invalid JSON
- Test headline truncation logic
- Test word count validation

### Property-Based Tests
- Use fast-check library for property testing
- Generate random headlines and verify length constraint
- Generate random storytelling and verify word count
- Test regeneration counter increments correctly

### Integration Tests
- Mock Gemini API responses
- Test full flow from image to generated content
- Test error handling scenarios
