// Tests for Prime Ninja's number logic. Run with `npm test` (node:test, no deps).
import { test } from 'node:test';
import assert from 'node:assert';
import { isPrime, spawnValue } from './prime.mjs';

test('isPrime edge cases', () => {
  assert.equal(isPrime(0), false, '0 is not prime');
  assert.equal(isPrime(1), false, '1 is not prime');
  assert.equal(isPrime(2), true, '2 is prime');
  assert.equal(isPrime(3), true, '3 is prime');
  assert.equal(isPrime(-7), false, 'negatives are not prime');
  assert.equal(isPrime(2.5), false, 'non-integers are not prime');
});

test('isPrime rejects composites', () => {
  for (const n of [4, 9, 15, 21, 25, 91, 99]) {
    assert.equal(isPrime(n), false, `${n} is composite`);
  }
});

test('isPrime accepts primes', () => {
  for (const n of [5, 7, 13, 29, 61, 97]) {
    assert.equal(isPrime(n), true, `${n} is prime`);
  }
});

test('spawnValue honors the requested primality', () => {
  for (let i = 0; i < 100; i++) {
    assert.equal(isPrime(spawnValue(1)), true, 'ratio 1 must yield a prime');
    assert.equal(isPrime(spawnValue(0)), false, 'ratio 0 must yield a composite');
  }
});
