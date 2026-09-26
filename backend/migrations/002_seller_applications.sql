-- ==========================================================
-- MITRENO SELLER APPLICATIONS - DATABASE SCHEMA
-- Migration 002: Seller onboarding & KYC tracking
-- ==========================================================

-- Seller Applications Table (KYC + Document Photos via R2)
CREATE TABLE IF NOT EXISTS seller_applications (
    id                  VARCHAR(255) PRIMARY KEY,           -- e.g. sa_xxxx
    user_id             VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Business Info
    business_name       VARCHAR(150) NOT NULL,
    business_type       VARCHAR(50) NOT NULL DEFAULT 'individual',  -- individual / partnership / company
    business_category   VARCHAR(100) NOT NULL DEFAULT 'Fashion',
    business_description TEXT DEFAULT '',

    -- Owner KYC Identity
    owner_full_name     VARCHAR(120) NOT NULL,
    owner_phone         VARCHAR(20) NOT NULL,
    owner_email         VARCHAR(255),

    -- KYC Document Numbers + R2 Photo URLs
    aadhar_number       VARCHAR(12) NOT NULL,
    aadhar_photo_url    TEXT NOT NULL,                       -- Cloudflare R2 uploaded photo
    pan_number          VARCHAR(10) NOT NULL,
    pan_photo_url       TEXT NOT NULL,
    voter_id_number     VARCHAR(20),                         -- Optional
    voter_id_photo_url  TEXT,
    dl_number           VARCHAR(20),                         -- Optional
    dl_photo_url        TEXT,
    gst_number          VARCHAR(15),                         -- Optional

    -- Business Documents & Entity Specifics (Dynamic JSONB & Convenience Fields)
    business_documents  JSONB DEFAULT '{}'::jsonb,           -- Dynamic KYC documents (CIN, COI, Deed, Resolution, etc.)
    cin_number          VARCHAR(25),                         -- Corporate Identification Number (Company / LLP)
    coi_photo_url       TEXT,                                -- Certificate of Incorporation URL
    firm_pan_number     VARCHAR(10),                         -- Firm / Entity PAN Number
    partnership_deed_url TEXT,                               -- Partnership Deed URL

    -- Shop Address
    shop_address        JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { "street", "city", "state", "pincode", "landmark" }

    -- Payout & Bank
    payout_upi_id       VARCHAR(100) NOT NULL,
    bank_account_number VARCHAR(20),
    bank_ifsc           VARCHAR(11),

    -- Application Lifecycle
    status              VARCHAR(30) NOT NULL DEFAULT 'pending_review',  -- pending_review / approved / rejected
    admin_notes         TEXT,
    rejection_reason    TEXT,
    reviewed_by         VARCHAR(255),
    reviewed_at         TIMESTAMP WITH TIME ZONE,

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_seller_apps_user ON seller_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_apps_status ON seller_applications(status);
CREATE INDEX IF NOT EXISTS idx_seller_apps_created ON seller_applications(created_at DESC);

-- Prevent multiple pending applications from same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_apps_unique_pending
    ON seller_applications(user_id)
    WHERE status = 'pending_review';
