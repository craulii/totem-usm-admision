import React, { useState, useEffect } from 'react';

// Sizes use clamp(min, preferred, max) so the whole menu scales with the
// viewport and always fits — phone, tablet, desktop or the 42" portalotem —
// without ever producing a scrollbar. The flex tree uses minHeight:0 on the
// growable rows so they shrink instead of overflowing.

const IconCards = () => (
  <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="11" height="14" rx="2"/>
    <path d="M8 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1"/>
  </svg>
);

const IconGrid = () => (
  <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconBlade = () => (
  <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21L18 6"/>
    <path d="M14 3l7 7-3.5 1.5L12.5 6.5z"/>
    <circle cx="6" cy="18" r="2"/>
  </svg>
);

const games = [
  {
    id: '2048',
    title: '2048 USM',
    subtitle: 'Combina las fichas y llega a 2187 (3⁷)',
    Icon: IconGrid,
    gradient: 'linear-gradient(135deg, #0055a5 0%, #0077cc 100%)',
    accent: '#80c4ff'
  },
  {
    id: 'memorice',
    title: 'Memorice',
    subtitle: 'Encuentra las parejas',
    Icon: IconCards,
    gradient: 'linear-gradient(135deg, #003366 0%, #0055a5 100%)',
    accent: '#4da6ff'
  },
  {
    id: 'primeNinja',
    title: 'Prime Ninja',
    subtitle: 'Corta solo los números primos',
    Icon: IconBlade,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#4da6ff'
  }
];

function PulseRing({ color }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      animation: 'pulseRing 2s ease-out infinite',
      opacity: 0.6
    }} />
  );
}

function GameCard({ game, onClick }) {
  const [pressed, setPressed] = useState(false);
  const Icon = game.Icon;

  return (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => { setPressed(false); onClick(); }}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => { setPressed(false); onClick(); }}
      style={{
        background: game.gradient,
        borderRadius: 'clamp(14px, 2vh, 24px)',
        padding: 'clamp(8px, 1.6vh, 24px) clamp(16px, 4vw, 40px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(6px, 1.2vh, 16px)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: pressed ? '0 4px 15px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.3)',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.15s ease',
        height: '100%',
        minHeight: 0,
        width: '100%',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%',
        width: '60%', height: '200%',
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
        animation: 'shimmer 3s infinite',
        pointerEvents: 'none'
      }} />

      {/* Icon is decorative → it shrinks first (flexShrink:1) so the text below
          it is never clipped by the card. aspectRatio keeps it circular while it
          scales. */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 'clamp(40px, 7vh, 72px)', aspectRatio: '1',
        flexShrink: 1, minHeight: 0
      }}>
        <PulseRing color={game.accent} />
        <div style={{
          width: '88%', height: '88%',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 1
        }}>
          <Icon />
        </div>
      </div>

      <div style={{ textAlign: 'center', minWidth: 0, flexShrink: 0 }}>
        <h2 style={{
          color: 'white', fontSize: 'clamp(16px, 2.6vh, 28px)', fontWeight: '700',
          letterSpacing: '-0.5px', margin: '0 0 clamp(2px, 0.6vh, 6px)'
        }}>
          {game.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(11px, 1.6vh, 16px)', margin: 0, lineHeight: 1.25 }}>
          {game.subtitle}
        </p>
      </div>
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
  const day = now.toLocaleDateString('es-CL', { timeZone: TZ, weekday: 'long' });
  const date = now.toLocaleDateString('es-CL', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('es-CL', { timeZone: TZ, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ textAlign: align, flexShrink: 0, whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: 'clamp(9px, 1.2vh, 12px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>{day}</div>
      <div style={{ fontSize: 'clamp(10px, 1.4vh, 14px)', color: 'rgba(255,255,255,0.8)', marginTop: '1px' }}>{date}</div>
      <div style={{ fontSize: 'clamp(15px, 2vh, 22px)', color: 'white', fontWeight: '700', fontVariantNumeric: 'tabular-nums', marginTop: '1px' }}>{time}</div>
    </div>
  );
}

const Menu = ({ onSelectGame }) => {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0a0f1e',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.7; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.9); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <header style={{
        background: 'linear-gradient(135deg, #001f4d 0%, #003380 100%)',
        padding: 'clamp(12px, 2.2vh, 24px) clamp(16px, 4vw, 40px)',
        display: 'flex', alignItems: 'center', gap: 'clamp(14px, 2.5vw, 24px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        flexShrink: 0, overflow: 'hidden'
      }}>
        <div style={{
          width: 'clamp(48px, 7vh, 72px)', height: 'clamp(48px, 7vh, 72px)',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0, fontSize: 'clamp(9px, 1.3vh, 11px)',
          color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: '1.3'
        }}>
          LOGO<br/>USM
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 'clamp(9px, 1.3vh, 12px)', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '4px' }}>
            Universidad Técnica Federico Santa María
          </div>
          <h1 style={{ color: 'white', fontSize: 'clamp(18px, 3vh, 28px)', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 }}>
            Admisión USM — Santiago
          </h1>
        </div>
        <div style={{ flex: 1, minWidth: 'clamp(6px, 2vw, 24px)' }} />
        <Clock align="right" />
      </header>

      <main style={{
        flex: 1, minHeight: 0, padding: 'clamp(12px, 2.5vh, 32px) clamp(16px, 4vw, 40px)',
        display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 20px)', justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 22px)',
          background: 'linear-gradient(135deg, rgba(0,85,165,0.28), rgba(0,40,90,0.4))',
          border: '1px solid rgba(0,170,255,0.28)', borderRadius: 'clamp(12px, 2vh, 20px)',
          padding: 'clamp(10px, 1.6vh, 18px) clamp(14px, 2vw, 24px)',
          flexShrink: 0
        }}>
          <div style={{ background: 'white', padding: 'clamp(6px, 1vh, 10px)', borderRadius: 'clamp(10px, 1.5vh, 14px)', flexShrink: 0, lineHeight: 0 }}>
            <img
              src={`${import.meta.env.BASE_URL}qr-registro.png`}
              alt="Código QR de registro"
              style={{ display: 'block', width: 'clamp(100px, 17vh, 190px)', height: 'clamp(100px, 17vh, 190px)', imageRendering: 'pixelated' }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'white', fontSize: 'clamp(16px, 2.6vh, 24px)', fontWeight: 800, marginBottom: 'clamp(2px, 0.6vh, 6px)', letterSpacing: '-0.3px' }}>
              Regístrate para jugar
            </div>
            <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 'clamp(12px, 1.7vh, 16px)', lineHeight: 1.4 }}>
              Escanea el código con tu celular, completa tus datos y muestra tu <b>ticket</b> al encargado.
            </div>
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(17px, 2.4vh, 22px)', fontWeight: '600', margin: 0 }}>Selecciona un juego</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(12px, 1.5vh, 14px)', marginTop: '4px' }}>Toca una tarjeta para comenzar</p>
        </div>

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 1.8vh, 20px)' }}>
          {games.map((game, i) => (
            <div key={game.id} style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both`, display: 'flex', flex: 1, minHeight: 0 }}>
              <GameCard game={game} onClick={() => onSelectGame(game.id)} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Menu;
