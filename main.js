const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 1920,
    resizable: false,
    fullscreen: !isDev,      // kiosk automático fuera de dev (NODE_ENV=production)
    kiosk: !isDev,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev,       // sin DevTools fuera de dev — ni por atajo ni por menú
      preload: path.join(__dirname, 'preload.js')
    }
  })

  Menu.setApplicationMenu(null) // sin barra de menú (Alt ya no la revela)

  // Bloquea que la página abra ventanas/pestañas nuevas (window.open, target="_blank", etc.)
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))

  // En el tótem: bloquea atajos para salir del kiosko, cerrar la ventana o abrir DevTools.
  // En dev se dejan libres para poder trabajar normalmente.
  if (!isDev) {
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type !== 'keyDown') return
      const key = (input.key || '').toLowerCase()
      const blocked =
        key === 'f11' || key === 'f12' ||
        (input.alt && key === 'f4') ||
        (input.control && ['i', 'j', 'c', 'u', 'n', 't', 'w'].includes(key))
      if (blocked) event.preventDefault()
    })
  }

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools({ mode: 'detach' }) // opcional para debug
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})