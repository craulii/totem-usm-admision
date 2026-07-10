// Field validators for the registration form (Fase 1).
// .mjs so the Node self-check can import it as ESM (project has no "type":"module").

// ── RUT (Chilean national ID), módulo 11 ────────────────────────────────────
export function cleanRut(rut) {
  return String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
}

export function validateRut(rut) {
  const c = cleanRut(rut);
  if (c.length < 2) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  if (!/^\d+$/.test(body)) return false;

  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const expected = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dv === expected;
}

export function formatRut(rut) {
  const c = cleanRut(rut);
  if (c.length < 2) return c;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
}

// ── Email ───────────────────────────────────────────────────────────────────
export function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

// ── Chilean phone: 9 digits (09XXXXXXXX mobile), optional +56 prefix ─────────
export function validatePhone(v) {
  const d = String(v).replace(/\D/g, '');
  return d.length === 9 || (d.length === 11 && d.startsWith('56'));
}
