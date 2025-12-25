// Device registration API endpoint
import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { registerDevice, getDevice, updateLastSeen } from '../../../lib/db/devices';
import { checkRateLimit, rateLimitResponse, getClientIP } from '../../../lib/security';
import { recordCohortEvent, getCohortMonth, recordUserActivity } from '../../../lib/analytics';
import type { ApiResponse, DBDevice } from '../../../types/database';

export const POST: APIRoute = async ({ request, locals }) => {
  // Rate limiting - prevent device registration abuse
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`device-register:${clientIP}`, 10, 60000); // 10 per minute
  if (!rateLimit.allowed) {
    return rateLimitResponse(rateLimit.resetIn);
  }
  
  try {
    // Debug: Check if runtime is available
    const runtime = (locals as any).runtime;
    if (!runtime) {
      console.error('Runtime not available in locals');
      return new Response(JSON.stringify({
        success: false,
        error: 'Runtime not configured - ensure Cloudflare adapter is set up',
        debug: { hasLocals: !!locals, localsKeys: Object.keys(locals || {}) }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (!runtime.env?.DB) {
      console.error('D1 binding not found in runtime.env');
      return new Response(JSON.stringify({
        success: false,
        error: 'D1 database not configured - add DB binding in Cloudflare Pages settings',
        debug: { hasEnv: !!runtime.env, envKeys: Object.keys(runtime.env || {}) }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const db = getDB(locals);
    const body = await request.json().catch(() => ({}));
    const { deviceId } = body as { deviceId?: string };
    
    let device: DBDevice;
    let isNewDevice = false;
    const kv = runtime.env?.KV as KVNamespace | undefined;
    
    if (deviceId) {
      // Check if device exists
      const existing = await getDevice(db, deviceId);
      if (existing) {
        // Update last seen and return existing device
        await updateLastSeen(db, deviceId);
        device = { ...existing, last_seen_at: new Date().toISOString() };
        
        // Record activity for retention tracking
        recordUserActivity(db, kv, deviceId);
      } else {
        // Device ID provided but not found, register new
        device = await registerDevice(db);
        isNewDevice = true;
      }
    } else {
      // No device ID, register new
      device = await registerDevice(db);
      isNewDevice = true;
    }
    
    // Record cohort signup event for new devices
    if (isNewDevice) {
      const now = new Date();
      recordCohortEvent(db, kv, {
        deviceId: device.id,
        eventType: 'signup',
        timestamp: now.toISOString(),
        cohortMonth: getCohortMonth(now),
      });
    }
    
    const response: ApiResponse<DBDevice> = {
      success: true,
      data: device,
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Device registration error:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal mendaftarkan device',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
