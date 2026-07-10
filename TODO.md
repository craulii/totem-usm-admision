# TODO — Tótem Interactivo USM

> Última actualización: 2026-07-09. **El backlog principal por fases vive en los issues de GitHub**
> (label `roadmap`, Fase 0–8) y en [`ROADMAP.md`](ROADMAP.md). Aquí solo queda la deuda técnica de
> código que no depende de una fase específica.

---

## Fase próxima: Fase 0 (ver issue `Fase 0 — Limpieza y botones base`)

- [ ] Quitar Buscar a Wally del menú y borrar `src/games/wally/WallyGame.jsx`
- [ ] Botón compartido "Terminar juego" (`src/components/EndGameButton.jsx`)
- [ ] Reloj forzado a `America/Santiago` en `Menu.jsx`
- [ ] `src/config.js` con duración configurable (default 60s); reemplaza el 120s del 2048

---

## Deuda técnica (no bloquea ninguna fase)

- [ ] **Resolver `components/GameCard.jsx` (código muerto)** — API distinta al GameCard inline de `Menu.jsx`: unificar o eliminar
- [ ] Mover keyframes CSS inline a `src/styles/animations.css`
- [ ] Extraer `Clock` de `Menu.jsx` a `components/Clock.jsx` (evita re-render por segundo)
- [ ] `package.json`: mover `react` y `react-dom` de devDependencies a dependencies
- [ ] Tests de lógica: `slideRow`/`canMove`/`hasWon` (2048), `isPrime` (Prime Ninja), validador de RUT

---

## Bloqueado — requiere entrega externa

- [ ] **Assets de branding USM** — esperando Comunicaciones USM
- [ ] **BDD real del cliente** — mientras tanto, esquema mock en Supabase
- [ ] **Tamaño de grilla del Memorice** — confirmar (10×10 es inviable para 30–60s)

---

## Completado recientemente ✅

- [x] Roadmap v2 por fases + issues de GitHub (2026-07-09)
- [x] Documentación alineada a Supabase + Capacitor + juegos nuevos (2026-07-09)
- [x] Sistema de leaderboard arcade con top 10 (2026-06-26)
