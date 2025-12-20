# CalleViva - Makefile
# =====================

.PHONY: help setup setup-db dev dev-backend dev-frontend build build-backend build-frontend deploy test logs status migrate migrate-down clean

# Variables
BACKEND_DIR = backend
FRONTEND_DIR = frontend
BINARY_NAME = calleviva-api
SERVICE_NAME = calleviva-api

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Muestra esta ayuda
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║            🚚 CalleViva - Comandos disponibles             ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# SETUP
# ============================================

setup: setup-backend setup-frontend ## Instala todas las dependencias
	@echo "$(GREEN)✓ Setup completo$(NC)"

setup-backend: ## Instala dependencias del backend (Go)
	@echo "$(YELLOW)→ Instalando dependencias de Go...$(NC)"
	cd $(BACKEND_DIR) && go mod download
	cd $(BACKEND_DIR) && go mod tidy
	@echo "$(GREEN)✓ Backend listo$(NC)"

setup-frontend: ## Instala dependencias del frontend (Node)
	@echo "$(YELLOW)→ Instalando dependencias de Node...$(NC)"
	cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✓ Frontend listo$(NC)"

setup-db: ## Crea base de datos y corre migrations
	@echo "$(YELLOW)→ Configurando base de datos...$(NC)"
	@chmod +x scripts/setup-db.sh
	@./scripts/setup-db.sh
	@echo "$(GREEN)✓ Base de datos lista$(NC)"

# ============================================
# DESARROLLO
# ============================================

dev: ## Corre backend y frontend en paralelo
	@echo "$(YELLOW)→ Iniciando ambiente de desarrollo...$(NC)"
	@make -j2 dev-backend dev-frontend

dev-backend: ## Corre el backend con hot reload
	@echo "$(YELLOW)→ Backend en http://localhost:8080$(NC)"
	cd $(BACKEND_DIR) && go run cmd/server/main.go

dev-frontend: ## Corre el frontend (Vite dev server)
	@echo "$(YELLOW)→ Frontend en http://localhost:5173$(NC)"
	cd $(FRONTEND_DIR) && npm run dev

# ============================================
# BUILD
# ============================================

build: build-backend build-frontend ## Compila todo para producción
	@echo "$(GREEN)✓ Build completo$(NC)"

build-backend: ## Compila el binario de Go
	@echo "$(YELLOW)→ Compilando backend...$(NC)"
	cd $(BACKEND_DIR) && CGO_ENABLED=0 GOOS=linux go build -o ../bin/$(BINARY_NAME) cmd/server/main.go
	@echo "$(GREEN)✓ Backend compilado: bin/$(BINARY_NAME)$(NC)"

build-frontend: ## Compila el frontend para producción
	@echo "$(YELLOW)→ Compilando frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run build
	@echo "$(GREEN)✓ Frontend compilado: frontend/dist/$(NC)"

# ============================================
# DATABASE
# ============================================

migrate: ## Corre migrations pendientes
	@echo "$(YELLOW)→ Corriendo migrations...$(NC)"
	@for file in database/migrations/*.sql; do \
		echo "  Aplicando: $$file"; \
		psql -U calleviva -d calleviva -h localhost -f $$file 2>/dev/null || true; \
	done
	@echo "$(GREEN)✓ Migrations aplicadas$(NC)"

migrate-down: ## Revierte última migration (requiere implementación manual)
	@echo "$(RED)⚠ migrate-down requiere implementación manual$(NC)"
	@echo "  Revisar database/migrations/ para scripts de rollback"

# ============================================
# DEPLOY
# ============================================

deploy: build ## Deploy completo (build + restart servicio)
	@echo "$(YELLOW)→ Desplegando...$(NC)"
	@chmod +x scripts/deploy.sh
	@./scripts/deploy.sh
	@echo "$(GREEN)✓ Deploy completo$(NC)"

deploy-frontend: build-frontend ## Solo deploy del frontend
	@echo "$(YELLOW)→ Copiando frontend a /var/www/calleviva...$(NC)"
	sudo rm -rf /var/www/calleviva/*
	sudo cp -r $(FRONTEND_DIR)/dist/* /var/www/calleviva/
	sudo chown -R www-data:www-data /var/www/calleviva/
	@echo "$(GREEN)✓ Frontend desplegado en /var/www/calleviva$(NC)"

deploy-backend: build-backend restart ## Solo deploy del backend
	@echo "$(GREEN)✓ Backend desplegado$(NC)"

restart: ## Reinicia el servicio backend
	@echo "$(YELLOW)→ Reiniciando servicio...$(NC)"
	sudo systemctl restart $(SERVICE_NAME)
	@echo "$(GREEN)✓ Servicio reiniciado$(NC)"

# ============================================
# TESTS
# ============================================

test: test-backend test-frontend ## Corre todos los tests
	@echo "$(GREEN)✓ Todos los tests pasaron$(NC)"

test-backend: ## Tests del backend
	@echo "$(YELLOW)→ Corriendo tests de Go...$(NC)"
	cd $(BACKEND_DIR) && go test -v ./...

test-frontend: ## Tests del frontend
	@echo "$(YELLOW)→ Corriendo tests de React...$(NC)"
	cd $(FRONTEND_DIR) && npm test --passWithNoTests

# ============================================
# UTILIDADES
# ============================================

logs: ## Ver logs del servicio en tiempo real
	sudo journalctl -u $(SERVICE_NAME) -f

status: ## Estado del servicio
	@echo "$(YELLOW)═══ Estado del Servicio ═══$(NC)"
	@sudo systemctl status $(SERVICE_NAME) --no-pager || true
	@echo ""
	@echo "$(YELLOW)═══ Estado de PostgreSQL ═══$(NC)"
	@sudo systemctl status postgresql --no-pager | head -5 || true
	@echo ""
	@echo "$(YELLOW)═══ Estado de Redis ═══$(NC)"
	@sudo systemctl status redis --no-pager | head -5 || true

clean: ## Limpia archivos generados
	@echo "$(YELLOW)→ Limpiando...$(NC)"
	rm -rf bin/
	rm -rf $(FRONTEND_DIR)/dist/
	rm -rf $(FRONTEND_DIR)/node_modules/
	@echo "$(GREEN)✓ Limpieza completa$(NC)"

lint: ## Corre linters
	@echo "$(YELLOW)→ Linting backend...$(NC)"
	cd $(BACKEND_DIR) && go vet ./...
	@echo "$(YELLOW)→ Linting frontend...$(NC)"
	cd $(FRONTEND_DIR) && npm run lint || true
	@echo "$(GREEN)✓ Linting completo$(NC)"

# ============================================
# INFO
# ============================================

info: ## Muestra información del ambiente
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║                🚚 CalleViva - Info                         ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "$(YELLOW)Versiones instaladas:$(NC)"
	@echo "  Go:         $$(go version | cut -d' ' -f3)"
	@echo "  Node:       $$(node --version)"
	@echo "  npm:        $$(npm --version)"
	@echo "  PostgreSQL: $$(psql --version | cut -d' ' -f3)"
	@echo "  Redis:      $$(redis-server --version | cut -d' ' -f3)"
	@echo ""
	@echo "$(YELLOW)Rutas:$(NC)"
	@echo "  Proyecto:   /opt/CalleViva"
	@echo "  Frontend:   /var/www/calleviva"
	@echo "  Logs:       journalctl -u $(SERVICE_NAME)"
