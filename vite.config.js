import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base depende del destino:
// - dev (serve): '/'
// - build para GitHub Pages: '/totem-usm-admision/'  (workflow pone DEPLOY_TARGET=pages)
// - build para el tótem/APK (Electron/Capacitor, file://): './'  (relativo)
export default defineConfig(({ command }) => ({
  base: command === 'serve'
    ? '/'
    : (process.env.DEPLOY_TARGET === 'pages' ? '/totem-usm-admision/' : './'),
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
}))
