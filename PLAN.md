# Plan de Desarrollo — Tótem Interactivo USM

> **La fuente de verdad del plan es [`ROADMAP.md`](ROADMAP.md)** (Fase 0–8) y los issues de GitHub
> (label `roadmap`). Este archivo resume el estado y las decisiones. Reescrito tras la reunión con
> el cliente (2026-07-09).

## Objetivo

Aplicación kiosk para el stand de admisión USM Santiago. El estudiante se registra (o se
pre-inscribe por QR), juega un minijuego corto y su registro + puntaje quedan en la base de datos.
Corre sin supervisión varias horas.

---

## Estado actual

```
✅ Completado    ⏳ Pendiente    🔴 Bloqueado
```

### Completado
- [x] Estructura base Electron + Vite + React
- [x] Menú principal con cards animadas + reloj
- [x] Juego 2048 USM (variante potencias de 3)
- [x] Leaderboard arcade con top 10 en `localStorage`

### Decisiones tomadas (reunión 2026-07-09)
- Backend: **Supabase** · Runtime producción: **Capacitor** · Juegos: 2048 + **Memorice** + **Prime Ninja** (se quita **Wally**)

---

## Fases (resumen — detalle en `ROADMAP.md`)

| Fase | Título | Estado |
|------|--------|--------|
| 0 | Limpieza y botones base (quitar Wally, botón Terminar, reloj Santiago, duración configurable) | ⏳ |
| 1 | Formulario de registro (página del QR, comuna→colegio→curso) | ✅ base |
| 2 | Supabase + pipeline online/offline + dedup + Excel | ⏳ |
| 3 | QR + registro web alojado + ficha de juego | ⏳ |
| 4 | Panel de administración (link privado) | ⏳ |
| 5 | Juego Memorice | ⏳ |
| 6 | Juego Prime Ninja | ⏳ |
| 7 | Migración a Capacitor (APK Android) | ⏳ |
| 8 | Producción / kiosk / deploy | ⏳ |

---

## Decisiones abiertas / blockers

| Tema | Estado |
|------|--------|
| Tamaño de grilla del Memorice (10×10 es inviable para 30–60s) | Confirmar con cliente |
| BDD real del cliente | Pendiente entrega → se usa esquema mock en Supabase |
| Assets de branding USM | Pendiente entrega USM |
| Duración de partida (30 vs 60s) | Default 60s, ajustable desde admin |
