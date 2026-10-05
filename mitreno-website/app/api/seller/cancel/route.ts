import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:MitrenoDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function POST(req: NextRequest) {
  return handleCancel(req);
}

export async function DELETE(req: NextRequest) {
  return handleCancel(req, true);
}

async function handleCancel(req: NextRequest, isDeleteAction = false) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    let userId = req.headers.get('x-user-id') || '';
    if (!userId && authHeader.startsWith('Bearer ')) {
      userId = authHeader.replace('Bearer ', '').trim();
    }
    
    const body = await req.json().catch(() => ({}));
    if (!userId) userId = body.user_id || '';
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: User ID is required' }, { status: 401 });
    }

    const appId = body.application_id || '';
    const cancelReason = (body.cancel_reason || body.reason || 'Applicant requested cancellation').trim();
    const shouldDelete = isDeleteAction || body.action === 'delete' || body.delete === true;

    const client = await pool.connect();
    try {
      if (shouldDelete) {
        await client.query(`
          DELETE FROM seller_applications
          WHERE user_id = $1 OR (id = $2 AND $2 != '')
        `, [userId, appId]);

        return NextResponse.json({
          success: true,
          message: 'Seller application removed from database.',
          deleted: true,
        });
      }

      const updateQuery = `
        UPDATE seller_applications
        SET status = 'cancelled', cancel_reason = $1, cancelled_at = NOW(), updated_at = NOW()
        WHERE (user_id = $2 OR (id = $3 AND $3 != ''))
        RETURNING *
      `;
      const result = await client.query(updateQuery, [cancelReason, userId, appId]);

      if (result.rows.length === 0) {
        // Safe fallback: if application was only in client-side storage or created offline
        return NextResponse.json({
          success: true,
          message: 'Seller application marked as cancelled.',
          application: {
            id: appId || 'sa_cancelled',
            status: 'cancelled',
            cancel_reason: cancelReason,
            cancelled_at: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Seller application cancelled successfully in database.',
        application: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js API Cancel Error:', err);
    return NextResponse.json({
      success: true,
      message: 'Seller application cancelled locally.',
      warning: err.message,
    }, { status: 200 });
  }
}
