# ============================================
# CalleViva Backend - Makefile
# ============================================
# Uso:
#   make build     - Compila todos los binarios
#   make api       - Compila solo el servidor API
#   make restart   - Recompila API y reinicia servicio
#   make clean     - Elimina binarios
#   make help      - Muestra esta ayuda
# ============================================

.PHONY: build api ai-cli ai-config clean restart help

# Directorio de binarios
BIN_DIR := bin

# Binarios disponibles
API_BIN := $(BIN_DIR)/calleviva-api
CLI_BIN := $(BIN_DIR)/ai-cli
CONFIG_BIN := $(BIN_DIR)/ai-config

# ============================================
# Comandos principales
# ============================================

## build: Compila todos los binarios
build: api ai-cli ai-config
	@echo "✅ Todos los binarios compilados en $(BIN_DIR)/"

## api: Compila el servidor API
api:
	@echo "🔨 Compilando calleviva-api..."
	@go build -o $(API_BIN) ./cmd/server/...
	@echo "✅ $(API_BIN) listo"

## ai-cli: Compila el CLI de prueba de AI
ai-cli:
	@echo "🔨 Compilando ai-cli..."
	@go build -o $(CLI_BIN) ./cmd/ai-cli/...
	@echo "✅ $(CLI_BIN) listo"

## ai-config: Compila el CLI de configuración de AI
ai-config:
	@echo "🔨 Compilando ai-config..."
	@go build -o $(CONFIG_BIN) ./cmd/ai-config/...
	@echo "✅ $(CONFIG_BIN) listo"

## restart: Recompila API y reinicia el servicio systemd
restart: api
	@echo "🔄 Reiniciando servicio..."
	@sudo systemctl restart calleviva-api
	@sleep 2
	@sudo systemctl status calleviva-api --no-pager | head -5
	@echo "✅ Servicio reiniciado"

## clean: Elimina todos los binarios
clean:
	@echo "🧹 Limpiando binarios..."
	@rm -f $(BIN_DIR)/*
	@echo "✅ Binarios eliminados"

## status: Muestra estado del servicio
status:
	@sudo systemctl status calleviva-api --no-pager

## logs: Muestra últimos logs del servicio
logs:
	@sudo journalctl -u calleviva-api --since "5 minutes ago" --no-pager

## help: Muestra esta ayuda
help:
	@echo ""
	@echo "CalleViva Backend - Comandos disponibles:"
	@echo ""
	@grep -E '^## ' Makefile | sed 's/## /  /'
	@echo ""
	@echo "Binarios se guardan en: $(BIN_DIR)/"
	@echo "Servicio systemd: calleviva-api.service"
	@echo ""
