// Tests for the export-to-Excel grouping logic. Run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert';
import { diaCL, toRow, agruparPorDia } from './exportExcel.mjs';

const R1 = { nombre: 'Ana', rut: '11.111.111-1', colegio: 'Liceo A', curso: '4A',
  comuna: 'Santiago', correo: 'ana@x.cl', telefono: '+56911111111', code: 'ABCD',
  ts: '2026-07-24T14:00:00.000Z' }; // 11:00 CLT (UTC-3)
const R2 = { nombre: 'Beto', rut: '22.222.222-2', colegio: 'Liceo B', curso: '3B',
  comuna: 'Ñuñoa', correo: 'beto@x.cl', telefono: '+56922222222', code: 'EFGH',
  ts: '2026-07-25T02:00:00.000Z' }; // 23:00 CLT del día 24

test('diaCL formatea en hora de Chile, no UTC', () => {
  assert.equal(diaCL(R1.ts), '2026-07-24');
  assert.equal(diaCL(R2.ts), '2026-07-24'); // 02:00 UTC == 23:00 CLT día anterior
});

test('toRow mapea a columnas en español y castea undefined a string vacío', () => {
  const row = toRow(R1);
  assert.equal(row['Nombre'], 'Ana');
  assert.equal(row['RUT'], '11.111.111-1');
  assert.equal(row['Colegio'], 'Liceo A');
  assert.ok(row['Fecha y hora'].includes('2026'));
  assert.equal(toRow({ ts: R1.ts })['Nombre'], '');
});

test('agruparPorDia junta registros del mismo día y ordena las claves', () => {
  const R3 = { ...R1, ts: '2026-07-23T14:00:00.000Z' };
  const grupos = agruparPorDia([R1, R2, R3]);
  assert.deepEqual([...grupos.keys()], ['2026-07-23', '2026-07-24']);
  assert.equal(grupos.get('2026-07-24').length, 2);
});

test('agruparPorDia con lista vacía no revienta', () => {
  assert.equal(agruparPorDia([]).size, 0);
});
