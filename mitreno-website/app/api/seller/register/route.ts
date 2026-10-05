import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:MitrenoDB2026@140.238.164.12:5433/postgres?sslmode=disable',
  max: 10,
  connectionTimeoutMillis: 8000,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    let userId = req.headers.get('x-user-id') || '';
    if (!userId && authHeader.startsWith('Bearer ')) {
      userId = authHeader.replace('Bearer ', '').trim();
    }
    if (!userId) userId = body.user_id || '';
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to register as a seller.' },
        { status: 401 }
      );
    }

    if (!body.business_name || !body.owner_full_name || !body.owner_phone) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner full name, and phone are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Ensure user exists
      await client.query(`
        INSERT INTO public.users (id, full_name, phone, role, is_active)
        VALUES ($1, $2, $3, 'customer', true)
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone
      `, [userId, body.owner_full_name, body.owner_phone]);

      const appId = 'sa_' + Date.now().toString(36);
      const shopAddressJson = typeof body.shop_address === 'string'
        ? body.shop_address
        : JSON.stringify(body.shop_address || {});

      const insertQuery = `
        INSERT INTO seller_applications (
          id, user_id, business_name, business_type, business_category, business_description,
          owner_full_name, owner_phone, owner_email,
          aadhar_number, aadhar_photo_url, pan_number, pan_photo_url,
          voter_id_number, voter_id_photo_url, dl_number, dl_photo_url, gst_number,
          shop_address, payout_upi_id, bank_account_number, bank_ifsc,
          status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21, $22,
          'pending_review', NOW(), NOW()
        ) RETURNING *
      `;

      const values = [
        appId,
        userId,
        body.business_name,
        body.business_type || 'individual',
        body.business_category || 'Fashion & Apparel',
        body.business_description || '',
        body.owner_full_name,
        body.owner_phone,
        body.owner_email || null,
        body.aadhar_number ? body.aadhar_number.replace(/\s/g, '') : '',
        body.aadhar_photo_url || '',
        body.pan_number ? body.pan_number.toUpperCase().trim() : '',
        body.pan_photo_url || '',
        body.voter_id_number || null,
        body.voter_id_photo_url || null,
        body.dl_number || null,
        body.dl_photo_url || null,
        body.gst_number ? body.gst_number.toUpperCase().trim() : null,
        shopAddressJson,
        body.payout_upi_id || '',
        body.bank_account_number || null,
        body.bank_ifsc || null,
      ];

      const inserted = await client.query(insertQuery, values);

      return NextResponse.json({
        success: true,
        message: 'Seller application submitted successfully! Our verification team will review your KYC documents.',
        application_id: appId,
        application: inserted.rows[0],
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Next.js API Register Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
