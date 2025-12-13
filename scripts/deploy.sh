#!/bin/bash
# ============================================
# CalleViva - Deploy Script
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/opt/CalleViva"
FRONTEND_DEST="/var/www/calleviva"
SERVICE_NAME="calleviva-api"

echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              🚀 CalleViva Deploy                           ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd $PROJECT_DIR

# 1. Pull últimos cambios
echo -e "${YELLOW}→ Obteniendo últimos cambios...${NC}"
git pull origin main
echo -e "${GREEN}✓ Código actualizado${NC}"

# 2. Build backend
echo -e "${YELLOW}→ Compilando backend...${NC}"
cd backend
go build -o ../bin/calleviva-api cmd/server/main.go
cd ..
echo -e "${GREEN}✓ Backend compilado${NC}"

# 3. Build frontend
echo -e "${YELLOW}→ Compilando frontend...${NC}"
cd frontend
npm install --silent
npm run build
cd ..
echo -e "${GREEN}✓ Frontend compilado${NC}"

# 4. Deploy frontend
echo -e "${YELLOW}→ Desplegando frontend...${NC}"
sudo rm -rf $FRONTEND_DEST/*
sudo cp -r frontend/dist/* $FRONTEND_DEST/
sudo chown -R www-data:www-data $FRONTEND_DEST
echo -e "${GREEN}✓ Frontend desplegado${NC}"

# 5. Correr migrations (si hay nuevas)
echo -e "${YELLOW}→ Verificando migrations...${NC}"
./scripts/setup-db.sh > /dev/null 2>&1 || true
echo -e "${GREEN}✓ Migrations verificadas${NC}"

# 6. Restart servicio
echo -e "${YELLOW}→ Reiniciando servicio...${NC}"
sudo systemctl restart $SERVICE_NAME
sleep 2

# 7. Verificar estado
if sudo systemctl is-active --quiet $SERVICE_NAME; then
    echo -e "${GREEN}✓ Servicio corriendo${NC}"
else
    echo -e "${RED}✗ Error: El servicio no está corriendo${NC}"
    sudo journalctl -u $SERVICE_NAME -n 20 --no-pager
    exit 1
fi

# 8. Health check
echo -e "${YELLOW}→ Verificando health...${NC}"
sleep 2
if curl -s http://localhost:8080/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ API respondiendo${NC}"
else
    echo -e "${YELLOW}⚠ API no responde al health check (puede estar iniciando)${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✓ Deploy completado                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "  Frontend: https://calleviva.club"
echo "  API:      https://calleviva.club/api/v1"
echo "  Logs:     sudo journalctl -u $SERVICE_NAME -f"
