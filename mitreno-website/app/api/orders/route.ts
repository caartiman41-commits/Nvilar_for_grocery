import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get('buyer_id') || searchParams.get('user_id');
    if (!buyerId) {
      return NextResponse.json({ success: true, orders: [] });
    }

    const client = await pool.connect();
    try {
      let q = `
        SELECT o.*, s.name as shop_name
        FROM orders o
        LEFT JOIN shops s ON o.shop_id = s.id
        WHERE o.buyer_id = $1
        ORDER BY o.placed_at DESC LIMIT 30
      `;
      const params = [buyerId];

      const oRes = await client.query(q, params);
      const orders = oRes.rows;

      // Fetch items for each order
      for (const ord of orders) {
        const itemsRes = await client.query(`
          SELECT oi.*, p.name as product_name, p.thumbnail as product_thumbnail
          FROM order_items oi
          LEFT JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = $1
        `, [ord.id]);
        ord.items = itemsRes.rows;
      }

      return NextResponse.json({ success: true, orders });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js GET /api/orders Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
