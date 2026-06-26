import React, { useState, useEffect, useCallback, useRef } from 'react';

const SIZE = 4;
const WIN_VALUE = 3 ** 7; // 2187
const GAME_DURATION = 120; // segundos

let tileIdCounter = 0;

function createEmpty() {
  return Array(SIZE).fill(null).map(() => Array(SIZE).fill(null));
}

function makeTile(val) {
  return { id: ++tileIdCounter, val, isNew: true, isMerged: false };
}

function getEmptyCells(board) {
  const cells = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      if (!board[r][c]) cells.push([r, c]);
  return cells;
}

function addRandom(board) {
  const empty = getEmptyCells(board);
  if (!empty.length) return board;
  const next = board.map(r => [...r]);
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  next[r][c] = makeTile(Math.random() < 0.9 ? 3 : 9);
  return next;
}

function initBoard() {
  let b = createEmpty();
  b = addRandom(b);
  b = addRandom(b);
  return b;
}

function slideRow(row) {
  const tiles = row.filter(t => t !== null);
  let score = 0;
  const merged = [];
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].val === tiles[i + 1].val) {
      const val = tiles[i].val * 3;
      merged.push({ ...makeTile(val), isMerged: true, isNew: false });
      score += val;
      i += 2;
    } else {
      merged.push({ ...tiles[i], isNew: false });
      i++;
    }
  }
  while (merged.length < SIZE) merged.push(null);
  return { row: merged, score };
}

function moveLeft(board) {
  let score = 0;
  const next = board.map(row => {
    const { row: r, score: s } = slideRow(row);
    score += s;
    return r;
  });
  return { board: next, score };
}

function rotateRight(board) {
  return board[0].map((_, c) => board.map(row => row[c]).reverse());
}
function rotateLeft(board) {
  return board[0].map((_, c) => board.map(row => row[SIZE - 1 - c]));
}

function move(board, dir) {
  let b = board;
  if (dir === 'right') b = rotateRight(rotateRight(b));
  if (dir === 'up') b = rotateLeft(b);
  if (dir === 'down') b = rotateRight(b);
  const { board: moved, score } = moveLeft(b);
  if (dir === 'right') return { board: rotateLeft(rotateLeft(moved)), score };
  if (dir === 'up') return { board: rotateRight(moved), score };
  if (dir === 'down') return { board: rotateLeft(moved), score };
  return { board: moved, score };
}

function boardsEqual(a, b) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      const av = a[r][c] ? a[r][c].val : 0;
      const bv = b[r][c] ? b[r][c].val : 0;
      if (av !== bv) return false;
    }
  return true;
}

function hasWon(board) {
  return board.some(row => row.some(t => t && t.val >= WIN_VALUE));
}

function canMove(board) {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return true;
      if (c + 1 < SIZE && board[r][c] && board[r][c + 1] && board[r][c].val === board[r][c + 1].val) return true;
      if (r + 1 < SIZE && board[r][c] && board[r + 1][c] && board[r][c].val === board[r + 1][c].val) return true;
    }
  return false;
}

function getTileStyle(val) {
  const map = {
    0:    { bg: 'rgba(255,255,255,0.04)', color: 'transparent', glow: 'none', border: 'rgba(255,255,255,0.06)' },
    3:    { bg: 'linear-gradient(135deg,#002a5c,#003d80)', color: '#a8d4ff', glow: '0 0 14px rgba(0,100,255,0.35)', border: 'rgba(0,120,255,0.3)' },
    9:    { bg: 'linear-gradient(135deg,#003d80,#0055a5)', color: '#cce5ff', glow: '0 0 16px rgba(0,140,255,0.45)', border: 'rgba(0,150,255,0.35)' },
    27:   { bg: 'linear-gradient(135deg,#0055a5,#0070cc)', color: '#ffffff', glow: '0 0 18px rgba(0,160,255,0.5)', border: 'rgba(0,170,255,0.4)' },
    81:   { bg: 'linear-gradient(135deg,#0070cc,#0088ee)', color: '#ffffff', glow: '0 0 20px rgba(0,180,255,0.55)', border: 'rgba(0,190,255,0.45)' },
    243:  { bg: 'linear-gradient(135deg,#0088ee,#00aaff)', color: '#ffffff', glow: '0 0 24px rgba(0,200,255,0.65)', border: 'rgba(0,210,255,0.5)' },
    729:  { bg: 'linear-gradient(135deg,#00aaff,#00ccff)', color: '#001a33', glow: '0 0 28px rgba(0,220,255,0.75)', border: 'rgba(0,230,255,0.6)' },
    2187: { bg: 'linear-gradient(135deg,#ffd700,#ff8c00)', color: '#1a0a00', glow: '0 0 36px rgba(255,180,0,0.9)', border: 'rgba(255,200,0,0.7)' },
    6561: { bg: 'linear-gradient(135deg,#ff4500,#ff0080)', color: '#fff', glow: '0 0 36px rgba(255,50,100,0.9)', border: 'rgba(255,80,120,0.7)' },
  };
  return map[val] || { bg: 'linear-gradient(135deg,#001a33,#002a4d)', color: '#aaddff', glow: '0 0 20px rgba(0,100,200,0.5)', border: 'rgba(0,150,255,0.4)' };
}

function Tile({ tile }) {
  const [visible, setVisible] = useState(false);
  const [popped, setPopped] = useState(false);

  useEffect(() => {
    if (tile.isNew) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(true);
    }
    if (tile.isMerged) {
      setPopped(true);
      const t = setTimeout(() => setPopped(false), 200);
      return () => clearTimeout(t);
    }
  }, [tile.id]);

  const s = getTileStyle(tile.val);
  const fontSize = tile.val >= 10000 ? '16px' : tile.val >= 1000 ? '20px' : tile.val >= 100 ? '26px' : '32px';

  return (
    <div style={{
      background: s.bg,
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: '900',
      fontSize,
      color: s.color,
      boxShadow: s.glow,
      border: `1px solid ${s.border}`,
      userSelect: 'none',
      aspectRatio: '1',
      transform: tile.isNew
        ? (visible ? 'scale(1)' : 'scale(0)')
        : popped ? 'scale(1.15)' : 'scale(1)',
      opacity: tile.isNew ? (visible ? 1 : 0) : 1,
      transition: tile.isNew
        ? 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), opacity 0.15s ease'
        : popped ? 'transform 0.1s ease' : 'transform 0.12s ease, box-shadow 0.2s ease',
      letterSpacing: '-1px',
    }}>
      {tile.val}
    </div>
  );
}

function EmptyTile() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.05)',
      aspectRatio: '1',
    }} />
  );
}

// Timer ring component
function TimerRing({ timeLeft, total }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = timeLeft / total;
  const dash = circ * progress;
  const urgent = timeLeft <= 30;
  const color = timeLeft <= 10 ? '#ff4444' : timeLeft <= 30 ? '#ffaa00' : '#00aaff';

  return (
    <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{
          color: urgent ? color : 'white',
          fontSize: '18px', fontWeight: '800',
          fontVariantNumeric: 'tabular-nums',
          animation: urgent && timeLeft <= 10 ? 'urgentPulse 0.5s ease infinite alternate' : 'none'
        }}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
}

// Score pop-up particle
function ScorePop({ points, onDone }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 700);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: '30%', left: '50%',
      color: '#ffd700', fontSize: '36px', fontWeight: '900',
      pointerEvents: 'none', zIndex: 999,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease, transform 0.7s ease',
      transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-40px)',
      textShadow: '0 0 20px rgba(255,200,0,0.8)',
      letterSpacing: '-1px'
    }}>
      +{points}
    </div>
  );
}

function Game2048({ onBack }) {
  const [board, setBoard] = useState(initBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [status, setStatus] = useState('playing'); // playing | won | timeup | lost
  const [touchStart, setTouchStart] = useState(null);
  const [scorePops, setScorePops] = useState([]);
  const boardRef = useRef(null);

  // Timer
  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) { setStatus('timeup'); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, status]);

  const applyMove = useCallback((dir) => {
    if (status !== 'playing') return;
    setBoard(prev => {
      const { board: moved, score: gained } = move(prev, dir);
      if (boardsEqual(prev, moved)) return prev;
      const withNew = addRandom(moved);
      if (gained > 0) {
        setScorePops(ps => [...ps, { id: Date.now(), points: gained }]);
        setScore(s => {
          const ns = s + gained;
          setBest(b => Math.max(b, ns));
          return ns;
        });
      }
      if (hasWon(withNew)) setStatus('won');
      else if (!canMove(withNew)) setStatus('lost');
      return withNew;
    });
  }, [status]);

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
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
    if (Math.abs(dx) > Math.abs(dy)) applyMove(dx > 0 ? 'right' : 'left');
    else applyMove(dy > 0 ? 'down' : 'up');
    setTouchStart(null);
  };

  const urgent = timeLeft <= 30;
  const timerBg = timeLeft <= 10
    ? 'rgba(255,50,50,0.15)'
    : timeLeft <= 30
    ? 'rgba(255,150,0,0.1)'
    : 'transparent';

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: '#0a0f1e',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <style>{`
        @keyframes urgentPulse { from { opacity:1; transform:scale(1); } to { opacity:0.6; transform:scale(1.15); } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes goldShine {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* Score pops */}
      {scorePops.map(p => (
        <ScorePop key={p.id} points={p.points} onDone={() => setScorePops(ps => ps.filter(x => x.id !== p.id))} />
      ))}

      {/* Header */}
      <div style={{
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
        background: timerBg,
        borderRadius: '16px',
        padding: '8px',
        transition: 'background 0.5s ease'
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Admisión USM
          </div>
          <div style={{ color: 'white', fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>
            2187
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
            Llega a 3<sup>7</sup>
          </div>
        </div>

        <TimerRing timeLeft={timeLeft} total={GAME_DURATION} />

        <div style={{ display: 'flex', gap: '8px' }}>
          {[['PUNTAJE', score], ['MEJOR', best]].map(([label, val]) => (
            <div key={label} style={{
              background: 'linear-gradient(135deg,#001f4d,#003380)',
              borderRadius: '10px', padding: '8px 14px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)', minWidth: '64px'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '1px' }}>{label}</div>
              <div style={{ color: 'white', fontSize: '18px', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '18px',
          padding: '12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: urgent
            ? `0 8px 40px rgba(0,0,0,0.5), 0 0 0 2px ${timeLeft <= 10 ? 'rgba(255,50,50,0.5)' : 'rgba(255,150,0,0.4)'}`
            : '0 8px 40px rgba(0,0,0,0.5)',
          position: 'relative',
          transition: 'box-shadow 0.5s ease',
          touchAction: 'none'
        }}
      >
        {board.flat().map((tile, i) =>
          tile ? <Tile key={tile.id} tile={tile} /> : <EmptyTile key={`e-${i}`} />
        )}

        {/* Overlay */}
        {status !== 'playing' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: status === 'won'
              ? 'rgba(0,20,0,0.92)'
              : status === 'timeup'
              ? 'rgba(0,10,30,0.94)'
              : 'rgba(20,0,0,0.92)',
            borderRadius: '18px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '10px',
            animation: 'fadeIn 0.4s ease'
          }}>
            {status === 'won' && (
              <>
                <div style={{ fontSize: '52px' }}>🏆</div>
                <div style={{ fontSize: '40px', fontWeight: '900', color: '#ffd700', textShadow: '0 0 30px rgba(255,200,0,0.8)' }}>¡2187!</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>¡Llegaste a 3⁷!</div>
              </>
            )}
            {status === 'timeup' && (
              <>
                <div style={{ fontSize: '48px' }}>⏱️</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#00aaff' }}>¡Tiempo!</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Se acabaron los 2 minutos</div>
              </>
            )}
            {status === 'lost' && (
              <>
                <div style={{ fontSize: '48px' }}>😵</div>
                <div style={{ fontSize: '32px', fontWeight: '900', color: '#ff4444' }}>Game Over</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>No hay más movimientos</div>
              </>
            )}

            {/* Score final */}
            <div style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg,#001f4d,#003380)',
              borderRadius: '14px', padding: '14px 28px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.12)',
              animation: 'slideUp 0.5s ease 0.2s both'
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Puntaje Final</div>
              <div style={{ color: 'white', fontSize: '42px', fontWeight: '900', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{score}</div>
              {best > 0 && score >= best && (
                <div style={{ color: '#ffd700', fontSize: '12px', marginTop: '4px' }}>✨ ¡Nuevo récord!</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      <div style={{
        color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center',
        letterSpacing: '0.5px'
      }}>
        Desliza para mover las fichas
      </div>
    </div>
  );
}

export default Game2048;