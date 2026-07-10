import React, { useState, useEffect } from 'react';

const IconCards = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="11" height="14" rx="2"/>
    <path d="M8 6V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-1"/>
  </svg>
);

const IconGrid = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const IconBlade = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    subtitle: 'Encuentra las parejas — Próximamente',
    Icon: IconCards,
    gradient: 'linear-gradient(135deg, #003366 0%, #0055a5 100%)',
    accent: '#4da6ff'
  },
  {
    id: 'primeNinja',
    title: 'Prime Ninja',
    subtitle: 'Corta solo los números primos — Próximamente',
    Icon: IconBlade,
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#4da6ff'
  }
];

function PulseRing({ color }) {
  return (
    <div style={{
      position: 'absolute',
      width: '90px', height: '90px',
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
        borderRadius: '24px',
        padding: '28px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: pressed ? '0 4px 15px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.3)',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.15s ease',
        minHeight: '160px',
        flex: 1,
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

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '90px', height: '90px', flexShrink: 0 }}>
        <PulseRing color={game.accent} />
        <div style={{
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          zIndex: 1
        }}>
          <Icon />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px', margin: '0 0 6px' }}>
          {game.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', margin: 0 }}>
          {game.subtitle}
        </p>
      </div>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Always render Santiago de Chile time regardless of the machine's timezone.
  const TZ = 'America/Santiago';
  const day = now.toLocaleDateString('es-CL', { timeZone: TZ, weekday: 'long' });
  const date = now.toLocaleDateString('es-CL', { timeZone: TZ, day: 'numeric', month: 'long', year: 'numeric' });
  const time = now.toLocaleTimeString('es-CL', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px' }}>{day}</div>
      <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>{date}</div>
      <div style={{ fontSize: '22px', color: 'white', fontWeight: '700', fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>{time}</div>
    </div>
  );
}

const Menu = ({ onSelectGame }) => {
  return (
    <div style={{
      width: '100%', height: '100vh',
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
        padding: '24px 40px',
        display: 'flex', alignItems: 'center', gap: '24px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <div style={{
          width: '72px', height: '72px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          flexShrink: 0, fontSize: '11px',
          color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: '1.3'
        }}>
          LOGO<br/>USM
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '4px' }}>
            Universidad Técnica Federico Santa María
          </div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 }}>
            Admisión USM — Santiago
          </h1>
        </div>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(255,255,255,0.15), transparent)' }} />
      </header>

      <main style={{
        flex: 1, padding: '32px 40px',
        display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <h2 style={{ color: 'white', fontSize: '22px', fontWeight: '600', margin: 0 }}>Selecciona un juego</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginTop: '4px' }}>Toca una tarjeta para comenzar</p>
        </div>
        {games.map((game, i) => (
          <div key={game.id} style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both`, display: 'flex', flex: 1 }}>
            <GameCard game={game} onClick={() => onSelectGame(game.id)} />
          </div>
        ))}
      </main>

      <footer style={{
        background: 'linear-gradient(135deg, #001f4d 0%, #003380 100%)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Clock />
      </footer>
    </div>
  );
};

export default Menu;