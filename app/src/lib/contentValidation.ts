/**
 * Content validation utilities for AI-generated marketing content
 */

export const HEADLINE_MAX_LENGTH = 60;
export const STORYTELLING_MIN_WORDS = 100;
export const STORYTELLING_MAX_WORDS = 200;

/**
 * Count words in a string (handles Indonesian text)
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  // Trim and split by whitespace
  const words = text.trim().split(/\s+/);
  
  // Filter out empty strings
  return words.filter(word => word.length > 0).length;
}

/**
 * Validate headline length
 * @returns true if valid, false if too long
 */
export function isValidHeadlineLength(headline: string): boolean {
  if (!headline || typeof headline !== 'string') return false;
  return headline.length <= HEADLINE_MAX_LENGTH;
}

/**
 * Truncate headline to max length while preserving whole words
 */
export function truncateHeadline(headline: string): string {
  if (!headline || typeof headline !== 'string') return '';
  
  if (headline.length <= HEADLINE_MAX_LENGTH) {
    return headline;
  }
  
  // Find last space before max length
  const truncated = headline.substring(0, HEADLINE_MAX_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > HEADLINE_MAX_LENGTH * 0.7) {
    // If space is reasonably close to end, truncate at word boundary
    return truncated.substring(0, lastSpace) + '...';
  }
  
  // Otherwise just truncate with ellipsis
  return truncated.substring(0, HEADLINE_MAX_LENGTH - 3) + '...';
}

/**
 * Validate storytelling word count
 * @returns object with isValid and actual word count
 */
export function validateStorytellingWordCount(storytelling: string): {
  isValid: boolean;
  wordCount: number;
  isTooShort: boolean;
  isTooLong: boolean;
} {
  const wordCount = countWords(storytelling);
  const isTooShort = wordCount < STORYTELLING_MIN_WORDS;
  const isTooLong = wordCount > STORYTELLING_MAX_WORDS;
  
  return {
    isValid: !isTooShort && !isTooLong,
    wordCount,
    isTooShort,
    isTooLong,
  };
}

/**
 * Get validation message for storytelling
 */
export function getStorytellingValidationMessage(storytelling: string): string | null {
  const { isValid, wordCount, isTooShort, isTooLong } = validateStorytellingWordCount(storytelling);
  
  if (isValid) return null;
  
  if (isTooShort) {
    return `Cerita terlalu pendek (${wordCount} kata). Minimal ${STORYTELLING_MIN_WORDS} kata.`;
  }
  
  if (isTooLong) {
    return `Cerita terlalu panjang (${wordCount} kata). Maksimal ${STORYTELLING_MAX_WORDS} kata.`;
  }
  
  return null;
}

/**
 * Validate all content fields
 */
export function validateContent(headline: string, storytelling: string): {
  isValid: boolean;
  errors: {
    headline?: string;
    storytelling?: string;
  };
} {
  const errors: { headline?: string; storytelling?: string } = {};
  
  if (!headline || headline.trim().length === 0) {
    errors.headline = 'Headline tidak boleh kosong';
  } else if (!isValidHeadlineLength(headline)) {
    errors.headline = `Headline terlalu panjang (${headline.length}/${HEADLINE_MAX_LENGTH} karakter)`;
  }
  
  if (!storytelling || storytelling.trim().length === 0) {
    errors.storytelling = 'Cerita produk tidak boleh kosong';
  } else {
    const storyValidation = getStorytellingValidationMessage(storytelling);
    if (storyValidation) {
      errors.storytelling = storyValidation;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
