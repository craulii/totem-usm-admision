// Tests for the registration validators. Run with `npm test` (node:test, no deps).
import { test } from 'node:test';
import assert from 'node:assert';
import { validateRut, formatRut, validateEmail, validatePhone, cleanRut } from './validation.mjs';

test('validateRut accepts valid RUTs (numeric, K and 0 check digits)', () => {
  assert.ok(validateRut('11.111.111-1'), 'numeric DV');
  assert.ok(validateRut('12.345.678-5'), 'numeric DV 2');
  assert.ok(validateRut('23-K'), 'K check digit (módulo 11 edge)');
  assert.ok(validateRut('6-K'), 'another K case');
});

test('validateRut rejects invalid RUTs', () => {
  assert.ok(!validateRut('11.111.111-2'), 'wrong DV');
  assert.ok(!validateRut('12.345.678-9'), 'wrong DV 2');
  assert.ok(!validateRut('foo'), 'junk');
  assert.ok(!validateRut('1'), 'too short');
  assert.ok(!validateRut(''), 'empty');
});

test('cleanRut strips punctuation and uppercases', () => {
  assert.equal(cleanRut('12.345.678-k'), '12345678K');
});

test('formatRut adds thousands separators and dash', () => {
  assert.equal(formatRut('111111111'), '11.111.111-1');
  assert.equal(formatRut('123456785'), '12.345.678-5');
  assert.equal(formatRut('23K'), '23-K');
});

test('validateEmail', () => {
  assert.ok(validateEmail('a.b@usm.cl'));
  assert.ok(validateEmail('estudiante@gmail.com'));
  assert.ok(!validateEmail('a@b'), 'needs TLD');
  assert.ok(!validateEmail('nope'));
  assert.ok(!validateEmail('a @b.cl'), 'no spaces');
});

test('validatePhone (Chilean: 9 digits, optional +56)', () => {
  assert.ok(validatePhone('9 1234 5678'));
  assert.ok(validatePhone('912345678'));
  assert.ok(validatePhone('+56 9 1234 5678'));
  assert.ok(!validatePhone('123'), 'too short');
  assert.ok(!validatePhone('12345678'), '8 digits');
});
