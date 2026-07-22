import React, { useState, useEffect, useCallback } from 'react';

const GAME_IDS = ['2048', 'memorice', 'primeNinja'];

const GAME_LABELS = {
  '2048': '6561',
  'memorice': 'Memorice',
  'primeNinja': 'Prime Ninja',
};

const GAME_COLORS = {
  '2048': '#80c4ff',
  'memorice': '#b7a6ff',
  'primeNinja': '#00e5bf',
};

function loadAllScores() {
  const all = [];
  for (const id of GAME_IDS) {
    try {
      const entries = JSON.parse(localStorage.getItem(`totem_lb_${id}`)) || [];
      for (const e of entries) {
        all.push({ ...e, gameId: id });
      }
    } catch { /* ignore */ }
  }
  all.sort((a, b) => b.score - a.score);
  return all.slice(0, 10);
}

function ScoreboardSidebar() {
  const [scores, setScores] = useState(() => loadAllScores());
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setScores(loadAllScores());
    requestAnimationFrame(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div style={{
      width: 'clamp(240px, 22vw, 320px)',
      flexShrink: 0,
      background: 'linear-gradient(180deg, rgba(0,20,55,0.7), rgba(0,10,30,0.8))',
      borderLeft: '1px solid rgba(0,170,255,0.15)',
      padding: 'clamp(16px, 2.5vh, 24px) clamp(12px, 1.6vw, 20px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: 'clamp(10px, 1.5vh, 18px)',
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 'clamp(15px, 2.2vh, 22px)',
          fontWeight: '900',
          letterSpacing: '3px',
          color: '#ffd700',
          textShadow: '0 0 15px rgba(255,215,0,0.5)',
        }}>
          HIGH SCORES
        </div>
        <div style={{
          fontSize: 'clamp(10px, 1.3vh, 13px)',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '2px',
          marginTop: '4px',
        }}>
          TOP 10 — TODOS LOS JUEGOS
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 80px',
        gap: '4px 10px',
        padding: '8px 10px',
        borderBottom: '1px solid rgba(0,170,255,0.12)',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(0,170,255,0.4)', fontSize: '10px', letterSpacing: '2px', textAlign: 'right' }}>#</span>
        <span style={{ color: 'rgba(0,170,255,0.4)', fontSize: '10px', letterSpacing: '2px' }}>NOMBRE</span>
        <span style={{ color: 'rgba(0,170,255,0.4)', fontSize: '10px', letterSpacing: '2px', textAlign: 'right' }}>PTS</span>
      </div>

      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        opacity: refreshing ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}>
        {scores.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%',
            color: 'rgba(255,255,255,0.15)',
            fontSize: 'clamp(9px, 1.1vh, 11px)',
            letterSpacing: '2px',
            textAlign: 'center',
          }}>
            — SIN PUNTAJES AÚN —
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            paddingTop: '4px',
          }}>
            {scores.map((s, i) => {
              const isTop3 = i < 3;
              return (
                <div
                  key={`${s.gameId}-${i}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 80px',
                    gap: '4px 10px',
                    alignItems: 'center',
                    padding: '7px 10px',
                    background: isTop3 ? 'rgba(255,215,0,0.04)' : 'transparent',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{
                    color: isTop3 ? '#ffd700' : 'rgba(255,255,255,0.25)',
                    fontSize: 'clamp(13px, 1.5vh, 16px)',
                    fontWeight: isTop3 ? '900' : '600',
                    textAlign: 'right',
                  }}>
                    {i + 1}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      color: isTop3 ? '#ffd700' : 'rgba(255,255,255,0.8)',
                      fontSize: 'clamp(13px, 1.7vh, 18px)',
                      fontWeight: '800',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    }}>
                      {s.name}
                    </span>
                    <span style={{
                      fontSize: 'clamp(9px, 1.1vh, 11px)',
                      fontWeight: '700',
                      color: GAME_COLORS[s.gameId] || 'rgba(255,255,255,0.3)',
                      opacity: 0.8,
                    }}>
                      {GAME_LABELS[s.gameId] || s.gameId}
                    </span>
                  </div>
                  <span style={{
                    color: isTop3 ? '#ffd700' : 'rgba(255,255,255,0.55)',
                    fontSize: 'clamp(13px, 1.5vh, 16px)',
                    fontWeight: '700',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {s.score.toLocaleString('es-CL')}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'clamp(8px, 1vh, 14px)',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: 'clamp(8px, 1vh, 11px)',
          color: 'rgba(255,255,255,0.2)',
        }}>
          {GAME_IDS.map(id => (
            <span key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                background: GAME_COLORS[id],
                display: 'inline-block',
              }} />
              {GAME_LABELS[id]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ScoreboardSidebar;
