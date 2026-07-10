# Índice de Documentación — Tótem Interactivo USM

## Para empezar

| Documento | Descripción |
|-----------|-------------|
| [`README.md`](README.md) | Instalación, ejecución, estructura general |
| [`SESION.md`](SESION.md) | Template para iniciar una sesión de trabajo |

## Desarrollo

| Documento | Descripción |
|-----------|-------------|
| [`ROADMAP.md`](ROADMAP.md) | **Roadmap v2 por fases (Fase 0–8) — fuente principal del plan** |
| [`PLAN.md`](PLAN.md) | Resumen de estado y decisiones (defiere a ROADMAP) |
| [`TODO.md`](TODO.md) | Deuda técnica (el backlog por fase está en los issues) |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios por versión |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir al proyecto |

## Arquitectura y diseño

| Documento | Descripción |
|-----------|-------------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitectura técnica con diagramas Mermaid |
| [`GAMEFLOW.md`](GAMEFLOW.md) | Flujo de navegación y estados de juego |
| [`GAME_DESIGN.md`](GAME_DESIGN.md) | Diseño de mecánicas de cada juego |
| [`DATABASE.md`](DATABASE.md) | Supabase, dedup, offline y export Excel |
| [`API.md`](API.md) | Cliente Supabase e integración (IPC legacy) |

## Despliegue

| Documento | Descripción |
|-----------|-------------|
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Build y despliegue (APK Capacitor + webs) |
| [`ANDROID.md`](ANDROID.md) | Runtime de producción: Capacitor (decidido) |
| [`GITHUB.md`](GITHUB.md) | Instrucciones GitHub, CI/CD, badges |

## Estándares de comunidad

| Documento | Descripción |
|-----------|-------------|
| [`LICENSE`](LICENSE) | Licencia MIT |
| [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) | Código de conducta del proyecto |
| [`SECURITY.md`](SECURITY.md) | Cómo reportar vulnerabilidades |

## Contexto para IA

| Documento | Descripción |
|-----------|-------------|
| [`CLAUDE.md`](CLAUDE.md) | Contexto completo para Claude (y otras IAs) |

---

## Mapa mental del proyecto

```
totem-app
├── ¿Qué es?          → README.md
├── ¿Cómo funciona?   → ARCHITECTURE.md, GAMEFLOW.md
├── ¿Qué viene?       → PLAN.md, ROADMAP.md, TODO.md
├── ¿Cómo cambió?     → CHANGELOG.md
├── ¿Cómo contribuyo? → CONTRIBUTING.md
├── ¿Cómo se despliega? → DEPLOYMENT.md, ANDROID.md
└── ¿Qué juegos hay?  → GAME_DESIGN.md
```
