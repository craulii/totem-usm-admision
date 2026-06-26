# Contexto para Claude — Tótem Interactivo USM

Aplicación kiosk React + Electron para el stand de admisión de la USM Santiago. Los estudiantes se acercan a una pantalla táctil y juegan minijuegos mientras esperan ser atendidos.

## Stack real (NO inventar dependencias que no existen)

- **Electron 33** — proceso principal, ventana 1080×1920 portrait
- **React 18 + Vite 5** — SPA, estilos inline (sin CSS framework)
- **JavaScript (JSX)** — sin TypeScript
- **Sin backend**, sin base de datos, sin API REST

## Estado de archivos — IMPORTANTE

Los siguientes archivos están **vacíos intencionalmente** (placeholders para fases futuras). **NO eliminarlos, NO implementarlos sin instrucción explícita**:

- `src/screens/Instructions.jsx` — Fase 2
- `src/screens/Result.jsx` — Fase 2
- `src/components/Timer.jsx` — Fase 3
- `src/components/IdleReset.jsx` — Fase 2
- `src/games/game3/Game3.jsx` — Fase 4
- `src/games/wally/WallyGame.jsx` — Fase 3

El único archivo con código que **no está conectado** es `src/screens/Attract.jsx` — está implementado pero no se usa aún (Fase 2).

## Archivo con código muerto real

- `src/components/GameCard.jsx` — tiene una API diferente a la usada en `Menu.jsx`. En Fase 2, se refactorizará para unificar. Por ahora dejarlo.

## Hardware

La pantalla final es **Android 42" portrait**. Electron no corre en Android. Hay tres opciones documentadas en `ANDROID.md`. Esta decisión está pendiente. **No asumir que el stack actual es el final para producción.**

## Assets

Logo, imágenes y fuentes de USM están **pendientes de entrega por la universidad**. `public/` y `src/assets/` están vacíos intencionalmente. No crear placeholders genéricos.

## Reglas para Claude

### Al hacer cambios en código:
- Leer siempre el archivo completo antes de editar
- No eliminar stubs vacíos
- No agregar dependencias sin preguntar
- Los inline styles son el patrón establecido — mantenerlos

### Al agregar juegos:
- Cada juego va en su propia carpeta: `src/games/nombreJuego/`
- El juego recibe una prop `onBack` para volver al menú
- El router en `App.jsx` maneja la navegación

### Al implementar Fase 2 (cuando se indique):
- Conectar Attract: `App.jsx` debe mostrar Attract en estado inicial, pasar al menú al tocar
- Idle timeout: `IntersectionObserver` o `setTimeout` de 30s sin interacción → volver a Attract
- Persistencia: usar `localStorage` (no electron-store por ahora)

### Al preparar para producción:
- Cambiar en `main.js`: `fullscreen: true`, `kiosk: true`
- Ver `DEPLOYMENT.md` para el proceso completo

## Flujo de navegación actual

```
Attract (no conectada aún)
    ↓ [toca pantalla]
Menu
    ↓ [toca card 2048]
Game2048
    ↓ [fin de juego → countdown 3s → onGameEnd(score)]
Leaderboard
    ↓ [GUARDAR o SALTAR]
Menu  (o vuelve a Game2048 con JUGAR DE NUEVO)
```

## Convenciones de código

- Estado de pantalla: string literal (`'menu'`, `'game2048'`, etc.)
- Touch swipe: `onTouchStart` / `onTouchEnd` en el contenedor del juego
- Animaciones: CSS keyframes inyectadas como `<style>` dentro del JSX (patrón existente)
- Español para toda la UI visible al estudiante
- Inglés para nombres de variables, funciones y comentarios de código
