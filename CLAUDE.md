# CLAUDE.md — CalleViva Project Guide

> Este documento es la fuente de verdad para cualquier agente IA o desarrollador trabajando en CalleViva.
> Leélo completo antes de hacer cualquier cambio.

---

## ⚡ SKILL: calleviva-project

### 🚨 ACTIVAR SIEMPRE AL INICIO

**IMPORTANTE:** Este proyecto tiene skills dedicados que se auto-activan:

```bash
# Skills disponibles (en /opt/.claude/skills/):
Skill(calleviva-project)     # Master skill - contexto general
Skill(calleviva-backend)     # Go API patterns y handlers
Skill(calleviva-frontend)    # React + PixiJS components
Skill(calleviva-game-logic)  # Sistemas del juego y fórmulas
Skill(calleviva-ai)          # Integración Claude API
```

### Reglas Críticas (del skill)

1. 🎨 **Paleta de colores** - Coral/Mango/Agua - NUNCA morado/lavanda
2. 🏛️ **Arquitectura** - Chi router, capas separadas
3. 🎮 **PixiJS** - Para rendering del juego, React para UI
4. 🔒 **Seguridad** - JWT, validación dual (backend + frontend)
5. 🖥️ **Deploy nativo** - systemd, NO Docker

---

## 🎮 ¿Qué es CalleViva?

**CalleViva.club** es un juego web tipo Tycoon donde gestionás un negocio de Food Trucks en una ciudad que cobra vida gracias a IA.

- **Género:** Tycoon / Simulación Económica
- **Plataforma:** Web (desktop + mobile responsive)
- **Audiencia:** 11+ años (family-friendly)
- **Slogan:** "¡La calle está viva!"

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CALLEVIVA STACK                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FRONTEND (React + PixiJS)          BACKEND (Go)                       │
│  /var/www/calleviva/                /opt/CalleViva/backend/            │
│  ────────────────────               ───────────────────────             │
│  • React 18 + TypeScript            • Go 1.22                          │
│  • Vite (bundler)                   • Chi router                       │
│  • PixiJS (rendering juego)         • pgx (PostgreSQL)                 │
│  • Zustand (estado)                 • go-redis                         │
│  • Tailwind CSS                     • Claude API                       │
│                                                                         │
│          │                                    │                         │
│          │         HTTP/REST + WebSocket      │                         │
│          └────────────────┬───────────────────┘                         │
│                           │                                             │
│  ┌────────────────────────┴────────────────────────┐                   │
│  │                    NGINX                        │                   │
│  │         calleviva.club (reverse proxy)          │                   │
│  └─────────────────────────────────────────────────┘                   │
│                           │                                             │
│  ┌────────────────────────┴────────────────────────┐                   │
│  │              PERSISTENCIA                       │                   │
│  │   PostgreSQL 16    │    Redis 7                 │                   │
│  │   (datos juego)    │    (cache, sessions)       │                   │
│  └─────────────────────────────────────────────────┘                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
/opt/CalleViva/
├── CLAUDE.md                 # ← ESTÁS AQUÍ (documento maestro)
├── README.md                 # Intro para GitHub
├── Makefile                  # Comandos útiles
├── .env.example              # Variables de entorno (template)
├── .env                      # Variables de entorno (NO commitear)
├── .gitignore
│
├── backend/                  # API en Go
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── server/
│   │       └── main.go       # Entry point
│   └── internal/
│       ├── api/              # HTTP handlers y rutas
│       │   ├── routes.go
│       │   ├── middleware/
│       │   └── handlers/
│       │       ├── auth.go
│       │       ├── game.go
│       │       └── world.go
│       ├── game/             # Lógica del juego
│       │   ├── simulation/   # Motor de simulación
│       │   ├── economy/      # Sistema económico
│       │   ├── customers/    # Lógica de clientes
│       │   ├── locations/    # Sistema de ubicaciones
│       │   └── events/       # Sistema de eventos
│       ├── ai/               # Integración IA
│       │   ├── orchestrator/ # Coordinador
│       │   ├── generators/   # Generadores (diálogos, eventos)
│       │   ├── cache/        # Caché de respuestas
│       │   └── prompts/      # Templates de prompts
│       ├── storage/          # Persistencia
│       │   ├── postgres/
│       │   └── redis/
│       └── models/           # Estructuras de datos
│
├── frontend/                 # Web App React
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx          # Entry point
│       ├── App.tsx           # Router principal
│       ├── components/       # Componentes React
│       │   ├── ui/           # Botones, modals, etc.
│       │   └── game/         # Componentes del juego
│       ├── game/             # Lógica PixiJS
│       │   ├── scenes/
│       │   └── sprites/
│       ├── services/         # API clients
│       ├── stores/           # Estado (Zustand)
│       ├── types/            # TypeScript types
│       └── assets/           # Imágenes, fuentes, audio
│
├── database/
│   └── migrations/           # SQL migrations
│       ├── 001_initial.sql
│       └── ...
│
├── config/
│   └── nginx/
│       └── calleviva.conf    # Configuración nginx
│
├── scripts/                  # Scripts de utilidad
│   ├── setup-db.sh
│   └── deploy.sh
│
└── docs/
    ├── GDD.md                # Game Design Document
    └── API.md                # Documentación de API
```

---

## 🖥️ Ambiente del Servidor

| Componente | Versión | Estado |
|------------|---------|--------|
| **OS** | Ubuntu 24.04.3 LTS | ✅ |
| **nginx** | 1.24.0 | ✅ |
| **PostgreSQL** | 16.11 | ✅ |
| **Go** | 1.22.0 | ✅ |
| **Node.js** | 22.18.0 | ✅ |
| **Redis** | 7.0.15 | ✅ |

**Rutas importantes:**
- Proyecto: `/opt/CalleViva`
- Frontend compilado: `/var/www/calleviva`
- Servicio systemd: `calleviva-api.service`

---

## ⚙️ Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```bash
# Server
PORT=8080
ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calleviva
DB_USER=calleviva
DB_PASSWORD=tu_password_seguro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Claude API
CLAUDE_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514

# JWT
JWT_SECRET=tu_jwt_secret_muy_largo_y_seguro

# Frontend URL (para CORS)
FRONTEND_URL=https://calleviva.club
```

---

## 🚀 Comandos (Makefile)

```bash
# Setup inicial
make setup              # Instala dependencias (frontend + backend)
make setup-db           # Crea BD y corre migrations

# Desarrollo
make dev                # Corre backend + frontend en paralelo
make dev-backend        # Solo backend (con hot reload)
make dev-frontend       # Solo frontend (Vite dev server)

# Base de datos
make migrate            # Corre migrations pendientes
make migrate-down       # Revierte última migration

# Build
make build              # Compila frontend + backend
make build-frontend     # Solo frontend
make build-backend      # Solo backend

# Deploy
make deploy             # Build + restart servicio

# Tests
make test               # Corre todos los tests
make test-backend       # Solo tests de Go
make test-frontend      # Solo tests de React

# Utilidades
make logs               # Ver logs del servicio
make status             # Estado del servicio
```

---

## 🗄️ Base de Datos

### Crear BD y usuario

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Crear usuario y BD
CREATE USER calleviva WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE calleviva OWNER calleviva;
GRANT ALL PRIVILEGES ON DATABASE calleviva TO calleviva;

-- Extensiones necesarias
\c calleviva
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Convenciones

- **Tablas:** snake_case, plural (`game_sessions`, `sales_log`)
- **Columnas:** snake_case (`created_at`, `player_id`)
- **PKs:** UUID con `gen_random_uuid()`
- **Timestamps:** `TIMESTAMPTZ` con default `NOW()`
- **Soft delete:** columna `deleted_at` nullable

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/v1/auth/register     # Crear cuenta
POST   /api/v1/auth/login        # Iniciar sesión
POST   /api/v1/auth/logout       # Cerrar sesión
GET    /api/v1/auth/me           # Usuario actual
```

### Juego
```
POST   /api/v1/games             # Nueva partida
GET    /api/v1/games             # Listar partidas del jugador
GET    /api/v1/games/:id         # Estado de partida
DELETE /api/v1/games/:id         # Eliminar partida
```

### Gameplay
```
GET    /api/v1/games/:id/day              # Info del día actual
POST   /api/v1/games/:id/market/buy       # Comprar ingredientes
POST   /api/v1/games/:id/location/set     # Elegir ubicación
POST   /api/v1/games/:id/menu/configure   # Configurar menú
POST   /api/v1/games/:id/day/start        # Iniciar simulación
GET    /api/v1/games/:id/day/results      # Resultados
```

### Datos estáticos
```
GET    /api/v1/worlds/:type/products      # Catálogo de productos
GET    /api/v1/worlds/:type/locations     # Ubicaciones
GET    /api/v1/worlds/:type/events        # Eventos posibles
```

---

## 🎨 Convenciones de Código

### Go (Backend)

```go
// Estructura de handler
func (h *GameHandler) GetGameState(w http.ResponseWriter, r *http.Request) {
    // 1. Extraer parámetros
    gameID := chi.URLParam(r, "id")
    
    // 2. Validar
    if gameID == "" {
        respondError(w, http.StatusBadRequest, "game_id required")
        return
    }
    
    // 3. Ejecutar lógica
    state, err := h.gameService.GetState(r.Context(), gameID)
    if err != nil {
        respondError(w, http.StatusInternalServerError, err.Error())
        return
    }
    
    // 4. Responder
    respondJSON(w, http.StatusOK, state)
}
```

**Convenciones:**
- Nombres de paquetes: minúsculas, una palabra (`game`, `storage`)
- Interfaces: terminan en `-er` (`GameService`, `CustomerGenerator`)
- Errores: usar `fmt.Errorf("contexto: %w", err)`
- Context: siempre pasarlo como primer parámetro

### TypeScript (Frontend)

```typescript
// Componente React
interface GameHeaderProps {
  money: number;
  reputation: number;
  day: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ 
  money, 
  reputation, 
  day 
}) => {
  return (
    <header className="game-header">
      {/* ... */}
    </header>
  );
};
```

**Convenciones:**
- Componentes: PascalCase (`GameHeader.tsx`)
- Hooks: camelCase con prefijo `use` (`useGameState.ts`)
- Types: PascalCase, sufijo descriptivo (`GameStateResponse`)
- Servicios: camelCase (`gameService.ts`)

---

## 🎨 Paleta de Colores

```css
:root {
  /* Primarios */
  --coral: #FF6B6B;      /* Energía, acciones principales */
  --mango: #FFE66D;      /* Alegría, destacados */
  --agua: #2EC4B6;       /* Éxito, frescura */
  
  /* Secundarios */
  --papaya: #FF9F43;     /* Calidez, reputación */
  --hoja: #5C8A4D;       /* Dinero, naturaleza */
  --terracota: #E17055;  /* Calle, artesanal */
  
  /* Neutrales */
  --carbon: #2D3436;     /* Texto principal */
  --crema: #F5F0E6;      /* Fondos */
  --gris-claro: #DFE6E9; /* Bordes, secundarios */
}
```

**Regla:** NO usar morados/lavandas (evitar "estética IA").

---

## 🤖 Integración IA (Claude)

### Cuándo llamar a Claude

| Momento | Qué genera | Latencia | Cacheable |
|---------|------------|----------|-----------|
| Venta completada | Diálogo cliente | Async | Sí |
| Fin de día | Tip del día | 2-3s | No |
| Fin de semana | Artículo periódico | Batch | No |
| Decisión competidor | Nueva estrategia | Batch | No |

### Estructura de prompts

```go
// prompts/dialogue.go
const CustomerDialoguePrompt = `Sos un cliente costarricense comprando en un Food Truck.
Respondé con UNA frase corta (máximo 10 palabras).
Usá jerga tica natural (mae, diay, tuanis, pura vida).
No uses hashtags ni emojis.

Contexto:
- Producto: {{.Product}}
- Precio: {{.Price}}
- Satisfacción: {{.Satisfaction}}/10
- Clima: {{.Weather}}

Generá solo la frase, nada más.`
```

### Fallbacks

Si Claude no responde, usar pool predefinido:
```go
var fallbackDialogues = map[string][]string{
    "happy": {"¡Pura vida!", "¡Tuanis!", "¡Qué rico!"},
    "neutral": {"Está bien", "Ok", "Gracias"},
    "unhappy": {"Muy caro", "Mucha fila", "Paso..."},
}
```

---

## 🚦 Git Workflow

```bash
# Ramas
main        # Producción
develop     # Desarrollo
feature/*   # Features nuevas
fix/*       # Bugfixes

# Commits (conventional commits)
feat: agregar sistema de clima
fix: corregir cálculo de reputación
docs: actualizar API.md
refactor: extraer lógica de simulación
```

---

## 📋 Checklist para nuevas features

### Agregar nuevo endpoint

1. [ ] Crear handler en `backend/internal/api/handlers/`
2. [ ] Registrar ruta en `backend/internal/api/routes.go`
3. [ ] Crear/actualizar modelos en `backend/internal/models/`
4. [ ] Agregar tests
5. [ ] Documentar en `docs/API.md`
6. [ ] Actualizar types en `frontend/src/types/`
7. [ ] Crear service en `frontend/src/services/`

### Agregar nueva pantalla (frontend)

1. [ ] Crear componente en `frontend/src/components/game/`
2. [ ] Agregar ruta en `App.tsx`
3. [ ] Conectar con store (Zustand)
4. [ ] Agregar llamadas a API si necesario
5. [ ] Responsive (mobile + desktop)

### Agregar producto/ubicación al juego

1. [ ] Agregar a migration SQL
2. [ ] Agregar a `worlds/costa_rica/products.json` (o similar)
3. [ ] Agregar assets (sprites, iconos)
4. [ ] Actualizar lógica de balanceo si necesario

---

## 🐛 Debugging

### Logs del backend
```bash
# Ver logs en tiempo real
sudo journalctl -u calleviva-api -f

# Últimas 100 líneas
sudo journalctl -u calleviva-api -n 100
```

### Logs de nginx
```bash
# Access log
tail -f /var/log/nginx/calleviva.access.log

# Error log
tail -f /var/log/nginx/calleviva.error.log
```

### Conectar a PostgreSQL
```bash
psql -U calleviva -d calleviva -h localhost
```

### Conectar a Redis
```bash
redis-cli
> KEYS calleviva:*
```

---

## 📞 Contacto

- **Proyecto:** CalleViva.club
- **Repo:** github.com/alonsoalpizar/calleviva
- **Inspirado por:** Nacho ✨

---

*Última actualización: Diciembre 2024*
