# Changelog — Tótem Interactivo USM

Todos los cambios notables se documentan aquí.
Formato: [Keep a Changelog](https://keepachangelog.com/es/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/lang/es/)

---

## [0.1.1] — 2026-06-26

### Fixed
- **[CRÍTICO]** Import case-sensitive en `App.jsx`: `'./games/game2048/game2048'` → `'./games/game2048/Game2048'`. El juego no cargaba en Linux/WSL porque el filesystem es case-sensitive.
- `ScorePop` component: propiedad `transform` duplicada en el objeto de estilos. La primera instancia era ignorada por JavaScript (claves duplicadas en objeto literal). Eliminada la redundante.
- Subtitle del card "2048 USM" en `Menu.jsx`: decía "Combina los números y llega al 2048" cuando el objetivo real es **2187** (3⁷).

### Added
- `touchAction: 'none'` en el board div de `Game2048.jsx` para prevenir scroll accidental durante swipe en pantallas touch.
- Soporte touch en `GameCard` de `Menu.jsx`: agregados `onTouchStart` / `onTouchEnd` para que las cards respondan en pantallas Android sin mouse.
- Toast "🚧 Próximamente — ¡Muy pronto!" en `App.jsx`: al tocar cards de juegos no disponibles (Wally, Próximamente), se muestra un toast de 2 segundos en vez de silencio total.

### Documentation
- `README.md` — guía completa de instalación y uso
- `ARCHITECTURE.md` — arquitectura con diagramas Mermaid
- `PLAN.md` — fases de desarrollo con estado actual
- `CLAUDE.md` — contexto para IA y reglas de desarrollo
- `SESION.md` — template de sesión de trabajo
- `GAMEFLOW.md` — flujo de navegación y estados
- `GAME_DESIGN.md` — diseño de mecánicas de juegos
- `DATABASE.md` — decisiones de persistencia
- `API.md` — IPC Electron (estado actual mínimo)
- `ROADMAP.md` — versiones planificadas
- `ANDROID.md` — opciones de hardware Android
- `DEPLOYMENT.md` — guía de build y despliegue
- `TODO.md` — pendientes detallados
- `CONTRIBUTING.md` — guía de contribución
- `GITHUB.md` — instrucciones para GitHub
- `DOCUMENTATION.md` — índice de documentación
- `CHANGELOG.md` — este archivo

### Chore
- `.gitignore` creado para Electron + Vite + React + Node
- `LICENSE` MIT agregado
- `CODE_OF_CONDUCT.md`, `SECURITY.md`
- `.github/ISSUE_TEMPLATE/` con plantillas para bugs y features
- `.github/PULL_REQUEST_TEMPLATE.md`

---

## [0.1.0] — 2026-06-21

### Added
- Estructura base: Electron 33 + React 18 + Vite 5
- Ventana 1080×1920 portrait (modo no-kiosk para desarrollo)
- Menú principal con 3 cards de juegos animadas
- Reloj en tiempo real con localización es-CL
- Juego 2048 USM (variante potencias de 3, objetivo 2187)
  - Grid 4×4
  - Mecánicas de slide y merge correctas
  - Timer SVG ring de 120 segundos
  - Estados: playing, won, lost, timeup
  - Touch swipe con threshold 25px
  - Popups de puntaje flotantes
  - Tiles con gradientes por valor (azul → dorado en 2187)
- Pantalla Attract (implementada, pendiente conectar al flujo)
- Placeholders estructurales: Instructions, Result, Timer, IdleReset, WallyGame, Game3
