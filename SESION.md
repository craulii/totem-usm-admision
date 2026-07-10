# Template de Sesión de Trabajo — Tótem USM

Usar este archivo al iniciar cada sesión de desarrollo con Claude o cualquier desarrollador nuevo.

---

## Antes de empezar, responder estas preguntas

### 1. ¿En qué fase estamos? (roadmap v2 — ver `ROADMAP.md` / issues)

- [ ] Fase 0 — Limpieza y botones base
- [ ] Fase 1 — Registro en el tótem
- [ ] Fase 2 — Supabase + pipeline (online/offline, dedup, Excel)
- [ ] Fase 3 — QR + ficha de juego
- [ ] Fase 4 — Panel de administración
- [ ] Fase 5 — Memorice
- [ ] Fase 6 — Prime Ninja
- [ ] Fase 7 — Capacitor (APK Android)
- [ ] Fase 8 — Producción / kiosk / deploy

### 2. ¿Llegaron assets de USM? ¿La BDD real del cliente?

- [ ] No, siguen pendientes (se usa esquema mock en Supabase)
- [ ] Sí — ¿qué llegó? _______________________

### 3. Hardware / runtime

- [x] Decidido: **Capacitor** (APK Android). Migración en Fase 7.

### 4. ¿Hubo cambios en los juegos o el diseño?

- [ ] No
- [ ] Sí — describir: ________________________________

### 5. ¿Se probó en el hardware físico?

- [ ] No se tiene acceso al tótem todavía
- [ ] Sí — ¿qué se encontró? ________________________

---

## Contexto para una IA nueva (copiar y pegar)

```
Proyecto: Tótem Interactivo USM Santiago
Stack: React 18 + Vite 5 + JavaScript (JSX). Runtime: Electron (dev) → Capacitor (prod). Backend: Supabase.
Carpeta de trabajo: totem-app/

Estado actual:
- Juego 2048 USM: IMPLEMENTADO y funcional
- Juegos nuevos: Memorice (Fase 5), Prime Ninja (Fase 6). Wally: ELIMINADO.
- Registro de datos + Supabase + QR + admin: por implementar (Fase 1–4)
- Assets USM y BDD real del cliente: pendientes (mock en Supabase mientras tanto)
- Hardware: Android 42" → Capacitor (decidido)

Archivos clave:
- src/App.jsx — router principal
- src/screens/Menu.jsx — menú + QR + reloj
- src/screens/Register.jsx — registro (Fase 1)
- src/lib/db.js — Supabase + offline (Fase 2)
- src/games/game2048/Game2048.jsx — juego activo

Lee ROADMAP.md para las fases y CLAUDE.md para las reglas específicas.
```

---

## Checklist de fin de sesión

- [ ] El juego 2048 sigue funcionando (probar)
- [ ] `npm start` abre sin errores
- [ ] Los cambios están commiteados con Conventional Commits
- [ ] Actualizar PLAN.md si se completó algo
- [ ] Actualizar CHANGELOG.md con los cambios del día
- [ ] Actualizar TODO.md si surgieron nuevas tareas
