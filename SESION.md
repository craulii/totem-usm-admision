# Template de Sesión de Trabajo — Tótem USM

Usar este archivo al iniciar cada sesión de desarrollo con Claude o cualquier desarrollador nuevo.

---

## Antes de empezar, responder estas preguntas

### 1. ¿En qué fase estamos?

- [ ] Fase 1 — MVP 2048 (✅ completada)
- [ ] Fase 2 — Flujo completo (idle, instrucciones, resultado)
- [ ] Fase 3 — Buscar a Wally
- [ ] Fase 4 — Tercer juego
- [ ] Fase 5 — Robustez y deploy

### 2. ¿Llegaron assets de USM?

- [ ] No, los assets siguen pendientes
- [ ] Sí — ¿qué archivos llegaron? _______________________

### 3. ¿Se decidió el hardware?

- [ ] No, todavía pendiente
- [ ] Sí — Opción elegida: A / B / C (ver `ANDROID.md`)

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
Stack: Electron 33 + React 18 + Vite 5 + JavaScript (JSX)
Carpeta de trabajo: totem-app/

Estado actual:
- Juego 2048 USM: IMPLEMENTADO y funcional
- Resto de juegos (Wally, Game3): STUBS VACÍOS INTENCIONALES, no tocar
- Assets USM: pendientes de entrega por la universidad
- Hardware final: pantalla Android 42" — decisión pendiente

Archivos clave:
- src/App.jsx — router principal
- src/screens/Menu.jsx — menú de selección
- src/games/game2048/Game2048.jsx — único juego activo

Lee PLAN.md para ver las fases y CLAUDE.md para las reglas específicas.
```

---

## Checklist de fin de sesión

- [ ] El juego 2048 sigue funcionando (probar)
- [ ] `npm start` abre sin errores
- [ ] Los cambios están commiteados con Conventional Commits
- [ ] Actualizar PLAN.md si se completó algo
- [ ] Actualizar CHANGELOG.md con los cambios del día
- [ ] Actualizar TODO.md si surgieron nuevas tareas
