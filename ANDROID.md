# Hardware Android — Decisión: Capacitor (Opción B) ✅

> **Decisión tomada (2026-07-09): Opción B — Capacitor (APK Android nativo).** El tótem se
> empaqueta como app nativa que corre en la pantalla Android de 42" sin hardware extra. La
> migración es la **Fase 7** del roadmap. Las Opciones A y C quedan documentadas abajo como
> contexto y plan B.

## Situación

El hardware final del tótem es una **pantalla Android de 42"** en orientación portrait. El stack
de desarrollo usa **Electron**, que **no corre en Android** — por eso se migra a Capacitor para
producción. El código React se reutiliza tal cual; se reescribe la capa de empaquetado.

---

## Las tres opciones

### Opción A: Mini-PC conectado a la pantalla Android ✅ Recomendada (si hay presupuesto)

La pantalla Android actúa como monitor externo. Un mini-PC con Windows o Linux se conecta por HDMI/USB-C y corre la app Electron normalmente.

**Pros**:
- Zero cambios en el código actual
- Electron corre perfectamente en Windows/Linux
- Control total del sistema operativo (kiosk mode, restart automático)
- Mejor rendimiento que Android nativo para apps complejas

**Contras**:
- Costo extra de hardware (mini-PC: $100-$300 USD)
- Un punto de falla adicional
- Necesita energía adicional y espacio físico

**Pasos para implementar**:
1. Adquirir mini-PC (recomendado: Intel NUC o similar, 8GB RAM, SSD)
2. Instalar Windows 11 o Ubuntu 22.04
3. Instalar Node.js + clonar repositorio
4. Ejecutar `npm start` con `fullscreen: true, kiosk: true`
5. Configurar auto-inicio con Task Scheduler (Windows) o systemd (Linux)

---

### Opción B: Migrar a Capacitor (APK Android nativo) ✅ ELEGIDA

Convertir la app React a una APK Android usando [Capacitor](https://capacitorjs.com/).

**Pros**:
- Nativo Android, sin hardware extra
- Acceso a APIs de Android (volumen, orientación, etc.)
- Una sola unidad de hardware

**Contras**:
- Requiere reescribir `main.js` (no existe en Capacitor)
- Configurar kiosk mode en Android es diferente (COSU/MDM)
- Necesita aprender Capacitor y Android Studio
- Build más complejo (requiere Java/Android SDK)
- Electron-store debe reemplazarse por almacenamiento Android

**Esfuerzo estimado de migración**: 2-3 días de desarrollo

---

### Opción C: PWA / Web pura en Chrome Android 🚀 Más rápida

Usar solo el frontend React+Vite (sin Electron) servido desde Chrome en Android.

**Pros**:
- Sin cambios en el código React
- Sin hardware extra
- Deploy simple: `npm run build` → servir carpeta `dist/`
- Chrome en Android soporta pantalla completa y touch

**Contras**:
- Sin acceso a APIs nativas de sistema
- Kiosk mode en Chrome Android requiere configuración MDM o "Modo Pantalla Completa"
- Sin restart automático si la app falla
- Limitaciones de storage (localStorage en vez de electron-store)

**Pasos para implementar**:
1. Instalar Chrome en el Android de 42"
2. Configurar Chrome en modo kiosk (flags o MDM)
3. Servir la carpeta `dist/` desde un servidor local (ej: `serve` npm package) o desde un servidor web simple
4. Opcional: convertir a PWA instalable (agregar `manifest.json` y service worker)

---

## Recomendación

| Prioridad | Si... | Opción |
|-----------|-------|--------|
| Rapidez | Se necesita algo funcionando esta semana | C (web pura) |
| Calidad | Hay presupuesto y tiempo | A (mini-PC) |
| Largo plazo | Se quiere app nativa sin hardware extra | **B (Capacitor) ✅** |

**Elegida: Opción B (Capacitor)** — app nativa sin hardware extra. La web de registro (QR) y el
panel admin se sirven aparte como web estática (mismo repo), así que el flujo QR-al-celular
funciona por internet independientemente del runtime del tótem.

---

## Estado de la decisión

- [x] Decisión tomada: **Opción B (Capacitor)** — 2026-07-09
- [ ] Migración ejecutada (Fase 7 del roadmap)
- [ ] Probado en el Android 42" físico
