// Exporta los registros a un .xlsx con una pestaña por día (hora de Chile).
import * as XLSX from 'xlsx';

const COLUMNS = [
  ['nombre', 'Nombre'], ['rut', 'RUT'], ['colegio', 'Colegio'], ['curso', 'Curso'],
  ['comuna', 'Comuna'], ['correo', 'Correo'], ['telefono', 'Teléfono'],
  ['code', 'Código'], ['ts', 'Fecha y hora'],
];

// sv-SE da formato YYYY-MM-DD, válido y corto como nombre de pestaña de Excel.
export function diaCL(ts) {
  return new Date(ts).toLocaleDateString('sv-SE', { timeZone: 'America/Santiago' });
}

export function toRow(r) {
  const row = {};
  for (const [key, label] of COLUMNS) {
    row[label] = key === 'ts'
      ? new Date(r.ts).toLocaleString('es-CL', { timeZone: 'America/Santiago' })
      : (r[key] ?? '');
  }
  return row;
}

// Agrupa registros por día (hora de Chile), claves ordenadas ascendente.
export function agruparPorDia(registros) {
  const porDia = new Map();
  for (const r of registros) {
    const key = diaCL(r.ts);
    if (!porDia.has(key)) porDia.set(key, []);
    porDia.get(key).push(r);
  }
  return new Map([...porDia.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function exportRegistrosExcel(registros) {
  const porDia = agruparPorDia(registros);

  const wb = XLSX.utils.book_new();
  for (const [key, dia] of porDia) {
    const sheet = XLSX.utils.json_to_sheet(dia.map(toRow));
    XLSX.utils.book_append_sheet(wb, sheet, key);
  }

  const hoy = diaCL(Date.now());
  XLSX.writeFile(wb, `registros_totem_${hoy}.xlsx`);
}
