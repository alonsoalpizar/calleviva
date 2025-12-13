# 🚚 CalleViva.club

> ¡La calle está viva!

Un juego web tipo Tycoon donde gestionás tu negocio de Food Trucks en una ciudad que cobra vida gracias a IA.

![CalleViva Banner](docs/banner.png)

## 🎮 ¿De qué se trata?

Empezás con un pequeño carrito de comida y un sueño. Tu misión: convertirte en la leyenda de la calle.

- 🌧️ **El clima cambia todo** — Sol, lluvia, tormentas... cada día es diferente
- 👥 **Clientes con personalidad** — Cada cliente tiene sus gustos y humor
- 🎪 **Eventos sorpresa** — Festivales, conciertos, feriados
- 🤖 **Competencia inteligente** — Otros trucks que piensan y se adaptan
- 📈 **Crecé a tu ritmo** — De carrito a cadena de restaurantes

## 🛠️ Tech Stack

| Componente | Tecnología |
|------------|------------|
| Frontend | React 18 + TypeScript + PixiJS + Vite |
| Backend | Go 1.22 + Chi |
| Base de datos | PostgreSQL 16 |
| Cache | Redis 7 |
| IA | Claude API (Anthropic) |
| Deploy | Ubuntu + nginx + systemd |

## 🚀 Quick Start

```bash
# Clonar repo
git clone https://github.com/alonsoalpizar/calleviva.git
cd calleviva

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Setup inicial
make setup
make setup-db

# Desarrollo
make dev
```

## 📁 Estructura

```
calleviva/
├── frontend/          # React + PixiJS
├── backend/           # Go API
├── database/          # SQL migrations
├── config/            # nginx, systemd
├── docs/              # Documentación
└── scripts/           # Utilidades
```

## 📖 Documentación

- [CLAUDE.md](CLAUDE.md) — Guía completa del proyecto
- [docs/GDD.md](docs/GDD.md) — Game Design Document
- [docs/API.md](docs/API.md) — API Reference

## 🎨 Screenshots

*Coming soon...*

## 🇨🇷 Hecho con amor en Costa Rica

✨ Inspirado por Nacho ✨

## 📄 Licencia

MIT © Alonso Alpízar
