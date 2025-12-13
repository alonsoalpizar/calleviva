-- ============================================
-- CalleViva - Mexico & USA Seed Data
-- ============================================
-- 004_seed_mx_us.sql

-- ============================================
-- PRODUCTOS MÉXICO
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('products_mx', 'tacos_pastor', 'Tacos al Pastor', '🌮', 1, '{"base_price": 25, "base_cost": 8, "popularity": "very_high"}'),
('products_mx', 'quesadillas', 'Quesadillas', '🧀', 2, '{"base_price": 30, "base_cost": 10, "popularity": "high"}'),
('products_mx', 'elotes', 'Elotes', '🌽', 3, '{"base_price": 20, "base_cost": 5, "popularity": "high"}'),
('products_mx', 'tamales', 'Tamales', '🫔', 4, '{"base_price": 25, "base_cost": 7, "popularity": "medium"}'),
('products_mx', 'tortas', 'Tortas', '🥪', 5, '{"base_price": 45, "base_cost": 15, "popularity": "high"}'),
('products_mx', 'horchata', 'Agua de Horchata', '🥛', 6, '{"base_price": 15, "base_cost": 3, "popularity": "very_high"}'),
('products_mx', 'churros', 'Churros', '🥖', 7, '{"base_price": 20, "base_cost": 5, "popularity": "high"}'),
('products_mx', 'esquites', 'Esquites', '🥣', 8, '{"base_price": 25, "base_cost": 6, "popularity": "medium"}'),
('products_mx', 'tostadas', 'Tostadas', '🫓', 9, '{"base_price": 30, "base_cost": 9, "popularity": "medium"}'),
('products_mx', 'aguas_frescas', 'Aguas Frescas', '🍹', 10, '{"base_price": 18, "base_cost": 4, "popularity": "high"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- UBICACIONES MÉXICO
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('locations_mx', 'zocalo', 'Zócalo', '🏛️', 1, '{"foot_traffic": "very_high", "competition": "high", "rent": 200, "best_hours": "12-20"}'),
('locations_mx', 'estadio', 'Estadio Azteca', '🏟️', 2, '{"foot_traffic": "event_based", "competition": "medium", "rent": 350, "best_hours": "eventos"}'),
('locations_mx', 'mercado', 'Mercado', '🛒', 3, '{"foot_traffic": "very_high", "competition": "very_high", "rent": 80, "best_hours": "6-14"}'),
('locations_mx', 'alameda', 'Alameda Central', '🌳', 4, '{"foot_traffic": "high", "competition": "medium", "rent": 150, "best_hours": "10-18"}'),
('locations_mx', 'universidad', 'Ciudad Universitaria', '🎓', 5, '{"foot_traffic": "very_high", "competition": "high", "rent": 120, "best_hours": "7-15"}'),
('locations_mx', 'metro', 'Estación de Metro', '🚇', 6, '{"foot_traffic": "very_high", "competition": "high", "rent": 100, "best_hours": "6-9,17-20"}'),
('locations_mx', 'chapultepec', 'Bosque de Chapultepec', '🌲', 7, '{"foot_traffic": "high", "competition": "low", "rent": 180, "best_hours": "10-17"}'),
('locations_mx', 'condesa', 'La Condesa', '🏘️', 8, '{"foot_traffic": "medium", "competition": "high", "rent": 250, "best_hours": "12-22"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- PRODUCTOS USA
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('products_us', 'hot_dog', 'Hot Dog', '🌭', 1, '{"base_price": 5, "base_cost": 1.5, "popularity": "very_high"}'),
('products_us', 'burger', 'Burger', '🍔', 2, '{"base_price": 8, "base_cost": 3, "popularity": "very_high"}'),
('products_us', 'fries', 'French Fries', '🍟', 3, '{"base_price": 4, "base_cost": 1, "popularity": "high"}'),
('products_us', 'nachos', 'Nachos', '🧀', 4, '{"base_price": 6, "base_cost": 2, "popularity": "high"}'),
('products_us', 'pizza_slice', 'Pizza Slice', '🍕', 5, '{"base_price": 4, "base_cost": 1.5, "popularity": "high"}'),
('products_us', 'lemonade', 'Lemonade', '🍋', 6, '{"base_price": 3, "base_cost": 0.5, "popularity": "high"}'),
('products_us', 'ice_cream', 'Ice Cream', '🍦', 7, '{"base_price": 5, "base_cost": 1.5, "popularity": "very_high"}'),
('products_us', 'pretzel', 'Soft Pretzel', '🥨', 8, '{"base_price": 4, "base_cost": 1, "popularity": "medium"}'),
('products_us', 'corn_dog', 'Corn Dog', '🌽', 9, '{"base_price": 5, "base_cost": 1.5, "popularity": "medium"}'),
('products_us', 'soda', 'Soda', '🥤', 10, '{"base_price": 2, "base_cost": 0.5, "popularity": "very_high"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- UBICACIONES USA
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('locations_us', 'downtown', 'Downtown', '🏙️', 1, '{"foot_traffic": "very_high", "competition": "high", "rent": 50, "best_hours": "11-14,17-20"}'),
('locations_us', 'beach', 'Beach Boardwalk', '🏖️', 2, '{"foot_traffic": "high", "competition": "medium", "rent": 40, "best_hours": "10-18"}'),
('locations_us', 'park', 'Central Park', '🌳', 3, '{"foot_traffic": "high", "competition": "low", "rent": 35, "best_hours": "11-17"}'),
('locations_us', 'stadium', 'Stadium', '🏟️', 4, '{"foot_traffic": "event_based", "competition": "medium", "rent": 80, "best_hours": "events"}'),
('locations_us', 'food_court', 'Food Court', '🍽️', 5, '{"foot_traffic": "very_high", "competition": "very_high", "rent": 60, "best_hours": "11-20"}'),
('locations_us', 'college', 'College Campus', '🎓', 6, '{"foot_traffic": "very_high", "competition": "high", "rent": 30, "best_hours": "7-15"}'),
('locations_us', 'fair', 'County Fair', '🎡', 7, '{"foot_traffic": "very_high", "competition": "high", "rent": 100, "best_hours": "10-22", "seasonal": true}'),
('locations_us', 'office_district', 'Office District', '🏢', 8, '{"foot_traffic": "high", "competition": "medium", "rent": 45, "best_hours": "11-14"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- EVENTOS ESPECIALES (para todos los países)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('events', 'festival', 'Festival Local', '🎉', 1, '{"duration_days": 3, "customer_boost": 2.0, "price_boost": 1.5}'),
('events', 'holiday', 'Día Festivo', '🎊', 2, '{"duration_days": 1, "customer_boost": 1.5, "price_boost": 1.2}'),
('events', 'concert', 'Concierto', '🎸', 3, '{"duration_days": 1, "customer_boost": 3.0, "price_boost": 2.0, "location_specific": true}'),
('events', 'sports', 'Evento Deportivo', '⚽', 4, '{"duration_days": 1, "customer_boost": 2.5, "price_boost": 1.8, "location_specific": true}'),
('events', 'rain_sale', 'Día Lluvioso', '🌧️', 5, '{"duration_days": 1, "customer_boost": 0.5, "price_boost": 0.9}'),
('events', 'heat_wave', 'Ola de Calor', '🥵', 6, '{"duration_days": 2, "customer_boost": 1.3, "drinks_boost": 2.0}'),
('events', 'food_critic', 'Crítico Gastronómico', '📝', 7, '{"duration_days": 1, "reputation_multiplier": 3.0}'),
('events', 'competition', 'Competencia de Food Trucks', '🏆', 8, '{"duration_days": 1, "customer_boost": 2.0, "winner_bonus": 5000}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- UPGRADES/MEJORAS (para el Food Truck)
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('upgrades', 'better_grill', 'Parrilla Mejorada', '🔥', 1, '{"cost": 5000, "effect": "speed_+20%", "description": "Cocina 20% más rápido"}'),
('upgrades', 'bigger_fridge', 'Refrigerador Grande', '❄️', 2, '{"cost": 8000, "effect": "capacity_+50%", "description": "50% más capacidad de ingredientes"}'),
('upgrades', 'sound_system', 'Sistema de Sonido', '🔊', 3, '{"cost": 3000, "effect": "attraction_+15%", "description": "Atrae 15% más clientes"}'),
('upgrades', 'neon_sign', 'Letrero de Neón', '💡', 4, '{"cost": 4000, "effect": "night_bonus_+30%", "description": "30% más ventas de noche"}'),
('upgrades', 'menu_board', 'Menú Digital', '📺', 5, '{"cost": 6000, "effect": "order_speed_+25%", "description": "Pedidos 25% más rápidos"}'),
('upgrades', 'umbrella', 'Sombrilla Grande', '☂️', 6, '{"cost": 2000, "effect": "rain_protection", "description": "Reduce efecto de lluvia"}'),
('upgrades', 'generator', 'Generador', '⚡', 7, '{"cost": 10000, "effect": "power_independence", "description": "Funciona en cualquier lugar"}'),
('upgrades', 'pos_system', 'Sistema de Pagos', '💳', 8, '{"cost": 5000, "effect": "tips_+20%", "description": "20% más propinas"}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- TIPOS DE CLIENTES
-- ============================================
INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
('customer_types', 'student', 'Estudiante', '🎒', 1, '{"budget": "low", "patience": "medium", "tip_chance": 0.1}'),
('customer_types', 'worker', 'Oficinista', '👔', 2, '{"budget": "medium", "patience": "low", "tip_chance": 0.3}'),
('customer_types', 'tourist', 'Turista', '📸', 3, '{"budget": "high", "patience": "high", "tip_chance": 0.5}'),
('customer_types', 'family', 'Familia', '👨‍👩‍👧', 4, '{"budget": "medium", "patience": "medium", "tip_chance": 0.2, "order_size": 3}'),
('customer_types', 'foodie', 'Foodie', '🤤', 5, '{"budget": "high", "patience": "high", "tip_chance": 0.4, "quality_sensitive": true}'),
('customer_types', 'regular', 'Cliente Regular', '⭐', 6, '{"budget": "medium", "patience": "high", "tip_chance": 0.35, "loyalty_bonus": true}'),
('customer_types', 'critic', 'Crítico', '📝', 7, '{"budget": "high", "patience": "low", "reputation_impact": 3.0}'),
('customer_types', 'influencer', 'Influencer', '📱', 8, '{"budget": "medium", "patience": "medium", "viral_chance": 0.3}')
ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- FIN DE MIGRATION
-- ============================================
