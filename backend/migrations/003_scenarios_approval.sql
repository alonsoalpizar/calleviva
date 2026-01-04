-- Migration: Add approval system to scenarios table
-- This allows scenarios to go through an approval workflow like content_creations

-- Add approval-related columns
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS creator_name VARCHAR(50) DEFAULT 'admin';
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS zone_id VARCHAR(50);  -- playa, comercial, financiera, etc.
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES players(id);
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_scenarios_status ON scenarios(status);
CREATE INDEX IF NOT EXISTS idx_scenarios_creator ON scenarios(creator_name);
CREATE INDEX IF NOT EXISTS idx_scenarios_zone ON scenarios(zone_id);

-- Update existing scenarios to approved status (they were created before approval system)
UPDATE scenarios SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Comment explaining the status values
COMMENT ON COLUMN scenarios.status IS 'Approval status: pending, approved, rejected';
COMMENT ON COLUMN scenarios.zone_id IS 'Base zone ID: playa, comercial, financiera, residencial, parque, centro';
