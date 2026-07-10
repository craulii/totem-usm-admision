# Roadmap — Tótem Interactivo USM (v2)

> Reescrito tras la reunión con el cliente (2026-07-09). Reemplaza el roadmap v1
> (MVP 2048 → Wally → tercer juego). El alcance ahora incluye registro de datos,
> backend en la nube, flujo de QR y panel de administración.

## Decisiones tomadas

| Tema | Decisión |
|------|----------|
| **Backend** | **Supabase** (Postgres + API + tabla editable gestionada). Sin backend propio. |
| **Runtime producción** | **Capacitor** (APK Android nativo). Se migra fuera de Electron. |
| **Juegos** | Mantener **2048** + agregar **Memorice** + **Prime Ninja**. Quitar **Buscar a Wally**. |
| **BDD del cliente** | Aún no entregada → se trabaja con **esquema mock** en Supabase. |

## Arquitectura

```
                     Supabase (Postgres + REST + Auth)
                     tablas: comunas, colegios, alumnos, partidas, config
                      ▲              ▲                 ▲
      (online)        │              │                 │
 ┌────────────────┐   │      ┌───────────────┐   ┌──────────────┐
 │ TÓTEM (APK      │───┘      │ Web registro  │   │ Panel admin  │
 │ Capacitor)      │          │ (celular vía  │   │ (link privado)│
 │ juegos + menú   │  QR ───► │  QR, alojada) │   │  hosted web   │
 │ + form local    │          └───────────────┘   └──────────────┘
 └────────────────┘
      └ offline: cache local + export CSV/Excel + dedup local
```

Un solo repo React con tres "targets" (APK del tótem, web de registro, web de admin),
todos hablando con Supabase. Se mantiene el patrón de **estilos inline + keyframes en `<style>`**.

---

## Fases

Cada fase = 1 milestone + 1 issue épico en GitHub.

### Fase 0 — Limpieza y botones base ⏳ *(sin bloqueos)*
Prepara el terreno; no depende de Supabase ni Capacitor.
- [ ] Quitar **Buscar a Wally** del menú y borrar `src/games/wally/WallyGame.jsx`
- [ ] Componente compartido **"Terminar juego"** (vuelve al menú) usado en todos los juegos
- [ ] Reloj forzado a **Santiago de Chile** (`timeZone: 'America/Santiago'`) en `Menu.jsx`
- [ ] **Duración de partida configurable** (default 60s) en `src/config.js`; reemplaza el 120s del 2048

### Fase 1 — Formulario de registro en el tótem ⏳
El estudiante ingresa sus datos **antes de cada juego** (aunque se repita).
- [ ] `src/screens/Register.jsx`: flujo **comuna → colegio → curso** + nombre, RUT, correo, teléfono
- [ ] Comuna y curso como selects; cursos fijos: 7°, 8°, I–IV medio, egresado, profesor
- [ ] **Colegio con texto predictivo** (filtro en vivo, sin librería); lista según comuna
- [ ] Validación de RUT (módulo 11), email y teléfono. Subconjunto de prueba: nombre, correo, teléfono
- [ ] Insertar `Register` en el router de `App.jsx` antes de cada juego

### Fase 2 — Supabase + pipeline online/offline + dedup + Excel ⏳
- [ ] Proyecto Supabase + esquema mock: `comunas`, `colegios`, `alumnos(rut UNIQUE)`, `partidas`, `config`
- [ ] **Dedup por constraint de BD** (rut UNIQUE, upsert `on conflict`)
- [ ] **Online:** insertar registro + partida (detección de conectividad real con ping a Supabase)
- [ ] **Offline:** cola local + export a Excel (CSV con BOM UTF-8; `.xlsx` solo si se necesita formato)
- [ ] Cliente Supabase en `src/lib/db.js` reutilizado por tótem, registro y admin

### Fase 3 — QR + registro web alojado + ficha de juego ⏳
- [ ] Web de registro (mismo `Register.jsx`) desplegada en host estático
- [ ] **QR grande, arriba en el menú** → URL del registro (PNG pre-generado)
- [ ] Flujo: QR → llenar en celular → **ficha de juego** (nombre + código) → encargado → jugar
- [ ] En el tótem, identificar por código al pre-registrado y **saltar** el tipeo

### Fase 4 — Panel de administración (link privado) ⏳
- [ ] Web de admin protegida (Supabase Auth o token secreto)
- [ ] Ver últimos logs y registros de usuarios/partidas
- [ ] Cambiar filtro de BD (ej. una sola comuna) y **configurar colegios** en el momento
- [ ] Cambiar duración del juego (30/60s) vía tabla `config`
- [ ] UX para gente no técnica (apoyarse en el Table Editor de Supabase para datos crudos)

### Fase 5 — Juego Memorice ⏳
- [ ] Memory match de pares; mockup con texto primero, luego imágenes/assets USM
- [ ] Priorizar diseño y animaciones (flip, match, mismatch)
- [ ] Botón "terminar juego", timer de `config`, score → leaderboard
- [ ] ⚠️ Confirmar tamaño de grilla (10×10 = 50 pares es inviable para 30–60s; proponer 4×4/6×6 default)

### Fase 6 — Juego Prime Ninja ⏳
- [ ] Números lanzados de abajo hacia arriba con trayectorias distintas
- [ ] Cortar primo = puntos; cortar no-primo = penalización; primo que cae sin cortarse = penalización
- [ ] Mecánica swipe-para-cortar, spawns, física de proyectil simple
- [ ] Botón "terminar juego", timer, score → leaderboard

### Fase 7 — Migración a Capacitor (APK Android) ⏳
- [ ] Agregar Capacitor, envolver la app React; deprecar `main.js`/`preload.js`
- [ ] Adaptar almacenamiento y export (localStorage + plugin Filesystem/Share)
- [ ] Config kiosk/COSU y orientación portrait; build APK; probar en el Android 42"

### Fase 8 — Producción / kiosk / deploy ⏳
- [ ] Integrar assets USM (bloqueado por entrega USM)
- [ ] Conectar **Attract + idle reset** (stubs existentes) — flujo UX completo
- [ ] Endurecer kiosk: auto-inicio, watchdog/restart, prevención de burn-in, soak test 4h+
- [ ] Deploy final en el stand

---

## Decisiones de diseño abiertas

- **Memorice 10×10:** casi seguro inviable para 30–60s / portrait. Proponer default menor + 10×10 opcional.
- **Duración 30 vs 60s:** default 60s, ajustable desde admin.
- **BDD real del cliente:** trabajar con esquema mock hasta que la entreguen.
- **Assets USM y ficha/QR final:** bloqueados por entrega USM; placeholders de texto mientras tanto.

---

## Milestones sugeridos para GitHub

| Milestone | Fase | Descripción |
|-----------|------|-------------|
| `Fase 0 — Limpieza y botones base` | 0 | Quitar Wally, botón terminar, reloj Santiago, duración configurable |
| `Fase 1 — Registro en el tótem` | 1 | Formulario comuna→colegio→curso + validación |
| `Fase 2 — Supabase + pipeline` | 2 | Backend, dedup, online/offline, Excel |
| `Fase 3 — QR + ficha de juego` | 3 | Registro web y pre-inscripción por QR |
| `Fase 4 — Panel de administración` | 4 | Admin por link privado, filtros, config |
| `Fase 5 — Memorice` | 5 | Juego de memoria |
| `Fase 6 — Prime Ninja` | 6 | Fruit ninja de primos |
| `Fase 7 — Capacitor` | 7 | Migración a APK Android |
| `Fase 8 — Producción` | 8 | Kiosk hardening y deploy |
