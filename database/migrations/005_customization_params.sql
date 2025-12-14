-- ============================================
-- CalleViva - Customization Parameters
-- ============================================
-- 005_customization_params.sql

-- ============================================
-- DECORACIONES (Items cosméticos para el truck)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('decorations', 'umbrella', 'Sombrilla', '⛱️', 1, '{"cost": 500, "position": "top", "appeal_bonus": 5}'),
('decorations', 'lights', 'Luces', '💡', 2, '{"cost": 800, "position": "top-right", "appeal_bonus": 8, "night_bonus": 15}'),
('decorations', 'sign', 'Letrero', '🪧', 3, '{"cost": 600, "position": "top-left", "appeal_bonus": 10}'),
('decorations', 'plants', 'Plantas', '🌿', 4, '{"cost": 400, "position": "bottom-left", "appeal_bonus": 5}'),
('decorations', 'flag_cr', 'Bandera CR', '🇨🇷', 5, '{"cost": 300, "position": "top-right", "appeal_bonus": 3, "country": "costa_rica"}'),
('decorations', 'flag_mx', 'Bandera MX', '🇲🇽', 6, '{"cost": 300, "position": "top-right", "appeal_bonus": 3, "country": "mexico"}'),
('decorations', 'flag_us', 'Bandera US', '🇺🇸', 7, '{"cost": 300, "position": "top-right", "appeal_bonus": 3, "country": "usa"}'),
('decorations', 'balloon', 'Globos', '🎈', 8, '{"cost": 200, "position": "top-left", "appeal_bonus": 7, "event_bonus": 20}'),
('decorations', 'star', 'Estrella', '⭐', 9, '{"cost": 1000, "position": "top", "appeal_bonus": 15, "requires_reputation": 3.0}'),
('decorations', 'neon', 'Neón', '✨', 10, '{"cost": 2000, "position": "front", "appeal_bonus": 20, "night_bonus": 30, "requires_reputation": 4.0}'),
('decorations', 'music', 'Bocina', '🔊', 11, '{"cost": 1500, "position": "side", "appeal_bonus": 12, "customer_attraction": 10}'),
('decorations', 'menu_board', 'Pizarra Menú', '📋', 12, '{"cost": 700, "position": "front", "appeal_bonus": 8, "order_speed": 10}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- ESTILOS VISUALES (Temas del truck)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('styles', 'classic', 'Clásico', '🎨', 1, '{"cost": 0, "description": "El estilo tradicional", "unlocked": true}'),
('styles', 'tropical', 'Tropical', '🌴', 2, '{"cost": 2000, "description": "Vibrante y colorido", "appeal_bonus": 5}'),
('styles', 'urban', 'Urbano', '🏙️', 3, '{"cost": 3000, "description": "Moderno y minimalista", "appeal_bonus": 8}'),
('styles', 'vintage', 'Vintage', '📻', 4, '{"cost": 5000, "description": "Retro con encanto", "appeal_bonus": 12, "requires_reputation": 3.5}'),
('styles', 'neon', 'Neón', '💜', 5, '{"cost": 8000, "description": "Brillante y nocturno", "appeal_bonus": 15, "night_bonus": 25, "requires_reputation": 4.0}'),
('styles', 'gourmet', 'Gourmet', '👨‍🍳', 6, '{"cost": 15000, "description": "Elegante y premium", "appeal_bonus": 25, "price_premium": 20, "requires_reputation": 4.5}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- COLORES (Para toldo/tema del truck)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('colors', 'coral', 'Coral', '🔴', 1, '{"hex": "#FF6B6B", "cost": 0}'),
('colors', 'orange', 'Naranja', '🟠', 2, '{"hex": "#FF9F43", "cost": 500}'),
('colors', 'yellow', 'Amarillo', '🟡', 3, '{"hex": "#FFE66D", "cost": 500}'),
('colors', 'green', 'Verde', '🟢', 4, '{"hex": "#5C8A4D", "cost": 500}'),
('colors', 'agua', 'Agua', '🔵', 5, '{"hex": "#2EC4B6", "cost": 500}'),
('colors', 'purple', 'Morado', '🟣', 6, '{"hex": "#9B59B6", "cost": 800}'),
('colors', 'pink', 'Rosa', '🩷', 7, '{"hex": "#E91E63", "cost": 800}'),
('colors', 'black', 'Negro', '⚫', 8, '{"hex": "#2D3436", "cost": 1000}'),
('colors', 'gold', 'Dorado', '🥇', 9, '{"hex": "#F1C40F", "cost": 2000, "requires_reputation": 4.0}'),
('colors', 'rainbow', 'Arcoíris', '🌈', 10, '{"hex": "linear-gradient", "cost": 5000, "requires_reputation": 4.5, "appeal_bonus": 10}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- EQUIPAMIENTO DETALLADO (Expandir upgrades)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
-- Cocina
('equipment', 'basic_stove', 'Estufa Básica', '🔥', 1, '{"cost": 0, "speed_bonus": 0, "capacity_bonus": 0, "included": true}'),
('equipment', 'improved_stove', 'Estufa Mejorada', '🔥', 2, '{"cost": 15000, "speed_bonus": 20, "description": "Cocina 20% más rápido"}'),
('equipment', 'pro_stove', 'Estufa Profesional', '🔥', 3, '{"cost": 40000, "speed_bonus": 40, "capacity_bonus": 10, "requires_vehicle": "truck", "description": "Cocina 40% más rápido"}'),
-- Refrigeración
('equipment', 'cooler', 'Hielera', '🧊', 4, '{"cost": 5000, "freshness_bonus": 25, "description": "Ingredientes duran 25% más"}'),
('equipment', 'fridge', 'Refrigerador', '❄️', 5, '{"cost": 20000, "freshness_bonus": 50, "unlocks_products": true, "description": "Ingredientes duran 50% más, desbloquea productos"}'),
('equipment', 'freezer', 'Congelador', '🥶', 6, '{"cost": 35000, "freshness_bonus": 100, "unlocks_products": true, "requires_vehicle": "truck", "description": "Ingredientes no se dañan"}'),
-- Energía
('equipment', 'basic_power', 'Sin Generador', '🔌', 7, '{"cost": 0, "hours_bonus": 0, "included": true}'),
('equipment', 'generator', 'Generador', '⚡', 8, '{"cost": 25000, "hours_bonus": 2, "location_freedom": true, "description": "+2 horas de trabajo, cualquier ubicación"}'),
('equipment', 'solar_panels', 'Paneles Solares', '☀️', 9, '{"cost": 50000, "hours_bonus": 4, "daily_savings": 500, "requires_vehicle": "truck", "description": "+4 horas, ahorra ₡500/día"}'),
-- Punto de venta
('equipment', 'cash_box', 'Caja Simple', '💵', 10, '{"cost": 0, "speed_bonus": 0, "included": true}'),
('equipment', 'cash_register', 'Caja Registradora', '🧮', 11, '{"cost": 12000, "speed_bonus": 15, "tips_bonus": 5, "description": "+15% velocidad, +5% propinas"}'),
('equipment', 'pos_system', 'Sistema POS', '💳', 12, '{"cost": 30000, "speed_bonus": 25, "tips_bonus": 15, "card_payments": true, "description": "+25% velocidad, +15% propinas, acepta tarjetas"}'),
-- Almacenamiento
('equipment', 'basic_storage', 'Almacén Básico', '📦', 13, '{"cost": 0, "capacity_bonus": 0, "included": true}'),
('equipment', 'shelves', 'Estantes', '🗄️', 14, '{"cost": 8000, "capacity_bonus": 30, "description": "+30% capacidad de ingredientes"}'),
('equipment', 'warehouse', 'Bodega Móvil', '🏪', 15, '{"cost": 25000, "capacity_bonus": 75, "requires_vehicle": "stand", "description": "+75% capacidad"}'),
-- Protección
('equipment', 'basic_cover', 'Sin Toldo', '☁️', 16, '{"cost": 0, "weather_protection": 0, "included": true}'),
('equipment', 'awning', 'Toldo', '⛱️', 17, '{"cost": 5000, "weather_protection": 30, "description": "-30% impacto del clima"}'),
('equipment', 'enclosure', 'Estructura Cerrada', '🏠', 18, '{"cost": 20000, "weather_protection": 80, "requires_vehicle": "stand", "description": "-80% impacto del clima"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- MEJORAS DE RECETAS
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
-- Costa Rica
('recipe_upgrades', 'gallo_pinto_premium', 'Gallo Pinto Premium', '🍳', 1, '{"base_product": "gallo_pinto", "cost": 5000, "price_increase": 1000, "description": "Con huevo, plátano y natilla", "country": "costa_rica"}'),
('recipe_upgrades', 'casado_especial', 'Casado Especial', '🍽️', 2, '{"base_product": "casado", "cost": 8000, "price_increase": 1500, "description": "Doble proteína, ensalada gourmet", "country": "costa_rica", "requires_reputation": 3.0}'),
('recipe_upgrades', 'churchill_supremo', 'Churchill Supremo', '🍧', 3, '{"base_product": "churchill", "cost": 4000, "price_increase": 800, "description": "Con frutas frescas y leche condensada extra", "country": "costa_rica"}'),
-- México
('recipe_upgrades', 'tacos_supremos', 'Tacos Supremos', '🌮', 4, '{"base_product": "tacos_pastor", "cost": 6000, "price_increase": 15, "description": "Con piña, cilantro extra y salsa especial", "country": "mexico"}'),
('recipe_upgrades', 'quesadilla_gourmet', 'Quesadilla Gourmet', '🧀', 5, '{"base_product": "quesadillas", "cost": 7000, "price_increase": 20, "description": "Queso Oaxaca, champiñones, flor de calabaza", "country": "mexico", "requires_reputation": 3.5}'),
('recipe_upgrades', 'elote_loco', 'Elote Loco', '🌽', 6, '{"base_product": "elotes", "cost": 3000, "price_increase": 10, "description": "Con todos los toppings y salsas", "country": "mexico"}'),
-- USA
('recipe_upgrades', 'gourmet_burger', 'Gourmet Burger', '🍔', 7, '{"base_product": "burger", "cost": 8000, "price_increase": 4, "description": "Angus beef, queso artesanal, toppings premium", "country": "usa"}'),
('recipe_upgrades', 'loaded_dog', 'Loaded Dog', '🌭', 8, '{"base_product": "hot_dog", "cost": 5000, "price_increase": 3, "description": "Con chili, queso, jalapeños y bacon", "country": "usa"}'),
('recipe_upgrades', 'truffle_fries', 'Truffle Fries', '🍟', 9, '{"base_product": "fries", "cost": 6000, "price_increase": 4, "description": "Con aceite de trufa y parmesano", "country": "usa", "requires_reputation": 4.0}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- ACTUALIZAR TRUCK_TYPES CON MÁS DETALLES
-- ============================================
UPDATE parameters SET config = '{"capacity": 20, "speed": 1.0, "cost": 0, "appeal_base": 30, "max_equipment": 3, "emoji": "🛒"}'
WHERE category = 'truck_types' AND code = 'cart';

UPDATE parameters SET config = '{"capacity": 40, "speed": 0.8, "cost": 25000, "appeal_base": 50, "max_equipment": 5, "emoji": "🏪"}'
WHERE category = 'truck_types' AND code = 'stand';

UPDATE parameters SET config = '{"capacity": 80, "speed": 1.2, "cost": 100000, "appeal_base": 70, "max_equipment": 8, "emoji": "🚚"}'
WHERE category = 'truck_types' AND code = 'truck';

UPDATE parameters SET config = '{"capacity": 150, "speed": 0.5, "cost": 500000, "appeal_base": 100, "max_equipment": 12, "emoji": "🍽️", "requires_reputation": 4.5}'
WHERE category = 'truck_types' AND code = 'restaurant';

-- ============================================
-- FIN DE MIGRATION
-- ============================================
