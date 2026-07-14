import React, { useState, useEffect, useRef } from 'react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function loadScores(gameId) {
  try {
    return JSON.parse(localStorage.getItem(`totem_lb_${gameId}`)) || [];
  } catch { return []; }
}

function saveScores(gameId, scores) {
  localStorage.setItem(`totem_lb_${gameId}`, JSON.stringify(scores));
}

// Returns 0-based rank where player would be inserted.
// Returns -1 if score is 0 (won't rank).
// Returns scores.length if player score is lower than all existing.
function getInsertRank(scores, playerScore) {
  if (playerScore <= 0) return -1;
  const idx = scores.findIndex(s => playerScore > s.score);
  return idx === -1 ? scores.length : idx;
}

// ── Letter Slot ──────────────────────────────────────────────────────────────

function LetterSlot({ letter, active, onUp, onDown, onSelect }) {
  const btnBase = {
    width: '64px', height: '52px',
    borderRadius: '10px', fontSize: '22px', fontWeight: '900',
    cursor: 'pointer', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <button
        onClick={onUp} onTouchEnd={e => { e.preventDefault(); onUp(); }}
        style={{
          ...btnBase,
          background: active ? 'rgba(0,170,255,0.25)' : 'rgba(255,255,255,0.05)',
          color: active ? '#00aaff' : 'rgba(255,255,255,0.4)',
        }}
      >▲</button>

      <div
        onClick={onSelect}
        style={{
          width: '72px', height: '80px',
          background: active ? 'rgba(0,80,160,0.4)' : 'rgba(255,255,255,0.05)',
          border: `2px solid ${active ? '#00aaff' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '52px', fontWeight: '900',
          fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
          color: active ? '#ffffff' : 'rgba(255,255,255,0.5)',
          boxShadow: active ? '0 0 20px rgba(0,170,255,0.45)' : 'none',
          cursor: 'pointer',
          animation: active ? 'slotBlink 0.9s ease infinite' : 'none',
          userSelect: 'none',
        }}
      >{letter}</div>

      <button
        onClick={onDown} onTouchEnd={e => { e.preventDefault(); onDown(); }}
        style={{
          ...btnBase,
          background: active ? 'rgba(0,170,255,0.25)' : 'rgba(255,255,255,0.05)',
          color: active ? '#00aaff' : 'rgba(255,255,255,0.4)',
        }}
      >▼</button>
    </div>
  );
}

// ── Score Row ────────────────────────────────────────────────────────────────

function ScoreRow({ rank, name, rowScore, isPlayer }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '48px 90px 1fr',
      alignItems: 'center',
      gap: '0 12px',
      padding: '9px 16px',
      background: isPlayer ? 'rgba(255,215,0,0.09)' : rank % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
      borderRadius: '8px',
      border: isPlayer ? '1px solid rgba(255,215,0,0.35)' : '1px solid transparent',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      <span style={{
        color: isPlayer ? '#ffd700' : rank <= 3 ? '#00aaff' : 'rgba(255,255,255,0.3)',
        fontSize: '15px', fontWeight: '900', textAlign: 'right',
      }}>
        {isPlayer && '►'}{rank}
      </span>
      <span style={{
        color: isPlayer ? '#ffd700' : 'rgba(255,255,255,0.85)',
        fontSize: '20px', fontWeight: '900', letterSpacing: '4px', textTransform: 'uppercase',
        animation: isPlayer ? 'titlePulse 1.8s ease infinite' : 'none',
      }}>
        {name}
      </span>
      <span style={{
        color: isPlayer ? '#ffd700' : 'rgba(255,255,255,0.65)',
        fontSize: '17px', fontWeight: '700', textAlign: 'right',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '1px',
      }}>
        {rowScore.toLocaleString('es-CL')}
      </span>
    </div>
  );
}

// ── Entry Row (inline name selector inside the table) ────────────────────────

function EntryRow({ rank, letters, score }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '48px 90px 1fr',
      alignItems: 'center',
      gap: '0 12px',
      padding: '9px 16px',
      background: 'rgba(255,215,0,0.09)',
      border: '1px solid rgba(255,215,0,0.35)',
      borderRadius: '8px',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      <span style={{ color: '#ffd700', fontSize: '15px', fontWeight: '900', textAlign: 'right' }}>►{rank}</span>
      <span style={{ color: '#ffd700', fontSize: '20px', fontWeight: '900', letterSpacing: '6px' }}>
        {letters.join('')}
      </span>
      <span style={{ color: '#ffd700', fontSize: '17px', fontWeight: '700', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {score.toLocaleString('es-CL')}
      </span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

function Leaderboard({ gameId, gameTitle, score, onMenu, onPlayAgain }) {
  const [scores, setScores] = useState(() => loadScores(gameId));
  const [letters, setLetters] = useState(['A', 'A', 'A']);
  const [activeSlot, setActiveSlot] = useState(0);
  const [phase, setPhase] = useState('entry'); // 'entry' | 'saved'
  const savedRankRef = useRef(null);

  const rank = getInsertRank(scores, score);
  // Player qualifies for top 10 if rank !== -1 AND (list not full, or rank is within top 10)
  const qualifies = rank !== -1 && (scores.length < 10 || rank < 10);

  function changeLetter(slot, delta) {
    setLetters(prev => {
      const next = [...prev];
      next[slot] = ALPHABET[(ALPHABET.indexOf(prev[slot]) + delta + 26) % 26];
      return next;
    });
  }

  function handleSave() {
    if (qualifies) {
      const name = letters.join('');
      const updated = [...scores];
      updated.splice(rank, 0, { name, score });
      const trimmed = updated.slice(0, 10);
      savedRankRef.current = rank;
      saveScores(gameId, trimmed);
      setScores(trimmed);
    }
    setPhase('saved');
  }

  // Keyboard support
  useEffect(() => {
    if (phase !== 'entry') return;
    const onKey = (e) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); changeLetter(activeSlot, +1); }
      if (e.key === 'ArrowDown')  { e.preventDefault(); changeLetter(activeSlot, -1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setActiveSlot(s => Math.max(0, s - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setActiveSlot(s => Math.min(2, s + 1)); }
      if (e.key === 'Enter')      { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, activeSlot, letters, qualifies]);

  // ── Build ranked rows for display ──────────────────────────────────────────

  function buildEntryRows() {
    // Visual positions 1..N, where player occupies position (rank+1)
    const totalVisible = qualifies
      ? Math.min(10, scores.length + 1)
      : Math.min(10, scores.length);

    const rows = [];
    for (let pos = 0; pos < totalVisible; pos++) {
      if (qualifies && pos === rank) {
        // Player's inline entry
        rows.push(
          <EntryRow key="player" rank={pos + 1} letters={letters} score={score} />
        );
      } else {
        // Existing score — shift index if player is above
        const si = qualifies && pos > rank ? pos - 1 : pos;
        const s = scores[si];
        if (s) rows.push(
          <ScoreRow key={`s${si}`} rank={pos + 1} name={s.name} rowScore={s.score} isPlayer={false} />
        );
      }
    }
    return rows;
  }

  function buildSavedRows() {
    return scores.slice(0, 10).map((s, i) => (
      <ScoreRow
        key={i}
        rank={i + 1}
        name={s.name}
        rowScore={s.score}
        isPlayer={savedRankRef.current !== null && i === savedRankRef.current}
      />
    ));
  }

  const tableRows = phase === 'entry' ? buildEntryRows() : buildSavedRows();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#00060f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes titlePulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.6; }
        }
        @keyframes slotBlink {
          0%,100% { box-shadow: 0 0 20px rgba(0,170,255,0.45); }
          50%      { box-shadow: 0 0 6px rgba(0,170,255,0.15); }
        }
        @keyframes lbIn {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* CRT scanlines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '520px',
        padding: '28px 20px 28px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '18px',
        animation: 'lbIn 0.4s ease',
      }}>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '30px', fontWeight: '900', letterSpacing: '5px',
            color: '#ffd700',
            textShadow: '0 0 20px rgba(255,215,0,0.7), 0 0 40px rgba(255,215,0,0.3)',
            animation: 'titlePulse 2s ease infinite',
          }}>★ HIGH SCORES ★</div>
          <div style={{
            fontSize: '15px', fontWeight: '700', letterSpacing: '4px',
            color: '#00aaff', marginTop: '4px',
            textShadow: '0 0 12px rgba(0,170,255,0.5)',
          }}>{gameTitle}</div>
        </div>

        {/* Ranking table */}
        <div style={{
          width: '100%',
          background: 'rgba(0,30,70,0.4)',
          borderRadius: '14px',
          border: '1px solid rgba(0,170,255,0.2)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '48px 90px 1fr',
            gap: '0 12px', padding: '8px 16px',
            borderBottom: '1px solid rgba(0,170,255,0.2)',
            background: 'rgba(0,170,255,0.07)',
          }}>
            <span style={{ color: 'rgba(0,170,255,0.55)', fontSize: '10px', letterSpacing: '2px', textAlign: 'right' }}>#</span>
            <span style={{ color: 'rgba(0,170,255,0.55)', fontSize: '10px', letterSpacing: '2px' }}>NOMBRE</span>
            <span style={{ color: 'rgba(0,170,255,0.55)', fontSize: '10px', letterSpacing: '2px', textAlign: 'right' }}>PUNTAJE</span>
          </div>

          {tableRows.length > 0 ? tableRows : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', letterSpacing: '3px' }}>
              — SIN REGISTROS AÚN —
            </div>
          )}

          {/* Player below top 10 in entry phase */}
          {phase === 'entry' && !qualifies && score > 0 && (
            <div style={{
              borderTop: '1px solid rgba(0,170,255,0.12)',
              padding: '10px 16px',
              background: 'rgba(255,215,0,0.04)',
            }}>
              <div style={{ color: 'rgba(255,215,0,0.5)', fontSize: '10px', letterSpacing: '2px', textAlign: 'center', marginBottom: '6px' }}>
                TU PUNTAJE — FUERA DEL TOP 10
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '48px 90px 1fr', gap: '0 12px', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,215,0,0.4)', fontSize: '14px', textAlign: 'right' }}>—</span>
                <span style={{ color: 'rgba(255,215,0,0.75)', fontSize: '20px', fontWeight: '900', letterSpacing: '4px' }}>{letters.join('')}</span>
                <span style={{ color: 'rgba(255,215,0,0.75)', fontSize: '17px', fontWeight: '700', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {score.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Letter selector — only in entry phase */}
        {phase === 'entry' && score > 0 && (
          <>
            <div style={{
              color: 'rgba(0,200,255,0.7)', fontSize: '12px',
              letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center',
            }}>
              — INGRESA TUS INICIALES —
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <LetterSlot
                  key={i}
                  letter={letters[i]}
                  active={activeSlot === i}
                  onUp={() => { setActiveSlot(i); changeLetter(i, +1); }}
                  onDown={() => { setActiveSlot(i); changeLetter(i, -1); }}
                  onSelect={() => setActiveSlot(i)}
                />
              ))}
            </div>

            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '2px', textAlign: 'center' }}>
              ← → MOVER ENTRE LETRAS · ↑ ↓ CAMBIAR · ENTER GUARDAR
            </div>

            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={handleSave}
                onTouchEnd={e => { e.preventDefault(); handleSave(); }}
                style={{
                  background: 'linear-gradient(135deg,#003d80,#0060c0)',
                  border: '2px solid #00aaff',
                  borderRadius: '12px', padding: '14px 36px',
                  color: 'white', fontSize: '17px', fontWeight: '900',
                  letterSpacing: '3px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                  boxShadow: '0 0 18px rgba(0,170,255,0.35)',
                }}
              >GUARDAR</button>
              <button
                onClick={() => setPhase('saved')}
                onTouchEnd={e => { e.preventDefault(); setPhase('saved'); }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', padding: '14px 22px',
                  color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontWeight: '600',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                }}
              >SALTAR</button>
            </div>
          </>
        )}

        {/* Score = 0, no entry */}
        {phase === 'entry' && score === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', letterSpacing: '3px' }}>
              PUNTAJE 0 — SIN REGISTRO
            </div>
            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                onClick={onPlayAgain}
                onTouchEnd={e => { e.preventDefault(); onPlayAgain(); }}
                style={{
                  background: 'linear-gradient(135deg,#003d80,#0060c0)',
                  border: '2px solid #00aaff', borderRadius: '12px',
                  padding: '14px 32px', color: 'white', fontSize: '16px', fontWeight: '900',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                  boxShadow: '0 0 18px rgba(0,170,255,0.3)',
                }}
              >JUGAR DE NUEVO</button>
              <button
                onClick={onMenu}
                onTouchEnd={e => { e.preventDefault(); onMenu(); }}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px', padding: '14px 22px',
                  color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '700',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                }}
              >MENÚ</button>
            </div>
          </div>
        )}

        {/* Saved phase: summary + buttons */}
        {phase === 'saved' && (
          <>
            {savedRankRef.current !== null && (
              <div style={{
                color: '#ffd700', fontSize: '13px', letterSpacing: '3px',
                textShadow: '0 0 12px rgba(255,215,0,0.6)',
                animation: 'titlePulse 1.5s ease infinite',
              }}>
                ✓ GUARDADO EN POSICIÓN #{savedRankRef.current + 1}
              </div>
            )}

            <div style={{
              width: '100%', background: 'rgba(0,30,70,0.4)',
              borderRadius: '12px', border: '1px solid rgba(0,170,255,0.15)',
              padding: '12px 20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', letterSpacing: '2px' }}>TU PUNTAJE</span>
              <span style={{ color: 'white', fontSize: '28px', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>
                {score.toLocaleString('es-CL')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={onPlayAgain}
                onTouchEnd={e => { e.preventDefault(); onPlayAgain(); }}
                style={{
                  background: 'linear-gradient(135deg,#003d80,#0060c0)',
                  border: '2px solid #00aaff', borderRadius: '12px',
                  padding: '14px 30px', color: 'white', fontSize: '16px', fontWeight: '900',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                  boxShadow: '0 0 18px rgba(0,170,255,0.3)',
                }}
              >JUGAR DE NUEVO</button>
              <button
                onClick={onMenu}
                onTouchEnd={e => { e.preventDefault(); onMenu(); }}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '12px', padding: '14px 26px',
                  color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: '700',
                  letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
                }}
              >MENÚ</button>
            </div>
          </>
        )}

        <div style={{ height: '16px' }} />
      </div>
    </div>
  );
}

export default Leaderboard;
