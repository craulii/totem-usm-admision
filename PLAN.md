# Plan de Desarrollo — Tótem Interactivo USM

## Objetivo

Aplicación kiosk fullscreen para el stand de admisión USM Santiago. Estudiantes se acercan, juegan un minijuego y se van. La app corre sin supervisión 4-8 horas continuas.

---

## Estado actual (v0.1.0 — Junio 2026)

```
✅ Completado    ⏳ Pendiente    🔴 Bloqueado    🚧 En progreso
```

### Completado
- [x] Estructura base Electron + Vite + React
- [x] Menú principal con 3 cards animadas
- [x] Reloj en tiempo real (es-CL locale)
- [x] Juego 2048 USM (variante potencias de 3)
- [x] Lógica de merge, slide, rotación
- [x] Timer SVG ring con 120 segundos
- [x] Estados de fin de juego (won / lost / timeup)
- [x] Touch swipe para el tablero
- [x] Score popups animados
- [x] Pantalla Attract implementada (pendiente de conectar)
- [x] Toast "Próximamente" para cards futuras

---

## Fases de desarrollo

### Fase 1 — MVP Juego 2048 ✅ (completada)

**Meta**: Un juego funcional y jugable en el tótem.

- [x] Grid 4×4 con potencias de 3
- [x] Mecánicas de merge correctas
- [x] Timer de 120 segundos
- [x] Touch swipe
- [x] Estados de victoria/derrota/tiempo
- [x] UI con tema azul USM

---

### Fase 2 — Flujo completo ⏳ (próxima)

**Meta**: Flujo completo de uso sin supervisión.

- [ ] Conectar pantalla Attract al flujo (idle → tocar → menú)
- [ ] Idle timeout: si nadie toca en 30s → volver a Attract
- [ ] Pantalla de instrucciones antes del juego
- [ ] Pantalla de resultado post-juego (con puntaje final y CTA)
- [ ] Persistencia de mejor puntaje con `localStorage`
- [ ] Botón "Volver al menú" visible en el juego
- [ ] Integrar assets USM cuando estén disponibles (logo, colores)

**Criterios de aceptación Fase 2**:
- Un estudiante puede completar el flujo completo sin ayuda
- La app vuelve sola a Attract después de 30s de inactividad
- El mejor puntaje persiste entre partidas de la misma sesión

---

### Fase 3 — Juego Buscar a Wally ⏳ (futuro)

**Meta**: Segundo juego playable.

- [ ] Diseño del juego (imagen con Wally escondido)
- [ ] Mecánica de tocar/seleccionar zona
- [ ] Niveles o variantes de dificultad
- [ ] Integración en el menú principal
- [ ] Assets de Wally (pendiente definición legal/estética)

---

### Fase 4 — Tercer juego ⏳ (futuro)

**Meta**: Tercer juego (nombre y mecánica TBD).

- [ ] Definir mecánica con el equipo USM
- [ ] Implementar juego
- [ ] Integrar al menú

---

### Fase 5 — Robustez y despliegue ⏳ (paralelo a fases 3-4)

**Meta**: App lista para correr 4-8 horas sin supervisión.

- [ ] Modo kiosk habilitado (`fullscreen: true`, `kiosk: true`)
- [ ] Watchdog / auto-restart si la app crashea
- [ ] Prevención de burn-in (idle screen animated)
- [ ] Definir estrategia de hardware Android vs. mini-PC (ver [`ANDROID.md`](ANDROID.md))
- [ ] Script de instalación y arranque automático
- [ ] Electron Builder para packaging

---

## Decisiones pendientes (blockers)

| Decisión | Quién decide | Impacto |
|---------|-------------|---------|
| Hardware: Android nativo vs mini-PC | Equipo USM + Desarrollo | Cambia toda la estrategia de deploy |
| Assets de branding (logo, colores oficiales) | USM Comunicaciones | Bloquea apariencia final |
| Nombre y mecánica del tercer juego | Equipo USM | Bloquea Fase 4 |
| Persistencia entre sesiones (¿leaderboard?) | Equipo USM | Define arquitectura de datos |

---

## Preguntas iniciales para cada sesión de desarrollo

Antes de codear, verificar:

1. ¿En qué fase estamos trabajando hoy?
2. ¿Llegaron assets de USM?
3. ¿Se tomó decisión sobre hardware Android?
4. ¿Hay cambios en el diseño de juegos?
5. ¿Se probó en el hardware físico?
