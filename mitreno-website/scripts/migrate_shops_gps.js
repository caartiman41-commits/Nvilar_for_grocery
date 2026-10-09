const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
});

async function migrate() {
  await client.connect();
  console.log('Connected to PostgreSQL database...');

  // 1. Add latitude and longitude columns to shops
  await client.query(`
    ALTER TABLE shops 
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
  `);
  console.log('Added latitude and longitude columns to shops table.');

  // 2. Set realistic coordinates for known shops
  // JOIHH & Guwahati shops: Fancy Bazaar, Guwahati (26.1859° N, 91.7454° E)
  await client.query(`
    UPDATE shops 
    SET latitude = 26.1859, longitude = 91.7454 
    WHERE id = 'shop_usr_ashr_41076' OR city ILIKE '%Guwahati%' OR name ILIKE '%JOIHH%';
  `);

  // Delhi shops: Sarojini Nagar, New Delhi (28.5770° N, 77.1983° E)
  await client.query(`
    UPDATE shops 
    SET latitude = 28.5770, longitude = 77.1983 
    WHERE city ILIKE '%Delhi%' AND (latitude IS NULL OR latitude = 0);
  `);

  // Srinagar shops: Lal Chowk (34.0725° N, 74.8093° E)
  await client.query(`
    UPDATE shops 
    SET latitude = 34.0725, longitude = 74.8093 
    WHERE city ILIKE '%Srinagar%' AND (latitude IS NULL OR latitude = 0);
  `);

  // Bengaluru shops: Commercial St (12.9822° N, 77.6083° E)
  await client.query(`
    UPDATE shops 
    SET latitude = 12.9822, longitude = 77.6083 
    WHERE city ILIKE '%Bengaluru%' AND (latitude IS NULL OR latitude = 0);
  `);

  // Pune shops: FC Road (18.5204° N, 73.8410° E)
  await client.query(`
    UPDATE shops 
    SET latitude = 18.5204, longitude = 73.8410 
    WHERE city ILIKE '%Pune%' AND (latitude IS NULL OR latitude = 0);
  `);

  // Default fallback coordinates for any remaining shops
  await client.query(`
    UPDATE shops 
    SET latitude = 26.1859, longitude = 91.7454 
    WHERE latitude IS NULL;
  `);

  const res = await client.query('SELECT id, name, city, latitude, longitude FROM shops LIMIT 6');
  console.log('Updated shops with GPS coordinates:');
  console.table(res.rows);

  await client.end();
  console.log('Migration complete.');
}

migrate().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
