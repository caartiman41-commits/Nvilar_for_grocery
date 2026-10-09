import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    let userId = req.headers.get('x-user-id') || '';
    if (!userId && authHeader.startsWith('Bearer ')) {
      // If token is raw user id
      const token = authHeader.replace('Bearer ', '').trim();
      if (token && !token.includes('.')) {
        userId = token;
      }
    }

    const body = await req.json().catch(() => ({}));
    if (!userId) userId = body.user_id || body.uid || '';

    const phone = body.phone || '';
    const fullName = body.full_name || '';
    const email = body.email || null;

    if (!userId && !phone) {
      return NextResponse.json(
        { success: false, error: 'User ID or Phone number required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // 1. Try to find user by ID or Phone
      let existingUser: any = null;
      if (userId) {
        const res = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (res.rows.length > 0) existingUser = res.rows[0];
      }
      if (!existingUser && phone) {
        const res = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (res.rows.length > 0) existingUser = res.rows[0];
      }

      if (existingUser) {
        // Update user if new info provided
        const finalName = fullName || existingUser.full_name;
        const finalEmail = email || existingUser.email;
        const finalPhone = phone || existingUser.phone;
        const finalId = userId || existingUser.id;

        const updateRes = await client.query(`
          UPDATE users 
          SET full_name = $1, email = $2, phone = $3, updated_at = NOW()
          WHERE id = $4
          RETURNING *
        `, [finalName, finalEmail, finalPhone, existingUser.id]);

        return NextResponse.json({
          success: true,
          user: updateRes.rows[0],
        });
      }

      // New user
      const newId = userId || ('usr_' + Date.now().toString(36));
      const newName = fullName || 'Nvilar Member';
      const insertRes = await client.query(`
        INSERT INTO users (id, phone, full_name, email, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'customer', true, NOW(), NOW())
        RETURNING *
      `, [newId, phone, newName, email]);

      return NextResponse.json({
        success: true,
        user: insertRes.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js POST /api/auth/sync Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
