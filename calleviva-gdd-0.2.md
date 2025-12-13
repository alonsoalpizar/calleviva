# GAME DESIGN DOCUMENT (GDD)
## CalleViva.club
### Versión 0.2 — Diseño Completo

---

# 📋 ÍNDICE

1. [Identidad del Proyecto](#1-identidad-del-proyecto)
2. [Sistema de Mundos](#2-sistema-de-mundos)
3. [Loop de Juego](#3-loop-de-juego)
4. [Sistemas Core](#4-sistemas-core)
5. [Integración IA](#5-integración-ia)
6. [Stack Técnico](#6-stack-técnico)
7. [MVP Scope](#7-mvp-scope)
8. [Roadmap](#8-roadmap)
9. [Monetización](#9-monetización)
10. [Anexos](#10-anexos)

---

# 1. IDENTIDAD DEL PROYECTO

## 1.1 Información Básica

| Campo | Valor |
|-------|-------|
| **Nombre** | CalleViva.club |
| **Slogan** | ¡La calle está viva! |
| **Género** | Tycoon / Simulación Económica / Estrategia |
| **Plataforma** | Web (desktop y mobile) |
| **Audiencia** | 11+ años (family-friendly) |
| **Jugadores** | Single-player (MVP), Multiplayer asíncrono (futuro) |

## 1.2 Pitch (Una oración)

> Un juego de Food Trucks donde la ciudad cobra vida y cada día es una aventura diferente.

## 1.3 Descripción Completa

¡Bienvenido a CalleViva.club! 🚚🌮

Empezás con un pequeño carrito de comida, unas monedas en el bolsillo y un montón de ganas. Tu misión: convertirte en la leyenda de la calle.

Pero ojo... ¡esta no es una ciudad normal!

- **🌧️ El clima cambia todo** — Un día soleado llena tu esquina de clientes. Pero si llueve... ¿tenés paraguas para ellos o se van a la competencia?

- **👥 Clientes con personalidad** — Cada cliente es único. Algunos buscan lo más barato, otros quieren lo mejor, y algunos solo pasan si les caés bien.

- **🎪 Eventos sorpresa** — Festivales, conciertos, días feriados... la ciudad siempre tiene algo preparado. ¿Vas a estar en el lugar correcto?

- **🤖 Competencia inteligente** — Otros Food Trucks también quieren tu esquina. Y no son tontos... se adaptan, cambian precios, ¡y hasta copian tus ideas!

- **📈 Crecé a tu ritmo** — Empezá con granizados, terminá con una cadena de restaurantes. Cada partida es diferente porque la calle nunca se repite.

## 1.4 Pilares de Diseño

### Pilar 1: Mundo Vivo
La ciudad respira. Los clientes tienen rutinas, el clima afecta el humor, y siempre hay algo pasando. No es un escenario estático.

### Pilar 2: Decisiones que Importan
Cada elección tiene consecuencias reales. ¿Dónde te ubicás? ¿Qué precio ponés? ¿Invertís en mejoras o guardás para emergencias?

### Pilar 3: Sorpresa Constante
Ningún día es igual. La combinación de clima, eventos, clientes y competencia crea situaciones únicas cada partida.

### Pilar 4: Fácil de Aprender, Difícil de Dominar
Un niño de 11 años puede jugar y divertirse. Un adulto estratégico puede optimizar durante horas.

### Pilar 5: Identidad Cultural
Cada "mundo" tiene sabor propio. Costa Rica se siente diferente a México, con productos, eventos y jerga únicos.

## 1.5 Fantasía del Jugador

El jugador experimenta:
- Ser dueño de su propio negocio
- Tomar decisiones como "el jefe"
- Ver su esfuerzo convertirse en éxito
- Descubrir sorpresas en un mundo que se siente vivo
- Aprender de sus errores sin castigo excesivo

## 1.6 Tono y Personalidad

### ES:
- ✅ Divertido
- ✅ Energético  
- ✅ Colorido
- ✅ Accesible
- ✅ Sorprendente
- ✅ Desafiante pero justo

### NO ES:
- ❌ Infantil o bobo
- ❌ Agresivo o estresante
- ❌ Técnico o corporativo
- ❌ Oscuro o pesimista
- ❌ Frustrante

### Voz de la Marca:
> "Hola! Soy CalleViva y te cuento las cosas como son, con energía, sin complicarme, y siempre con una sorpresa guardada."

## 1.7 Paleta de Colores

### Primarios (energía, comida, calle):
- `#FF6B6B` — Rojo coral (salsa, energía)
- `#FFE66D` — Amarillo mango (sol, alegría)
- `#2EC4B6` — Verde agua (frescura, éxito)

### Secundarios (ambiente, variedad):
- `#FF9F43` — Naranja papaya (atardecer, calidez)
- `#5C8A4D` — Verde hoja (naturaleza, mercado)
- `#E17055` — Terracota (calle, artesanal)

### Neutrales:
- `#2D3436` — Gris carbón (texto)
- `#F5F0E6` — Crema cálido (fondos)
- `#DFE6E9` — Gris claro (UI secundaria)

### Evitamos:
- ❌ Morados / Lavandas (tono "IA")
- ❌ Azules neón (tech startup)
- ❌ Gradientes brillantes (crypto)

---

# 2. SISTEMA DE MUNDOS

## 2.1 Concepto

CalleViva usa un sistema de **"Mundos"** que representan diferentes regiones/países. Cada mundo comparte el motor base pero tiene identidad única.

```
MOTOR BASE (compartido)
├── Sistemas de economía
├── Lógica de demanda
├── IA de competidores
├── Motor de eventos
└── UI/UX

MUNDOS (contenido específico)
├── 🇨🇷 Costa Rica (MVP)
├── 🇲🇽 México (futuro)
├── 🇨🇴 Colombia (futuro)
└── 🇦🇷 Argentina (futuro)
```

## 2.2 Estructura de un Mundo

Cada mundo define:

| Elemento | Descripción |
|----------|-------------|
| **Productos** | Comidas y bebidas locales |
| **Ubicaciones** | Mapa con zonas características |
| **Eventos** | Festividades y situaciones culturales |
| **Clima** | Patrones climáticos regionales |
| **Jerga** | Frases y expresiones para diálogos |
| **Moneda** | Símbolo y nombre (cosmético) |
| **Assets** | Sprites, música, sonidos |

## 2.3 Mundo MVP: Costa Rica 🇨🇷

### Productos Disponibles

| Producto | Costo Base | Precio Sugerido | Dificultad |
|----------|------------|-----------------|------------|
| Granizado básico | ₡150 | ₡350 | ⭐ Inicial |
| Granizado premium | ₡280 | ₡650 | ⭐ Inicial |
| Churchill | ₡400 | ₡900 | ⭐⭐ Intermedio |
| Agua de pipa | ₡350 | ₡700 | ⭐⭐ Intermedio |
| Copo con leche | ₡450 | ₡950 | ⭐⭐ Intermedio |
| Gallo pinto | ₡600 | ₡1,200 | ⭐⭐⭐ Avanzado |
| Casado | ₡900 | ₡2,000 | ⭐⭐⭐ Avanzado |

### Ubicaciones

| Zona | Tráfico Base | Tipo de Cliente | Costo/Día |
|------|--------------|-----------------|-----------|
| Parque Central | Medio | Variado | ₡800 |
| Zona Industrial | Alto (12-2pm) | Trabajadores | ₡600 |
| Escuela/Colegio | Alto (7am, 12pm) | Jóvenes | ₡500 |
| Playa (desbloq.) | Alto fines de semana | Turistas | ₡1,500 |
| Estadio (desbloq.) | Muy alto en eventos | Fanáticos | ₡2,000 |
| Feria (temporal) | Muy alto | Familias | ₡2,500 |

### Eventos

| Evento | Frecuencia | Efecto |
|--------|------------|--------|
| Día soleado | Común | +20% tráfico general |
| Lluvia fuerte | Común | -30% tráfico, +precio bebidas calientes |
| Feria del pueblo | Mensual | Nueva ubicación temporal, mucho tráfico |
| Partido de la Sele | Variable | Zona estadio explota, patriotismo +compras |
| Día de la Madre | Anual | +50% tráfico, familias |
| Semana Santa | Anual | -tráfico en ciudad, +playa |
| Fiestas de Palmares | Anual | Evento masivo, ubicación especial |

### Jerga para Diálogos

```
Positivo:
- "¡Pura vida, mae!"
- "¡Qué rico está esto!"
- "¡Tuanis!"
- "¡Me salvaste el día!"

Neutral:
- "Diay, está bien"
- "Ahí vamos"
- "Regular, mae"

Negativo:
- "¡Está muy caro, mae!"
- "Uy no, mucha fila"
- "Qué pereza esperar"
- "Paso, paso..."
```

---

# 3. LOOP DE JUEGO

## 3.1 Loop Macro (Sesión Completa)

```
┌─────────────────────────────────────────────────────────────┐
│                    LOOP DE SESIÓN                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   INICIO DE SESIÓN                                          │
│         │                                                   │
│         ▼                                                   │
│   ┌───────────┐                                             │
│   │  REVISAR  │  Ver estado actual, dinero, reputación     │
│   │  ESTADO   │  Noticias del día, clima, eventos          │
│   └─────┬─────┘                                             │
│         │                                                   │
│         ▼                                                   │
│   ┌───────────┐                                             │
│   │ PLANIFICAR│  Comprar ingredientes                      │
│   │   EL DÍA  │  Elegir ubicación                          │
│   │           │  Configurar menú y precios                 │
│   └─────┬─────┘                                             │
│         │                                                   │
│         ▼                                                   │
│   ┌───────────┐                                             │
│   │  SIMULAR  │  Ver el día desarrollarse                  │
│   │   DÍA     │  Clientes llegan, compran, reaccionan      │
│   │           │  Eventos pueden ocurrir                    │
│   └─────┬─────┘                                             │
│         │                                                   │
│         ▼                                                   │
│   ┌───────────┐                                             │
│   │  REVISAR  │  Ver resultados del día                    │
│   │ RESULTADOS│  Ganancias, clientes, reputación           │
│   │           │  Aprender qué funcionó                     │
│   └─────┬─────┘                                             │
│         │                                                   │
│         ▼                                                   │
│   ┌───────────┐                                             │
│   │  MEJORAR  │  Comprar upgrades                          │
│   │   (opc.)  │  Desbloquear productos                     │
│   │           │  Expandir negocio                          │
│   └─────┬─────┘                                             │
│         │                                                   │
│         └──────────► REPETIR (siguiente día)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 3.2 Loop Micro (Momento a Momento)

### Ritmo de Juego: HÍBRIDO

El jugador planifica sin presión de tiempo, pero VE la simulación del día en tiempo acelerado.

```
PLANIFICACIÓN (sin tiempo)     SIMULACIÓN (tiempo acelerado)
═══════════════════════════    ═══════════════════════════════
• Pensás con calma             • Ves clientes llegar
• Ajustás todo                 • Ventas aparecen en log
• Sin estrés                   • Podés acelerar (x2, x5)
• Clic "Iniciar día"           • No podés cambiar nada
                               • Dura 30-60 segundos reales
```

### Controles Durante Simulación

```
┌─────────────────────────────────────────────────────────────┐
│  [▶ x1]  [▶▶ x2]  [▶▶▶ x5]              🕐 12:34 PM       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     🚚 ← Tu Food Truck                                      │
│                                                             │
│     😊 😊 → 🚚 → 😋  (clientes en fila)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ LOG DE VENTAS                                       │   │
│  │ 12:30  Churchill         +₡900   😋 "¡Tuanis!"     │   │
│  │ 12:32  Granizado premium +₡650   😊 "Rico"         │   │
│  │ 12:33  Cliente se fue    ---     😤 "Mucha fila"   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Ventas: ₡4,200    Clientes: 8    Perdidos: 2              │
└─────────────────────────────────────────────────────────────┘
```

## 3.3 Flujo de Pantallas

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MENÚ      │────▶│   MAPA      │────▶│  MERCADO    │
│  PRINCIPAL  │     │  (elegir    │     │  (comprar   │
│             │     │  ubicación) │     │ ingredientes│
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                          │                    │
                          └────────┬───────────┘
                                   ▼
                          ┌─────────────┐
                          │   PREPARAR  │
                          │    MENÚ     │
                          │  (precios)  │
                          └──────┬──────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  SIMULACIÓN │
                          │   DEL DÍA   │
                          └──────┬──────┘
                                 │
                                 ▼
                          ┌─────────────┐
                          │  RESUMEN    │────▶ [MEJORAS]
                          │  DEL DÍA    │────▶ [SIGUIENTE DÍA]
                          └─────────────┘
```

## 3.4 Sesión Ejemplo: 15 Minutos

```
MINUTO 0-1: Inicio
─────────────────
• Jugador abre el juego
• Ve: Día 5, ₡12,000, Reputación 45
• Noticia: "¡Hoy hay sol! Buen día para helados"

MINUTO 1-3: Planificación
─────────────────────────
• Revisa inventario: le queda poco hielo
• Va al mercado, compra 20 bolsas (₡2,000)
• Elige ubicación: Parque Central
• Configura menú: Granizado ₡400, Churchill ₡950

MINUTO 3-4: Simulación
──────────────────────
• Clic "¡Iniciar día!"
• Ve clientes llegar, algunos compran
• Un cliente se queja del precio (feedback)
• El día termina

MINUTO 4-5: Resultados
──────────────────────
• Ventas: ₡8,500
• Costos: ₡3,200
• Ganancia: ₡5,300 ✓
• 2 clientes perdidos por precio alto
• Reputación: 45 → 47

MINUTO 5-6: Decisión
────────────────────
• Jugador baja precio del Churchill a ₡850
• Decide ahorrar para comprar sombrilla (₡5,000)

MINUTO 6-15: Repite 2-3 días más
────────────────────────────────
• Cada ciclo toma ~3-4 minutos
• En 15 min jugó ~4 días de juego
• Progresó, aprendió, se divirtió
```

---

# 4. SISTEMAS CORE

## 4.1 Sistema Económico

### Fórmulas Base

**Ganancia diaria:**
```
GANANCIA = VENTAS_TOTALES - COSTOS_INGREDIENTES - COSTO_UBICACIÓN
```

**Precio de venta sugerido:**
```
PRECIO_SUGERIDO = COSTO_BASE × 2.2 (margen ~55%)
```

**Elasticidad de demanda:**
```
FACTOR_PRECIO = 1 - ((PRECIO_ACTUAL - PRECIO_ESPERADO) / PRECIO_ESPERADO × 0.5)

Si PRECIO > PRECIO_ESPERADO × 1.3 → Clientes se quejan
Si PRECIO < PRECIO_ESPERADO × 0.8 → Sospechan baja calidad
```

### Curva de Progresión

| Día | Dinero Esperado | Reputación | Desbloqueos |
|-----|-----------------|------------|-------------|
| 1-7 | ₡10,000-25,000 | 0-30 | Tutorial, productos básicos |
| 8-30 | ₡25,000-80,000 | 30-60 | Nuevas ubicaciones, upgrades |
| 31-90 | ₡80,000-250,000 | 60-85 | Segundo truck, empleados |
| 90+ | ₡250,000+ | 85+ | Cadena, dominio del mercado |

### Condición de Quiebra

```
Si DINERO < 0 por 3 días consecutivos:
    → Mensaje amigable: "¡Uy! Tiempos difíciles..."
    → Opción: Reiniciar día / Préstamo de emergencia / Nuevo juego
```

## 4.2 Sistema de Clientes

### Atributos de Cliente

| Atributo | Valores | Efecto |
|----------|---------|--------|
| **Presupuesto** | Bajo / Medio / Alto | Sensibilidad al precio |
| **Paciencia** | 1-10 | Tolerancia a filas |
| **Preferencia** | Dulce / Salado / Fresco | Productos favoritos |
| **Lealtad** | 0-100 | Probabilidad de volver |
| **Humor** | 1-10 | Afectado por clima, espera |

### Comportamiento de Cliente

```
CLIENTE LLEGA
    │
    ├── ¿Hay producto que le gusta?
    │   └── NO → Se va (😐 "No hay lo que busco")
    │
    ├── ¿El precio está en su rango?
    │   └── NO → Se va (😤 "Muy caro")
    │
    ├── ¿La fila es tolerable?
    │   └── NO → Se va (😤 "Mucha fila")
    │
    └── SÍ a todo → COMPRA (😋 + comentario)
        │
        └── Lealtad += f(satisfacción)
```

### Generación de Clientes

```
CLIENTES_POR_HORA = TRÁFICO_BASE 
                   × MODIFICADOR_HORA 
                   × MODIFICADOR_CLIMA 
                   × MODIFICADOR_EVENTO 
                   × MODIFICADOR_REPUTACIÓN

Ejemplo:
Zona Industrial, 12:00 PM, Soleado, Sin evento, Rep 50

CLIENTES = 10 × 1.5 × 1.1 × 1.0 × 1.25 = ~20 clientes/hora
```

## 4.3 Sistema de Ubicaciones

### Características por Ubicación

| Ubicación | Horarios Pico | Perfil Cliente | Costo | Requisito |
|-----------|---------------|----------------|-------|-----------|
| Parque | 10-12, 15-18 | Familias, variado | ₡800 | Ninguno |
| Industrial | 11-14 | Trabajadores, rápido | ₡600 | Ninguno |
| Escuela | 7-8, 11-13 | Jóvenes, bajo presupuesto | ₡500 | Ninguno |
| Playa | 10-17 (finde) | Turistas, alto presupuesto | ₡1,500 | Rep 40+ |
| Estadio | Eventos | Fanáticos, impulsivos | ₡2,000 | Rep 60+ |

### Tráfico por Hora

```
ZONA INDUSTRIAL:
06:00 ████░░░░░░ 40%
07:00 ██████░░░░ 60%
08:00 ████░░░░░░ 40%
09:00 ███░░░░░░░ 30%
10:00 ███░░░░░░░ 30%
11:00 ███████░░░ 70%
12:00 ██████████ 100%  ← PICO
13:00 ████████░░ 80%
14:00 █████░░░░░ 50%
15:00 ███░░░░░░░ 30%
16:00 ████░░░░░░ 40%
17:00 ██████░░░░ 60%
18:00 ████░░░░░░ 40%
```

## 4.4 Sistema de Clima

### Efectos del Clima

| Clima | Prob. | Tráfico | Productos Afectados |
|-------|-------|---------|---------------------|
| ☀️ Soleado | 50% | +20% | Helados +30%, Caliente -20% |
| ⛅ Nublado | 25% | +0% | Sin cambio |
| 🌧️ Lluvia | 20% | -25% | Helados -30%, Bebidas calientes +30% |
| ⛈️ Tormenta | 5% | -50% | Todo baja, considera cerrar |

### Pronóstico

El jugador ve el pronóstico del día actual y una probabilidad para mañana:
```
HOY: ☀️ Soleado
MAÑANA: 70% ☀️ | 20% ⛅ | 10% 🌧️
```

## 4.5 Sistema de Reputación

### Cálculo de Reputación

```
REPUTACIÓN cambia diariamente:

Por cada cliente satisfecho:    +0.5
Por cada cliente muy feliz:     +1.0
Por cada cliente perdido:       -0.3
Por cliente que se queja:       -0.8
Bono por racha positiva:        +2.0 (5 días seguidos positivos)
```

### Efectos de Reputación

| Nivel | Rango | Efectos |
|-------|-------|---------|
| Desconocido | 0-20 | Sin bonos |
| Conocido | 21-40 | +10% clientes |
| Popular | 41-60 | +20% clientes, desbloquea ubicaciones |
| Famoso | 61-80 | +30% clientes, clientes viajan más |
| Leyenda | 81-100 | +50% clientes, eventos especiales |

## 4.6 Sistema de Progresión y Upgrades

### Árbol de Mejoras

```
MEJORAS DE EQUIPO
├── Hielera básica → Grande → Industrial
│   (Capacidad: 20 → 50 → 100 unidades)
│
├── Carrito → Food Truck pequeño → Food Truck grande
│   (Velocidad servicio: 1x → 1.3x → 1.6x)
│
├── Sin techo → Sombrilla → Toldo completo
│   (Clientes esperan: +0 → +2 → +5 en fila)
│
└── Caja simple → Registradora → Sistema POS
    (Errores de cobro: 5% → 2% → 0%)

MEJORAS DE NEGOCIO
├── Sin empleados → 1 ayudante → 2 ayudantes
│   (Clientes/hora: base → +30% → +60%)
│
├── Sin marketing → Redes sociales → Publicidad local
│   (Clientes nuevos: base → +15% → +30%)
│
└── Un local → Dos trucks → Cadena
    (Múltiples ubicaciones simultáneas)
```

### Precios de Mejoras

| Mejora | Costo | Requisito |
|--------|-------|-----------|
| Hielera grande | ₡8,000 | Día 5+ |
| Sombrilla | ₡5,000 | Ninguno |
| Food Truck pequeño | ₡50,000 | Rep 30+ |
| Primer empleado | ₡3,000/día | Rep 40+ |
| Segunda ubicación | ₡100,000 | Rep 60+ |

---

# 5. INTEGRACIÓN IA

## 5.1 Principio Fundamental

```
┌─────────────────────────────────────────────────────────────┐
│  LA IA ES INVISIBLE PARA EL JUGADOR                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  El jugador NUNCA debe pensar "esto lo hizo una IA"        │
│  Debe sentir "este mundo se siente vivo"                   │
│                                                             │
│  ❌ MAL:  "IA Generativa crea diálogos únicos"             │
│  ✅ BIEN: "Los clientes dicen cosas diferentes cada vez"   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 5.2 Qué Genera el LLM vs Qué es Algorítmico

| Sistema | Tipo | Razón |
|---------|------|-------|
| Diálogos de clientes | **LLM** | Variedad infinita, personalidad |
| Nombres de clientes | **LLM** (pre-gen) | Pool generado offline |
| Decisiones de competidores | **Híbrido** | Lógica + LLM para "creatividad" |
| Eventos narrativos | **LLM** | Noticias, historias emergentes |
| Precios y demanda | **Algorítmico** | Fórmulas matemáticas |
| Clima | **Algorítmico** | Probabilidades simples |
| Spawn de clientes | **Algorítmico** | Fórmulas de tráfico |
| Pathfinding | **Algorítmico** | A* estándar |

## 5.3 Momentos de Trigger (Cuándo se llama al LLM)

```
TRIGGER: VENTA COMPLETADA
─────────────────────────
Cuándo: Después de cada venta
Qué genera: Comentario del cliente (1 línea)
Latencia permitida: Async (el comentario puede llegar 1-2s después)
Cacheable: Sí, por contexto similar

TRIGGER: FIN DE DÍA
───────────────────
Cuándo: Al cerrar el día
Qué genera: Resumen narrativo, tip del día
Latencia permitida: 2-3 segundos (pantalla de carga)
Cacheable: No

TRIGGER: FIN DE SEMANA
──────────────────────
Cuándo: Cada 7 días de juego
Qué genera: "Artículo de periódico" sobre tu negocio
Latencia permitida: Batch (se genera mientras juega)
Cacheable: No

TRIGGER: DECISIÓN DE COMPETIDOR
───────────────────────────────
Cuándo: Cada día, después de tu turno
Qué genera: Nueva estrategia del competidor
Latencia permitida: Batch offline
Cacheable: No

TRIGGER: EVENTO ESPECIAL
────────────────────────
Cuándo: Condiciones específicas (rep alta, racha, etc.)
Qué genera: Evento narrativo único
Latencia permitida: Pre-generado
Cacheable: No
```

## 5.4 Estrategia de Caché

```
┌─────────────────────────────────────────────────────────────┐
│  CACHÉ DE DIÁLOGOS                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONTEXTO:                                                  │
│  {producto, satisfacción, clima, hora_del_día}              │
│                                                             │
│  HASH:                                                      │
│  "churchill_happy_sunny_noon" → ["¡Pura vida!", "Tuanis!"]  │
│  "granizado_neutral_rainy_morning" → ["Está bien", "Ok"]    │
│                                                             │
│  ESTRATEGIA:                                                │
│  1. Buscar en caché por hash de contexto                   │
│  2. Si hay hit y pool > 3 opciones → usar random del pool  │
│  3. Si no hay hit → llamar LLM, guardar resultado          │
│  4. Si caché tiene < 3 para ese contexto → llamar async    │
│                                                             │
│  RESULTADO:                                                 │
│  • 80% de requests servidos por caché                      │
│  • LLM se llama en background para "llenar" el caché       │
│  • Costo reducido, latencia mínima                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 5.5 Prompts Ejemplo

### Prompt: Diálogo de Cliente

```
Sistema: Sos un cliente costarricense comprando en un Food Truck.
Respondé con UNA frase corta (máximo 10 palabras).
Usá jerga tica natural (mae, diay, tuanis, pura vida).
No uses hashtags ni emojis.

Contexto:
- Producto: {producto}
- Precio pagado: {precio}
- Tu satisfacción: {satisfaccion} (1-10)
- Clima: {clima}
- Hora: {hora}

Generá solo la frase del cliente, nada más.
```

### Prompt: Noticia Semanal

```
Sistema: Sos un periodista del pueblo escribiendo sobre negocios locales.
Tono: Amigable, local, un poco humorístico.
Largo: 3-4 oraciones.

Datos del negocio esta semana:
- Nombre: {nombre_negocio}
- Ventas totales: {ventas}
- Producto más vendido: {top_producto}
- Clientes atendidos: {clientes}
- Reputación actual: {reputacion}
- Evento destacado: {evento}

Escribí una nota breve como para el periódico del pueblo.
```

## 5.6 Fallbacks (Sin Conexión)

```
Si LLM no disponible:
├── Diálogos → Pool de 50 frases predefinidas por contexto
├── Noticias → Templates con variables: "Esta semana {nombre} vendió {n} {producto}"
├── Competidor → Lógica determinística simple
└── Eventos → Pool predefinido de eventos

El juego SIEMPRE debe funcionar offline.
La IA es mejora, no dependencia.
```

---

# 6. STACK TÉCNICO

## 6.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ARQUITECTURA                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        FRONTEND (Web)                           │   │
│  │                    React + PixiJS + TypeScript                  │   │
│  └───────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                      │
│                                  │ HTTP/REST + WebSocket               │
│                                  │                                      │
│  ┌───────────────────────────────┴─────────────────────────────────┐   │
│  │                        BACKEND (Go)                             │   │
│  │                                                                 │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │   │
│  │   │ API Gateway │  │ Game Engine │  │ AI Orchestrator     │    │   │
│  │   │ (REST/WS)   │  │ (Simulation)│  │ (Claude + Cache)    │    │   │
│  │   └─────────────┘  └─────────────┘  └─────────────────────┘    │   │
│  │                                                                 │   │
│  └───────────────────────────────┬─────────────────────────────────┘   │
│                                  │                                      │
│                                  │                                      │
│  ┌───────────────────────────────┴─────────────────────────────────┐   │
│  │                      PERSISTENCIA                               │   │
│  │                                                                 │   │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │   │
│  │   │ PostgreSQL  │  │ Redis       │  │ S3/Storage          │    │   │
│  │   │ (datos)     │  │ (cache/     │  │ (assets)            │    │   │
│  │   │             │  │  sessions)  │  │                     │    │   │
│  │   └─────────────┘  └─────────────┘  └─────────────────────┘    │   │
│  │                                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Frontend

### Stack
- **Framework:** React 18+
- **Rendering:** PixiJS 7+ (para visualización del juego)
- **UI Components:** Componentes custom + Tailwind CSS
- **State:** Zustand o Redux Toolkit
- **Lenguaje:** TypeScript

### Estructura de Proyecto

```
frontend/
├── src/
│   ├── components/          # Componentes React UI
│   │   ├── ui/              # Botones, panels, modals
│   │   ├── game/            # Componentes específicos del juego
│   │   └── screens/         # Pantallas completas
│   │
│   ├── game/                # Lógica PixiJS
│   │   ├── scenes/          # Escenas del juego
│   │   ├── sprites/         # Clases de sprites
│   │   └── systems/         # Sistemas de juego (client-side)
│   │
│   ├── services/            # API clients
│   ├── stores/              # Estado global
│   ├── hooks/               # Custom hooks
│   └── types/               # TypeScript types
│
├── public/
│   └── assets/              # Sprites, audio, etc.
│
└── package.json
```

## 6.3 Backend

### Stack
- **Lenguaje:** Go 1.21+
- **Framework:** Chi o Gin (HTTP), Gorilla (WebSocket)
- **Base de datos:** PostgreSQL 15+
- **Cache:** Redis 7+
- **IA:** Claude API (Anthropic)

### Estructura de Proyecto

```
backend/
├── cmd/
│   └── server/
│       └── main.go          # Entry point
│
├── internal/
│   ├── api/                 # Handlers HTTP
│   │   ├── handlers/
│   │   ├── middleware/
│   │   └── routes.go
│   │
│   ├── game/                # Core del juego
│   │   ├── simulation/      # Motor de simulación
│   │   ├── economy/         # Sistema económico
│   │   ├── customers/       # Lógica de clientes
│   │   ├── locations/       # Sistema de ubicaciones
│   │   └── events/          # Sistema de eventos
│   │
│   ├── ai/                  # Integración IA
│   │   ├── orchestrator/    # Coordinador de llamadas
│   │   ├── generators/      # Generadores específicos
│   │   ├── cache/           # Cache de respuestas
│   │   └── prompts/         # Templates de prompts
│   │
│   ├── storage/             # Persistencia
│   │   ├── postgres/
│   │   └── redis/
│   │
│   └── models/              # Estructuras de datos
│
├── pkg/                     # Paquetes públicos/reutilizables
├── migrations/              # Migraciones SQL
└── go.mod
```

## 6.4 Base de Datos (PostgreSQL)

### Esquema Principal

```sql
-- Jugadores
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    display_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'
);

-- Partidas/Mundos
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id),
    world_type VARCHAR(50) NOT NULL DEFAULT 'costa_rica',
    game_day INT NOT NULL DEFAULT 1,
    money BIGINT NOT NULL DEFAULT 15000,
    reputation INT NOT NULL DEFAULT 0,
    current_location VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventario
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    cost_per_unit INT NOT NULL,
    UNIQUE(session_id, item_type)
);

-- Trucks/Negocios del jugador
CREATE TABLE trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    name VARCHAR(100),
    level INT DEFAULT 1,
    speed_multiplier DECIMAL(3,2) DEFAULT 1.0,
    capacity INT DEFAULT 20,
    upgrades JSONB DEFAULT '[]'
);

-- Menú configurado
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Log de ventas (para analytics y replay)
CREATE TABLE sales_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    game_day INT NOT NULL,
    game_hour INT NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    price_sold INT NOT NULL,
    cost INT NOT NULL,
    customer_satisfaction INT, -- 1-10
    customer_dialogue TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventos que han ocurrido
CREATE TABLE events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    game_day INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    narrative_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NPCs conocidos (clientes recurrentes, competidores)
CREATE TABLE npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
    npc_type VARCHAR(20) NOT NULL, -- 'customer', 'competitor'
    name VARCHAR(100),
    personality JSONB,
    relationship INT DEFAULT 50, -- 0-100
    memory JSONB DEFAULT '[]' -- Interacciones pasadas
);

-- Cache de IA
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_hash VARCHAR(64) NOT NULL,
    prompt_type VARCHAR(50) NOT NULL,
    response TEXT NOT NULL,
    hits INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(context_hash, prompt_type)
);

-- Índices
CREATE INDEX idx_sessions_player ON game_sessions(player_id);
CREATE INDEX idx_sales_session_day ON sales_log(session_id, game_day);
CREATE INDEX idx_ai_cache_hash ON ai_cache(context_hash);
```

## 6.5 API Endpoints

### REST API

```
AUTH
────
POST   /api/v1/auth/register     Crear cuenta
POST   /api/v1/auth/login        Iniciar sesión
POST   /api/v1/auth/logout       Cerrar sesión

GAME
────
POST   /api/v1/games             Nueva partida
GET    /api/v1/games             Listar partidas del jugador
GET    /api/v1/games/:id         Estado actual de partida
DELETE /api/v1/games/:id         Eliminar partida

GAMEPLAY
────────
GET    /api/v1/games/:id/day              Info del día actual
POST   /api/v1/games/:id/market/buy       Comprar ingredientes
POST   /api/v1/games/:id/location/set     Elegir ubicación
POST   /api/v1/games/:id/menu/configure   Configurar menú/precios
POST   /api/v1/games/:id/day/start        Iniciar simulación del día
GET    /api/v1/games/:id/day/results      Resultados del día

UPGRADES
────────
GET    /api/v1/games/:id/upgrades         Mejoras disponibles
POST   /api/v1/games/:id/upgrades/buy     Comprar mejora

WORLD DATA (estático, cacheable)
──────────────────────────────
GET    /api/v1/worlds/:type/products      Catálogo de productos
GET    /api/v1/worlds/:type/locations     Ubicaciones disponibles
GET    /api/v1/worlds/:type/events        Eventos posibles
```

### WebSocket Events

```
CLIENT → SERVER
───────────────
{ type: "start_day" }
{ type: "speed_change", speed: 2 }  // x1, x2, x5

SERVER → CLIENT
───────────────
{ type: "day_started", weather: "sunny", events: [...] }
{ type: "customer_arrived", customer: {...} }
{ type: "sale", product: "churchill", price: 900, dialogue: "¡Tuanis!" }
{ type: "customer_left", reason: "queue_too_long", dialogue: "..." }
{ type: "hour_complete", hour: 12, stats: {...} }
{ type: "day_complete", summary: {...} }
```

## 6.6 Diseño "Multiplayer-Ready"

Aunque el MVP es single-player, el diseño permite multiplayer asíncrono futuro:

```
PRINCIPIOS
──────────

1. Todo estado vive en servidor
   → Cliente es "dumb", solo renderiza
   → No se puede hackear cambiando client

2. Acciones son eventos inmutables
   → INSERT, nunca UPDATE destructivo
   → Permite replay, sync, audit

3. World_id es clave foránea de todo
   → Hoy: 1 player = 1 world
   → Futuro: N players = 1 world

4. Timestamps en todo
   → Permite ordenar acciones de múltiples jugadores
   → Resuelve conflictos por tiempo

MIGRACIÓN FUTURA
────────────────
-- Agregar soporte multi-jugador
ALTER TABLE game_sessions ADD COLUMN is_shared BOOLEAN DEFAULT false;
ALTER TABLE game_sessions ADD COLUMN max_players INT DEFAULT 1;

CREATE TABLE session_players (
    session_id UUID REFERENCES game_sessions(id),
    player_id UUID REFERENCES players(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    role VARCHAR(20) DEFAULT 'player',
    PRIMARY KEY (session_id, player_id)
);
```

---

# 7. MVP SCOPE

## 7.1 Definición de MVP

> **MVP = La versión más pequeña que demuestra que el juego es DIVERTIDO**

No es sobre features, es sobre validar el core loop.

## 7.2 Features del MVP ✅

### Gameplay Core
- [ ] Crear nueva partida (mundo Costa Rica)
- [ ] Ver estado actual (dinero, reputación, día)
- [ ] Comprar ingredientes en mercado
- [ ] Elegir ubicación (3 ubicaciones iniciales)
- [ ] Configurar menú (4 productos iniciales)
- [ ] Ajustar precios
- [ ] Iniciar simulación del día
- [ ] Ver simulación con clientes (visual básico)
- [ ] Ver resultados del día
- [ ] Avanzar al siguiente día

### Sistemas
- [ ] Sistema económico básico (comprar, vender, ganancia)
- [ ] Sistema de clientes (spawn, decisión compra, satisfacción)
- [ ] Sistema de clima (3 tipos: sol, nublado, lluvia)
- [ ] Sistema de reputación (sube/baja según servicio)

### IA (mínima)
- [ ] Diálogos de clientes generados (con fallback a pool)
- [ ] Cache básico de respuestas

### UI/UX
- [ ] Pantalla de menú principal
- [ ] Pantalla de mapa (selección ubicación)
- [ ] Pantalla de mercado
- [ ] Pantalla de preparación (menú/precios)
- [ ] Pantalla de simulación
- [ ] Pantalla de resultados
- [ ] Responsive (funciona en desktop y mobile web)

### Técnico
- [ ] Autenticación básica (email/password o magic link)
- [ ] Guardar/cargar partida
- [ ] Deploy funcional en web

## 7.3 Explícitamente EXCLUIDO del MVP ❌

| Feature | Razón de exclusión |
|---------|-------------------|
| Múltiples mundos | Costa Rica primero, otros después |
| Multiplayer | Validar single-player primero |
| Competidores IA | Complejidad, no esencial para loop |
| Eventos especiales | Complejidad, no esencial para loop |
| Sistema de empleados | Progresión avanzada |
| Múltiples trucks | Progresión avanzada |
| Upgrades complejos | Solo 2-3 upgrades básicos en MVP |
| Monetización | Gratis total en MVP |
| Leaderboards | Requiere usuarios |
| Sonido/Música | Nice to have, no esencial |
| Tutorial guiado | Tooltips básicos suficientes |
| Logros/Achievements | Post-MVP |

## 7.4 Criterio de "Done" para MVP

```
EL MVP ESTÁ COMPLETO CUANDO:
────────────────────────────

□ Un jugador nuevo puede:
  □ Crear cuenta en < 1 minuto
  □ Empezar a jugar en < 30 segundos
  □ Entender qué hacer sin tutorial extenso
  □ Completar 5 días de juego sin bugs bloqueantes
  □ Sentir que sus decisiones importan
  □ Querer jugar "un día más"

□ Técnicamente:
  □ Carga en < 3 segundos
  □ No hay errores de consola críticos
  □ Funciona en Chrome, Firefox, Safari
  □ Funciona en móvil (responsive)
  □ Los datos persisten entre sesiones

□ El equipo puede decir honestamente:
  □ "Es divertido, aunque sea básico"
  □ "Quiero seguir jugando"
```

---

# 8. ROADMAP

## 8.1 Visión de Fases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ROADMAP CALLEVIVA                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FASE 1          FASE 2          FASE 3          FASE 4                │
│  MVP             Polish          Expansión       Social                 │
│  ══════          ══════          ═════════       ══════                 │
│                                                                         │
│  • Core loop     • Más productos • Mundo México  • Multiplayer         │
│  • 1 mundo       • Competidores  • Mundo Colombia• Leaderboards        │
│  • IA básica     • Eventos       • Más upgrades  • AloCoins            │
│  • Web deploy    • Sonido/música • Empleados     • Torneos             │
│  • Single-player • Tutorial      • Logros        • Compartir           │
│                  • Bug fixes     • Balance       • API pública         │
│                                                                         │
│  Duración:       Duración:       Duración:       Duración:             │
│  2-3 meses       1-2 meses       2-3 meses       2-3 meses             │
│                                                                         │
│  Milestone:      Milestone:      Milestone:      Milestone:            │
│  "Es divertido"  "Está pulido"   "Hay variedad"  "Hay comunidad"       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Fase 1: MVP (2-3 meses)

### Mes 1: Fundamentos
- Semana 1-2: Setup proyecto, arquitectura, DB
- Semana 3-4: Core gameplay (comprar, ubicar, vender)

### Mes 2: Integración
- Semana 1-2: Sistema de clientes y simulación
- Semana 3-4: Integración IA básica, UI completa

### Mes 3: Polish MVP
- Semana 1-2: Testing, bugs, balance
- Semana 3-4: Deploy, soft launch

### Entregable:
- Juego funcional en calleviva.club
- 10-20 usuarios de prueba
- Feedback inicial

## 8.3 Fase 2: Polish (1-2 meses)

- Competidores IA (básicos)
- Eventos especiales (3-5 tipos)
- Más productos (8-10 total)
- Sistema de sonido
- Tutorial interactivo
- Bug fixes basados en feedback
- Optimización de performance

### Entregable:
- Juego "completo" para single-player
- Ready para marketing

## 8.4 Fase 3: Expansión (2-3 meses)

- Mundo México
- Mundo Colombia
- Sistema de empleados
- Múltiples trucks
- Árbol de upgrades completo
- Sistema de logros
- Balance avanzado

### Entregable:
- 3 mundos jugables
- Progresión profunda
- 50+ horas de contenido

## 8.5 Fase 4: Social (2-3 meses)

- Multiplayer asíncrono
- Leaderboards por mundo
- Sistema de torneos semanales
- Integración AloCoins (si procede)
- API para integraciones
- Herramientas de comunidad

### Entregable:
- Plataforma social completa
- Modelo de negocio activo

---

# 9. MONETIZACIÓN

## 9.1 Estrategia por Fases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ESTRATEGIA DE MONETIZACIÓN                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  FASE 1 (MVP):     GRATIS TOTAL                                        │
│  ─────────────     ─────────────                                        │
│                                                                         │
│  Objetivo: Validar diversión, no monetizar                             │
│  Ingreso: $0                                                           │
│  Costo absorbido: ~$50-100/mes (hosting + API)                        │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  FASE 2-3:         FREEMIUM SUAVE                                      │
│  ─────────         ──────────────                                       │
│                                                                         │
│  Gratis:                                                               │
│  • Mundo Costa Rica completo                                           │
│  • Toda la jugabilidad core                                            │
│  • Sin límites de tiempo o energía                                     │
│                                                                         │
│  Premium ($3-5 cada uno):                                              │
│  • Mundos adicionales (México, Colombia)                               │
│  • Pack de cosméticos (skins de truck)                                 │
│  • "Supporter Badge" (cosmético)                                       │
│                                                                         │
│  ═══════════════════════════════════════════════════════════════════   │
│                                                                         │
│  FASE 4:           OPCIONAL ALOCOINS                                   │
│  ───────           ─────────────────                                    │
│                                                                         │
│  Si hay masa crítica de usuarios:                                      │
│  • Logros otorgan AloCoins reales                                     │
│  • Conexión con ecosistema Dropio                                      │
│  • Solo para usuarios 18+ (verificación)                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 9.2 Principios de Monetización

```
LO QUE NUNCA HAREMOS:
─────────────────────
❌ Pay-to-win (ventajas jugables por dinero)
❌ Energía/vidas limitadas
❌ Timers molestos ("espera 4 horas o paga")
❌ Loot boxes o gambling
❌ Anuncios intrusivos
❌ Presión de compra a menores

LO QUE SÍ HAREMOS:
──────────────────
✅ Contenido adicional de valor (mundos)
✅ Cosméticos opcionales
✅ Soporte voluntario ("tip jar")
✅ Transparencia total en qué es gratis vs pago
```

## 9.3 Proyección Económica (Estimada)

| Fase | Usuarios | Conversión | Ingreso/mes |
|------|----------|------------|-------------|
| MVP | 100-500 | 0% | $0 |
| Polish | 500-2,000 | 2% | $100-400 |
| Expansión | 2,000-10,000 | 3% | $500-2,500 |
| Social | 10,000+ | 5% | $5,000+ |

*Nota: Estimaciones conservadoras para planificación*

---

# 10. ANEXOS

## 10.1 Glosario

| Término | Definición |
|---------|------------|
| **Core Loop** | Ciclo principal de juego (planificar → ejecutar → resultado) |
| **MVP** | Minimum Viable Product - versión mínima funcional |
| **NPC** | Non-Player Character - personajes controlados por el juego |
| **Spawn** | Aparición de clientes/eventos en el juego |
| **Tick** | Unidad de tiempo de simulación |
| **Upgrade** | Mejora comprable para el negocio |
| **World** | Escenario regional (Costa Rica, México, etc.) |

## 10.2 Referencias e Inspiraciones

| Juego | Qué tomamos |
|-------|-------------|
| Game Dev Tycoon | Loop por fases, feedback claro |
| Stardew Valley | Tono cálido, accesibilidad |
| Kairosoft games | Simplicidad, mobile-friendly |
| Two Point Hospital | Humor, personalidad |
| Clash Royale | Progresión, competencia amigable |

## 10.3 Preguntas Abiertas

1. ¿Nombre final del protagonista/negocio inicial?
2. ¿Mascota o personaje guía?
3. ¿Historia/narrativa de fondo?
4. ¿Integración con redes sociales?
5. ¿Versión nativa mobile eventual?

## 10.4 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 0.1 | - | Concepto inicial |
| 0.2 | 2024 | Diseño completo, decisiones finales |

---

# FIN DEL DOCUMENTO

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         ¡LA CALLE ESTÁ VIVA!                           │
│                                                                         │
│                           CalleViva.club                                │
│                              GDD v0.2                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```
