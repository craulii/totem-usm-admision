# API e Integración — Tótem USM

> Actualizado (2026-07-09): el backend es **Supabase**. La app ya no es "sin API". El IPC de
> Electron deja de ser el mecanismo principal (se migra a Capacitor); el acceso a datos va por
> el cliente Supabase (REST/JS) desde el renderer.

## Cliente Supabase (`src/lib/db.js`) — Fase 2

Un único módulo expone las operaciones de datos, reutilizado por el tótem, la web de registro
(QR) y el panel admin.

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

// Registro con dedup por RUT (upsert)
export async function upsertAlumno(alumno) {
  return supabase.from('alumnos').upsert(alumno, { onConflict: 'rut' }).select().single()
}

// Guardar partida
export async function savePartida(p) {
  return supabase.from('partidas').insert(p)
}

// Config editable por admin (duración de juego, filtro de comuna)
export async function getConfig(key) {
  const { data } = await supabase.from('config').select('value').eq('key', key).single()
  return data?.value
}
```

### Conectividad (online/offline)

`navigator.onLine` no es confiable. Usar un **ping real** a Supabase antes de decidir; si falla,
encolar en `localStorage` (`totem_pending`) y vaciar la cola al reconectar. Ver `DATABASE.md`.

---

## Variables de entorno

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

No commitear. En Capacitor se inyectan en el build.

---

## IPC Electron (legacy / solo dev)

Mientras se corre en Electron (desarrollo), `preload.js` sigue disponible para puentes puntuales
(`contextBridge`). Al migrar a **Capacitor** (Fase 7), `main.js`/`preload.js` se deprecan y las
capacidades nativas (Filesystem para el export, Share) se cubren con **plugins de Capacitor**.

| Necesidad | Antes (Electron) | Ahora / futuro |
|-----------|------------------|----------------|
| Guardar/leer datos | IPC + FS | Supabase + `localStorage` |
| Exportar Excel/CSV | IPC + FS | `localStorage` → Blob download (web) / plugin Filesystem (Capacitor) |
| Reiniciar la app | `app.relaunch()` | Config kiosk/COSU en Android |

---

## Panel de administración

Web aparte (mismo repo, ruta protegida) que lee/escribe en Supabase (`config`, `colegios`,
`alumnos`, `partidas`). Para navegar datos crudos se puede usar además el **Table Editor** de
Supabase. Ver Fase 4 en `ROADMAP.md`.
