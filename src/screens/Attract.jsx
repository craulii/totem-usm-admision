import React from 'react';
import { BRAND, logo, bgImage } from '../brand';

// Idle/attract screen: shown when nobody is using the totem. Tapping anywhere
// enters the menu. Branded with the Ensayo Nacional PAES identity to draw people in.
const Attract = ({ onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        position: 'relative',
        width: '100%', height: '100%',
        backgroundImage: `linear-gradient(rgba(11,23,64,0.5), rgba(11,23,64,0.6)), url(${bgImage()})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: BRAND.bg,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(28px, 5vh, 56px)',
        cursor: 'pointer', overflow: 'hidden',
        fontFamily: BRAND.font,
      }}
    >
      <style>{`
        @keyframes attractPulse { 0%,100% { opacity: 0.45; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }
        @keyframes attractFloat { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* USM institutional logo (white on the dark background) */}
      <img
        src={logo('usm-blanco.png')}
        alt="Universidad Técnica Federico Santa María"
        style={{ height: 'clamp(56px, 9vh, 104px)', width: 'auto', animation: 'attractFloat 0.6s ease both' }}
      />

      {/* Ensayo Nacional PAES logo — reads fine directly on the dark background */}
      <img
        src={logo('logo-ensayo.png')}
        alt="Ensayo Nacional PAES"
        style={{ width: 'clamp(280px, 60vw, 620px)', height: 'auto', animation: 'attractFloat 0.6s ease 0.1s both' }}
      />

      {/* Tap hint */}
      <div style={{
        color: BRAND.accentYellow, fontSize: 'clamp(20px, 3.4vh, 40px)', fontWeight: 700,
        letterSpacing: '0.5px', textAlign: 'center',
        textShadow: '0 2px 12px rgba(0,0,0,0.6)',
        animation: 'attractPulse 1.8s ease-in-out infinite',
      }}>
        Toca la pantalla para comenzar
      </div>

      {/* Credit footer */}
      <div style={{
        position: 'absolute', bottom: 'clamp(10px, 2vh, 18px)', left: 0, right: 0,
        textAlign: 'center', color: 'rgba(255,255,255,0.45)',
        fontSize: 'clamp(9px, 1.1vh, 12px)', letterSpacing: '0.5px',
      }}>
        Hecho por Christian Riquelme y Jose Vega — estudiantes de Ingenieria Civil Telematica USM
      </div>
    </div>
  );
};

export default Attract;
