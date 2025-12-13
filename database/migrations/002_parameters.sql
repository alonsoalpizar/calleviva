-- ============================================
-- CalleViva - Parameters Migration
-- ============================================
-- 002_parameters.sql

-- ============================================
-- PARAMETERS (configuración dinámica)
-- ============================================
CREATE TABLE IF NOT EXISTS parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,        -- 'countries', 'weather', 'truck_types', etc.
    code VARCHAR(50) NOT NULL,            -- 'costa_rica', 'sunny', 'cart', etc.
    name VARCHAR(100) NOT NULL,           -- 'Costa Rica', 'Soleado', 'Carrito'
    description TEXT,
    icon VARCHAR(10),                     -- emoji o código de icono
    config JSONB DEFAULT '{}',            -- configuración adicional
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category, code)
);

CREATE INDEX IF NOT EXISTS idx_parameters_category ON parameters(category);
CREATE INDEX IF NOT EXISTS idx_parameters_active ON parameters(category, is_active);

-- Trigger para updated_at
CREATE TRIGGER update_parameters_updated_at BEFORE UPDATE ON parameters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Países/Mundos
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('countries', 'costa_rica', 'Costa Rica', '🇨🇷', 1, '{"currency": "₡", "currency_name": "colones", "starting_money": 15000}'),
('countries', 'mexico', 'México', '🇲🇽', 2, '{"currency": "$", "currency_name": "pesos", "starting_money": 500}'),
('countries', 'usa', 'Estados Unidos', '🇺🇸', 3, '{"currency": "$", "currency_name": "dollars", "starting_money": 100}')
ON CONFLICT (category, code) DO NOTHING;

-- Tipos de clima
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('weather', 'sunny', 'Soleado', '☀️', 1, '{"customer_modifier": 1.2, "mood": "happy"}'),
('weather', 'cloudy', 'Nublado', '☁️', 2, '{"customer_modifier": 1.0, "mood": "neutral"}'),
('weather', 'rainy', 'Lluvioso', '🌧️', 3, '{"customer_modifier": 0.6, "mood": "sad"}'),
('weather', 'stormy', 'Tormenta', '⛈️', 4, '{"customer_modifier": 0.3, "mood": "scared"}')
ON CONFLICT (category, code) DO NOTHING;

-- Tipos de Food Truck
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('truck_types', 'cart', 'Carrito', '🛒', 1, '{"capacity": 20, "speed": 1.0, "cost": 0}'),
('truck_types', 'stand', 'Puesto', '🏪', 2, '{"capacity": 40, "speed": 0.8, "cost": 25000}'),
('truck_types', 'truck', 'Food Truck', '🚚', 3, '{"capacity": 80, "speed": 1.2, "cost": 100000}'),
('truck_types', 'restaurant', 'Restaurante Móvil', '🍽️', 4, '{"capacity": 150, "speed": 0.5, "cost": 500000}')
ON CONFLICT (category, code) DO NOTHING;

-- Estados de partida
INSERT INTO parameters (category, code, name, icon, sort_order) VALUES
('game_status', 'active', 'Activa', '🎮', 1),
('game_status', 'paused', 'Pausada', '⏸️', 2),
('game_status', 'finished', 'Terminada', '🏁', 3)
ON CONFLICT (category, code) DO NOTHING;

-- Tipos de productos (Costa Rica)
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('products_cr', 'gallo_pinto', 'Gallo Pinto', '🍳', 1, '{"base_price": 2500, "base_cost": 800}'),
('products_cr', 'casado', 'Casado', '🍽️', 2, '{"base_price": 4500, "base_cost": 1500}'),
('products_cr', 'empanadas', 'Empanadas', '🥟', 3, '{"base_price": 1500, "base_cost": 400}'),
('products_cr', 'churchill', 'Churchill', '🍧', 4, '{"base_price": 2000, "base_cost": 500}'),
('products_cr', 'agua_dulce', 'Agua Dulce', '☕', 5, '{"base_price": 1000, "base_cost": 200}'),
('products_cr', 'tacos', 'Tacos Ticos', '🌮', 6, '{"base_price": 2000, "base_cost": 600}')
ON CONFLICT (category, code) DO NOTHING;

-- Ubicaciones (Costa Rica)
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('locations_cr', 'parque_central', 'Parque Central', '🏛️', 1, '{"foot_traffic": "high", "competition": "medium", "rent": 5000}'),
('locations_cr', 'universidad', 'Universidad', '🎓', 2, '{"foot_traffic": "very_high", "competition": "high", "rent": 8000}'),
('locations_cr', 'playa', 'Playa', '🏖️', 3, '{"foot_traffic": "medium", "competition": "low", "rent": 10000}'),
('locations_cr', 'mercado', 'Mercado', '🛒', 4, '{"foot_traffic": "very_high", "competition": "very_high", "rent": 3000}'),
('locations_cr', 'oficinas', 'Zona de Oficinas', '🏢', 5, '{"foot_traffic": "high", "competition": "medium", "rent": 7000}')
ON CONFLICT (category, code) DO NOTHING;

COMMENT ON TABLE parameters IS 'Configuración dinámica del juego: países, climas, productos, etc.';

-- ============================================
-- FIN DE MIGRATION
-- ============================================
