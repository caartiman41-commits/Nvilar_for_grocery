const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:MitrenoDB2026@140.238.164.12:5433/postgres?sslmode=disable'
  });
  await client.connect();

  console.log('Connected to PostgreSQL database...');

  // 1. Add default_commission_rate to cities and commission_rate to shops
  await client.query(`
    ALTER TABLE cities ADD COLUMN IF NOT EXISTS default_commission_rate NUMERIC(5,2) DEFAULT 10.00;
    ALTER TABLE shops ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) DEFAULT 10.00;
  `);

  // 2. Set default baseline commission if null
  await client.query(`
    UPDATE cities SET default_commission_rate = 12.00 WHERE default_commission_rate IS NULL;
    UPDATE shops SET commission_rate = 12.00 WHERE commission_rate IS NULL;
  `);

  // 3. Inspect columns
  const cityCols = await client.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'cities' AND column_name IN ('default_commission_rate', 'total_revenue', 'shop_count');
  `);
  console.log('City Columns:', cityCols.rows);

  const shopCols = await client.query(`
    SELECT column_name, data_type, column_default 
    FROM information_schema.columns 
    WHERE table_name = 'shops' AND column_name IN ('commission_rate', 'city_id', 'state_id');
  `);
  console.log('Shop Columns:', shopCols.rows);

  const sampleCities = await client.query('SELECT id, name, default_commission_rate, shop_count FROM cities ORDER BY name ASC LIMIT 5');
  console.log('Sample Cities:', sampleCities.rows);

  await client.end();
  console.log('Migration completed successfully!');
}

main().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
