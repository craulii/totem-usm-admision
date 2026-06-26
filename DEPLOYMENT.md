# Guía de Despliegue — Tótem USM

## Prerrequisitos

- Node.js >= 18 instalado
- npm >= 9
- Git instalado
- Repositorio clonado y dependencias instaladas (`npm install`)

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
- [ ] `fullscreen: true` y `kiosk: true` en `main.js`
- [ ] DevTools desactivados
- [ ] Probado en el hardware físico final
- [ ] Auto-inicio configurado
- [ ] Probado que la app vuelve sola al estado inicial (cuando esté implementado)
