-- ============================================
-- CalleViva - Initial Migration
-- ============================================
-- 001_initial.sql

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PLAYERS (usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);

-- ============================================
-- GAME SESSIONS (partidas)
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    world_type VARCHAR(50) NOT NULL DEFAULT 'costa_rica',
    name VARCHAR(100),
    game_day INT NOT NULL DEFAULT 1,
    money BIGINT NOT NULL DEFAULT 15000,
    reputation INT NOT NULL DEFAULT 0,
    current_location VARCHAR(50),
    weather VARCHAR(20) DEFAULT 'sunny',
    status VARCHAR(20) DEFAULT 'active',
    stats JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_player ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON game_sessions(status);

-- ============================================
-- TRUCKS (negocios del jugador)
-- ============================================
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Mi Food Truck',
    level INT DEFAULT 1,
    truck_type VARCHAR(50) DEFAULT 'cart',
    speed_multiplier DECIMAL(3,2) DEFAULT 1.0,
    capacity INT DEFAULT 20,
    upgrades JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trucks_session ON trucks(session_id);

-- ============================================
-- INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    cost_per_unit INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, item_type)
);

CREATE INDEX IF NOT EXISTS idx_inventory_session ON inventory(session_id);

-- ============================================
-- MENU ITEMS (productos configurados)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id UUID NOT NULL REFERENCES trucks(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(truck_id, product_type)
);

CREATE INDEX IF NOT EXISTS idx_menu_truck ON menu_items(truck_id);

-- ============================================
-- SALES LOG (historial de ventas)
-- ============================================
CREATE TABLE IF NOT EXISTS sales_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    game_day INT NOT NULL,
    game_hour INT NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    price_sold INT NOT NULL,
    cost INT NOT NULL DEFAULT 0,
    customer_type VARCHAR(50),
    customer_satisfaction INT,
    customer_dialogue TEXT,
    location VARCHAR(50),
    weather VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_session_day ON sales_log(session_id, game_day);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales_log(created_at);

-- ============================================
-- DAY SUMMARIES (resúmenes diarios)
-- ============================================
CREATE TABLE IF NOT EXISTS day_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    game_day INT NOT NULL,
    location VARCHAR(50),
    weather VARCHAR(20),
    total_revenue BIGINT DEFAULT 0,
    total_costs BIGINT DEFAULT 0,
    total_profit BIGINT DEFAULT 0,
    customers_served INT DEFAULT 0,
    customers_lost INT DEFAULT 0,
    reputation_change INT DEFAULT 0,
    top_product VARCHAR(50),
    events JSONB DEFAULT '[]',
    ai_tip TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, game_day)
);

CREATE INDEX IF NOT EXISTS idx_summaries_session ON day_summaries(session_id);

-- ============================================
-- EVENTS LOG
-- ============================================
CREATE TABLE IF NOT EXISTS events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    game_day INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100),
    event_data JSONB DEFAULT '{}',
    effects JSONB DEFAULT '{}',
    narrative_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events_log(session_id);

-- ============================================
-- NPCS (clientes y competidores conocidos)
-- ============================================
CREATE TABLE IF NOT EXISTS npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    npc_type VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    personality JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    relationship INT DEFAULT 50,
    visit_count INT DEFAULT 0,
    last_visit_day INT,
    memory JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_npcs_session ON npcs(session_id);
CREATE INDEX IF NOT EXISTS idx_npcs_type ON npcs(npc_type);

-- ============================================
-- AI CACHE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_hash VARCHAR(64) NOT NULL,
    prompt_type VARCHAR(50) NOT NULL,
    context JSONB DEFAULT '{}',
    response TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    hits INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
    UNIQUE(context_hash, prompt_type)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_cache(context_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_cache(expires_at);

-- ============================================
-- UPGRADES (mejoras compradas)
-- ============================================
CREATE TABLE IF NOT EXISTS upgrades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    upgrade_type VARCHAR(50) NOT NULL,
    upgrade_level INT DEFAULT 1,
    purchased_day INT NOT NULL,
    cost_paid BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, upgrade_type)
);

CREATE INDEX IF NOT EXISTS idx_upgrades_session ON upgrades(session_id);

-- ============================================
-- ACHIEVEMENTS (logros)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
    data JSONB DEFAULT '{}',
    UNIQUE(player_id, achievement_type)
);

CREATE INDEX IF NOT EXISTS idx_achievements_player ON achievements(player_id);

-- ============================================
-- LEADERBOARDS (para futuro multiplayer)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    world_type VARCHAR(50) NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    period_key VARCHAR(20) NOT NULL,
    score BIGINT NOT NULL DEFAULT 0,
    rank INT,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, world_type, period_type, period_key)
);

CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(world_type, period_type, period_key);
CREATE INDEX IF NOT EXISTS idx_leaderboards_score ON leaderboards(score DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at BEFORE UPDATE ON trucks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON npcs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES (Mundo Costa Rica)
-- ============================================

-- Estos datos podrían ir en archivos JSON, pero los dejamos aquí para referencia
-- En producción, se cargarían desde archivos de configuración

COMMENT ON TABLE players IS 'Usuarios registrados en CalleViva';
COMMENT ON TABLE game_sessions IS 'Partidas/mundos de cada jugador';
COMMENT ON TABLE trucks IS 'Food trucks de cada partida';
COMMENT ON TABLE sales_log IS 'Historial de ventas para analytics';
COMMENT ON TABLE ai_cache IS 'Cache de respuestas de Claude para optimizar costos';

-- ============================================
-- FIN DE MIGRATION
-- ============================================
