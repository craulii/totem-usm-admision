import React from 'react';
import { BRAND } from '../brand';
import { getTopScore } from '../lib/scores';

// Shared "Terminar juego" button, plus a live "HIGH SCORES" pill for that game
// (when gameId is given). Every game renders this so the student can bail back
// to the menu at any time, and see the current best without leaving the round.
// Fixed top-left, above the game UI.
export default function EndGameButton({ onClick, gameId }) {
  return (
    <div style={{
      position: 'fixed', top: '18px', left: '18px', zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <button
        onClick={onClick}
        onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          minHeight: '44px', padding: '10px 20px',
          background: BRAND.gradientButton,
          border: '3px solid white',
          borderRadius: '999px',
          color: BRAND.textOnLight, fontSize: '15px', fontWeight: '700',
          letterSpacing: '0.5px', cursor: 'pointer',
          fontFamily: BRAND.font,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        ✕ Terminar
      </button>
      {gameId && (
        <div style={{
          minHeight: '44px', padding: '10px 20px',
          display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
          background: BRAND.purple,
          border: '3px solid white',
          borderRadius: '999px',
          color: 'white', fontSize: '13px', fontWeight: '700',
          letterSpacing: '0.5px',
          fontFamily: BRAND.font,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          HIGH SCORE: {getTopScore(gameId).toLocaleString('es-CL')}
        </div>
      )}
    </div>
  );
}
