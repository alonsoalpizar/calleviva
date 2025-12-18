-- ============================================
-- CalleViva - Add Ingredients for Costa Rica
-- ============================================
-- 202412180001_add_ingredients_cr.sql
-- Ingredientes base para el Laboratorio de Sabores

-- ============================================
-- INGREDIENTES (Costa Rica)
-- ============================================
-- Estos son ingredientes crudos/base que los jugadores
-- pueden combinar en el Laboratorio de Sabores para crear platillos únicos

INSERT INTO parameters (category, code, name, icon, sort_order, config) VALUES
-- Granos y Cereales
('ingredients_cr', 'arroz', 'Arroz', '🍚', 1, '{"type": "grain", "cost": 200, "tags": ["base", "common"]}'),
('ingredients_cr', 'frijoles_negros', 'Frijoles Negros', '🫘', 2, '{"type": "legume", "cost": 300, "tags": ["base", "protein", "traditional"]}'),
('ingredients_cr', 'frijoles_rojos', 'Frijoles Rojos', '🫘', 3, '{"type": "legume", "cost": 280, "tags": ["base", "protein"]}'),
('ingredients_cr', 'maiz', 'Maíz', '🌽', 4, '{"type": "grain", "cost": 250, "tags": ["versatile", "traditional"]}'),

-- Proteínas
('ingredients_cr', 'pollo', 'Pollo', '🍗', 10, '{"type": "protein", "cost": 800, "tags": ["meat", "common"]}'),
('ingredients_cr', 'carne_res', 'Carne de Res', '🥩', 11, '{"type": "protein", "cost": 1200, "tags": ["meat", "premium"]}'),
('ingredients_cr', 'cerdo', 'Cerdo', '🥓', 12, '{"type": "protein", "cost": 900, "tags": ["meat", "traditional"]}'),
('ingredients_cr', 'chicharron', 'Chicharrón', '🥓', 13, '{"type": "protein", "cost": 600, "tags": ["meat", "fried", "traditional"]}'),
('ingredients_cr', 'huevo', 'Huevo', '🥚', 14, '{"type": "protein", "cost": 150, "tags": ["breakfast", "common", "versatile"]}'),
('ingredients_cr', 'pescado', 'Pescado', '🐟', 15, '{"type": "protein", "cost": 1000, "tags": ["seafood", "coastal"]}'),
('ingredients_cr', 'camarones', 'Camarones', '🦐', 16, '{"type": "protein", "cost": 1500, "tags": ["seafood", "premium"]}'),

-- Vegetales y Verduras
('ingredients_cr', 'platano_maduro', 'Plátano Maduro', '🍌', 20, '{"type": "vegetable", "cost": 200, "tags": ["sweet", "traditional", "fried"]}'),
('ingredients_cr', 'platano_verde', 'Plátano Verde', '🍌', 21, '{"type": "vegetable", "cost": 180, "tags": ["savory", "traditional"]}'),
('ingredients_cr', 'yuca', 'Yuca', '🥔', 22, '{"type": "vegetable", "cost": 250, "tags": ["traditional", "starchy"]}'),
('ingredients_cr', 'papa', 'Papa', '🥔', 23, '{"type": "vegetable", "cost": 200, "tags": ["common", "starchy"]}'),
('ingredients_cr', 'tomate', 'Tomate', '🍅', 24, '{"type": "vegetable", "cost": 150, "tags": ["fresh", "common"]}'),
('ingredients_cr', 'cebolla', 'Cebolla', '🧅', 25, '{"type": "vegetable", "cost": 100, "tags": ["base", "aromatic"]}'),
('ingredients_cr', 'chile_dulce', 'Chile Dulce', '🫑', 26, '{"type": "vegetable", "cost": 180, "tags": ["aromatic", "traditional"]}'),
('ingredients_cr', 'aguacate', 'Aguacate', '🥑', 27, '{"type": "vegetable", "cost": 400, "tags": ["fresh", "premium"]}'),
('ingredients_cr', 'lechuga', 'Lechuga', '🥬', 28, '{"type": "vegetable", "cost": 120, "tags": ["fresh", "salad"]}'),
('ingredients_cr', 'repollo', 'Repollo', '🥬', 29, '{"type": "vegetable", "cost": 100, "tags": ["fresh", "traditional"]}'),
('ingredients_cr', 'zanahoria', 'Zanahoria', '🥕', 30, '{"type": "vegetable", "cost": 100, "tags": ["common", "versatile"]}'),
('ingredients_cr', 'chayote', 'Chayote', '🥒', 31, '{"type": "vegetable", "cost": 150, "tags": ["traditional", "mild"]}'),
('ingredients_cr', 'ayote', 'Ayote', '🎃', 32, '{"type": "vegetable", "cost": 180, "tags": ["traditional", "sweet"]}'),
('ingredients_cr', 'palmito', 'Palmito', '🌴', 33, '{"type": "vegetable", "cost": 350, "tags": ["premium", "traditional"]}'),

-- Lácteos y Derivados
('ingredients_cr', 'queso_turrialba', 'Queso Turrialba', '🧀', 40, '{"type": "dairy", "cost": 500, "tags": ["traditional", "premium", "local"]}'),
('ingredients_cr', 'queso_palmito', 'Queso Palmito', '🧀', 41, '{"type": "dairy", "cost": 400, "tags": ["traditional", "mild"]}'),
('ingredients_cr', 'natilla', 'Natilla', '🥛', 42, '{"type": "dairy", "cost": 300, "tags": ["traditional", "creamy"]}'),
('ingredients_cr', 'crema', 'Crema Ácida', '🥛', 43, '{"type": "dairy", "cost": 250, "tags": ["common", "topping"]}'),

-- Condimentos y Salsas
('ingredients_cr', 'salsa_lizano', 'Salsa Lizano', '🫙', 50, '{"type": "condiment", "cost": 200, "tags": ["essential", "traditional", "iconic"]}'),
('ingredients_cr', 'culantro', 'Culantro/Cilantro', '🌿', 51, '{"type": "herb", "cost": 80, "tags": ["aromatic", "traditional", "fresh"]}'),
('ingredients_cr', 'ajo', 'Ajo', '🧄', 52, '{"type": "condiment", "cost": 100, "tags": ["aromatic", "base"]}'),
('ingredients_cr', 'limon', 'Limón', '🍋', 53, '{"type": "citrus", "cost": 80, "tags": ["fresh", "acidic"]}'),
('ingredients_cr', 'chile_panameño', 'Chile Panameño', '🌶️', 54, '{"type": "condiment", "cost": 150, "tags": ["spicy", "traditional"]}'),

-- Panes y Masas
('ingredients_cr', 'tortilla_maiz', 'Tortilla de Maíz', '🫓', 60, '{"type": "bread", "cost": 150, "tags": ["traditional", "base"]}'),
('ingredients_cr', 'tortilla_harina', 'Tortilla de Harina', '🫓', 61, '{"type": "bread", "cost": 180, "tags": ["versatile", "base"]}'),
('ingredients_cr', 'pan_baguette', 'Pan Baguette', '🥖', 62, '{"type": "bread", "cost": 200, "tags": ["common", "sandwich"]}'),
('ingredients_cr', 'empanada_masa', 'Masa para Empanadas', '🥟', 63, '{"type": "dough", "cost": 180, "tags": ["fried", "traditional"]}'),

-- Frutas
('ingredients_cr', 'cas', 'Cas', '🍈', 70, '{"type": "fruit", "cost": 200, "tags": ["tropical", "traditional", "drink"]}'),
('ingredients_cr', 'mora', 'Mora', '🫐', 71, '{"type": "fruit", "cost": 250, "tags": ["tropical", "sweet", "drink"]}'),
('ingredients_cr', 'mango', 'Mango', '🥭', 72, '{"type": "fruit", "cost": 180, "tags": ["tropical", "sweet"]}'),
('ingredients_cr', 'papaya', 'Papaya', '🍈', 73, '{"type": "fruit", "cost": 200, "tags": ["tropical", "breakfast"]}'),
('ingredients_cr', 'piña', 'Piña', '🍍', 74, '{"type": "fruit", "cost": 250, "tags": ["tropical", "sweet"]}'),
('ingredients_cr', 'coco', 'Coco', '🥥', 75, '{"type": "fruit", "cost": 300, "tags": ["tropical", "coastal"]}'),
('ingredients_cr', 'tamarindo', 'Tamarindo', '🌰', 76, '{"type": "fruit", "cost": 200, "tags": ["traditional", "sweet-sour"]}'),

-- Bebidas Base
('ingredients_cr', 'cafe_costarricense', 'Café Costarricense', '☕', 80, '{"type": "beverage", "cost": 300, "tags": ["traditional", "premium", "iconic"]}'),
('ingredients_cr', 'tapa_dulce', 'Tapa de Dulce', '🍯', 81, '{"type": "sweetener", "cost": 200, "tags": ["traditional", "sweetener"]}'),
('ingredients_cr', 'leche', 'Leche', '🥛', 82, '{"type": "dairy", "cost": 250, "tags": ["common", "versatile"]}'),
('ingredients_cr', 'horchata', 'Horchata en Polvo', '🌾', 83, '{"type": "beverage", "cost": 180, "tags": ["traditional", "sweet"]}'),

-- Extras y Toppings
('ingredients_cr', 'hielo_raspado', 'Hielo Raspado', '🧊', 90, '{"type": "topping", "cost": 50, "tags": ["cold", "dessert"]}'),
('ingredients_cr', 'leche_condensada', 'Leche Condensada', '🥛', 91, '{"type": "topping", "cost": 200, "tags": ["sweet", "dessert"]}'),
('ingredients_cr', 'sirope_kola', 'Sirope de Kola', '🍾', 92, '{"type": "topping", "cost": 100, "tags": ["sweet", "dessert", "traditional"]}')

ON CONFLICT (category, code) DO NOTHING;

-- ============================================
-- FIN DE MIGRATION
-- ============================================
