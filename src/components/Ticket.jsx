import React from 'react';
import { logo } from '../brand';

// Ticket shown on the phone after registering. The student shows it to the
// staff member next to the totem, who checks it manually and lets them play.
export default function Ticket({ student, code, onDone }) {
  const fecha = new Date().toLocaleString('es-CL', {
    timeZone: 'America/Santiago', dateStyle: 'long', timeStyle: 'short',
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', boxSizing: 'border-box',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`@keyframes ticketIn { from { opacity:0; transform:translateY(16px);} to {opacity:1; transform:translateY(0);} }`}</style>

      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'linear-gradient(160deg,#001f4d,#00294f)',
        border: '1px solid rgba(0,170,255,0.3)', borderRadius: '22px',
        padding: '32px 28px', boxShadow: '0 12px 50px rgba(0,0,0,0.5)',
        textAlign: 'center', animation: 'ticketIn 0.4s ease',
      }}>
        {/* Co-brand header (dark card → white logos) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '18px' }}>
          <img src={logo('usm-blanco.png')} alt="USM" style={{ height: '40px', width: 'auto' }} />
          <div style={{ width: '1px', height: '34px', background: 'rgba(255,255,255,0.18)' }} />
          <img src={logo('mujeres-blanco.png')} alt="+Mujeres en STEM" style={{ height: '34px', width: 'auto' }} />
        </div>

        <div style={{ fontSize: '46px', lineHeight: 1 }}>🎫</div>
        <div style={{ color: '#00d68f', fontSize: '20px', fontWeight: 800, marginTop: '8px', letterSpacing: '0.5px' }}>
          ¡Registro exitoso!
        </div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginTop: '4px' }}>
          Ticket de juego
        </div>

        <div style={{
          margin: '22px 0', padding: '18px',
          background: 'rgba(255,215,0,0.08)', border: '1px dashed rgba(255,215,0,0.45)',
          borderRadius: '14px',
        }}>
          <div style={{ color: 'rgba(255,215,0,0.6)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Código
          </div>
          <div style={{
            color: '#ffd700', fontSize: '44px', fontWeight: 900, letterSpacing: '8px',
            fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif", textShadow: '0 0 20px rgba(255,215,0,0.4)',
          }}>{code}</div>
        </div>

        <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.85)', fontSize: '16px', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, fontSize: '19px' }}>{student.nombre}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>{student.colegio}</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>{student.curso} · {student.comuna}</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginTop: '6px' }}>{fecha}</div>
        </div>

        <div style={{
          marginTop: '22px', padding: '14px', borderRadius: '12px',
          background: 'rgba(0,170,255,0.1)', border: '1px solid rgba(0,170,255,0.2)',
          color: '#8fd3ff', fontSize: '15px', lineHeight: 1.5,
        }}>
          Muestra este ticket al encargado del tótem para jugar.
        </div>

        <button
          onClick={onDone}
          onTouchEnd={e => { e.preventDefault(); onDone(); }}
          style={{
            marginTop: '20px', width: '100%', padding: '14px',
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px', color: 'rgba(255,255,255,0.6)', fontSize: '15px',
            fontWeight: 700, letterSpacing: '1px', cursor: 'pointer',
          }}
        >Registrar a otra persona</button>
      </div>
    </div>
  );
}
