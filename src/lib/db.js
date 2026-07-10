// Data layer for config, registrations and comunas/colegios.
//
// ponytail: implementación MOCK sobre localStorage. La Fase 2 (Supabase)
// reemplaza el cuerpo de estas funciones manteniendo la misma API, y recién ahí
// los datos se comparten entre el celular, el tótem y el panel admin (hoy son
// por-dispositivo).

import { GAME_DURATION } from '../config';
import { COMUNAS as BASE_COMUNAS } from '../data/comunas.mjs';

const K_CONFIG = 'totem_config';
const K_REGISTROS = 'totem_registros';
const K_COLEGIOS = 'totem_colegios_extra'; // { [comunaId]: ["Colegio", ...] }

const DEFAULTS = { gameDuration: GAME_DURATION, comunaFiltro: null };

function read(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v ?? fallback;
  } catch { return fallback; }
}
function write(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage off */ }
}

// ── Config (editable desde el admin) ────────────────────────────────────────
export function getConfig() {
  return { ...DEFAULTS, ...read(K_CONFIG, {}) };
}
export function setConfig(patch) {
  const next = { ...getConfig(), ...patch };
  write(K_CONFIG, next);
  return next;
}
export function getGameDuration() {
  const d = Number(getConfig().gameDuration);
  return d > 0 ? d : GAME_DURATION;
}

// ── Registros (generados por el formulario del QR) ──────────────────────────
export function getRegistros() {
  return read(K_REGISTROS, []);
}
export function addRegistro(r) {
  const list = getRegistros();
  list.push(r);
  write(K_REGISTROS, list);
  return list;
}

// ── Comunas / colegios (base estática + altas del admin, con filtro opcional) ─
export function getComunas({ applyFilter = false } = {}) {
  const extra = read(K_COLEGIOS, {});
  let comunas = BASE_COMUNAS.map(c => ({
    ...c,
    colegios: [...c.colegios, ...(extra[c.id] || [])],
  }));
  if (applyFilter) {
    const { comunaFiltro } = getConfig();
    if (comunaFiltro) comunas = comunas.filter(c => String(c.id) === String(comunaFiltro));
  }
  return comunas;
}
export function addColegio(comunaId, nombre) {
  const extra = read(K_COLEGIOS, {});
  const arr = extra[comunaId] || [];
  if (nombre && !arr.includes(nombre)) arr.push(nombre);
  extra[comunaId] = arr;
  write(K_COLEGIOS, extra);
}
