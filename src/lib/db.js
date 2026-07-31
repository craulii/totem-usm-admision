// Data layer for config, registrations and comunas/colegios.
// Fase 2: backed by Supabase (ver DATABASE.md para el schema / supabase/schema.sql).
//
// getGameDuration() se mantiene síncrona: solo la usan los juegos dentro de la
// sesión larga del tótem (App.jsx), así que puede leer una cache que se llena
// un instante después de cargar este módulo. getConfig()/getComunas() sí son
// async — los usan AdminPage y Register/RegisterPage, que se abren como
// carga de página nueva (?admin=…, ?registro) sin tiempo de precalentar cache.
//
// getRegistros(token) llama a la RPC admin_listar_alumnos, que verifica
// ADMIN_TOKEN del lado del servidor antes de devolver nada — mejor que un
// SELECT abierto, pero no es auth real (ADMIN_TOKEN igual viaja en el bundle
// público). Reemplazar por Supabase Auth cuando exista el login del admin
// (Fase 4).

import { createClient } from '@supabase/supabase-js';
import { GAME_DURATION } from '../config';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DEFAULTS = { gameDuration: GAME_DURATION, comunaFiltro: null };

// ── Bitácora admin (solo visible desde el Table Editor de Supabase, con tu
// login de dueño del proyecto — no hay policy de select para el link
// ?admin=… compartido). Fire-and-forget: un log que falla no debe romper
// la acción real del admin.
export function logAdminAction(accion, detalle) {
  supabase.from('admin_log').insert({ accion, detalle: detalle != null ? String(detalle) : null })
    .then(({ error }) => { if (error) console.error('logAdminAction failed', error); });
}

// ── Config (editable desde el admin) ────────────────────────────────────────
// gameDuration: 0-120 (segundos) o Infinity ("sin límite", guardado como
// el string 'unlimited' porque `config.value` es texto).
function encodeDuration(d) { return d === Infinity ? 'unlimited' : String(d); }
function decodeDuration(v) {
  if (v === 'unlimited') return Infinity;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : GAME_DURATION;
}

let gameDurationCache = GAME_DURATION;
supabase.from('config').select('value').eq('key', 'gameDuration').maybeSingle()
  .then(({ data }) => {
    if (data?.value != null) gameDurationCache = decodeDuration(data.value);
  });

export function getGameDuration() {
  return gameDurationCache;
}

export async function getConfig() {
  const { data, error } = await supabase.from('config').select('key, value');
  if (error) { console.error('getConfig failed', error); return { ...DEFAULTS }; }
  const stored = Object.fromEntries(data.map(({ key, value }) => [key, value]));
  return {
    gameDuration: stored.gameDuration != null ? decodeDuration(stored.gameDuration) : GAME_DURATION,
    comunaFiltro: stored.comunaFiltro || null,
  };
}

export async function setConfig(patch) {
  const rows = Object.entries(patch).map(([key, value]) => ({
    key, value: key === 'gameDuration' ? encodeDuration(value) : String(value),
  }));
  const { error } = await supabase.from('config').upsert(rows);
  if (error) console.error('setConfig failed', error);
  else logAdminAction('config_update', JSON.stringify(patch));
  if ('gameDuration' in patch) gameDurationCache = decodeDuration(encodeDuration(patch.gameDuration));
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

// Protegido por ADMIN_TOKEN vía RPC (ver nota de seguridad en schema.sql):
// mejor que nada, pero no es auth real — ADMIN_TOKEN va en el bundle público.
export async function getRegistros(token) {
  const { data, error } = await supabase.rpc('admin_listar_alumnos', { p_token: token });
  if (error) { console.error('getRegistros failed', error); return null; }
  return data.map(r => ({ ...r, ts: r.creado_en }));
}

// Protegido por owner_token (distinto de ADMIN_TOKEN, nunca vive en el
// código — solo en `admin_secrets` y en la URL que guardes tú).
export async function getAdminLog(token) {
  const { data, error } = await supabase.rpc('admin_listar_log', { p_token: token });
  if (error) { console.error('getAdminLog failed', error); return null; }
  return data;
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
  const clean = nombre?.trim().toLowerCase();
  if (!clean) return;
  const { error } = await supabase
    .from('colegios')
    .upsert({ comuna_id: comunaId, nombre: clean }, { onConflict: 'comuna_id,nombre', ignoreDuplicates: true });
  if (error) console.error('addColegio failed', error);
  else logAdminAction('colegio_add', `comuna_id=${comunaId} nombre=${clean}`);
}

// ── Partidas (respaldo de puntajes, sin PII) ────────────────────────────────
// Nunca .select() después del insert: partidas no tiene policy de SELECT
// (no hace falta, el ranking en pantalla vive en localStorage) y un INSERT
// ...RETURNING exige poder leer la fila de vuelta, así que fallaría por RLS.
export async function registrarPartida({ iniciales, juego, score }) {
  const { error } = await supabase.from('partidas').insert({ iniciales, juego, score });
  if (error) console.error('registrarPartida failed', error);
}
