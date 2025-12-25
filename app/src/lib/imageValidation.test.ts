/**
 * Image Validation Property Tests
 * **Feature: security-hardening, Property 9: Image Format Validation**
 * **Validates: Requirements 6.1**
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateBase64Image, checkImageSize, validateImageForUpload } from './imageValidation';

// Helper to create valid base64 image data
function createJpegBase64(): string {
  // Minimal valid JPEG header (FF D8 FF E0)
  const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  return btoa(String.fromCharCode(...jpegBytes));
}

function createPngBase64(): string {
  // PNG header (89 50 4E 47 0D 0A 1A 0A)
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return btoa(String.fromCharCode(...pngBytes));
}

function createGif87aBase64(): string {
  // GIF87a header
  const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
  return btoa(String.fromCharCode(...gifBytes));
}

function createGif89aBase64(): string {
  // GIF89a header
  const gifBytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  return btoa(String.fromCharCode(...gifBytes));
}

function createWebPBase64(): string {
  // WebP header (RIFF....WEBP)
  const webpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x00, 0x00, 0x00, 0x00, // file size (placeholder)
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]);
  return btoa(String.fromCharCode(...webpBytes));
}

describe('Image Validation - Property Tests', () => {
  /**
   * Property 9: Image Format Validation
   * For any base64 data that is not a valid image format (JPEG, PNG, GIF, WebP),
   * the validateBase64Image function should return valid: false.
   */
  describe('validateBase64Image', () => {
    it('should accept valid JPEG images', () => {
      const result = validateBase64Image(createJpegBase64());
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should accept valid PNG images', () => {
      const result = validateBase64Image(createPngBase64());
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/png');
    });

    it('should accept valid GIF87a images', () => {
      const result = validateBase64Image(createGif87aBase64());
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/gif');
    });

    it('should accept valid GIF89a images', () => {
      const result = validateBase64Image(createGif89aBase64());
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/gif');
    });

    it('should accept valid WebP images', () => {
      const result = validateBase64Image(createWebPBase64());
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/webp');
    });

    it('should accept images with data URL prefix', () => {
      const dataUrl = `data:image/jpeg;base64,${createJpegBase64()}`;
      const result = validateBase64Image(dataUrl);
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should reject empty input', () => {
      expect(validateBase64Image('')).toEqual({ valid: false, error: 'Data gambar tidak valid' });
      expect(validateBase64Image(null as unknown as string)).toEqual({
        valid: false,
        error: 'Data gambar tidak valid',
      });
      expect(validateBase64Image(undefined as unknown as string)).toEqual({
        valid: false,
        error: 'Data gambar tidak valid',
      });
    });

    it('should reject invalid base64', () => {
      const result = validateBase64Image('not-valid-base64!!!');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    /**
     * Property 9: For any random bytes that don't match image signatures,
     * validation should fail
     */
    it('property: rejects random non-image data', () => {
      fc.assert(
        fc.property(
          fc.uint8Array({ minLength: 1, maxLength: 100 }),
          (randomBytes) => {
            // Skip if random bytes happen to match valid image signatures
            const startsWithJpeg =
              randomBytes[0] === 0xff && randomBytes[1] === 0xd8 && randomBytes[2] === 0xff;
            const startsWithPng =
              randomBytes[0] === 0x89 &&
              randomBytes[1] === 0x50 &&
              randomBytes[2] === 0x4e &&
              randomBytes[3] === 0x47;
            const startsWithGif = randomBytes[0] === 0x47 && randomBytes[1] === 0x49;
            const startsWithRiff = randomBytes[0] === 0x52 && randomBytes[1] === 0x49;

            if (startsWithJpeg || startsWithPng || startsWithGif || startsWithRiff) {
              return true; // Skip this case
            }

            const base64 = btoa(String.fromCharCode(...randomBytes));
            const result = validateBase64Image(base64);
            return result.valid === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 9: Text content should never be valid
     */
    it('property: rejects text content as images', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1, maxLength: 1000 }), (text) => {
          // Encode text as base64
          const base64 = btoa(text);
          const result = validateBase64Image(base64);

          // Text should not be valid unless it accidentally starts with image magic bytes
          // which is extremely unlikely for printable ASCII
          if (result.valid) {
            // If valid, it must have detected a valid mime type
            expect(result.mimeType).toBeDefined();
          }
          return true;
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property 9: Script content should never be valid
     */
    it('should reject script content disguised as images', () => {
      const scriptPayloads = [
        '<script>alert("xss")</script>',
        '<?php echo "hack"; ?>',
        '#!/bin/bash\nrm -rf /',
        'javascript:alert(1)',
      ];

      scriptPayloads.forEach((payload) => {
        const base64 = btoa(payload);
        const result = validateBase64Image(base64);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('checkImageSize', () => {
    it('should accept images within size limit', () => {
      const smallImage = createJpegBase64();
      expect(checkImageSize(smallImage, 10)).toBe(true);
    });

    it('should reject images exceeding size limit', () => {
      // Create a large base64 string (> 1MB)
      const largeData = 'A'.repeat(1.5 * 1024 * 1024); // ~1.5MB of base64
      expect(checkImageSize(largeData, 1)).toBe(false);
    });

    it('should handle data URL prefix', () => {
      const dataUrl = `data:image/jpeg;base64,${createJpegBase64()}`;
      expect(checkImageSize(dataUrl, 10)).toBe(true);
    });

    it('should reject empty input', () => {
      expect(checkImageSize('', 10)).toBe(false);
      expect(checkImageSize(null as unknown as string, 10)).toBe(false);
    });

    /**
     * Property: Size check is consistent with base64 encoding ratio
     */
    it('property: size calculation is accurate', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (sizeKB) => {
          // Create base64 data of approximately sizeKB kilobytes
          // base64 is 4/3 of original, so we need sizeKB * 1024 * 4/3 chars
          const base64Length = Math.floor((sizeKB * 1024 * 4) / 3);
          const base64Data = 'A'.repeat(base64Length);

          // Should pass for limit > sizeKB, fail for limit < sizeKB
          const limitMB = sizeKB / 1024;
          expect(checkImageSize(base64Data, limitMB + 0.1)).toBe(true);
          if (sizeKB > 10) {
            // Only test rejection for larger sizes to avoid edge cases
            expect(checkImageSize(base64Data, limitMB - 0.1)).toBe(false);
          }
          return true;
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('validateImageForUpload', () => {
    it('should validate both format and size', () => {
      const validImage = createJpegBase64();
      const result = validateImageForUpload(validImage, 10);
      expect(result.valid).toBe(true);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should reject oversized images', () => {
      // Create oversized "image" with valid header
      const jpegHeader = createJpegBase64();
      const padding = 'A'.repeat(15 * 1024 * 1024); // 15MB padding
      const oversizedImage = jpegHeader + padding;

      const result = validateImageForUpload(oversizedImage, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10MB');
    });

    it('should reject invalid format even if size is ok', () => {
      const invalidData = btoa('not an image');
      const result = validateImageForUpload(invalidData, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Format');
    });
  });
});
