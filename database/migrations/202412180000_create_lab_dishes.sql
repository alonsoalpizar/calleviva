-- ============================================
-- CalleViva - Laboratorio de Sabores Migration
-- ============================================
-- 202412180000_create_lab_dishes.sql

-- ============================================
-- PLAYER DISHES (platillos creados en el Lab)
-- ============================================
CREATE TABLE IF NOT EXISTS player_dishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Info del platillo
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Ingredientes usados (array de IDs/códigos)
    ingredients JSONB NOT NULL DEFAULT '[]',
    -- Prompt original del jugador
    player_prompt TEXT,

    -- Stats sugeridos por IA
    suggested_price INT NOT NULL DEFAULT 0,
    suggested_popularity INT NOT NULL DEFAULT 50,  -- 1-100
    suggested_difficulty VARCHAR(20) DEFAULT 'medio',  -- facil, medio, dificil
    tags JSONB DEFAULT '[]',  -- ["picante", "dulce", "tradicional"]

    -- Stats ajustados por jugador
    player_price INT,  -- NULL = usa suggested

    -- Estado en el menú
    is_in_menu BOOLEAN DEFAULT false,
    times_sold INT DEFAULT 0,
    total_revenue BIGINT DEFAULT 0,
    avg_satisfaction INT DEFAULT 0,  -- promedio de satisfacción de clientes

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(session_id, name)
);

CREATE INDEX IF NOT EXISTS idx_player_dishes_session ON player_dishes(session_id);
CREATE INDEX IF NOT EXISTS idx_player_dishes_player ON player_dishes(player_id);
CREATE INDEX IF NOT EXISTS idx_player_dishes_menu ON player_dishes(session_id, is_in_menu);

-- Trigger para updated_at
CREATE TRIGGER update_player_dishes_updated_at BEFORE UPDATE ON player_dishes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AI USAGE LIMITS (límites de uso de IA)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_usage_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL,  -- 'lab_generate', 'dialogue', etc.

    -- Límites
    hits_used INT DEFAULT 0,
    max_hits INT DEFAULT 3,  -- -1 = unlimited

    -- Reset diario
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),

    -- Bypass (para admin)
    is_unlimited BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(player_id, feature)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_player ON ai_usage_limits(player_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage_limits(feature);

-- Trigger para updated_at
CREATE TRIGGER update_ai_usage_updated_at BEFORE UPDATE ON ai_usage_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE player_dishes IS 'Platillos creados por jugadores en el Laboratorio de Sabores';
COMMENT ON TABLE ai_usage_limits IS 'Control de uso de IA por jugador para evitar abuso';
COMMENT ON COLUMN player_dishes.ingredients IS 'Array de ingredientes: [{id, type, name}]';
COMMENT ON COLUMN ai_usage_limits.max_hits IS '-1 significa ilimitado';

-- ============================================
-- FIN DE MIGRATION
-- ============================================
