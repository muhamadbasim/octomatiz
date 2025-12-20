// Device registration API endpoint
import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { registerDevice, getDevice, updateLastSeen, deviceExists } from '../../../lib/db/devices';
import type { ApiResponse, DBDevice } from '../../../types/database';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const db = getDB(locals);
    const body = await request.json().catch(() => ({}));
    const { deviceId } = body as { deviceId?: string };
    
    let device: DBDevice;
    
    if (deviceId) {
      // Check if device exists
      const existing = await getDevice(db, deviceId);
      if (existing) {
        // Update last seen and return existing device
        await updateLastSeen(db, deviceId);
        device = { ...existing, last_seen_at: new Date().toISOString() };
      } else {
        // Device ID provided but not found, register new
        device = await registerDevice(db);
      }
    } else {
      // No device ID, register new
      device = await registerDevice(db);
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
      error: 'Gagal mendaftarkan device',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
