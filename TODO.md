# TODO — Tótem Interactivo USM

> Última actualización: 2026-06-26

---

## Prioridad ALTA (Fase 2 — próxima)

- [ ] **Conectar Attract screen al flujo en `App.jsx`**
  - Al arrancar la app → mostrar Attract
  - Al tocar Attract → ir al menú
  - Al estar 30s sin tocar en menú → volver a Attract

- [ ] **Implementar idle timeout**
  - Usar `IntersectionObserver` o `setTimeout` con reset en cada touch
  - 30 segundos → volver a Attract
  - Archivo placeholder: `src/components/IdleReset.jsx`

- [ ] **Implementar `Instructions.jsx`**
  - Pantalla que aparece ANTES del juego
  - Mostrar reglas del 2048 en 3-4 líneas
  - Botón "¡Jugar!" para comenzar

- [ ] **Implementar `Result.jsx`**
  - Pantalla de resultado post-juego
  - Mostrar puntaje final, mejor puntaje, tiempo
  - Botones: "Jugar de nuevo" y "Volver al menú"

- [ ] **Agregar botón "Volver" visible en Game2048**
  - Hay una prop `onBack` pero sin UI
  - Agregar botón pequeño en esquina superior izquierda
  - Confirmar si es necesario (en kiosk real, quizás no)

- [ ] **Persistir mejor puntaje en localStorage**
  - `localStorage.setItem('totem_best', score)`
  - Leer al inicio de Game2048

---

## Prioridad MEDIA

- [ ] **Integrar assets USM cuando lleguen**
  - Logo → reemplazar placeholder "LOGO USM" en `Menu.jsx:189`
  - Colores oficiales → crear `src/config.js` con constantes
  - Pendiente de entrega por USM Comunicaciones

- [ ] **Mover keyframes CSS a archivo externo**
  - Actualmente inyectados con `<style>` dentro del JSX
  - Crear `src/styles/animations.css` y importarlo en `main.jsx`

- [ ] **Extraer `Clock` de `Menu.jsx` a `components/Clock.jsx`**
  - Evita re-renders del menú completo cada segundo

- [ ] **Resolver `components/GameCard.jsx` (código muerto)**
  - Tiene una API diferente al GameCard inline de Menu.jsx
  - Opciones: unificarlos o eliminar el archivo viejo

- [ ] **Actualizar `package.json`**: mover react y react-dom de devDependencies a dependencies

- [ ] **Confirmar hardware** (ver `ANDROID.md`)
  - Elegir Opción A, B o C
  - Asignar responsable y fecha

---

## Prioridad BAJA (cuando haya tiempo)

- [ ] Agregar `will-change: transform` a tiles animados (performance en Android)
- [ ] Agregar `React.memo` al componente `Clock` y `GameCard`
- [ ] Agregar animación de transición entre pantallas (Attract → Menú, Menú → Juego)
- [ ] Considerar TypeScript (migraría gradualmente, empezando por Game2048)
- [ ] Agregar tests unitarios para lógica de `slideRow`, `canMove`, `hasWon`

---

## Bloqueado — requiere decisión externa

- [ ] **Assets de branding USM** — esperando entrega de Comunicaciones USM
- [ ] **Hardware final** — esperando decisión del equipo
- [ ] **Diseño de Wally** — licencias del personaje o alternativa propia
- [ ] **Tercer juego** — definir con equipo USM

---

## Completado recientemente ✅

- [x] Import case-sensitivity en App.jsx (2026-06-26)
- [x] ScorePop transform duplicado (2026-06-26)
- [x] Subtitle incorrecto en menú (2026-06-26)
- [x] Touch en GameCard del menú (2026-06-26)
- [x] touchAction:none en tablero (2026-06-26)
- [x] Toast "Próximamente" para cards futuras (2026-06-26)
- [x] .gitignore (2026-06-26)
- [x] Documentación completa (2026-06-26)
