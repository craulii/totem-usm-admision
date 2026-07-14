import React from 'react';

// Shared "Terminar juego" button. Every game renders it so the student can
// bail back to the menu at any time. Fixed top-left, above the game UI.
export default function EndGameButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      style={{
        position: 'fixed', top: '18px', left: '18px', zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: '8px',
        minHeight: '44px', padding: '10px 18px',
        background: 'rgba(0,20,50,0.85)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: '12px',
        color: 'rgba(255,255,255,0.9)', fontSize: '15px', fontWeight: '700',
        letterSpacing: '0.5px', cursor: 'pointer',
        fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      ✕ Terminar
    </button>
  );
}
