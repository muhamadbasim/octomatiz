// Device operations for D1
import type { DBDevice } from '../../types/database';
import { generateDeviceId, generateLinkCode, nowISO, firstOrNull, toArray } from './client';

export async function registerDevice(db: D1Database): Promise<DBDevice> {
  const id = generateDeviceId();
  const now = nowISO();
  
  await db.prepare(`
    INSERT INTO devices (id, created_at, last_seen_at)
    VALUES (?, ?, ?)
  `).bind(id, now, now).run();
  
  return {
    id,
    created_at: now,
    last_seen_at: now,
    link_code: null,
    linked_to: null,
  };
}

export async function getDevice(db: D1Database, id: string): Promise<DBDevice | null> {
  const result = await db.prepare(`
    SELECT * FROM devices WHERE id = ?
  `).bind(id).first<DBDevice>();
  
  return result;
}

export async function updateLastSeen(db: D1Database, id: string): Promise<void> {
  await db.prepare(`
    UPDATE devices SET last_seen_at = ? WHERE id = ?
  `).bind(nowISO(), id).run();
}

export async function createLinkCode(db: D1Database, deviceId: string): Promise<string> {
  const code = generateLinkCode();
  
  await db.prepare(`
    UPDATE devices SET link_code = ? WHERE id = ?
  `).bind(code, deviceId).run();
  
  return code;
}

export async function linkDevices(db: D1Database, linkCode: string, newDeviceId: string): Promise<boolean> {
  // Find device with this link code
  const sourceDevice = await db.prepare(`
    SELECT id FROM devices WHERE link_code = ?
  `).bind(linkCode).first<{ id: string }>();
  
  if (!sourceDevice) {
    return false;
  }
  
  // Link new device to source device
  await db.prepare(`
    UPDATE devices SET linked_to = ? WHERE id = ?
  `).bind(sourceDevice.id, newDeviceId).run();
  
  // Clear the link code (one-time use)
  await db.prepare(`
    UPDATE devices SET link_code = NULL WHERE id = ?
  `).bind(sourceDevice.id).run();
  
  return true;
}

export async function getLinkedDeviceIds(db: D1Database, deviceId: string): Promise<string[]> {
  // Get all devices linked to this device (including self)
  const results = await db.prepare(`
    SELECT id FROM devices 
    WHERE id = ? OR linked_to = ? OR id = (SELECT linked_to FROM devices WHERE id = ?)
  `).bind(deviceId, deviceId, deviceId).all<{ id: string }>();
  
  return toArray(results).map(r => r.id);
}

export async function deviceExists(db: D1Database, id: string): Promise<boolean> {
  const result = await db.prepare(`
    SELECT 1 FROM devices WHERE id = ? LIMIT 1
  `).bind(id).first();
  
  return result !== null;
}
