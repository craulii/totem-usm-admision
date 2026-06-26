# Tótem Interactivo — Admisión USM Santiago

> Aplicación kiosk de pantalla táctil para el stand de admisión de la **Universidad Técnica Federico Santa María (USM) — Sede Santiago**. Los estudiantes se acercan, seleccionan un minijuego y juegan mientras esperan ser atendidos.

---

## Estado del Proyecto

| Componente | Estado |
|-----------|--------|
| Menú principal | ✅ Implementado |
| Juego 2048 USM | ✅ Implementado |
| Pantalla Attract (idle) | ⏳ Pendiente Fase 2 |
| Buscar a Wally | ⏳ Pendiente Fase 3 |
| Tercer juego | ⏳ Pendiente Fase 4 |
| Assets / branding USM | ⏳ Pendiente entrega USM |

---

## Requisitos

- Node.js >= 18
- npm >= 9
- Sistema operativo: Windows, macOS o Linux (incluyendo WSL2)

> **IMPORTANTE**: Esta app usa Electron, que **no corre en Android**. Si el hardware final es una pantalla Android, ver [`ANDROID.md`](ANDROID.md) para opciones de despliegue.

---

## Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/totem-usm-admision.git
cd totem-usm-admision

# 2. Instalar dependencias
npm install

# 3. Iniciar en modo desarrollo (abre Electron + Vite hot-reload)
npm start
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Vite + Electron en modo desarrollo |
| `npm run dev` | Solo Vite (sin Electron) — útil para debug en navegador |
| `npm run build` | Genera build de producción en `dist/` |
| `npm run electron` | Solo Electron — requiere que Vite ya esté corriendo |

---

## Estructura del proyecto

```
totem-app/
├── main.js             ← Proceso principal Electron (ventana, kiosk mode)
├── preload.js          ← Preload script Electron
├── vite.config.js      ← Configuración Vite (puerto 5173)
├── index.html          ← Entry point HTML
├── package.json
└── src/
    ├── App.jsx         ← Router principal (maneja pantalla activa)
    ├── main.jsx        ← ReactDOM entry point
    ├── screens/
    │   ├── Menu.jsx    ← Menú con selección de juegos
    │   └── Attract.jsx ← Pantalla de atracción (idle) — pendiente de conectar
    ├── components/     ← Componentes reutilizables (en construcción)
    └── games/
        └── game2048/
            └── Game2048.jsx  ← Juego activo: 2048 variante potencias de 3
```

---

## Cómo funciona

1. La app abre una ventana **1080×1920** (portrait) — tamaño estándar de tótem
2. El menú muestra **3 cards de juegos** (1 activo, 2 próximamente)
3. Al seleccionar **2048 USM**, el juego comienza con **120 segundos**
4. El objetivo es combinar fichas hasta llegar a **2187 (3⁷)**
5. Al terminar, se muestra el puntaje y un overlay de resultado
6. (Futuro) Volver al menú → pantalla Attract en idle

---

## Modo Kiosk (producción)

En `main.js`, cambiar:

```javascript
fullscreen: false,  // → true
kiosk: false,       // → true
```

Esto bloquea la ventana en pantalla completa sin barra de tareas ni acceso al sistema.

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [`PLAN.md`](PLAN.md) | Fases de desarrollo y roadmap |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitectura técnica con diagramas |
| [`GAMEFLOW.md`](GAMEFLOW.md) | Flujo de navegación y estados |
| [`GAME_DESIGN.md`](GAME_DESIGN.md) | Diseño de mecánicas de cada juego |
| [`ANDROID.md`](ANDROID.md) | Opciones para hardware Android |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Guía de build y despliegue |
| [`ROADMAP.md`](ROADMAP.md) | Versiones planificadas |
| [`TODO.md`](TODO.md) | Pendientes detallados |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios |

---

## Tecnologías

- **Electron 33** — wrapper desktop
- **React 18** — UI
- **Vite 5** — bundler y dev server
- **JavaScript (JSX)** — sin TypeScript por ahora
- **Estilos inline** — sin CSS framework externo

---

## Licencia

MIT — ver [`LICENSE`](LICENSE)
