/**
 * Admin Reset Data API - Clear test data from D1
 * POST /api/admin/reset-data
 * 
 * WARNING: This will delete ALL data from the database!
 * Only use for development/testing purposes.
 * 
 * REQUIRES: Authorization header with ADMIN_SECRET
 */

import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';
import { verifyAdminAuth, unauthorizedResponse, checkRateLimit, rateLimitResponse, getClientIP } from '../../../lib/security';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { locals, request } = context;
  
  try {
    // Rate limiting - very strict for destructive endpoint
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`reset:${clientIP}`, 3, 3600000); // 3 requests per hour
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetIn);
    }

    // Authentication required
    if (!verifyAdminAuth(context, request)) {
      console.warn(`Unauthorized reset-data attempt from IP: ${clientIP}`);
      return unauthorizedResponse();
    }

    const db = getDB(locals);
    
    // Delete all data from tables (order matters due to foreign keys)
    await db.exec(`
      DELETE FROM events;
      DELETE FROM projects;
      DELETE FROM devices;
    `);

    return new Response(JSON.stringify({
      success: true,
      message: 'Semua data berhasil dihapus',
      deletedTables: ['events', 'projects', 'devices'],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Reset data error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Gagal menghapus data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
