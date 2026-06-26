# Roadmap — Tótem Interactivo USM

## Versiones planificadas

```
v0.1.0 → v0.2.0 → v0.3.0 → v1.0.0
   MVP     Flujo    Juegos   Producción
```

---

## v0.1.x — MVP Juego 2048 ✅

**Estado**: Completado (Junio 2026)

### v0.1.0 — Base
- Estructura Electron + Vite + React
- Menú con 3 cards
- Juego 2048 con variante potencias de 3

### v0.1.1 — Bugfixes
- Fix import case-sensitivity en Linux (Game2048 no cargaba)
- Fix ScorePop animación (transform duplicado)
- Fix subtitle del menú (decía "2048" en vez de "2187")
- Soporte touch en GameCard del menú (para Android)
- touchAction: none en tablero del juego
- Toast "Próximamente" para cards futuras

---

## v0.2.0 — Flujo completo ⏳

**Estado**: Pendiente (Fase 2)
**Objetivo**: Un estudiante puede usar el tótem de principio a fin sin ayuda.

### Hitos
- [ ] Pantalla Attract conectada al flujo
- [ ] Idle timeout de 30 segundos → volver a Attract
- [ ] Pantalla de instrucciones (antes del juego)
- [ ] Pantalla de resultado con puntaje final
- [ ] Botón "Volver al menú" visible en el juego
- [ ] Persistencia del mejor puntaje (localStorage)
- [ ] Assets USM integrados (bloqueado por entrega USM)

---

## v0.3.0 — Segundo juego (Wally) ⏳

**Estado**: Pendiente (Fase 3)
**Bloqueado por**: Decisión de assets y mecánica con equipo USM

### Hitos
- [ ] Diseño y assets de Buscar a Wally listos
- [ ] Implementación del juego
- [ ] Integración en el menú
- [ ] Flujo completo incluyendo instrucciones y resultado de Wally

---

## v0.4.0 — Tercer juego ⏳

**Estado**: Pendiente (Fase 4)
**Bloqueado por**: Decisión de qué juego hacer

### Hitos
- [ ] Nombre y mecánica del tercer juego definidos
- [ ] Implementación
- [ ] Integración

---

## v1.0.0 — Producción ⏳

**Estado**: Pendiente (Fase 5)
**Bloqueado por**: Decisión de hardware (ANDROID.md)

### Hitos
- [ ] Decisión hardware tomada (Android vs mini-PC vs PWA)
- [ ] Modo kiosk habilitado (fullscreen + kiosk)
- [ ] Auto-inicio configurado
- [ ] Watchdog / auto-restart
- [ ] Prevención de burn-in
- [ ] Probado 4+ horas continuas sin intervención
- [ ] Packaging con electron-builder (si es Opción A/B)
- [ ] Deploy en hardware físico del stand USM

---

## Milestones sugeridos para GitHub

| Milestone | Versión | Descripción |
|-----------|---------|-------------|
| `MVP Completo` | v0.1.x | 2048 funcionando con flujo básico |
| `Flujo UX Completo` | v0.2.0 | Attract → Menú → Juego → Resultado |
| `Dos Juegos` | v0.3.0 | 2048 + Wally |
| `Tres Juegos` | v0.4.0 | 2048 + Wally + Tercer juego |
| `Producción` | v1.0.0 | Listo para el stand USM |
