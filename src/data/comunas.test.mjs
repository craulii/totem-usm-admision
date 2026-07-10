// Sanity tests for the mock comunas/colegios data the registration form relies on.
import { test } from 'node:test';
import assert from 'node:assert';
import { COMUNAS, CURSOS } from './comunas.mjs';

test('every comuna has an id, name and at least one colegio', () => {
  assert.ok(COMUNAS.length > 0);
  for (const c of COMUNAS) {
    assert.equal(typeof c.id, 'number');
    assert.ok(c.nombre && typeof c.nombre === 'string');
    assert.ok(Array.isArray(c.colegios) && c.colegios.length > 0, `${c.nombre} sin colegios`);
  }
});

test('comuna ids are unique', () => {
  const ids = COMUNAS.map(c => c.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('CURSOS includes the courses required by the client', () => {
  for (const req of ['7° básico', '8° básico', 'I medio', 'IV medio', 'Egresado', 'Profesor']) {
    assert.ok(CURSOS.includes(req), `falta curso: ${req}`);
  }
});
