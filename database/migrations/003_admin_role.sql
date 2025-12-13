-- ============================================
-- CalleViva - Admin Role Migration
-- ============================================
-- 003_admin_role.sql

-- Agregar campo is_admin a players
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Crear índice para consultas de admin
CREATE INDEX IF NOT EXISTS idx_players_admin ON players(is_admin) WHERE is_admin = true;

-- Establecer primer admin
UPDATE players SET is_admin = true WHERE email = 'alonsoalpizar@gmail.com';

-- Comentario
COMMENT ON COLUMN players.is_admin IS 'Indica si el jugador tiene permisos de administrador';

-- ============================================
-- FIN DE MIGRATION
-- ============================================
