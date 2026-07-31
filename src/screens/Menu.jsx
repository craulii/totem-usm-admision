import React, { useState, useEffect } from 'react';
import { BRAND, logo, bgImage } from '../brand';
import { getCoBrandLogo } from '../lib/db';
import ScoreboardSidebar from '../components/ScoreboardSidebar';

// Vertical/portrait layout for the 42" totem: logos → QR panel → game buttons
// → ranking panel, stacked top to bottom. Sizes use clamp(min, preferred, max)
// so the whole stack scales with the viewport and always fits without scroll.

const games = [
  { id: '2048', title: '6561' },
  { id: 'primeNinja', title: 'Prime Ninja' },
  { id: 'memorice', title: 'Memorice' },
];

function GameButton({ game, onClick }) {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onClick(); }}
      style={{
        background: BRAND.gradientButton,
        border: '3px solid white',
        borderRadius: 'clamp(18px, 2.5vh, 28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: pressed ? '0 4px 15px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.3)',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.15s ease',
        height: '100%', minHeight: 0, width: '100%',
      }}
    >
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%',
        width: '60%', height: '200%',
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
        animation: 'shimmer 3s infinite',
        pointerEvents: 'none',
      }} />
      <h2 style={{
        position: 'relative',
        color: BRAND.textOnLight, fontSize: 'clamp(20px, 3.4vh, 34px)', fontWeight: 900,
        letterSpacing: '1px', textTransform: 'uppercase', margin: 0, textAlign: 'center',
        fontFamily: BRAND.font,
      }}>
        {game.title}
      </h2>
    </div>
  );
}

function Clock({ align = 'center' }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Always render Santiago de Chile time regardless of the machine's timezone.
  const TZ = 'America/Santiago';
  const time = now.toLocaleTimeString('es-CL', { timeZone: TZ, hour12: false, hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ textAlign: align, flexShrink: 0, whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: 'clamp(14px, 2vh, 20px)', color: 'white', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{time}</div>
    </div>
  );
}

const Menu = ({ onSelectGame }) => {
  const [coBrandLogo] = useState(getCoBrandLogo); // admin-configurable, read once al montar
  return (
    <div style={{
      width: '100%', height: '100%',
      backgroundImage: `linear-gradient(rgba(11,23,64,0.55), rgba(11,23,64,0.6)), url(${bgImage()})`,
      backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: BRAND.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: BRAND.font,
      overflow: 'hidden',
      padding: 'clamp(12px, 2vh, 24px) clamp(14px, 3vw, 28px)',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header: institutional + Ensayo logos, small clock */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 'clamp(10px, 2vw, 20px)', flexShrink: 0,
        paddingBottom: 'clamp(10px, 1.6vh, 18px)',
      }}>
        <img
          src={logo('usm-blanco.png')}
          alt="Universidad Técnica Federico Santa María"
          style={{ height: 'clamp(32px, 5vh, 48px)', width: 'auto', flexShrink: 0, display: 'block' }}
        />
        <img
          src={coBrandLogo}
          alt="Imagen de marca"
          style={{ height: 'clamp(30px, 4.5vh, 44px)', width: 'auto', flexShrink: 1, minWidth: 0, objectFit: 'contain' }}
        />
        <Clock align="right" />
      </header>

      {/* QR panel */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 22px)',
        background: BRAND.purple,
        border: '3px solid white', borderRadius: 'clamp(16px, 2.2vh, 24px)',
        padding: 'clamp(10px, 1.6vh, 18px) clamp(14px, 2vw, 24px)',
        flexShrink: 0, marginBottom: 'clamp(12px, 2vh, 20px)',
      }}>
        <div style={{ background: 'white', padding: 'clamp(6px, 1vh, 10px)', borderRadius: 'clamp(10px, 1.5vh, 14px)', flexShrink: 0, lineHeight: 0 }}>
          <img
            src={`${import.meta.env.BASE_URL}qr-registro.png`}
            alt="Código QR de registro"
            style={{ display: 'block', width: 'clamp(84px, 13vh, 140px)', height: 'clamp(84px, 13vh, 140px)', imageRendering: 'pixelated' }}
          />
        </div>
        {/* Kept on the legacy font/on purpose — QR instructions are excluded from the reskin */}
        <div style={{ minWidth: 0, fontFamily: BRAND.fontLegacy }}>
          <div style={{ color: 'white', fontSize: 'clamp(15px, 2.2vh, 21px)', fontWeight: 800, marginBottom: 'clamp(2px, 0.6vh, 6px)', letterSpacing: '-0.3px' }}>
            Regístrate para jugar
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'clamp(11px, 1.5vh, 15px)', lineHeight: 1.35 }}>
            Escanea el código con tu celular, completa tus datos y muestra tu <b>ticket</b> al encargado.
          </div>
        </div>
      </div>

      {/* Game buttons */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 18px)' }}>
        {games.map((game, i) => (
          <div key={game.id} style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both`, display: 'flex', flex: 1, minHeight: 0 }}>
            <GameButton game={game} onClick={() => onSelectGame(game.id)} />
          </div>
        ))}
      </div>

      <ScoreboardSidebar />

      {/* Credit footer */}
      <div style={{
        flexShrink: 0, textAlign: 'center', marginTop: 'clamp(4px, 0.8vh, 8px)',
        color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(8px, 1vh, 10px)', letterSpacing: '0.3px',
      }}>
        Hecho por Christian Riquelme y Jose Vega — estudiantes de Ingenieria Civil Telematica USM
      </div>
    </div>
  );
};

export default Menu;
