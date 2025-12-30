-- ============================================
-- Migration: 001_scenarios
-- Description: Tabla para persistir escenarios/locaciones 3D
-- ============================================

CREATE TABLE IF NOT EXISTS scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    world_type VARCHAR(50) NOT NULL DEFAULT 'costa_rica',

    -- Datos del escenario (estructura 3D completa)
    scene_data JSONB NOT NULL,
    -- scene_data contiene:
    -- {
    --   "baseModel": "/assets/models/City/CityFull/City_2.glb",
    --   "placements": [
    --     {
    --       "id": "uuid",
    --       "category": "buildings|vehicles|props|...",
    --       "assetKey": "city_building_1",
    --       "position": [x, y, z],
    --       "rotation": 0,
    --       "scale": 1,
    --       "megacity": true,
    --       "customName": "Mi edificio"
    --     }
    --   ]
    -- }

    -- Versionado
    version INT DEFAULT 1,

    -- Estado
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_scenarios_code ON scenarios(code);
CREATE INDEX IF NOT EXISTS idx_scenarios_world ON scenarios(world_type);
CREATE INDEX IF NOT EXISTS idx_scenarios_active ON scenarios(is_active) WHERE is_active = true;

-- Trigger para auto-actualizar updated_at
-- Nota: La función update_updated_at_column() ya existe en la BD
CREATE TRIGGER update_scenarios_updated_at
    BEFORE UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE scenarios IS 'Escenarios/locaciones 3D creados en el editor';
COMMENT ON COLUMN scenarios.code IS 'Código único slug-friendly (ej: parque_central)';
COMMENT ON COLUMN scenarios.scene_data IS 'Datos completos del escenario: baseModel + placements[]';
COMMENT ON COLUMN scenarios.world_type IS 'Tipo de mundo: costa_rica, mexico, etc.';
