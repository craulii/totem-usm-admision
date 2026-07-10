# Base de Datos y Persistencia — Tótem USM

> Actualizado (2026-07-09): el proyecto **sí tiene backend** ahora. Estrategia elegida:
> **Supabase** (Postgres gestionado) con **fallback offline** (cache local + export Excel).
> Reemplaza el enfoque "offline-first sin backend" del roadmap v1.

## Objetivo

- Registrar alumnos y sus partidas.
- **Online:** enviar a Supabase (mock hasta que el cliente entregue su BDD real).
- **Offline:** encolar localmente y **exportar a Excel/CSV**.
- **Siempre:** evitar alumnos duplicados (dedup por RUT).

---

## Esquema (mock en Supabase)

```sql
comunas   (id, nombre)
colegios  (id, comuna_id → comunas.id, nombre)
alumnos   (id, rut UNIQUE, nombre, correo, telefono, colegio_id, curso, creado_en)
partidas  (id, alumno_id → alumnos.id, juego, score, jugado_en)
config    (key PRIMARY KEY, value)   -- ej: duracion_juego=60, comuna_filtro=<id>
```

- **Dedup**: `alumnos.rut UNIQUE` + `upsert ... on conflict (rut)`. La deduplicación vive en la
  **BD**, no en la app.
- `config` guarda ajustes editables por el admin (duración de juego, filtro de comuna).

---

## Flujo online / offline

```
Registro / fin de partida
        │
   ¿hay internet?  (ping real a Supabase, no solo navigator.onLine)
        │
   ┌────┴─────┐
  sí          no
   │           │
 upsert     encolar en localStorage
 Supabase   (cola de pendientes)
   │           │
   │        export CSV/Excel bajo demanda
   └── al reconectar → vaciar la cola (dedup por RUT evita duplicados)
```

Cliente único en `src/lib/db.js`, reutilizado por el tótem, la web de registro (QR) y el admin.

---

## Export a Excel (offline)

- **Default (ponytail):** CSV con **BOM UTF-8** → Excel lo abre directo, cero dependencias.
- Si se necesita `.xlsx` con formato/múltiples hojas: agregar **SheetJS** (`xlsx`) — solo entonces.

---

## Persistencia local (ya existente)

| Clave | Contenido | Responsable |
|-------|-----------|-------------|
| `totem_lb_<gameId>` | Top 10 por juego `[{name, score}]` | `Leaderboard.jsx` |
| `totem_pending` | Cola de registros/partidas sin sincronizar | `src/lib/db.js` (Fase 2) |

El leaderboard arcade seguirá usando `localStorage` para el ranking visible en pantalla; Supabase
es la fuente de verdad para los datos de admisión.

---

## Privacidad

Se capturan datos personales (nombre, RUT, correo, teléfono, comuna, colegio, curso). Aplica la
**Ley 19.628**: aviso de privacidad visible en el registro, y no almacenar más de lo necesario.
Ver `SECURITY.md`.

---

## Pendiente

- **BDD real del cliente:** aún no entregada → se trabaja con el esquema mock; migrar cuando llegue.
- **Credenciales Supabase:** en variables de entorno (`.env`, no commitear).
