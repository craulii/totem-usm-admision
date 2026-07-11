// Prime check + spawn-value helper for Prime Ninja. Pure logic, no React — so the
// game AND prime.test.mjs (npm test / node:test) can both import it.

export function isPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// Numbers thrown into play. ~half primes so the player always has targets.
// ponytail: fixed 2–99 range + 0.5 ratio are tuning knobs; adjust on the real tablet.
const MIN = 2, MAX = 99;

export function spawnValue(primeRatio = 0.5, rnd = Math.random) {
  const wantPrime = rnd() < primeRatio;
  // Rejection sampling — the range is tiny so this is cheap.
  for (let tries = 0; tries < 50; tries++) {
    const n = MIN + Math.floor(rnd() * (MAX - MIN + 1));
    if (isPrime(n) === wantPrime) return n;
  }
  return wantPrime ? 7 : 8; // fallback, should never hit
}
