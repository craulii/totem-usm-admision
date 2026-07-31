// Data layer for config, registrations and comunas/colegios.
// Fase 2: backed by Supabase (ver DATABASE.md para el schema / supabase/schema.sql).
//
// getGameDuration() se mantiene síncrona: solo la usan los juegos dentro de la
// sesión larga del tótem (App.jsx), así que puede leer una cache que se llena
// un instante después de cargar este módulo. getConfig()/getComunas() sí son
// async — los usan AdminPage y Register/RegisterPage, que se abren como
// carga de página nueva (?admin=…, ?registro) sin tiempo de precalentar cache.
//
// getRegistros() NO está conectado a Supabase: `alumnos` guarda datos
// personales (RUT, teléfono, correo) y el panel admin todavía no tiene
// autenticación real (solo un token de cliente) — exponer un SELECT a la
// anon key filtraría datos de alumnos a cualquiera con las devtools. Conectar
// cuando el panel admin tenga Supabase Auth (Fase 4).

import { createClient } from '@supabase/supabase-js';
import { GAME_DURATION } from '../config';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DEFAULTS = { gameDuration: GAME_DURATION, comunaFiltro: null };

// ── Config (editable desde el admin) ────────────────────────────────────────
let gameDurationCache = GAME_DURATION;
supabase.from('config').select('value').eq('key', 'gameDuration').maybeSingle()
  .then(({ data }) => {
    const d = Number(data?.value);
    if (d > 0) gameDurationCache = d;
  });

export function getGameDuration() {
  return gameDurationCache;
}

export async function getConfig() {
  const { data, error } = await supabase.from('config').select('key, value');
  if (error) { console.error('getConfig failed', error); return { ...DEFAULTS }; }
  const stored = Object.fromEntries(data.map(({ key, value }) => [key, value]));
  return {
    gameDuration: Number(stored.gameDuration) > 0 ? Number(stored.gameDuration) : GAME_DURATION,
    comunaFiltro: stored.comunaFiltro || null,
  };
}

export async function setConfig(patch) {
  const rows = Object.entries(patch).map(([key, value]) => ({ key, value: String(value) }));
  const { error } = await supabase.from('config').upsert(rows);
  if (error) console.error('setConfig failed', error);
  if ('gameDuration' in patch) {
    const d = Number(patch.gameDuration);
    if (d > 0) gameDurationCache = d;
  }
  return getConfig();
}

// ── Registros (generados por el formulario del QR) ──────────────────────────
export async function addRegistro(r) {
  const { data, error } = await supabase.rpc('registrar_alumno', {
    p_rut: r.rut,
    p_nombre: r.nombre,
    p_correo: r.correo,
    p_telefono: r.telefono,
    p_comuna_id: r.comunaId,
    p_colegio_nombre: r.colegio,
    p_curso: r.curso,
    p_code: r.code,
  });
  if (error) throw error;
  return data;
}

// ponytail: stub hasta que el panel admin tenga auth real (ver nota arriba).
export function getRegistros() {
  return [];
}

// ── Comunas / colegios (base + altas del admin, con filtro opcional) ───────
export async function getComunas({ applyFilter = false } = {}) {
  const { data, error } = await supabase
    .from('comunas')
    .select('id, nombre, colegios(nombre)')
    .order('id');
  if (error) { console.error('getComunas failed', error); return []; }
  let comunas = data.map(c => ({ id: c.id, nombre: c.nombre, colegios: c.colegios.map(x => x.nombre) }));
  if (applyFilter) {
    const { comunaFiltro } = await getConfig();
    if (comunaFiltro) comunas = comunas.filter(c => String(c.id) === String(comunaFiltro));
  }
  return comunas;
}

export async function addColegio(comunaId, nombre) {
  if (!nombre) return;
  const { error } = await supabase.from('colegios').insert({ comuna_id: comunaId, nombre });
  if (error) console.error('addColegio failed', error);
}
