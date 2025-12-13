#!/bin/bash
# ============================================
# CalleViva - Database Setup Script
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║           🗄️  CalleViva Database Setup                      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Cargar variables de entorno si existe .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Variables por defecto
DB_NAME=${DB_NAME:-calleviva}
DB_USER=${DB_USER:-calleviva}
DB_PASSWORD=${DB_PASSWORD:-calleviva_dev_password}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo -e "${YELLOW}→ Configuración:${NC}"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Host:     $DB_HOST:$DB_PORT"
echo ""

# Verificar si PostgreSQL está corriendo
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}✗ PostgreSQL no está corriendo${NC}"
    echo "  Intentar: sudo systemctl start postgresql"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"

# Crear usuario si no existe
echo -e "${YELLOW}→ Verificando usuario...${NC}"
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || {
    echo -e "${YELLOW}→ Creando usuario $DB_USER...${NC}"
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo -e "${GREEN}✓ Usuario creado${NC}"
}

# Crear base de datos si no existe
echo -e "${YELLOW}→ Verificando base de datos...${NC}"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || {
    echo -e "${YELLOW}→ Creando base de datos $DB_NAME...${NC}"
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
    echo -e "${GREEN}✓ Base de datos creada${NC}"
}

# Dar permisos
echo -e "${YELLOW}→ Configurando permisos...${NC}"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

# Crear extensiones
echo -e "${YELLOW}→ Creando extensiones...${NC}"
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

# Correr migrations
echo -e "${YELLOW}→ Corriendo migrations...${NC}"
for migration in database/migrations/*.sql; do
    if [ -f "$migration" ]; then
        echo "  Aplicando: $migration"
        PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f "$migration" 2>/dev/null || {
            echo -e "${YELLOW}  (ya aplicada o error ignorado)${NC}"
        }
    fi
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           ✓ Base de datos configurada                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Conexión: psql -U $DB_USER -d $DB_NAME -h $DB_HOST"
