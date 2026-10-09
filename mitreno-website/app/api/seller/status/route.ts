import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const { searchParams } = new URL(req.url);
    let userId = req.headers.get('x-user-id') || searchParams.get('user_id') || '';
    if (!userId && authHeader.startsWith('Bearer ')) {
      userId = authHeader.replace('Bearer ', '').trim();
    }
    if (!userId) {
      return NextResponse.json({
        success: true,
        status: 'none',
        application: null,
      });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT * FROM seller_applications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [userId]);

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: true,
          status: 'none',
          application: null,
        });
      }

      const app = result.rows[0];
      return NextResponse.json({
        success: true,
        status: app.status,
        application_id: app.id,
        business_name: app.business_name,
        rejection_reason: app.rejection_reason,
        cancel_reason: app.cancel_reason,
        cancelled_at: app.cancelled_at,
        admin_notes: app.admin_notes,
        reviewed_by: app.reviewed_by,
        application: app,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js API Status Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
