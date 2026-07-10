# Tótem Interactivo — Admisión USM Santiago

> Aplicación kiosk de pantalla táctil para el stand de admisión de la **Universidad Técnica Federico Santa María (USM) — Sede Santiago**. Los estudiantes se acercan, se registran (o se pre-inscriben por QR), juegan un minijuego mientras esperan ser atendidos, y su puntaje queda guardado.

> **Dirección actual (2026-07-09):** el proyecto se expandió con registro de datos, backend en la nube (Supabase), flujo de QR y panel de administración. Ver [`ROADMAP.md`](ROADMAP.md) (Fase 0–8) y los issues de GitHub.

---

## Estado del Proyecto

| Componente | Estado |
|-----------|--------|
| Menú principal | ✅ Implementado |
| Juego 2048 USM | ✅ Implementado |
| Leaderboard local | ✅ Implementado |
| Formulario de registro (comuna→colegio→curso) | ⏳ Fase 1 |
| Backend Supabase + dedup + Excel offline | ⏳ Fase 2 |
| QR + pre-inscripción + ficha de juego | ⏳ Fase 3 |
| Panel de administración | ⏳ Fase 4 |
| Juego Memorice | ⏳ Fase 5 |
| Juego Prime Ninja | ⏳ Fase 6 |
| Migración a Capacitor (APK Android) | ⏳ Fase 7 |
| Attract / idle / kiosk hardening | ⏳ Fase 8 |
| Assets / branding USM | ⏳ Pendiente entrega USM |

---

## Requisitos

- Node.js >= 18
- npm >= 9
- Sistema operativo: Windows, macOS o Linux (incluyendo WSL2)

> **Nota de runtime:** el desarrollo usa **Electron** (`npm start`). Para producción se migra a **Capacitor** (APK Android nativo), ya que la pantalla final es Android 42". Ver [`ANDROID.md`](ANDROID.md).

---

## Instalación rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/craulii/totem-usm-admision.git
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
| `npm run dev` | Solo Vite (sin Electron) — útil para debug en navegador y build web |
| `npm run build` | Genera build de producción en `dist/` |
| `npm run electron` | Solo Electron — requiere que Vite ya esté corriendo |

---

## Estructura del proyecto

```
totem-app/
├── main.js             ← Electron (dev; se deprecará al migrar a Capacitor)
├── preload.js          ← Preload Electron
├── vite.config.js      ← Configuración Vite (puerto 5173)
├── index.html          ← Entry point HTML
├── package.json
└── src/
    ├── App.jsx         ← Router principal (maneja pantalla activa)
    ├── main.jsx        ← ReactDOM entry point
    ├── config.js       ← Config (duración de juego, flags) — Fase 0
    ├── lib/
    │   └── db.js       ← Cliente Supabase + dedup + cola offline + export — Fase 2
    ├── screens/
    │   ├── Menu.jsx    ← Menú con selección de juegos + QR + reloj
    │   ├── Register.jsx← Formulario de registro (comuna→colegio→curso) — Fase 1
    │   └── Attract.jsx ← Pantalla de atracción (idle) — pendiente de conectar
    ├── components/
    │   ├── Leaderboard.jsx  ← Ranking arcade (localStorage)
    │   └── EndGameButton.jsx← Botón "Terminar juego" compartido — Fase 0
    └── games/
        ├── game2048/   ← 2048 variante potencias de 3 (activo)
        ├── memorice/   ← Memorice — Fase 5
        └── primeNinja/ ← Prime Ninja — Fase 6
```

---

## Cómo funciona

1. La app abre una ventana **1080×1920** (portrait) — tamaño estándar de tótem
2. El menú muestra los juegos y un **QR arriba** que lleva al registro en el celular
3. Antes de jugar, el estudiante **se registra** (comuna → colegio → curso + nombre, RUT, correo, teléfono) o presenta su ficha del pre-registro por QR
4. Juega el minijuego elegido (2048, Memorice o Prime Ninja); puede tocar **"Terminar juego"** para volver al menú
5. Al terminar, se guarda el puntaje (online → Supabase; offline → local + Excel)
6. (Fase 8) En idle, la pantalla vuelve a Attract

---

## Modo Kiosk (producción)

En desarrollo (Electron), en `main.js` cambiar `fullscreen: false` → `true` y `kiosk: false` → `true`. En producción el kiosk se maneja vía Capacitor / COSU en Android — ver [`DEPLOYMENT.md`](DEPLOYMENT.md) y [`ANDROID.md`](ANDROID.md).

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [`ROADMAP.md`](ROADMAP.md) | Roadmap v2 por fases (Fase 0–8) — **fuente principal** |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitectura técnica con diagramas |
| [`GAMEFLOW.md`](GAMEFLOW.md) | Flujo de navegación y estados |
| [`GAME_DESIGN.md`](GAME_DESIGN.md) | Diseño de mecánicas de cada juego |
| [`DATABASE.md`](DATABASE.md) | Supabase, dedup, offline y Excel |
| [`API.md`](API.md) | Cliente Supabase e integración |
| [`ANDROID.md`](ANDROID.md) | Runtime de producción (Capacitor) |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Guía de build y despliegue |
| [`TODO.md`](TODO.md) | Pendientes (ver también los issues) |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Cómo contribuir |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial de cambios |

---

## Tecnologías

- **React 18** — UI
- **Vite 5** — bundler y dev server
- **Electron 33** — entorno de desarrollo (→ Capacitor en producción)
- **Supabase** — backend (Postgres + REST + Auth)
- **JavaScript (JSX)** — sin TypeScript por ahora
- **Estilos inline** — sin CSS framework externo

---

## Licencia

MIT — ver [`LICENSE`](LICENSE)
