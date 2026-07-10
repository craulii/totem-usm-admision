import React, { useState, useEffect, useCallback, useRef } from 'react';
import EndGameButton from '../../components/EndGameButton';
import { GAME_DURATION } from '../../config';

// ─── Constants ─────────────────────────────────────────────────────────────────
const SIZE = 4;
const WIN_VALUE = 3 ** 7;   // 2187
const GAP = 10;             // px between cells
const PAD = 12;             // px board padding
const SLIDE_MS = 110;       // slide animation duration

let uid = 0;

// ─── Pure game logic (ported from gabrielecirulli/2048) ───────────────────────

function makeTile(val, row, col) {
  return { id: ++uid, val, row, col, isNew: true, isMerged: false, removing: false };
}

// Build a 2D lookup grid from the flat tile list (ignores removing tiles)
function buildGrid(tiles) {
  const g = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  tiles.forEach(t => { if (!t.removing) g[t.row][t.col] = t; });
  return g;
}

function spawnTile(tiles) {
  const g = buildGrid(tiles);
  const empty = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!g[r][c]) empty.push([r, c]);
  if (!empty.length) return tiles;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  return [...tiles, makeTile(Math.random() < 0.9 ? 3 : 9, r, c)];
}

function initTiles() {
  return spawnTile(spawnTile([]));
}

// Core move: traversal order matches original 2048 (process from the destination side)
function computeMove(tiles, dir) {
  const dr = { up: -1, down: 1, left: 0, right: 0 }[dir];
  const dc = { up: 0, down: 0, left: -1, right: 1 }[dir];

  const rows = [0, 1, 2, 3]; if (dr > 0) rows.reverse();
  const cols = [0, 1, 2, 3]; if (dc > 0) cols.reverse();

  // Fresh copies with animation flags cleared
  const work = tiles
    .filter(t => !t.removing)
    .map(t => ({ ...t, isNew: false, isMerged: false }));

  const g = Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
  work.forEach(t => { g[t.row][t.col] = t; });

  let moved = false;
  let score = 0;

  for (const r of rows) {
    for (const c of cols) {
      const t = g[r][c];
      if (!t) continue;

      // Slide to the farthest empty cell in the direction
      let fr = r, fc = c;
      while (true) {
        const nr = fr + dr, nc = fc + dc;
        if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE || g[nr][nc]) break;
        fr = nr; fc = nc;
      }

      const nr = fr + dr, nc = fc + dc;
      const other = (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) ? g[nr][nc] : null;

      if (other && other.val === t.val && !other.isMerged) {
        // Merge t into other (other stays, t gets removed after animation)
        other.val *= 3;  // powers of 3 instead of 2
        other.isMerged = true;
        score += other.val;

        g[t.row][t.col] = null;
        t.row = nr;       // animate toward merge target
        t.col = nc;
        t.removing = true;
        moved = true;
      } else if (fr !== r || fc !== c) {
        // Slide without merge
        g[r][c] = null;
        t.row = fr;
        t.col = fc;
        g[fr][fc] = t;
        moved = true;
      }
    }
  }

  return { tiles: work, moved, score };
}

function hasWon(tiles) {
  return tiles.some(t => !t.removing && t.val >= WIN_VALUE);
}

function hasNoMoves(tiles) {
  const g = buildGrid(tiles);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!g[r][c]) return false;
      if (r + 1 < SIZE && g[r + 1][c]?.val === g[r][c].val) return false;
      if (c + 1 < SIZE && g[r][c + 1]?.val === g[r][c].val) return false;
    }
  return true;
}

// ─── Tile color map ────────────────────────────────────────────────────────────

function getTileStyle(val) {
  const map = {
    3:    { bg: 'linear-gradient(135deg,#002a5c,#003d80)', color: '#a8d4ff', glow: '0 0 14px rgba(0,100,255,0.35)', border: 'rgba(0,120,255,0.3)' },
    9:    { bg: 'linear-gradient(135deg,#003d80,#0055a5)', color: '#cce5ff', glow: '0 0 16px rgba(0,140,255,0.45)', border: 'rgba(0,150,255,0.35)' },
    27:   { bg: 'linear-gradient(135deg,#0055a5,#0070cc)', color: '#ffffff', glow: '0 0 18px rgba(0,160,255,0.5)',  border: 'rgba(0,170,255,0.4)' },
    81:   { bg: 'linear-gradient(135deg,#0070cc,#0088ee)', color: '#ffffff', glow: '0 0 20px rgba(0,180,255,0.55)', border: 'rgba(0,190,255,0.45)' },
    243:  { bg: 'linear-gradient(135deg,#0088ee,#00aaff)', color: '#ffffff', glow: '0 0 24px rgba(0,200,255,0.65)', border: 'rgba(0,210,255,0.5)' },
    729:  { bg: 'linear-gradient(135deg,#00aaff,#00ccff)', color: '#001a33', glow: '0 0 28px rgba(0,220,255,0.75)', border: 'rgba(0,230,255,0.6)' },
    2187: { bg: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00', glow: '0 0 36px rgba(255,180,0,0.9)',  border: 'rgba(255,200,0,0.7)' },
    6561: { bg: 'linear-gradient(135deg,#ff4500,#ff0080)', color: '#ffffff', glow: '0 0 36px rgba(255,50,100,0.9)', border: 'rgba(255,80,120,0.7)' },
  };
  return map[val] || { bg: 'linear-gradient(135deg,#001a33,#002a4d)', color: '#aaddff', glow: '0 0 20px rgba(0,100,200,0.5)', border: 'rgba(0,150,255,0.4)' };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TimerRing({ timeLeft, total }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = circ * (timeLeft / total);
  const urgent = timeLeft <= 30;
  const color = timeLeft <= 10 ? '#ff4444' : timeLeft <= 30 ? '#ffaa00' : '#00aaff';
  return (
    <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{
          color: urgent ? color : 'white', fontSize: '18px', fontWeight: '800',
          fontVariantNumeric: 'tabular-nums',
          animation: urgent && timeLeft <= 10 ? 'urgentPulse 0.5s ease infinite alternate' : 'none',
        }}>{timeLeft}</span>
      </div>
    </div>
  );
}

function ScorePop({ points, onDone }) {
  const [risen, setRisen] = useState(false);
  useEffect(() => {
    const t1 = requestAnimationFrame(() => setRisen(true));
    const t2 = setTimeout(onDone, 900);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: 'fixed', top: '32%', left: '50%',
      transform: risen ? 'translateX(-50%) translateY(-50px)' : 'translateX(-50%) translateY(0)',
      opacity: risen ? 0 : 1,
      transition: 'transform 0.8s ease, opacity 0.8s ease 0.1s',
      color: '#ffd700', fontSize: '36px', fontWeight: '900',
      pointerEvents: 'none', zIndex: 999,
      textShadow: '0 0 20px rgba(255,200,0,0.8)',
      letterSpacing: '-1px',
    }}>+{points}</div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function Game2048({ onGameEnd, onMenu }) {
  const [tiles, setTiles] = useState(initTiles);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [status, setStatus] = useState('playing'); // playing | won | timeup | lost
  const [scorePops, setScorePops] = useState([]);
  const [touchStart, setTouchStart] = useState(null);
  const [cellSize, setCellSize] = useState(107);
  const [countdown, setCountdown] = useState(3);
  const boardRef = useRef(null);
  const busyRef = useRef(false); // block moves during animation

  // Refs to avoid stale closures in keyboard handler
  const statusRef = useRef(status);
  const tilesRef = useRef(tiles);
  const scoreRef = useRef(score);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { tilesRef.current = tiles; }, [tiles]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Auto-transition to leaderboard when game ends
  useEffect(() => {
    if (status === 'playing') return;
    setCountdown(3);
    let c = 3;
    const tick = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) { clearInterval(tick); onGameEnd(scoreRef.current); }
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  // Measure board to get exact cell size for absolute positioning
  useEffect(() => {
    const calc = () => {
      if (!boardRef.current) return;
      const w = boardRef.current.offsetWidth;
      setCellSize((w - 2 * PAD - (SIZE - 1) * GAP) / SIZE);
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, []);

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) { setStatus('timeup'); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, status]);

  // Central move handler — stable reference via refs
  const handleMove = useCallback((dir) => {
    if (statusRef.current !== 'playing') return;
    if (busyRef.current) return;

    const current = tilesRef.current.filter(t => !t.removing);
    const { tiles: moved, moved: didMove, score: gained } = computeMove(current, dir);
    if (!didMove) return;

    busyRef.current = true;

    // Spawn new tile; new tiles animate AFTER the slide (see CSS animation-delay)
    const next = spawnTile(moved);
    setTiles(next);

    if (gained > 0) {
      setScorePops(ps => [...ps, { id: Date.now() + Math.random(), points: gained }]);
      setScore(s => s + gained);
    }

    // After slide: remove consumed tiles, then check game state
    setTimeout(() => {
      setTiles(prev => {
        const live = prev.filter(t => !t.removing);
        if (hasWon(live)) setStatus('won');
        else if (hasNoMoves(live)) setStatus('lost');
        return live;
      });
      busyRef.current = false;
    }, SLIDE_MS + 30);
  }, []); // stable — reads from refs

  // Keyboard: arrow keys
  useEffect(() => {
    const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const onKey = (e) => {
      const dir = KEYS[e.key];
      if (dir) { e.preventDefault(); handleMove(dir); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  // Touch swipe
  const onTouchStart = (e) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };
  const onTouchEnd = (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    setTouchStart(null);
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
    handleMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };

  const urgent = timeLeft <= 30;
  const timerBg = timeLeft <= 10 ? 'rgba(255,50,50,0.15)' : timeLeft <= 30 ? 'rgba(255,150,0,0.1)' : 'transparent';

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#0a0f1e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '20px', boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes urgentPulse {
          from { opacity:1; transform:scale(1); }
          to   { opacity:0.6; transform:scale(1.15); }
        }
        @keyframes tileSpawn {
          from { transform:scale(0); opacity:0; }
          to   { transform:scale(1); opacity:1; }
        }
        @keyframes tilePop {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.13); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(30px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {onMenu && <EndGameButton onClick={onMenu} />}

      {/* Score popups */}
      {scorePops.map(p => (
        <ScorePop key={p.id} points={p.points} onDone={() => setScorePops(ps => ps.filter(x => x.id !== p.id))} />
      ))}

      {/* ── Header ── */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', background: timerBg, borderRadius: '16px',
        padding: '8px', transition: 'background 0.5s ease',
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Admisión USM</div>
          <div style={{ color: 'white', fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>2187</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Llega a 3<sup>7</sup></div>
        </div>
        <TimerRing timeLeft={timeLeft} total={GAME_DURATION} />
        <div style={{
          background: 'linear-gradient(135deg,#001f4d,#003380)',
          borderRadius: '10px', padding: '8px 14px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.1)', minWidth: '80px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '1px' }}>PUNTAJE</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>{score}</div>
        </div>
      </div>

      {/* ── Board ── */}
      <div
        ref={boardRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: '480px',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)',
          boxShadow: urgent
            ? `0 8px 40px rgba(0,0,0,0.5), 0 0 0 2px ${timeLeft <= 10 ? 'rgba(255,50,50,0.5)' : 'rgba(255,150,0,0.4)'}`
            : '0 8px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          transition: 'box-shadow 0.5s ease',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {/* Background cell grid (defines board height, cells act as placeholders) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gap: `${GAP}px`,
          padding: `${PAD}px`,
        }}>
          {Array(SIZE * SIZE).fill(null).map((_, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              aspectRatio: '1',
            }} />
          ))}
        </div>

        {/* Absolutely positioned tiles — CSS transition on left/top enables slide animation */}
        {tiles.map(tile => {
          const s = getTileStyle(tile.val);
          const left = PAD + tile.col * (cellSize + GAP);
          const top  = PAD + tile.row * (cellSize + GAP);
          const fontSize = tile.val >= 10000 ? '15px' : tile.val >= 1000 ? '20px' : tile.val >= 100 ? '26px' : '32px';

          return (
            <div
              key={tile.id}
              style={{
                position: 'absolute',
                left: `${left}px`,
                top:  `${top}px`,
                width:  `${cellSize}px`,
                height: `${cellSize}px`,
                // Slide transition on position — fires when row/col change because key is stable
                transition: tile.isNew ? 'none' : `left ${SLIDE_MS}ms ease, top ${SLIDE_MS}ms ease`,
                // Spawn after slide finishes; merge pop after slide finishes
                animation: tile.isNew
                  ? `tileSpawn 0.15s cubic-bezier(0.34,1.56,0.64,1) ${SLIDE_MS}ms both`
                  : tile.isMerged
                  ? `tilePop 0.18s ease ${SLIDE_MS}ms both`
                  : 'none',
                // Consumed tiles slide into merge target, then disappear
                opacity: tile.removing ? 0.85 : 1,
                zIndex: tile.removing ? 1 : 2,
                background: s.bg,
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '900', fontSize,
                color: s.color,
                boxShadow: s.glow,
                border: `1px solid ${s.border}`,
                letterSpacing: '-1px',
              }}
            >
              {tile.val}
            </div>
          );
        })}

        {/* Game over / win overlay */}
        {status !== 'playing' && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: status === 'won' ? 'rgba(0,20,0,0.92)' : status === 'timeup' ? 'rgba(0,10,30,0.94)' : 'rgba(20,0,0,0.92)',
            borderRadius: '18px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            animation: 'fadeIn 0.4s ease',
          }}>
            {status === 'won' && (<>
              <div style={{ fontSize: '52px' }}>🏆</div>
              <div style={{ fontSize: '40px', fontWeight: '900', color: '#ffd700', textShadow: '0 0 30px rgba(255,200,0,0.8)' }}>¡2187!</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>¡Llegaste a 3⁷!</div>
            </>)}
            {status === 'timeup' && (<>
              <div style={{ fontSize: '48px' }}>⏱️</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#00aaff' }}>¡Tiempo!</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Se acabó el tiempo</div>
            </>)}
            {status === 'lost' && (<>
              <div style={{ fontSize: '48px' }}>😵</div>
              <div style={{ fontSize: '32px', fontWeight: '900', color: '#ff4444' }}>Game Over</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No hay más movimientos</div>
            </>)}

            <div style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg,#001f4d,#003380)',
              borderRadius: '14px', padding: '14px 28px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
              animation: 'slideUp 0.5s ease 0.2s both',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Puntaje Final</div>
              <div style={{ color: 'white', fontSize: '42px', fontWeight: '900', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{score}</div>
            </div>

            <div style={{
              color: 'rgba(255,255,255,0.35)', fontSize: '13px', letterSpacing: '2px',
              fontFamily: "'Courier New', monospace",
            }}>
              CARGANDO RANKING... {countdown}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center', letterSpacing: '0.5px' }}>
        Desliza o usa las teclas ↑ ↓ ← →
      </div>
    </div>
  );
}

export default Game2048;
