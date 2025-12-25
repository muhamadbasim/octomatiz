// KV Error Handler for OCTOmatiz
// Provides safe wrappers for KV operations with error handling and retry logic

export type KVErrorCode = 'KV_UNAVAILABLE' | 'KV_READ_ERROR' | 'KV_WRITE_ERROR' | 'NOT_FOUND';

export interface KVErrorResult {
  success: boolean;
  error?: string;
  errorCode?: KVErrorCode;
}

export interface SafeKVGetResult<T> {
  data: T | null;
  error?: KVErrorResult;
}

/**
 * Check if KV binding is available
 */
export function isKVAvailable(kv: KVNamespace | undefined): kv is KVNamespace {
  return kv !== undefined && kv !== null;
}

/**
 * Safe KV get with error handling
 * Returns data or error result, never throws
 */
export async function safeKVGet<T>(
  kv: KVNamespace | undefined,
  key: string
): Promise<SafeKVGetResult<T>> {
  if (!isKVAvailable(kv)) {
    return {
      data: null,
      error: {
        success: false,
        error: 'KV storage tidak tersedia',
        errorCode: 'KV_UNAVAILABLE',
      },
    };
  }

  try {
    const data = await kv.get(key, 'json') as T | null;
    return { data };
  } catch (err) {
    console.error(`KV read error for key ${key}:`, err);
    return {
      data: null,
      error: {
        success: false,
        error: 'Gagal membaca data dari storage',
        errorCode: 'KV_READ_ERROR',
      },
    };
  }
}


/**
 * Safe KV put with retry logic
 * Retries once on failure before returning error
 */
export async function safeKVPut(
  kv: KVNamespace | undefined,
  key: string,
  value: string,
  options?: KVNamespacePutOptions
): Promise<KVErrorResult> {
  if (!isKVAvailable(kv)) {
    return {
      success: false,
      error: 'KV storage tidak tersedia',
      errorCode: 'KV_UNAVAILABLE',
    };
  }

  // First attempt
  try {
    await kv.put(key, value, options);
    return { success: true };
  } catch (firstError) {
    console.warn(`KV write failed (attempt 1) for key ${key}:`, firstError);
    
    // Retry once
    try {
      await kv.put(key, value, options);
      console.log(`KV write succeeded on retry for key ${key}`);
      return { success: true };
    } catch (retryError) {
      console.error(`KV write failed (attempt 2) for key ${key}:`, retryError);
      return {
        success: false,
        error: 'Gagal menyimpan data ke storage',
        errorCode: 'KV_WRITE_ERROR',
      };
    }
  }
}

/**
 * Generate branded error page HTML
 */
export function generateErrorPage(
  errorCode: KVErrorCode | 'GENERIC',
  slug?: string
): string {
  const errorMessages: Record<string, { title: string; message: string; emoji: string }> = {
    KV_UNAVAILABLE: {
      title: 'Layanan Tidak Tersedia',
      message: 'Maaf, layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.',
      emoji: '🔧',
    },
    KV_READ_ERROR: {
      title: 'Gagal Memuat Halaman',
      message: 'Terjadi kesalahan saat memuat halaman. Silakan refresh atau coba lagi nanti.',
      emoji: '😵',
    },
    KV_WRITE_ERROR: {
      title: 'Gagal Menyimpan',
      message: 'Terjadi kesalahan saat menyimpan halaman. Silakan coba lagi.',
      emoji: '💾',
    },
    NOT_FOUND: {
      title: 'Halaman Tidak Ditemukan',
      message: slug 
        ? `Halaman "${slug}" tidak ditemukan atau sudah dihapus.`
        : 'Halaman yang Anda cari tidak ditemukan.',
      emoji: '🔍',
    },
    GENERIC: {
      title: 'Terjadi Kesalahan',
      message: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
      emoji: '😔',
    },
  };

  const { title, message, emoji } = errorMessages[errorCode] || errorMessages.GENERIC;
  const statusCode = errorCode === 'NOT_FOUND' ? '404' : '503';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - OCTOmatiz</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0f0d 0%, #112117 50%, #0a0f0d 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      padding: 1rem;
    }
    .container {
      text-align: center;
      max-width: 400px;
      padding: 2rem;
    }
    .logo {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    .brand-icon {
      font-size: 1.5rem;
    }
    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: #36e27b;
    }
    .status-code {
      font-size: 4rem;
      font-weight: 800;
      color: #36e27b;
      opacity: 0.3;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #fff;
    }
    p {
      color: #9ca3af;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: #36e27b;
      color: #000;
      text-decoration: none;
      border-radius: 9999px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn:hover {
      background: #2bc968;
      transform: translateY(-2px);
    }
    .footer {
      margin-top: 3rem;
      font-size: 0.75rem;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="brand">
      <span class="brand-icon">🐙</span>
      <span class="brand-text">OCTOmatiz</span>
    </div>
    <div class="status-code">${statusCode}</div>
    <div class="logo">${emoji}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="/" class="btn">
      ← Kembali ke Beranda
    </a>
    <div class="footer">
      Powered by OCTOmatiz
    </div>
  </div>
</body>
</html>`;
}

/**
 * Get HTTP status code for error
 */
export function getStatusCodeForError(errorCode: KVErrorCode): number {
  switch (errorCode) {
    case 'NOT_FOUND':
      return 404;
    case 'KV_UNAVAILABLE':
    case 'KV_READ_ERROR':
      return 503;
    case 'KV_WRITE_ERROR':
      return 500;
    default:
      return 500;
  }
}
