# Guía de Despliegue — Tótem USM

> Actualizado (2026-07-09): producción usa **Capacitor (APK Android)**. Electron queda como
> entorno de **desarrollo**. Además hay dos webs a desplegar (registro por QR y panel admin) y
> variables de entorno de **Supabase**. Ver `ANDROID.md` y `ROADMAP.md`.

## Prerrequisitos

- Node.js >= 18 instalado
- npm >= 9
- Git instalado
- Repositorio clonado y dependencias instaladas (`npm install`)
- Variables de entorno Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — no commitear
- Para producción: Android Studio + JDK (Capacitor build) — Fase 7

---

## Producción: APK Android con Capacitor (Fase 7)

Runtime elegido para el tótem. Resumen (detalle al ejecutar la Fase 7):

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init                 # appId cl.usm.totem, appName "Tótem USM"
npm run build                # genera dist/
npx cap add android
npx cap sync
npx cap open android         # build/run del APK en Android Studio
```

- Orientación **portrait** y **kiosk/COSU** se configuran en Android (lock task / MDM).
- Export offline (CSV/Excel) usa el plugin **Filesystem/Share** de Capacitor.

## Webs auxiliares (Fase 3–4)

- **Registro (QR):** `npm run build` de la ruta de registro → host estático (Vercel/Netlify). El QR
  del menú apunta a esa URL.
- **Panel admin:** misma app, ruta protegida por link privado.

---

## Modo desarrollo (Windows / macOS / Linux)

```bash
npm start
```

Esto inicia:
1. Vite dev server en `http://localhost:5173`
2. Electron carga desde `localhost:5173`
3. DevTools abierto en ventana separada

La ventana tiene 1080×1920 pero **no está en kiosk mode**. Ideal para desarrollo.

---

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` con los assets estáticos de React.

Luego para probar el build en Electron:

```bash
# Cambiar NODE_ENV a producción
NODE_ENV=production npm run electron
```

Electron cargará `dist/index.html` en vez del servidor Vite.

---

## Activar modo kiosk para el tótem

En `main.js`, cambiar:

```javascript
// Modo desarrollo (actual)
fullscreen: false,
kiosk: false,

// Modo tótem (cambiar antes de deploy)
fullscreen: true,
kiosk: true,
```

También remover el `openDevTools()`:
```javascript
// Comentar o eliminar esta línea:
// win.webContents.openDevTools({ mode: 'detach' })
```

---

## Opción A: Deploy en mini-PC con Windows

### Instalación inicial

```cmd
# 1. Instalar Node.js desde nodejs.org
# 2. Clonar el repositorio
git clone https://github.com/TU_USUARIO/totem-usm-admision.git
cd totem-usm-admision
npm install
npm run build

# 3. Probar
npm run electron  (con NODE_ENV=production)
```

### Auto-inicio con Windows Task Scheduler

Crear una tarea que ejecute al inicio de sesión:
```
Programa: C:\Program Files\nodejs\node.exe
Argumentos: C:\Users\...\totem-app\node_modules\.bin\electron .
Directorio: C:\Users\...\totem-app
```

### Script `iniciar.bat`

```batch
@echo off
cd /d "%~dp0"
set NODE_ENV=production
node_modules\.bin\electron .
```

---

## Opción C: Deploy como Web (Chrome en Android)

```bash
# 1. Hacer build
npm run build

# 2. Instalar servidor simple
npm install -g serve

# 3. Servir la carpeta dist
serve -s dist -p 3000
```

En el Android: abrir Chrome → `http://localhost:3000` → activar pantalla completa.

Para auto-inicio en Android, usar una app de kiosk launcher.

---

## Packaging con electron-builder (futuro)

Cuando se necesite distribuir la app como ejecutable `.exe` o `.AppImage`:

```bash
# Instalar electron-builder (pendiente agregar al proyecto)
npm install --save-dev electron-builder

# Agregar a package.json:
# "build": { "appId": "cl.usm.totem", "productName": "Totem USM" }

# Generar instalador
npm run dist
```

---

## Checklist de deploy

- [ ] `npm run build` completó sin errores
- [ ] Variables `VITE_SUPABASE_*` configuradas en el build (no en el repo)
- [ ] APK generado con Capacitor e instalado en el Android 42"
- [ ] Kiosk/COSU (lock task) activo; orientación portrait
- [ ] Web de registro (QR) y panel admin desplegados y accesibles
- [ ] Probado el flujo online (Supabase) y offline (cola + Excel)
- [ ] Auto-inicio configurado en el Android
- [ ] Probado que la app vuelve sola a Attract en idle (Fase 8)

> **Legacy (Electron dev/plan B mini-PC):** activar kiosk con `fullscreen: true` y `kiosk: true`
> en `main.js` y desactivar DevTools.
