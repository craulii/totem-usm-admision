import React, { useEffect, useState } from 'react';
import { getAdminLog } from '../lib/db';

// Página secreta ?secreto=<owner_token>: bitácora de acciones del panel
// admin (config, altas de colegio, export Excel). owner_token no vive en
// el código (a diferencia de ADMIN_TOKEN) — solo en `admin_secrets` y en
// esta URL, así que no hay nada que revisar contra un valor del bundle:
// se intenta el fetch y si el token es inválido la RPC falla sola.
export default function OwnerLogPage({ token }) {
  const [log, setLog] = useState(null); // null = cargando, [] = ok pero vacío, undefined-ish = inválido

  useEffect(() => { getAdminLog(token).then(setLog); }, [token]);

  if (log === null) return null;

  if (!log) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0f1e', color: 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", fontSize: '18px', padding: '24px', textAlign: 'center',
      }}>
        🔒 Token inválido.
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", color: 'white',
    }}>
      <header style={{
        background: 'linear-gradient(135deg,#001f4d,#003380)', padding: '22px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '3px' }}>
          Admisión USM — Santiago
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '2px 0 0' }}>Bitácora admin</h1>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px 60px' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '20px' }}>
          {log.length} acciones registradas (config, altas de colegio, export Excel) desde el panel
          admin. No identifica quién las hizo — el link ?admin=... es compartido, sin login por persona.
        </p>
        {log.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Sin acciones todavía.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {log.map(l => (
              <div key={l.id} style={{
                display: 'flex', justifyContent: 'space-between', gap: '12px',
                padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{l.accion}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{l.detalle}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {new Date(l.creado_en).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
