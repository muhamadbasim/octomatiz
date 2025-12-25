# Requirements Document

## Introduction

This feature integrates Google Gemini Vision API to analyze product photos captured in Step 2 and automatically generate marketing content (headline and storytelling) for UMKM landing pages. The AI will identify the product type, extract key features, and create compelling Indonesian marketing copy.

## Glossary

- **Gemini API**: Google's multimodal AI model capable of understanding images and generating text
- **Vision Analysis**: The process of extracting information from product images
- **Headline**: A short, catchy marketing title (max 60 characters)
- **Storytelling**: A longer product description with emotional appeal (100-200 words)
- **UMKM**: Usaha Mikro Kecil Menengah (Indonesian MSMEs)

## Requirements

### Requirement 1

**User Story:** As a freelancer, I want the app to automatically analyze product photos, so that I can quickly generate marketing content without manual writing.

#### Acceptance Criteria

1. WHEN a user captures or selects a product photo in Step 2 THEN the OCTOmatiz system SHALL send the image to Gemini Vision API for analysis
2. WHEN the Gemini API returns analysis results THEN the OCTOmatiz system SHALL extract product type, key features, and suggested selling points
3. IF the image analysis fails due to network error THEN the OCTOmatiz system SHALL display a retry button and allow manual content entry
4. IF the image is unclear or not a product photo THEN the OCTOmatiz system SHALL notify the user and suggest retaking the photo

### Requirement 2

**User Story:** As a freelancer, I want AI-generated headlines and storytelling in Bahasa Indonesia, so that the content resonates with local customers.

#### Acceptance Criteria

1. WHEN image analysis completes successfully THEN the OCTOmatiz system SHALL generate a headline in Bahasa Indonesia within 5 seconds
2. WHEN image analysis completes successfully THEN the OCTOmatiz system SHALL generate storytelling content in Bahasa Indonesia within 5 seconds
3. THE generated headline SHALL contain maximum 60 characters and highlight the main product benefit
4. THE generated storytelling SHALL contain 100-200 words with emotional appeal and call-to-action

### Requirement 3

**User Story:** As a freelancer, I want to regenerate content if I'm not satisfied, so that I can get better alternatives.

#### Acceptance Criteria

1. WHEN a user taps the regenerate button THEN the OCTOmatiz system SHALL request new content from Gemini API
2. WHEN regenerating content THEN the OCTOmatiz system SHALL provide a different variation while maintaining product accuracy
3. THE OCTOmatiz system SHALL limit regeneration to 3 attempts per session to manage API costs

### Requirement 4

**User Story:** As a freelancer, I want the AI to consider business category when generating content, so that the tone matches the industry.

#### Acceptance Criteria

1. WHEN generating content THEN the OCTOmatiz system SHALL incorporate the business category (kuliner/fashion/jasa/kerajinan) from Step 1
2. WHEN the category is kuliner THEN the generated content SHALL emphasize taste, freshness, and appetite appeal
3. WHEN the category is fashion THEN the generated content SHALL emphasize style, quality, and trends
4. WHEN the category is jasa THEN the generated content SHALL emphasize reliability, expertise, and customer satisfaction
5. WHEN the category is kerajinan THEN the generated content SHALL emphasize craftsmanship, uniqueness, and artistry

### Requirement 5

**User Story:** As a developer, I want secure API key management, so that credentials are not exposed in client-side code.

#### Acceptance Criteria

1. THE Gemini API key SHALL be stored as environment variable on Cloudflare Pages
2. THE OCTOmatiz system SHALL call Gemini API through a server-side API route, not directly from client
3. IF the API key is missing or invalid THEN the OCTOmatiz system SHALL log the error and return a user-friendly message
