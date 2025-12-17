-- ============================================
-- CalleViva - Content Creations Migration
-- ============================================
-- 202412170000_create_content_creations.sql

CREATE TABLE IF NOT EXISTS content_creations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    recipe JSONB NOT NULL,
    creator_name VARCHAR(50) NOT NULL DEFAULT 'Nacho',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_content_status ON content_creations(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON content_creations(content_type);
CREATE INDEX IF NOT EXISTS idx_content_creator ON content_creations(creator_name);
