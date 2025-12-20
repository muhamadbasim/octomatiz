/**
 * Admin Reset Data API - Clear test data from D1
 * POST /api/admin/reset-data
 * 
 * WARNING: This will delete ALL data from the database!
 * Only use for development/testing purposes.
 */

import type { APIRoute } from 'astro';
import { getDB } from '../../../lib/db/client';

export const prerender = false;

export const POST: APIRoute = async ({ locals, request }) => {
  try {
    // Optional: Add authentication check here
    // const authHeader = request.headers.get('Authorization');
    // if (authHeader !== `Bearer ${import.meta.env.ADMIN_SECRET}`) {
    //   return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    // }

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
