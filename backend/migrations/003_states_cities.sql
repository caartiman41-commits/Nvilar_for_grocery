-- =============================================================================
-- Migration 003: States & Cities Geographic Hierarchy
-- Creates the State → City → Shop geographic commerce engine
-- =============================================================================

-- 1. STATES TABLE (Indian states with metadata)
CREATE TABLE IF NOT EXISTS states (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CITIES TABLE (linked to states)
CREATE TABLE IF NOT EXISTS cities (
    id VARCHAR(50) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pincode_prefix VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    shop_count INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ADD GEOGRAPHIC COLUMNS TO SHOPS
ALTER TABLE shops ADD COLUMN IF NOT EXISTS city_id VARCHAR(50) REFERENCES cities(id);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS state_id VARCHAR(50) REFERENCES states(id);
ALTER TABLE shops ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_cities_featured ON cities(is_featured);
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city_id);
CREATE INDEX IF NOT EXISTS idx_shops_state ON shops(state_id);
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

-- 5. SEED STATES
INSERT INTO states (id, name, code, sort_order) VALUES
    ('maharashtra', 'Maharashtra', 'MH', 1),
    ('karnataka', 'Karnataka', 'KA', 2),
    ('tamil_nadu', 'Tamil Nadu', 'TN', 3),
    ('assam', 'Assam', 'AS', 4),
    ('delhi_ncr', 'Delhi NCR', 'DL', 5),
    ('west_bengal', 'West Bengal', 'WB', 6),
    ('rajasthan', 'Rajasthan', 'RJ', 7),
    ('uttar_pradesh', 'Uttar Pradesh', 'UP', 8),
    ('telangana', 'Telangana', 'TG', 9),
    ('gujarat', 'Gujarat', 'GJ', 10)
ON CONFLICT (id) DO NOTHING;

-- 6. SEED CITIES
INSERT INTO cities (id, state_id, name, pincode_prefix, is_featured, sort_order) VALUES
    ('mumbai', 'maharashtra', 'Mumbai', '400', TRUE, 1),
    ('pune', 'maharashtra', 'Pune', '411', FALSE, 2),
    ('nagpur', 'maharashtra', 'Nagpur', '440', FALSE, 3),
    ('bengaluru', 'karnataka', 'Bengaluru', '560', TRUE, 1),
    ('mysuru', 'karnataka', 'Mysuru', '570', FALSE, 2),
    ('chennai', 'tamil_nadu', 'Chennai', '600', TRUE, 1),
    ('coimbatore', 'tamil_nadu', 'Coimbatore', '641', FALSE, 2),
    ('guwahati', 'assam', 'Guwahati', '781', TRUE, 1),
    ('new_delhi', 'delhi_ncr', 'New Delhi', '110', TRUE, 1),
    ('noida', 'delhi_ncr', 'Noida', '201', FALSE, 2),
    ('gurugram', 'delhi_ncr', 'Gurugram', '122', FALSE, 3),
    ('kolkata', 'west_bengal', 'Kolkata', '700', TRUE, 1),
    ('jaipur', 'rajasthan', 'Jaipur', '302', TRUE, 1),
    ('lucknow', 'uttar_pradesh', 'Lucknow', '226', TRUE, 1),
    ('hyderabad', 'telangana', 'Hyderabad', '500', TRUE, 1),
    ('ahmedabad', 'gujarat', 'Ahmedabad', '380', TRUE, 1)
ON CONFLICT (id) DO NOTHING;
