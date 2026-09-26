-- Migration 002: Enterprise Relational Tables (Followers, Reviews, Wishlist)
-- Flipkart / Meesho Standard Relational Mapping

-- 1. Create shop_followers table
CREATE TABLE IF NOT EXISTS shop_followers (
    user_id VARCHAR(255) NOT NULL,
    shop_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, shop_id),
    CONSTRAINT fk_shop_followers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_followers_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shop_followers_shop ON shop_followers(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_followers_user ON shop_followers(user_id);

-- 2. Create shop_reviews table
CREATE TABLE IF NOT EXISTS shop_reviews (
    id VARCHAR(255) PRIMARY KEY,
    shop_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    order_id VARCHAR(255) NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_shop_reviews_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shop_reviews_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_shop_reviews_shop ON shop_reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_reviews_user ON shop_reviews(user_id);

-- 3. Create user_wishlists table
CREATE TABLE IF NOT EXISTS user_wishlists (
    user_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id),
    CONSTRAINT fk_user_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_wishlists_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_wishlists_user ON user_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlists_product ON user_wishlists(product_id);

-- 4. Update shops table default rating and review count
ALTER TABLE shops ALTER COLUMN rating SET DEFAULT 0.00;
ALTER TABLE shops ALTER COLUMN review_count SET DEFAULT 0;

-- Reset hardcoded 4.80 ratings on shops that have 0 real reviews
UPDATE shops 
SET rating = 0.00, review_count = 0 
WHERE review_count = 0 OR review_count IS NULL;
