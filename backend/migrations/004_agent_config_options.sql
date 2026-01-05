-- ============================================
-- Migration: 004_agent_config_options
-- Description: Tabla para opciones configurables de agentes AI
-- ============================================

-- Tabla de categorías de opciones
CREATE TABLE IF NOT EXISTS agent_option_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de opciones de agentes
CREATE TABLE IF NOT EXISTS agent_config_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Categoría (rol, personalidad, economia, preferencias, etc.)
    category_id VARCHAR(50) NOT NULL REFERENCES agent_option_categories(id),

    -- Identificación
    key VARCHAR(50) NOT NULL,           -- Clave interna (ej: 'turista', 'amigable')
    label VARCHAR(100) NOT NULL,         -- Etiqueta para mostrar (ej: 'Turista', 'Amigable')
    description TEXT,                    -- Descripción para tooltip
    icon VARCHAR(10),                    -- Emoji opcional

    -- Para valores numéricos (ej: sensibilidad_precio 1-5)
    value_type VARCHAR(20) DEFAULT 'option', -- 'option', 'number', 'range', 'text'
    min_value INT,
    max_value INT,
    default_value VARCHAR(100),

    -- Ordenamiento y estado
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,

    -- Metadata adicional (para prompts, comportamientos, etc.)
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Clave única por categoría
    UNIQUE(category_id, key)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agent_options_category ON agent_config_options(category_id);
CREATE INDEX IF NOT EXISTS idx_agent_options_active ON agent_config_options(is_active) WHERE is_active = true;

-- Trigger para auto-actualizar updated_at
CREATE TRIGGER update_agent_options_updated_at
    BEFORE UPDATE ON agent_config_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED: Categorías iniciales
-- ============================================
INSERT INTO agent_option_categories (id, name, description, icon, sort_order) VALUES
    ('rol', 'Rol/Tipo', 'Tipo de cliente o rol del personaje', '🎭', 1),
    ('temperamento', 'Temperamento', 'Actitud general del personaje', '😊', 2),
    ('paciencia', 'Paciencia', 'Nivel de paciencia al esperar', '⏳', 3),
    ('exigencia', 'Exigencia', 'Qué tan exigente es con el servicio', '⭐', 4),
    ('gusto_culinario', 'Gusto Culinario', 'Preferencia al probar cosas nuevas', '🍽️', 5),
    ('presupuesto', 'Presupuesto', 'Capacidad de gasto', '💰', 6),
    ('preferencias', 'Preferencias', 'Gustos de comida', '❤️', 7),
    ('restricciones', 'Restricciones', 'Restricciones alimentarias', '🚫', 8)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED: Opciones de ROL
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('rol', 'turista', 'Turista', 'Visitante curioso, primera vez en el área', '🧳', 1,
     '{"prompt_hint": "Es un turista visitando por primera vez, curioso por probar comida local"}'),
    ('rol', 'local', 'Local', 'Conoce el área, tiene preferencias definidas', '🏠', 2,
     '{"prompt_hint": "Es un residente local que conoce bien la zona y tiene sus preferencias"}'),
    ('rol', 'trabajador', 'Trabajador', 'Poco tiempo, busca rapidez', '👔', 3,
     '{"prompt_hint": "Trabajador en su hora de almuerzo, necesita comer rápido"}'),
    ('rol', 'foodie', 'Foodie', 'Apasionado por la comida, busca calidad', '🍴', 4,
     '{"prompt_hint": "Entusiasta de la gastronomía, aprecia la calidad y presentación"}'),
    ('rol', 'estudiante', 'Estudiante', 'Presupuesto limitado, busca ofertas', '📚', 5,
     '{"prompt_hint": "Estudiante con presupuesto ajustado, busca buena relación calidad-precio"}'),
    ('rol', 'ejecutivo', 'Ejecutivo', 'Alto poder adquisitivo, valora el tiempo', '💼', 6,
     '{"prompt_hint": "Ejecutivo de negocios, dispuesto a pagar por calidad y rapidez"}'),
    ('rol', 'familia', 'Familia', 'Viene con niños, busca opciones variadas', '👨‍👩‍👧', 7,
     '{"prompt_hint": "Padre/madre de familia buscando opciones para todos"}'),
    ('rol', 'deportista', 'Deportista', 'Consciente de la salud, busca opciones saludables', '🏃', 8,
     '{"prompt_hint": "Persona activa que cuida su alimentación y busca opciones saludables"}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de TEMPERAMENTO
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('temperamento', 'amigable', 'Amigable', 'Sociable y conversador', '😄', 1,
     '{"prompt_hint": "Personalidad amigable, le gusta conversar y es cordial"}'),
    ('temperamento', 'neutral', 'Neutral', 'Trato cordial pero reservado', '😐', 2,
     '{"prompt_hint": "Personalidad neutral, educado pero no muy conversador"}'),
    ('temperamento', 'reservado', 'Reservado', 'Prefiere interacciones mínimas', '🤐', 3,
     '{"prompt_hint": "Personalidad reservada, prefiere pedir rápido sin mucha charla"}'),
    ('temperamento', 'entusiasta', 'Entusiasta', 'Muy expresivo y positivo', '🤩', 4,
     '{"prompt_hint": "Personalidad entusiasta, se emociona con la comida y el servicio"}'),
    ('temperamento', 'gruñon', 'Gruñón', 'Difícil de complacer', '😠', 5,
     '{"prompt_hint": "Personalidad difícil, tiende a quejarse y es duro de complacer"}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de PACIENCIA
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('paciencia', 'muy_paciente', 'Muy Paciente', 'Espera sin problemas', '🧘', 1,
     '{"prompt_hint": "Muy paciente, no le importa esperar", "tiempo_espera_factor": 2.0}'),
    ('paciencia', 'paciente', 'Paciente', 'Espera con calma', '😌', 2,
     '{"prompt_hint": "Paciente, puede esperar un tiempo razonable", "tiempo_espera_factor": 1.5}'),
    ('paciencia', 'normal', 'Normal', 'Paciencia promedio', '🙂', 3,
     '{"prompt_hint": "Paciencia normal, espera un tiempo estándar", "tiempo_espera_factor": 1.0}'),
    ('paciencia', 'impaciente', 'Impaciente', 'Se frustra con esperas', '😤', 4,
     '{"prompt_hint": "Impaciente, se frustra si tarda mucho", "tiempo_espera_factor": 0.7}'),
    ('paciencia', 'muy_impaciente', 'Muy Impaciente', 'No tolera esperas', '🏃💨', 5,
     '{"prompt_hint": "Muy impaciente, se va si hay demora", "tiempo_espera_factor": 0.4}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de EXIGENCIA
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('exigencia', 'flexible', 'Flexible', 'Acepta lo que hay disponible', '👍', 1,
     '{"prompt_hint": "Flexible con las opciones, no es exigente"}'),
    ('exigencia', 'moderado', 'Moderado', 'Tiene preferencias pero es razonable', '🤝', 2,
     '{"prompt_hint": "Tiene preferencias pero es razonable y acepta alternativas"}'),
    ('exigencia', 'exigente', 'Exigente', 'Espera exactamente lo que pide', '🎯', 3,
     '{"prompt_hint": "Exigente con sus pedidos, espera exactitud"}'),
    ('exigencia', 'muy_exigente', 'Muy Exigente', 'Perfeccionista, difícil de satisfacer', '👑', 4,
     '{"prompt_hint": "Muy exigente, perfeccionista con cada detalle"}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de GUSTO CULINARIO
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('gusto_culinario', 'aventurero', 'Aventurero', 'Le gusta probar cosas nuevas', '🌟', 1,
     '{"prompt_hint": "Aventurero culinario, le encanta probar cosas nuevas y exóticas"}'),
    ('gusto_culinario', 'curioso', 'Curioso', 'Abierto a probar con sugerencias', '🤔', 2,
     '{"prompt_hint": "Curioso pero cauteloso, prueba cosas nuevas si se las recomiendan"}'),
    ('gusto_culinario', 'equilibrado', 'Equilibrado', 'Balance entre nuevo y conocido', '⚖️', 3,
     '{"prompt_hint": "Equilibrado, alterna entre favoritos y cosas nuevas"}'),
    ('gusto_culinario', 'tradicional', 'Tradicional', 'Prefiere lo conocido', '🏛️', 4,
     '{"prompt_hint": "Tradicional, prefiere platillos conocidos y clásicos"}'),
    ('gusto_culinario', 'conservador', 'Conservador', 'Solo come lo que conoce', '🔒', 5,
     '{"prompt_hint": "Conservador, solo pide lo que ya conoce y le gusta"}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de PRESUPUESTO
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, metadata) VALUES
    ('presupuesto', 'muy_bajo', 'Muy Bajo', 'Busca lo más económico', '💸', 1,
     '{"prompt_hint": "Presupuesto muy limitado, busca lo más barato", "rango": [0, 2000]}'),
    ('presupuesto', 'bajo', 'Bajo', 'Consciente del precio', '💵', 2,
     '{"prompt_hint": "Presupuesto bajo, busca buenas ofertas", "rango": [2000, 4000]}'),
    ('presupuesto', 'medio', 'Medio', 'Balance calidad-precio', '💰', 3,
     '{"prompt_hint": "Presupuesto medio, busca buena relación calidad-precio", "rango": [4000, 7000]}'),
    ('presupuesto', 'alto', 'Alto', 'Prioriza calidad sobre precio', '💎', 4,
     '{"prompt_hint": "Presupuesto alto, prioriza calidad sobre precio", "rango": [7000, 12000]}'),
    ('presupuesto', 'premium', 'Premium', 'El precio no es problema', '👑', 5,
     '{"prompt_hint": "Sin límite de presupuesto, busca lo mejor disponible", "rango": [12000, 50000]}')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de PREFERENCIAS (multi-select)
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, value_type) VALUES
    ('preferencias', 'salado', 'Salado', 'Prefiere sabores salados', '🧂', 1, 'option'),
    ('preferencias', 'dulce', 'Dulce', 'Prefiere sabores dulces', '🍯', 2, 'option'),
    ('preferencias', 'picante', 'Picante', 'Le gusta el picante', '🌶️', 3, 'option'),
    ('preferencias', 'acido', 'Ácido', 'Disfruta sabores ácidos', '🍋', 4, 'option'),
    ('preferencias', 'umami', 'Umami', 'Aprecia sabores profundos', '🍖', 5, 'option'),
    ('preferencias', 'fresco', 'Fresco', 'Prefiere comida fresca/ligera', '🥗', 6, 'option'),
    ('preferencias', 'caliente', 'Caliente', 'Prefiere comida caliente', '🔥', 7, 'option'),
    ('preferencias', 'frio', 'Frío', 'Prefiere comida fría', '❄️', 8, 'option'),
    ('preferencias', 'crujiente', 'Crujiente', 'Le gusta lo crujiente', '🥨', 9, 'option'),
    ('preferencias', 'cremoso', 'Cremoso', 'Disfruta texturas cremosas', '🍦', 10, 'option')
ON CONFLICT (category_id, key) DO NOTHING;

-- ============================================
-- SEED: Opciones de RESTRICCIONES (multi-select)
-- ============================================
INSERT INTO agent_config_options (category_id, key, label, description, icon, sort_order, value_type) VALUES
    ('restricciones', 'ninguna', 'Ninguna', 'Sin restricciones', '✅', 0, 'option'),
    ('restricciones', 'vegetariano', 'Vegetariano', 'No come carne', '🥬', 1, 'option'),
    ('restricciones', 'vegano', 'Vegano', 'No consume productos animales', '🌱', 2, 'option'),
    ('restricciones', 'sin_gluten', 'Sin Gluten', 'Intolerante al gluten', '🌾', 3, 'option'),
    ('restricciones', 'sin_lactosa', 'Sin Lactosa', 'Intolerante a la lactosa', '🥛', 4, 'option'),
    ('restricciones', 'sin_mariscos', 'Sin Mariscos', 'Alérgico a mariscos', '🦐', 5, 'option'),
    ('restricciones', 'sin_nueces', 'Sin Nueces', 'Alérgico a nueces', '🥜', 6, 'option'),
    ('restricciones', 'kosher', 'Kosher', 'Solo comida kosher', '✡️', 7, 'option'),
    ('restricciones', 'halal', 'Halal', 'Solo comida halal', '☪️', 8, 'option'),
    ('restricciones', 'bajo_sodio', 'Bajo en Sodio', 'Restricción de sal', '🧂', 9, 'option'),
    ('restricciones', 'diabetico', 'Diabético', 'Control de azúcar', '💉', 10, 'option')
ON CONFLICT (category_id, key) DO NOTHING;

-- Comentarios
COMMENT ON TABLE agent_option_categories IS 'Categorías de opciones para configuración de agentes AI';
COMMENT ON TABLE agent_config_options IS 'Opciones configurables para personalidad y comportamiento de agentes AI';
COMMENT ON COLUMN agent_config_options.metadata IS 'JSON con hints para prompts, factores numéricos, etc.';
