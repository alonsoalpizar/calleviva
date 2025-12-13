# CalleViva API Documentation

> API REST para CalleViva.club
> Base URL: `https://calleviva.club/api/v1`

---

## Autenticación

Todas las rutas protegidas requieren header `Authorization: Bearer <token>`.

### POST /auth/register

Crear nueva cuenta.

**Request:**
```json
{
  "email": "jugador@ejemplo.com",
  "password": "password123",
  "display_name": "MiNombre"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "jugador@ejemplo.com",
  "display_name": "MiNombre",
  "token": "jwt_token_here"
}
```

### POST /auth/login

Iniciar sesión.

**Request:**
```json
{
  "email": "jugador@ejemplo.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "jugador@ejemplo.com",
  "display_name": "MiNombre",
  "token": "jwt_token_here"
}
```

### GET /auth/me

Obtener usuario actual.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "jugador@ejemplo.com",
  "display_name": "MiNombre",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Partidas

### POST /games

Crear nueva partida.

**Request:**
```json
{
  "world_type": "costa_rica",
  "name": "Mi Primera Partida"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "world_type": "costa_rica",
  "name": "Mi Primera Partida",
  "game_day": 1,
  "money": 15000,
  "reputation": 0,
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### GET /games

Listar partidas del jugador.

**Response (200):**
```json
{
  "games": [
    {
      "id": "uuid",
      "world_type": "costa_rica",
      "name": "Mi Primera Partida",
      "game_day": 5,
      "money": 25000,
      "reputation": 35,
      "status": "active"
    }
  ]
}
```

### GET /games/:id

Obtener estado de una partida.

**Response (200):**
```json
{
  "id": "uuid",
  "world_type": "costa_rica",
  "name": "Mi Primera Partida",
  "game_day": 5,
  "money": 25000,
  "reputation": 35,
  "current_location": "parque",
  "weather": "sunny",
  "status": "active",
  "trucks": [
    {
      "id": "uuid",
      "name": "Mi Food Truck",
      "level": 1,
      "truck_type": "cart"
    }
  ],
  "inventory": [
    {
      "item_type": "hielo",
      "quantity": 15,
      "cost_per_unit": 100
    }
  ]
}
```

### DELETE /games/:id

Eliminar partida.

**Response (204):** No content

---

## Gameplay

### GET /games/:id/day

Obtener información del día actual.

**Response (200):**
```json
{
  "game_day": 5,
  "weather": "sunny",
  "weather_effects": {
    "traffic_modifier": 1.2,
    "message": "¡Buen día para helados!"
  },
  "events": [],
  "available_locations": [
    {
      "id": "parque",
      "name": "Parque Central",
      "cost": 800,
      "traffic_level": "medium",
      "unlocked": true
    }
  ]
}
```

### POST /games/:id/market/buy

Comprar ingredientes.

**Request:**
```json
{
  "items": [
    { "item_type": "hielo", "quantity": 10 },
    { "item_type": "sirope_premium", "quantity": 5 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "total_cost": 2500,
  "new_money": 22500,
  "inventory": [
    { "item_type": "hielo", "quantity": 25 }
  ]
}
```

### POST /games/:id/location/set

Elegir ubicación para el día.

**Request:**
```json
{
  "location_id": "zona_industrial"
}
```

**Response (200):**
```json
{
  "success": true,
  "location": {
    "id": "zona_industrial",
    "name": "Zona Industrial",
    "cost": 600
  },
  "cost_applied": 600,
  "new_money": 21900
}
```

### POST /games/:id/menu/configure

Configurar menú y precios.

**Request:**
```json
{
  "items": [
    { "product_type": "granizado_basico", "price": 350, "active": true },
    { "product_type": "granizado_premium", "price": 650, "active": true },
    { "product_type": "churchill", "price": 900, "active": false }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "menu": [
    { "product_type": "granizado_basico", "price": 350, "active": true },
    { "product_type": "granizado_premium", "price": 650, "active": true }
  ]
}
```

### POST /games/:id/day/start

Iniciar simulación del día.

**Response (200):**
```json
{
  "success": true,
  "simulation_id": "uuid",
  "message": "Simulación iniciada"
}
```

**WebSocket Events durante simulación:**
```json
// Venta
{
  "type": "sale",
  "data": {
    "product": "granizado_premium",
    "price": 650,
    "customer_dialogue": "¡Tuanis!",
    "customer_mood": "happy",
    "time": "12:34"
  }
}

// Cliente perdido
{
  "type": "customer_left",
  "data": {
    "reason": "queue_too_long",
    "dialogue": "Mucha fila, paso..."
  }
}

// Hora completada
{
  "type": "hour_complete",
  "data": {
    "hour": 12,
    "sales_this_hour": 2450,
    "customers_served": 5,
    "customers_lost": 1
  }
}

// Día completado
{
  "type": "day_complete",
  "data": {
    "summary_available": true
  }
}
```

### GET /games/:id/day/results

Obtener resultados del día.

**Response (200):**
```json
{
  "game_day": 5,
  "location": "zona_industrial",
  "weather": "sunny",
  "summary": {
    "total_revenue": 12500,
    "total_costs": 4800,
    "location_cost": 600,
    "total_profit": 7100,
    "customers_served": 18,
    "customers_lost": 3,
    "reputation_change": 3,
    "top_product": {
      "type": "churchill",
      "quantity": 8
    }
  },
  "ai_tip": "¡Los trabajadores aman el Churchill! Considerá bajar un poco el precio del granizado básico.",
  "new_totals": {
    "money": 29000,
    "reputation": 38
  }
}
```

---

## Datos Estáticos (Mundos)

### GET /worlds/:type/products

Obtener catálogo de productos de un mundo.

**Response (200):**
```json
{
  "world_type": "costa_rica",
  "products": [
    {
      "id": "granizado_basico",
      "name": "Granizado Básico",
      "icon": "🧊",
      "base_cost": 150,
      "suggested_price": 350,
      "difficulty": 1,
      "unlock_reputation": 0
    },
    {
      "id": "churchill",
      "name": "Churchill",
      "icon": "🍨",
      "base_cost": 400,
      "suggested_price": 900,
      "difficulty": 2,
      "unlock_reputation": 20
    }
  ]
}
```

### GET /worlds/:type/locations

Obtener ubicaciones disponibles.

**Response (200):**
```json
{
  "world_type": "costa_rica",
  "locations": [
    {
      "id": "parque",
      "name": "Parque Central",
      "icon": "🌳",
      "cost_per_day": 800,
      "traffic_base": "medium",
      "client_type": "families",
      "peak_hours": [10, 11, 15, 16, 17],
      "unlock_reputation": 0
    }
  ]
}
```

### GET /worlds/:type/events

Obtener eventos posibles.

**Response (200):**
```json
{
  "world_type": "costa_rica",
  "events": [
    {
      "id": "dia_soleado",
      "name": "Día Soleado",
      "icon": "☀️",
      "probability": 0.5,
      "effects": {
        "traffic_modifier": 1.2,
        "product_modifiers": {
          "helados": 1.3
        }
      }
    }
  ]
}
```

---

## Health Check

### GET /health

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no existe |
| 409 | Conflict - Recurso ya existe |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit |
| 500 | Internal Server Error |

**Formato de error:**
```json
{
  "error": "error_code",
  "message": "Descripción legible del error",
  "details": {}
}
```

---

*Última actualización: Diciembre 2024*
