import React, { useState } from 'react';
import { CURSOS } from '../data/comunas';
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

const OTROS = '__OTROS__';

export default function Register({ comunas, submitting, submitError, onSubmit, onCancel }) {
  const [comunaId, setComunaId] = useState('');
  const [colegioSel, setColegioSel] = useState('');
  const [colegioManual, setColegioManual] = useState('');
  const [curso, setCurso] = useState('');
  const [nombre, setNombre] = useState('');
  const [rut, setRut] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [errors, setErrors] = useState({});

  const comuna = comunas.find(c => String(c.id) === String(comunaId));
  // Se ve en MAYÚSCULAS en pantalla; se guarda en minúscula recién al enviar
  // (registrar_alumno normaliza), así que acá no hay que tocar el casing.
  const colegioOptions = comuna
    ? [...comuna.colegios].map(c => c.toUpperCase()).sort((a, b) => a.localeCompare(b, 'es'))
    : [];
  const colegio = colegioSel === OTROS ? colegioManual.trim() : colegioSel;

  function validate() {
    const e = {};
    if (!comunaId) e.comuna = 'Selecciona tu comuna';
    if (!colegio) e.colegio = 'Selecciona tu colegio (o "Otros" si no aparece)';
    if (!curso) e.curso = 'Selecciona tu curso';
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre';
    if (!validateRut(rut)) e.rut = 'RUT inválido';
    if (!validateEmail(correo)) e.correo = 'Correo inválido';
    if (!validatePhone(telefono)) e.telefono = 'Teléfono inválido (9 dígitos)';
    return e;
  }

  function handleSubmit() {
    if (submitting) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      comunaId: comuna.id, comuna: comuna.nombre,
      colegio, curso,
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
            onChange={e => { setComunaId(e.target.value); setColegioSel(''); setColegioManual(''); }}
            style={inputStyle}
          >
            <option value="">— Selecciona tu comuna —</option>
            {comunas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>

        <Field label="Colegio" error={errors.colegio}>
          <select
            className="reg-in"
            value={colegioSel}
            onChange={e => { setColegioSel(e.target.value); setColegioManual(''); }}
            disabled={!comuna}
            style={{ ...inputStyle, opacity: comuna ? 1 : 0.5 }}
          >
            <option value="">{comuna ? '— Selecciona tu colegio —' : 'Primero elige tu comuna'}</option>
            {colegioOptions.map(c => <option key={c} value={c}>{c}</option>)}
            <option value={OTROS}>OTROS (ESCRIBA SU COLEGIO)</option>
          </select>
          {colegioSel === OTROS && (
            <input
              className="reg-in"
              value={colegioManual}
              onChange={e => setColegioManual(e.target.value)}
              placeholder="Escribe el nombre de tu colegio"
              style={{ ...inputStyle, marginTop: '10px' }}
            />
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

        {submitError && (
          <div style={{
            marginTop: '16px', padding: '14px 16px', borderRadius: '12px',
            background: 'rgba(255,80,60,0.1)', border: '1px solid rgba(255,80,60,0.3)',
            color: '#ff6b6b', fontSize: '14px', lineHeight: 1.5,
          }}>{submitError}</div>
        )}
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
          disabled={submitting}
          style={{
            flex: 1, padding: '16px 24px',
            background: 'linear-gradient(135deg,#003d80,#0060c0)',
            border: '2px solid #00aaff', borderRadius: '12px',
            color: 'white', fontSize: '18px', fontWeight: 800,
            letterSpacing: '1px', textTransform: 'uppercase', cursor: submitting ? 'default' : 'pointer',
            boxShadow: '0 0 18px rgba(0,170,255,0.35)', opacity: submitting ? 0.6 : 1,
          }}
        >{submitting ? 'Enviando…' : 'Comenzar juego'}</button>
      </footer>
    </div>
  );
}
