-- 004_user_presence_telemetry.sql
-- Production telemetry tables for real-time presence, heatbeats & customer search radar

CREATE TABLE IF NOT EXISTS user_presences (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer', -- 'customer' or 'seller'
    shop_id VARCHAR(255),
    current_route VARCHAR(255) DEFAULT '/',
    device VARCHAR(30) DEFAULT 'mobile',
    city VARCHAR(100) DEFAULT 'India',
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_presences_last_seen ON user_presences(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_presences_role_last_seen ON user_presences(role, last_seen);
CREATE INDEX IF NOT EXISTS idx_user_presences_shop_id ON user_presences(shop_id);

CREATE TABLE IF NOT EXISTS search_telemetries (
    id BIGSERIAL PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    user_session VARCHAR(64),
    results_count INT DEFAULT 0,
    searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_telemetries_searched_at ON search_telemetries(searched_at);
CREATE INDEX IF NOT EXISTS idx_search_telemetries_query ON search_telemetries(query);
