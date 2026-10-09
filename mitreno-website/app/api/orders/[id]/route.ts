import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const oRes = await client.query(`
        SELECT o.*, s.name as shop_name, u.full_name as buyer_name, u.phone as buyer_phone
        FROM orders o
        LEFT JOIN shops s ON o.shop_id = s.id
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE o.id = $1
      `, [orderId]);

      if (oRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      const order = oRes.rows[0];
      const itemsRes = await client.query(`
        SELECT oi.*, p.name as product_name, p.thumbnail as product_thumbnail
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [orderId]);

      const trackRes = await client.query(`
        SELECT * FROM order_tracking_history
        WHERE order_id = $1
        ORDER BY sort_order ASC, created_at ASC
      `, [orderId]);

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          orderId: order.id,
          items: itemsRes.rows,
          tracking_history: trackRes.rows,
        }
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js GET /api/orders/[id] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
