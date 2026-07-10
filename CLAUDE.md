# Contexto para Claude — Tótem Interactivo USM

Aplicación kiosk React para el stand de admisión de la USM Santiago. Los estudiantes se acercan a una pantalla táctil, se registran y juegan minijuegos mientras esperan ser atendidos. Los datos de registro se envían a una base de datos y sus puntajes se guardan.

> **Dirección del proyecto (post-reunión cliente, 2026-07-09):** ver `ROADMAP.md` (Fase 0–8) y los issues de GitHub. Este archivo refleja esas decisiones.

## Stack real (NO inventar dependencias que no existen)

- **React 18 + Vite 5** — SPA, estilos inline (sin CSS framework)
- **JavaScript (JSX)** — sin TypeScript
- **Electron 33** — entorno de desarrollo actual (`npm start`). **Se migra a Capacitor** (APK Android nativo) para producción — ver `ANDROID.md`. No asumir que Electron es el runtime final.
- **Supabase** (Postgres + REST + Auth) — backend para registro, puntajes, config y panel admin. Cliente en `src/lib/db.js` (Fase 2). Offline: cache local + export CSV/Excel + dedup por RUT.

> El supuesto viejo de "sin backend / 100% offline" **ya no aplica**: ahora hay backend en la nube con fallback offline.

## Estado de archivos — IMPORTANTE

Stubs que siguen **vacíos intencionalmente** (placeholders para Fase 8 / UX). **NO implementarlos sin instrucción explícita**:

- `src/screens/Instructions.jsx` — instrucciones previas al juego
- `src/screens/Result.jsx` — pantalla de resultado (hoy la cubre el leaderboard)
- `src/components/Timer.jsx` — timer compartido
- `src/components/IdleReset.jsx` — idle timeout → Attract

**Cambios de estructura ya decididos:**
- `src/games/wally/WallyGame.jsx` — **eliminar** (el cliente descartó Buscar a Wally). Autorizado.
- `src/games/game3/Game3.jsx` — **superado** por los dos juegos nombrados: Memorice (`src/games/memorice/`) y Prime Ninja (`src/games/primeNinja/`). Se puede eliminar al implementarlos.
- `src/screens/Attract.jsx` — implementado pero no conectado aún (Fase 8).

## Archivo con código muerto real

- `src/components/GameCard.jsx` — API distinta a la usada en `Menu.jsx`. Unificar o eliminar cuando se toque el menú. Por ahora dejarlo.

## Hardware

Pantalla final **Android 42" portrait**. **Decisión tomada: Capacitor** (APK nativo) — ver `ANDROID.md`. Electron queda como entorno de desarrollo hasta la migración (Fase 7).

## Datos y privacidad

Ahora **sí** se capturan datos personales (nombre, RUT, correo, teléfono, comuna, colegio, curso). Aplica la Ley 19.628 de protección de datos: aviso de privacidad visible, dedup por RUT, y no duplicar alumnos. Ver `DATABASE.md` y `SECURITY.md`.

## Assets

Logo, imágenes y fuentes de USM están **pendientes de entrega por la universidad**. `public/` y `src/assets/` están vacíos intencionalmente. No crear placeholders genéricos.

## Reglas para Claude

### Al hacer cambios en código:
- Leer siempre el archivo completo antes de editar
- No eliminar stubs vacíos (salvo Wally/Game3, ya autorizados)
- No agregar dependencias sin preguntar
- Los inline styles son el patrón establecido — mantenerlos

### Al agregar juegos:
- Cada juego va en su propia carpeta: `src/games/nombreJuego/`
- El juego recibe `onGameEnd(score)` para ir al leaderboard y debe tener botón **"Terminar juego"** que vuelve al menú
- Timer leído desde `src/config.js` (duración configurable, default 60s)
- El router en `App.jsx` maneja la navegación

### Datos (Fase 1–3):
- El registro es **fuera del tótem**: el alumno escanea el QR del menú, llena el formulario en su celular y al enviar se genera un **ticket** válido para jugar
- Una persona junto al tótem revisa el ticket **manualmente** y lo deja jugar; el tótem **no** pide datos entre el menú y el juego
- Flujo de registro (en la web que abre el QR): **comuna → colegio → curso** + nombre, RUT, correo, teléfono
- Online → Supabase; offline → cola local + export CSV/Excel; siempre dedup por RUT

### Al preparar para producción:
- Migrar a Capacitor (Fase 7); en Electron dev, kiosk se activa con `fullscreen: true`, `kiosk: true` en `main.js`
- Ver `DEPLOYMENT.md` para el proceso completo

## Flujo de navegación objetivo

```
Registro (FUERA del tótem):
    QR del menú → formulario en el celular → ticket
              → una persona revisa el ticket y deja jugar

En el tótem:
Attract (Fase 8)
    ↓ [toca pantalla]
Menu  (QR arriba → registro web en el celular)
    ↓ [toca un juego]                     ← sin formulario de por medio
Juego (2048 / Memorice / Prime Ninja) — botón "Terminar juego" → Menu
    ↓ [fin de juego → onGameEnd(score)]
Leaderboard  (guarda puntaje; online → Supabase, offline → local)
    ↓
Menu
```

## Convenciones de código

- Estado de pantalla: string literal (`'menu'`, `'game2048'`, `'memorice'`, `'primeNinja'`, `'leaderboard'`) — el registro es una página web aparte (la que abre el QR), no una pantalla del tótem
- Touch swipe: `onTouchStart` / `onTouchEnd` en el contenedor del juego
- Animaciones: CSS keyframes inyectadas como `<style>` dentro del JSX (patrón existente)
- Español para toda la UI visible al estudiante
- Inglés para nombres de variables, funciones y comentarios de código
