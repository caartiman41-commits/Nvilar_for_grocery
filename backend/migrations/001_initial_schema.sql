-- ==========================================================
-- MITRENO HIGH-PERFORMANCE NATIVE BACKEND - DATABASE SCHEMA
-- Target Database: PostgreSQL / Supabase / Cloud SQL
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Strictly No Avatar, supports phone auth & FCM tokens)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,                         -- Firebase Phone Auth UID
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    gender VARCHAR(20) DEFAULT 'unisex',                 -- male, female, unisex
    body_measurements JSONB DEFAULT '{}'::jsonb,         -- { "height_cm": 178, "chest_inch": 40, "waist_inch": 32, "usual_size": "L" }
    android_device_tokens TEXT[] DEFAULT ARRAY[]::TEXT[],-- FCM push notification device tokens
    role VARCHAR(30) DEFAULT 'customer',                 -- customer, boutique_owner, admin
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. SHOPS / BOUTIQUES TABLE (Strictly No GPS Coordinates - Address in Bio)
CREATE TABLE IF NOT EXISTS shops (
    id VARCHAR(255) PRIMARY KEY,                         -- e.g. shop_thrift_garage
    owner_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    logo_url TEXT,
    cover_image TEXT,
    bio TEXT NOT NULL DEFAULT '',                        -- Plain-text store profile, timing & address info
    rating NUMERIC(3, 2) DEFAULT 4.80,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    payout_upi_id VARCHAR(100),                          -- Seller settlement UPI ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_verified ON shops(is_verified);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,                         -- e.g. prod_aero_fit_shirt
    shop_id VARCHAR(255) REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'Fashion',
    base_price INTEGER NOT NULL,                         -- Price in INR (e.g. 2499)
    original_price INTEGER NOT NULL,                     -- MRP before discount (e.g. 3499)
    discount_percent INTEGER DEFAULT 0,                  -- Calculated discount e.g. 29
    thumbnail TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    fabric VARCHAR(100) DEFAULT 'Premium Blend',
    gsm INTEGER DEFAULT 220,
    fit VARCHAR(60) DEFAULT 'Aero-Fit',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- 3.1 PRODUCT VARIANTS (Sizes & Inventory Management)
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(15) NOT NULL,                           -- S, M, L, XL, XXL
    color VARCHAR(50) DEFAULT 'Standard',
    stock INTEGER NOT NULL DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_size ON product_variants(size);

-- 4. REELS & SHOP VIDEO FEED (Cloudflare R2 Integration)
CREATE TABLE IF NOT EXISTS reels (
    id VARCHAR(255) PRIMARY KEY,
    shop_id VARCHAR(255) REFERENCES shops(id) ON DELETE CASCADE,
    creator_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    video_url TEXT NOT NULL,                             -- Cloudflare R2 HLS or MP4 streaming URL
    thumbnail_url TEXT,
    caption TEXT DEFAULT '',
    tagged_product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reels_shop ON reels(shop_id);
CREATE INDEX IF NOT EXISTS idx_reels_tagged_product ON reels(tagged_product_id);

-- 5. NEGOTIATIONS & LIVE BARGAIN ENGINE
CREATE TABLE IF NOT EXISTS negotiations (
    id VARCHAR(255) PRIMARY KEY,                         -- e.g. neg_xxxx
    buyer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    shop_id VARCHAR(255) REFERENCES shops(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    original_price INTEGER NOT NULL,
    buyer_last_offer INTEGER,
    seller_last_offer INTEGER,
    agreed_price INTEGER,                                -- NULL until agreement is locked
    status VARCHAR(50) DEFAULT 'active',                 -- active, accepted, rejected, expired, checkout_locked
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,       -- 24 hours expiry for negotiation session
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_negotiations_buyer ON negotiations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_shop ON negotiations(shop_id);
CREATE INDEX IF NOT EXISTS idx_negotiations_status ON negotiations(status);

-- 5.1 BARGAIN CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(255) PRIMARY KEY,
    negotiation_id VARCHAR(255) REFERENCES negotiations(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL,                     -- user_id or shop_id
    message_text TEXT DEFAULT '',
    is_counter_offer BOOLEAN DEFAULT FALSE,
    offered_price INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_negotiation ON chat_messages(negotiation_id);

-- 6. ORDERS & CHECKOUT (Supports 24h Free Cancellation)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,                         -- Unique Order ID e.g. AFZ-46804229
    buyer_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    shipping_address JSONB NOT NULL,                     -- Snapshot: { "name": "...", "phone": "...", "street": "...", "city": "...", "pincode": "..." }
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'UPI',     -- UPI, CARD, COD
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID',  -- PENDING, PAID, FAILED, REFUNDED
    total_mrp INTEGER NOT NULL,
    total_savings INTEGER DEFAULT 0,
    delivery_charge INTEGER DEFAULT 0,
    total_paid INTEGER NOT NULL,
    order_status VARCHAR(50) DEFAULT 'CONFIRMED',        -- CONFIRMED, PROCESSING, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    cancel_window_expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Placed_at + 24 Hours
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- 6.1 ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(15) NOT NULL,
    price_per_unit INTEGER NOT NULL,                     -- Captures final/bargained price
    is_cancelled BOOLEAN DEFAULT FALSE,
    cancellation_reason VARCHAR(255),
    cancellation_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- 7. ORDER TRACKING LOGISTICS TIMELINE
CREATE TABLE IF NOT EXISTS order_tracking_history (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,                          -- RECEIVED, QUALITY_CHECKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(50) NOT NULL,                         -- completed, in-progress, pending
    time_label VARCHAR(100),                             -- [Today, 11:42 pm]
    sort_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_order ON order_tracking_history(order_id);
