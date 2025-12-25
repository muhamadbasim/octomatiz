/**
 * Image Validation Utilities
 * Validates image format and size for security
 * **Feature: security-hardening, Task 7: Image Validation**
 */

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
}

// Magic bytes for common image formats
const IMAGE_SIGNATURES: { bytes: number[]; mimeType: string }[] = [
  // JPEG: FF D8 FF
  { bytes: [0xff, 0xd8, 0xff], mimeType: 'image/jpeg' },
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mimeType: 'image/png' },
  // GIF87a: 47 49 46 38 37 61
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], mimeType: 'image/gif' },
  // GIF89a: 47 49 46 38 39 61
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], mimeType: 'image/gif' },
  // WebP: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  { bytes: [0x52, 0x49, 0x46, 0x46], mimeType: 'image/webp' },
];

/**
 * Decode base64 string to Uint8Array
 * Handles both data URL format and raw base64
 */
function decodeBase64(base64Data: string): Uint8Array | null {
  try {
    // Remove data URL prefix if present
    let base64 = base64Data;
    if (base64.includes(',')) {
      base64 = base64.split(',')[1];
    }
    
    // Decode base64 to binary string
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i++) {
    if (bytes[i] !== signature[i]) return false;
  }
  return true;
}

/**
 * Additional check for WebP format (RIFF....WEBP)
 */
function isWebP(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  // Check RIFF header
  if (!matchesSignature(bytes, [0x52, 0x49, 0x46, 0x46])) return false;
  // Check WEBP at offset 8
  return bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

/**
 * Validate base64 image data
 * Checks for valid image magic bytes (JPEG, PNG, GIF, WebP)
 * @param base64Data - Base64 encoded image data (with or without data URL prefix)
 * @returns Validation result with mime type if valid
 */
export function validateBase64Image(base64Data: string): ImageValidationResult {
  if (!base64Data || typeof base64Data !== 'string') {
    return { valid: false, error: 'Data gambar tidak valid' };
  }

  // Decode base64
  const bytes = decodeBase64(base64Data);
  if (!bytes || bytes.length === 0) {
    return { valid: false, error: 'Format base64 tidak valid' };
  }

  // Check for WebP specifically (needs special handling)
  if (isWebP(bytes)) {
    return { valid: true, mimeType: 'image/webp' };
  }

  // Check against known image signatures
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.mimeType === 'image/webp') continue; // Already handled
    if (matchesSignature(bytes, sig.bytes)) {
      return { valid: true, mimeType: sig.mimeType };
    }
  }

  return { valid: false, error: 'Format gambar tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP.' };
}

/**
 * Check if base64 image data is within size limit
 * @param base64Data - Base64 encoded image data
 * @param maxSizeMB - Maximum size in megabytes (default: 10MB)
 * @returns true if within limit, false if exceeds
 */
export function checkImageSize(base64Data: string, maxSizeMB: number = 10): boolean {
  if (!base64Data || typeof base64Data !== 'string') {
    return false;
  }

  // Remove data URL prefix if present
  let base64 = base64Data;
  if (base64.includes(',')) {
    base64 = base64.split(',')[1];
  }

  // Calculate approximate size: base64 is ~4/3 of original size
  // So original size ≈ base64.length * 3/4
  const approximateSizeBytes = (base64.length * 3) / 4;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  return approximateSizeBytes <= maxSizeBytes;
}

/**
 * Validate image for upload
 * Combines format and size validation
 * @param base64Data - Base64 encoded image data
 * @param maxSizeMB - Maximum size in megabytes (default: 10MB)
 * @returns Validation result
 */
export function validateImageForUpload(
  base64Data: string,
  maxSizeMB: number = 10
): ImageValidationResult {
  // Check size first (cheaper operation)
  if (!checkImageSize(base64Data, maxSizeMB)) {
    return { valid: false, error: `Ukuran gambar melebihi ${maxSizeMB}MB` };
  }

  // Then validate format
  return validateBase64Image(base64Data);
}
