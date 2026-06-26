# API e IPC — Tótem USM

## Estado actual: Sin API ni IPC activo

La app actualmente no tiene:
- Backend HTTP
- API REST
- Comunicación IPC main ↔ renderer (más allá del preload vacío)

---

## IPC Electron (cuando se necesite)

El `preload.js` actualmente solo registra un log:

```javascript
// preload.js actual
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload cargado correctamente')
})
```

### Cómo agregar IPC en el futuro

Si se necesita que el renderer (React) hable con el proceso principal (Electron):

**main.js** — recibir desde renderer:
```javascript
const { ipcMain } = require('electron');

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
```

**preload.js** — exponer de forma segura al renderer:
```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  // Agregar más métodos aquí
});
```

**React (renderer)** — usar desde cualquier componente:
```javascript
const version = await window.electronAPI.getVersion();
```

---

## Casos de uso IPC que podrían necesitarse

| Caso | Método | Fase |
|------|--------|------|
| Obtener versión de la app | `ipcRenderer.invoke` | Futuro |
| Imprimir comprobante | `ipcMain.handle` + impresora | Futuro |
| Exportar datos a CSV | Main accede al filesystem | Futuro |
| Reiniciar la app | `app.relaunch()` | Fase 5 |

---

## Sin backend HTTP

No hay planes de backend propio. La app funciona 100% offline. Si en el futuro se necesita sincronización de datos con sistemas USM, se evaluará un backend Flask o Node.js mínimo.
