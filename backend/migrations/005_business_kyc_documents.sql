-- ==========================================================
-- MITRENO BUSINESS KYC DOCUMENTS - DATABASE SCHEMA
-- Migration 005: Dynamic business KYC documents for Individual, Partnership, and Company
-- ==========================================================

ALTER TABLE seller_applications 
    ADD COLUMN IF NOT EXISTS business_documents JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS cin_number VARCHAR(25),
    ADD COLUMN IF NOT EXISTS coi_photo_url TEXT,
    ADD COLUMN IF NOT EXISTS firm_pan_number VARCHAR(10),
    ADD COLUMN IF NOT EXISTS partnership_deed_url TEXT;

-- Comments for documentation
COMMENT ON COLUMN seller_applications.business_documents IS 'Dynamic KYC documents (CIN, COI photo URL, Firm PAN, Partnership Deed URL, Board Resolution URL, Managing Partner details, Director details)';
COMMENT ON COLUMN seller_applications.cin_number IS 'Corporate Identification Number (for Company / LLP)';
COMMENT ON COLUMN seller_applications.coi_photo_url IS 'Certificate of Incorporation photo / PDF URL';
COMMENT ON COLUMN seller_applications.firm_pan_number IS 'Firm / Entity PAN Number (for Partnership / Company)';
COMMENT ON COLUMN seller_applications.partnership_deed_url IS 'Partnership Deed photo / PDF URL';
