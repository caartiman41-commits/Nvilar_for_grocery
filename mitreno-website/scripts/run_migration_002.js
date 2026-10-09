const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  connectionString: 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
});

async function main() {
  await client.connect();
  console.log('✅ Connected to PostgreSQL database...');

  const sqlPath = path.join(__dirname, '../go-backend/migrations/002_enterprise_relational_tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('🔄 Executing Migration 002: Enterprise Relational Tables...');
  await client.query(sql);
  console.log('🎉 Migration 002 executed successfully!');

  // Verify created tables
  console.log('\n=== VERIFYING NEW TABLES ===');
  const tables = ['shop_followers', 'shop_reviews', 'user_wishlists'];
  for (const table of tables) {
    const res = await client.query(`
      SELECT count(*) FROM information_schema.tables 
      WHERE table_schema = CURRENT_SCHEMA() AND table_name = $1
    `, [table]);
    console.log(`Table ${table}: ${res.rows[0].count === '1' ? 'EXISTS ✅' : 'MISSING ❌'}`);
  }

  // Verify shop rating defaults
  const shopsRes = await client.query(`SELECT id, name, rating, review_count FROM shops LIMIT 5`);
  console.log('\n=== VERIFYING SHOPS RATING DEFAULTS ===');
  console.table(shopsRes.rows);

  await client.end();
}

main().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
