/**
 * Image Compressor Utility
 * Compresses images client-side before sending to AI API
 * Target: < 500KB for optimal API performance
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  maxSizeKB: 500,
};

/**
 * Compress an image file to a smaller size
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<string> - Base64 encoded compressed image
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const compressed = resizeAndCompress(img, opts);
          resolve(compressed);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress a base64 image string
 * @param base64 - Base64 encoded image
 * @param options - Compression options
 * @returns Promise<string> - Compressed base64 image
 */
export async function compressBase64(
  base64: string,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const compressed = resizeAndCompress(img, opts);
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
}

function resizeAndCompress(img: HTMLImageElement, opts: CompressOptions): string {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8, maxSizeKB = 500 } = opts;
  
  // Calculate new dimensions while maintaining aspect ratio
  let { width, height } = img;
  
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  
  // Use better image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);
  
  // Try to compress to target size
  let currentQuality = quality;
  let result = canvas.toDataURL('image/jpeg', currentQuality);
  
  // Iteratively reduce quality if still too large
  while (getBase64SizeKB(result) > maxSizeKB && currentQuality > 0.1) {
    currentQuality -= 0.1;
    result = canvas.toDataURL('image/jpeg', currentQuality);
  }
  
  return result;
}

/**
 * Get the size of a base64 string in KB
 */
export function getBase64SizeKB(base64: string): number {
  // Remove data URL prefix if present
  const base64Data = base64.split(',')[1] || base64;
  // Base64 encodes 3 bytes into 4 characters
  const sizeInBytes = (base64Data.length * 3) / 4;
  return sizeInBytes / 1024;
}

/**
 * Format file size for display
 */
export function formatFileSize(sizeKB: number): string {
  if (sizeKB < 1024) {
    return `${Math.round(sizeKB)} KB`;
  }
  return `${(sizeKB / 1024).toFixed(1)} MB`;
}
