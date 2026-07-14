import React, { useState } from 'react';
import { CURSOS } from '../data/comunas';
import { getComunas } from '../lib/db';
import { validateRut, formatRut, validateEmail, validatePhone } from '../lib/validation';
import { logo } from '../brand';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '15px 18px', fontSize: '19px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px', color: 'white',
  fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
  outline: 'none',
};

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', color: 'rgba(255,255,255,0.72)', fontSize: '14px', fontWeight: 600, marginBottom: '7px', letterSpacing: '0.3px' }}>
        {label}
      </label>
      {children}
      {error && <div style={{ color: '#ff6b6b', fontSize: '13px', marginTop: '6px' }}>{error}</div>}
    </div>
  );
}

export default function Register({ onSubmit, onCancel }) {
  const [comunaId, setComunaId] = useState('');
  const [colegio, setColegio] = useState('');
  const [curso, setCurso] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errors, setErrors] = useState({});
  const [comunas] = useState(() => getComunas({ applyFilter: true }));

  const comuna = comunas.find(c => String(c.id) === String(comunaId));
  const query = colegio.trim().toLowerCase();
  const suggestions = comuna && query
    ? comuna.colegios.filter(x => x.toLowerCase().includes(query) && x.toLowerCase() !== query).slice(0, 5)
    : [];

  function validate() {
    const e = {};
    if (!comunaId) e.comuna = 'Selecciona tu comuna';
    if (!colegio.trim()) e.colegio = 'Ingresa tu colegio';
    if (!curso) e.curso = 'Selecciona tu curso';
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre';
    if (!validateRut(rut)) e.rut = 'RUT inválido';
    if (!validateEmail(correo)) e.correo = 'Correo inválido';
    if (!validatePhone(telefono)) e.telefono = 'Teléfono inválido (9 dígitos)';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      comunaId: comuna.id, comuna: comuna.nombre,
      colegio: colegio.trim(), curso,
      nombre: nombre.trim(), rut: formatRut(rut),
      correo: correo.trim(), telefono: telefono.replace(/\s/g, ''),
    });
  }

  return (
    <div style={{
      width: '100%', height: '100vh', background: '#0a0f1e',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <style>{`
        .reg-in::placeholder { color: rgba(255,255,255,0.32); }
        .reg-in:focus { border-color: rgba(0,170,255,0.6); background: rgba(0,120,255,0.08); }
        .reg-in option { color: #0a0f1e; }
      `}</style>

      <header style={{
        background: 'linear-gradient(135deg, #001f4d 0%, #003380 100%)',
        padding: '22px 32px', borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)', flexShrink: 0,
      }}>
        {/* Co-brand (dark header → white logos) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <img src={logo('usm-blanco.png')} alt="USM" style={{ height: '44px', width: 'auto' }} />
          <div style={{ flex: 1 }} />
          <img src={logo('mujeres-blanco.png')} alt="+Mujeres en STEM" style={{ height: '36px', width: 'auto' }} />
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '4px' }}>
          Admisión USM — Santiago
        </div>
        <h1 style={{ color: 'white', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>
          Regístrate para jugar
        </h1>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        <Field label="Comuna" error={errors.comuna}>
          <select
            className="reg-in"
            value={comunaId}
            onChange={e => { setComunaId(e.target.value); setColegio(''); }}
            style={inputStyle}
          >
            <option value="">— Selecciona tu comuna —</option>
            {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>

        <Field label="Colegio" error={errors.colegio}>
          <input
            className="reg-in"
            value={colegio}
            onChange={e => setColegio(e.target.value)}
            placeholder={comuna ? 'Escribe para buscar tu colegio…' : 'Primero elige tu comuna'}
            disabled={!comuna}
            style={{ ...inputStyle, opacity: comuna ? 1 : 0.5 }}
          />
          {suggestions.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setColegio(s)}
                  onTouchEnd={e => { e.preventDefault(); setColegio(s); }}
                  style={{
                    textAlign: 'left', padding: '12px 16px',
                    background: 'rgba(0,120,255,0.12)', border: '1px solid rgba(0,150,255,0.25)',
                    borderRadius: '10px', color: '#cce5ff', fontSize: '17px', cursor: 'pointer',
                  }}
                >{s}</button>
              ))}
            </div>
          )}
        </Field>

        <Field label="Curso" error={errors.curso}>
          <select className="reg-in" value={curso} onChange={e => setCurso(e.target.value)} style={inputStyle}>
            <option value="">— Selecciona tu curso —</option>
            {CURSOS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Nombre completo" error={errors.nombre}>
          <input className="reg-in" value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre y apellido" style={inputStyle} />
        </Field>

        <Field label="RUT" error={errors.rut}>
          <input className="reg-in" value={rut}
            onChange={e => setRut(e.target.value)}
            onBlur={() => rut.trim() && setRut(formatRut(rut))}
            placeholder="12.345.678-9" inputMode="text" style={inputStyle} />
        </Field>

        <Field label="Correo" error={errors.correo}>
          <input className="reg-in" value={correo} onChange={e => setCorreo(e.target.value)}
            type="email" placeholder="tu@correo.cl" inputMode="email" style={inputStyle} />
        </Field>

        <Field label="Teléfono" error={errors.telefono}>
          <input className="reg-in" value={telefono} onChange={e => setTelefono(e.target.value)}
            type="tel" placeholder="9 1234 5678" inputMode="tel" style={inputStyle} />
        </Field>

        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '4px', lineHeight: 1.5 }}>
          Tus datos se usan solo para el proceso de admisión USM (Ley 19.628).
        </div>
      </main>

      <footer style={{
        flexShrink: 0, display: 'flex', gap: '14px', padding: '18px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,10,30,0.6)',
      }}>
        <button
          onClick={onCancel}
          onTouchEnd={e => { e.preventDefault(); onCancel(); }}
          style={{
            padding: '16px 24px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.18)', borderRadius: '12px',
            color: 'rgba(255,255,255,0.6)', fontSize: '16px', fontWeight: 700,
            letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
          }}
        >Cancelar</button>
        <button
          onClick={handleSubmit}
          onTouchEnd={e => { e.preventDefault(); handleSubmit(); }}
          style={{
            flex: 1, padding: '16px 24px',
            background: 'linear-gradient(135deg,#003d80,#0060c0)',
            border: '2px solid #00aaff', borderRadius: '12px',
            color: 'white', fontSize: '18px', fontWeight: 800,
            letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 0 18px rgba(0,170,255,0.35)',
          }}
        >Comenzar juego</button>
      </footer>
    </div>
  );
}
