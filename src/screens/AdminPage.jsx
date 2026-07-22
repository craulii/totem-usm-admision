import React, { useState } from 'react';
import { ADMIN_TOKEN } from '../config';
import { getConfig, setConfig, getRegistros, getComunas, addColegio } from '../lib/db';

const card = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '16px', padding: '22px 24px', marginBottom: '18px',
};
const h2 = { color: 'white', fontSize: '19px', fontWeight: 700, margin: '0 0 4px' };
const hint = { color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: '0 0 16px', lineHeight: 1.5 };
const input = {
  padding: '12px 14px', fontSize: '16px', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: 'white', outline: 'none',
};

function Restricted() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e', color: 'rgba(255,255,255,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", fontSize: '18px', padding: '24px', textAlign: 'center',
    }}>
      🔒 Acceso restringido. Usa el link privado del panel (con el token correcto).
    </div>
  );
}

export default function AdminPage({ token }) {
  if (token !== ADMIN_TOKEN) return <Restricted />;

  const [config, setCfg] = useState(getConfig);
  const [registros] = useState(getRegistros);
  const [comunas, setComunas] = useState(() => getComunas());
  const [selComuna, setSelComuna] = useState('');
  const [nuevoColegio, setNuevoColegio] = useState('');

  function updateConfig(patch) { setCfg(setConfig(patch)); }
  function handleAddColegio() {
    if (!selComuna || !nuevoColegio.trim()) return;
    addColegio(selComuna, nuevoColegio.trim());
    setComunas(getComunas());
    setNuevoColegio('');
  }

  function handleResetScoreboard() {
    if (!window.confirm('¿Estás seguro de reiniciar el scoreboard? Se borrarán todos los puntajes de todos los juegos.')) return;
    const keys = ['totem_lb_2048', 'totem_lb_memorice', 'totem_lb_primeNinja'];
    for (const k of keys) localStorage.removeItem(k);
  }

  const selObj = comunas.find(c => String(c.id) === String(selComuna));

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", color: 'white',
    }}>
      <style>{`.adm-in:focus{border-color:rgba(0,170,255,.6);} .adm-in option{color:#0a0f1e;}`}</style>

      <header style={{
        background: 'linear-gradient(135deg,#001f4d,#003380)', padding: '22px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '3px' }}>
          Admisión USM — Santiago
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '2px 0 0' }}>Panel de administración</h1>
      </header>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px 60px' }}>
        <div style={{
          background: 'rgba(255,180,0,0.08)', border: '1px solid rgba(255,180,0,0.25)',
          borderRadius: '12px', padding: '14px 18px', marginBottom: '20px',
          color: 'rgba(255,220,150,0.9)', fontSize: '14px', lineHeight: 1.5,
        }}>
          Los cambios se guardan en <b>este dispositivo</b>. Cuando conectemos la base central (Fase 2),
          se sincronizarán entre el celular, el tótem y este panel.
        </div>

        {/* Duración del juego */}
        <section style={card}>
          <h2 style={h2}>Duración de cada partida</h2>
          <p style={hint}>Cuánto dura cada juego antes de mostrar el puntaje.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {[30, 60].map(seg => {
              const active = Number(config.gameDuration) === seg;
              return (
                <button
                  key={seg}
                  onClick={() => updateConfig({ gameDuration: seg })}
                  style={{
                    flex: 1, padding: '18px', borderRadius: '12px', cursor: 'pointer',
                    fontSize: '20px', fontWeight: 800,
                    background: active ? 'linear-gradient(135deg,#003d80,#0060c0)' : 'rgba(255,255,255,0.05)',
                    border: active ? '2px solid #00aaff' : '1px solid rgba(255,255,255,0.15)',
                    color: active ? 'white' : 'rgba(255,255,255,0.6)',
                  }}
                >{seg} segundos</button>
              );
            })}
          </div>
        </section>

        {/* Filtro de comuna */}
        <section style={card}>
          <h2 style={h2}>Comuna del evento</h2>
          <p style={hint}>Si eliges una comuna, el formulario de registro mostrará solo los colegios de esa comuna.</p>
          <select
            className="adm-in"
            value={config.comunaFiltro || ''}
            onChange={e => updateConfig({ comunaFiltro: e.target.value || null })}
            style={{ ...input, width: '100%' }}
          >
            <option value="">Todas las comunas</option>
            {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </section>

        {/* Colegios */}
        <section style={card}>
          <h2 style={h2}>Colegios</h2>
          <p style={hint}>Agrega un colegio que falte. Elige la comuna, escribe el nombre y presiona Agregar.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select className="adm-in" value={selComuna} onChange={e => setSelComuna(e.target.value)} style={{ ...input, flex: '1 1 160px' }}>
              <option value="">Comuna…</option>
              {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <input
              className="adm-in" value={nuevoColegio} onChange={e => setNuevoColegio(e.target.value)}
              placeholder="Nombre del colegio" style={{ ...input, flex: '2 1 200px' }}
            />
            <button
              onClick={handleAddColegio}
              disabled={!selComuna || !nuevoColegio.trim()}
              style={{
                padding: '12px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '15px',
                border: '2px solid #00aaff', background: 'linear-gradient(135deg,#003d80,#0060c0)',
                color: 'white', cursor: 'pointer', opacity: (!selComuna || !nuevoColegio.trim()) ? 0.4 : 1,
              }}
            >Agregar</button>
          </div>
          {selObj && (
            <ul style={{ margin: '14px 0 0', paddingLeft: '20px', color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: 1.8 }}>
              {selObj.colegios.map(n => <li key={n}>{n}</li>)}
            </ul>
          )}
        </section>

        {/* Reiniciar scoreboard */}
        <section style={card}>
          <h2 style={h2}>Reiniciar scoreboard</h2>
          <p style={hint}>Borra todos los puntajes de todos los juegos. El scoreboard del menú se verá vacío hasta que nuevos jugadores registren puntajes.</p>
          <button
            onClick={handleResetScoreboard}
            style={{
              padding: '14px 28px', borderRadius: '10px', fontWeight: 700, fontSize: '15px',
              border: '2px solid rgba(255,80,60,0.6)', background: 'rgba(255,60,40,0.15)',
              color: '#ff6b5a', cursor: 'pointer',
            }}
          >🗑 Reiniciar scoreboard</button>
        </section>

        {/* Registros */}
        <section style={card}>
          <h2 style={h2}>Registros ({registros.length})</h2>
          <p style={hint}>Últimos alumnos registrados desde el QR en este dispositivo.</p>
          {registros.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>Sin registros todavía.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...registros].reverse().map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', gap: '12px',
                  padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.nombre}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                      {r.colegio} · {r.curso} · {r.comuna}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{r.correo} · {r.telefono}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ color: '#ffd700', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", fontWeight: 800, letterSpacing: '2px' }}>{r.code}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>
                      {r.ts ? new Date(r.ts).toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'short', timeStyle: 'short' }) : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
