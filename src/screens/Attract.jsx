import React from 'react';
import { BRAND, logo } from '../brand';

// Idle/attract screen: shown when nobody is using the totem. Tapping anywhere
// enters the menu. Branded with the campaign (+Mujeres en STEM) to draw people in.
const Attract = ({ onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        width: '100%', height: '100%',
        // navy base with a soft purple/cyan campaign glow
        background: `radial-gradient(circle at 50% 32%, ${BRAND.purple}44 0%, transparent 55%),
                     radial-gradient(circle at 50% 82%, ${BRAND.cyan}2e 0%, transparent 50%),
                     linear-gradient(160deg, #0a0f1e 0%, #0b1430 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 'clamp(28px, 5vh, 56px)',
        cursor: 'pointer', overflow: 'hidden',
        fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
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

      {/* Campaign logo (full colour → on a white card so its black text reads) */}
      <div style={{
        background: 'white', borderRadius: 'clamp(18px, 3vh, 32px)',
        padding: 'clamp(22px, 4vh, 48px) clamp(26px, 5vw, 64px)',
        boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 0 1px ${BRAND.purple}55`,
        animation: 'attractFloat 0.6s ease 0.1s both',
      }}>
        <img
          src={logo('mujeres-color.png')}
          alt="+Mujeres en STEM"
          style={{ display: 'block', width: 'clamp(280px, 60vw, 620px)', height: 'auto' }}
        />
      </div>

      {/* Tap hint */}
      <div style={{
        color: 'white', fontSize: 'clamp(20px, 3.4vh, 40px)', fontWeight: 700,
        letterSpacing: '0.5px', textAlign: 'center',
        animation: 'attractPulse 1.8s ease-in-out infinite',
      }}>
        Toca la pantalla para comenzar
      </div>
    </div>
  );
};

export default Attract;
