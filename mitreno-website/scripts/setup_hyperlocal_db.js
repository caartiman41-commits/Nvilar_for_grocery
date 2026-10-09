const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:NvilarDB2026@140.238.164.12:5433/postgres?sslmode=disable',
});

async function run() {
  const client = await pool.connect();
  try {
    const shopId = 'shop_usr_ashr_41076'; // JOIHH
    console.log(`Setting up hyper-local orders for ${shopId}...`);

    // 1. Update AFZ-617378916 to be an active hyper-local order awaiting rider (Zoo Road - 3.8 km)
    await client.query(`
      UPDATE orders SET
        delivery_tier = 'hyperlocal_same_day',
        distance_km = 3.8,
        local_dispatch_partner = 'rapido',
        local_dispatch_status = 'pending',
        rider_name = NULL,
        rider_phone = NULL,
        rider_vehicle_no = NULL,
        pickup_otp = '7492',
        delivery_otp = '3104',
        dispatch_elapsed_minutes = 14,
        delivery_target_time = NOW() + interval '2 hours 20 minutes',
        shipping_address = jsonb_set(
          jsonb_set(
            jsonb_set(shipping_address::jsonb, '{city}', '"Guwahati"'),
            '{street}', '"Zoo Road, Opp. Central Mall, Flat 3B"'
          ),
          '{pincode}', '"781024"'
        )
      WHERE id = 'AFZ-617378916'
    `);

    // 2. Update AFZ-763855455 to be a rider-assigned hyper-local order on the way (Bora Service - 2.4 km)
    await client.query(`
      UPDATE orders SET
        delivery_tier = 'hyperlocal_same_day',
        distance_km = 2.4,
        local_dispatch_partner = 'rapido',
        local_dispatch_status = 'on_route',
        rider_name = 'Bikram Sarma',
        rider_phone = '+91 98640 12845',
        rider_vehicle_no = 'Hero Splendor (AS-01-EF-4821)',
        pickup_otp = '5819',
        delivery_otp = '6621',
        dispatch_elapsed_minutes = 28,
        delivery_elapsed_minutes = 45,
        delivery_target_time = NOW() + interval '45 minutes',
        shipping_address = jsonb_set(
          jsonb_set(
            jsonb_set(shipping_address::jsonb, '{city}', '"Guwahati"'),
            '{street}', '"Bora Service, GS Road, House 12"'
          ),
          '{pincode}', '"781007"'
        )
      WHERE id = 'AFZ-763855455'
    `);

    // 3. Update ord_pkg_77412 to be a delivered hyper-local order (Dispur - 5.6 km, delivered in 1h 18m)
    await client.query(`
      UPDATE orders SET
        delivery_tier = 'hyperlocal_same_day',
        distance_km = 5.6,
        local_dispatch_partner = 'borzo',
        local_dispatch_status = 'delivered',
        rider_name = 'Pranab Deka',
        rider_phone = '+91 94350 77123',
        rider_vehicle_no = 'Honda Activa (AS-01-DJ-9034)',
        pickup_otp = '8821',
        delivery_otp = '4490',
        dispatch_elapsed_minutes = 22,
        delivery_elapsed_minutes = 78,
        delivery_target_time = NOW() - interval '2 hours',
        shipping_address = jsonb_set(
          jsonb_set(
            jsonb_set(shipping_address::jsonb, '{city}', '"Guwahati"'),
            '{street}', '"Dispur Capital Complex, Block C"'
          ),
          '{pincode}', '"781006"'
        )
      WHERE id = 'ord_pkg_77412'
    `);

    // 4. Update AFZ-850221367 to be an order where rider is at store for pickup (Ulubari - 1.9 km)
    await client.query(`
      UPDATE orders SET
        delivery_tier = 'hyperlocal_same_day',
        distance_km = 1.9,
        local_dispatch_partner = 'store_fleet',
        local_dispatch_status = 'rider_at_store',
        rider_name = 'Raju Das (Store Runner)',
        rider_phone = '+91 91012 88472',
        rider_vehicle_no = 'TVS Jupiter (AS-01-BR-1102)',
        pickup_otp = '9120',
        delivery_otp = '2871',
        dispatch_elapsed_minutes = 12,
        delivery_target_time = NOW() + interval '1 hour 15 minutes',
        shipping_address = jsonb_set(
          jsonb_set(
            jsonb_set(shipping_address::jsonb, '{city}', '"Guwahati"'),
            '{street}', '"Ulubari Chariali, Near Flyover"'
          ),
          '{pincode}', '"781008"'
        )
      WHERE id = 'AFZ-850221367'
    `);

    console.log('✅ Successfully updated orders for JOIHH to Hyper-Local Same-Day!');
  } catch (err) {
    console.error('Error updating orders:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
