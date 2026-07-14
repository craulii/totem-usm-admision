import React, { useEffect, useRef, useState } from 'react';
import EndGameButton from '../../components/EndGameButton';
import { getGameDuration } from '../../lib/db';

// ─── Setup ───────────────────────────────────────────────────────────────────
// 8 emojis → 8 pairs → 4×4 board.
// ponytail: emojis are placeholders. When USM sends assets, swap the emoji
// string for an <img src={...}/> in the front face — the rest is untouched.
const EMOJIS = ['🎓', '🔬', '⚛️', '🚀', '🧪', '📐', '🛰️', '💡'];
const TOTAL_PAIRS = EMOJIS.length;

// Scoring knobs (kept simple on purpose).
const PAIR_POINTS = 100;      // per matched pair
const COMBO_STEP = 20;        // extra points per consecutive match
const ERROR_PENALTY = 15;     // per mismatch
const TIME_BONUS = 10;        // per second left, only if the board is cleared

function shuffled() {
  const deck = EMOJIS.flatMap(e => [e, e]).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
  for (let i = deck.length - 1; i > 0; i--) {           // Fisher–Yates
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// ─── Timer ring (same visual language as the other games) ────────────────────
function TimerRing({ timeLeft, total }) {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = circ * (timeLeft / total);
  const urgent = timeLeft <= 10;
  const color = timeLeft <= 10 ? '#ff4444' : timeLeft <= 30 ? '#ffaa00' : '#00aaff';
  return (
    <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.9s linear, stroke 0.3s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: urgent ? color : 'white', fontSize: '16px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{timeLeft}</span>
      </div>
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ card, faceUp, wrong, onClick }) {
  return (
    <div
      onClick={onClick}
      onTouchEnd={(e) => { e.preventDefault(); onClick(); }}
      style={{ perspective: '800px', cursor: 'pointer', aspectRatio: '1' }}
    >
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.34,1.3,0.64,1)',
        transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
        animation: card.matched ? 'memMatch 0.5s ease' : wrong ? 'memShake 0.4s ease' : 'none',
      }}>
        {/* Back (hidden side when face-up) */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: '14px',
          background: 'linear-gradient(135deg,#00305e,#001a33)',
          border: '1px solid rgba(0,150,255,0.3)',
          boxShadow: 'inset 0 0 20px rgba(0,120,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(120,190,255,0.5)', fontSize: 'clamp(28px,7vw,44px)', fontWeight: 900,
        }}>?</div>

        {/* Front (the emoji) */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: '14px',
          background: card.matched
            ? 'linear-gradient(135deg,#0a4d2e,#0f7a44)'
            : 'linear-gradient(135deg,#0077cc,#0055a5)',
          border: `1px solid ${card.matched ? 'rgba(0,255,150,0.5)' : 'rgba(120,200,255,0.5)'}`,
          boxShadow: card.matched ? '0 0 22px rgba(0,220,120,0.5)' : '0 0 16px rgba(0,150,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 'clamp(34px,9vw,58px)',
        }}>{card.emoji}</div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
function Memorice({ onGameEnd, onMenu }) {
  const [duration] = useState(getGameDuration);
  const [cards, setCards] = useState(shuffled);
  const [flipped, setFlipped] = useState([]);   // indices currently face-up, unmatched
  const [wrong, setWrong] = useState([]);        // indices shaking on a mismatch
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [status, setStatus] = useState('playing'); // playing | won | timeup
  const [countdown, setCountdown] = useState(3);

  const busyRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const matchesRef = useRef(0);
  const timeLeftRef = useRef(duration);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  // ── Timer ──
  useEffect(() => {
    if (status !== 'playing') return;
    if (timeLeft <= 0) { setStatus('timeup'); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, status]);

  // ── End → leaderboard (mirrors Game2048) ──
  useEffect(() => {
    if (status === 'playing') return;
    setCountdown(3);
    let c = 3;
    const tick = setInterval(() => {
      c -= 1; setCountdown(c);
      if (c <= 0) { clearInterval(tick); onGameEnd(scoreRef.current); }
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  function handleFlip(i) {
    if (busyRef.current || status !== 'playing') return;
    const card = cards[i];
    if (card.flipped || card.matched) return;

    const next = [...flipped, i];
    setCards(cs => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c)));
    setFlipped(next);
    if (next.length < 2) return;

    busyRef.current = true;
    const [a, b] = next;
    const isMatch = cards[a].emoji === cards[b].emoji; // emoji is stable, closure value is fine

    if (isMatch) {
      setTimeout(() => {
        setCards(cs => cs.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c)));
        setFlipped([]);
        comboRef.current += 1;
        scoreRef.current += PAIR_POINTS + (comboRef.current - 1) * COMBO_STEP;
        matchesRef.current += 1;
        setMatches(matchesRef.current);
        if (matchesRef.current === TOTAL_PAIRS) {
          scoreRef.current += timeLeftRef.current * TIME_BONUS;
          setStatus('won');
        }
        setScore(scoreRef.current);
        busyRef.current = false;
      }, 380); // let the flip finish before the match pop
    } else {
      setWrong([a, b]);
      setTimeout(() => {
        setCards(cs => cs.map((c, idx) => (idx === a || idx === b ? { ...c, flipped: false } : c)));
        setFlipped([]); setWrong([]);
        comboRef.current = 0;
        scoreRef.current = Math.max(0, scoreRef.current - ERROR_PENALTY);
        setScore(scoreRef.current);
        busyRef.current = false;
      }, 750);
    }
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: '#0a0f1e',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: '20px', padding: '20px', boxSizing: 'border-box', overflow: 'hidden',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes memMatch { 0%,100%{transform:rotateY(180deg) scale(1)} 50%{transform:rotateY(180deg) scale(1.12)} }
        @keyframes memShake { 0%,100%{transform:rotateY(180deg) translateX(0)} 25%{transform:rotateY(180deg) translateX(-7px)} 75%{transform:rotateY(180deg) translateX(7px)} }
        @keyframes memFade { from{opacity:0} to{opacity:1} }
        @keyframes memUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {onMenu && <EndGameButton onClick={onMenu} />}

      {/* Header */}
      <div style={{
        width: '100%', maxWidth: '460px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px' }}>Admisión USM</div>
          <div style={{ color: 'white', fontSize: '26px', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1 }}>Memorice</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Pares {matches}/{TOTAL_PAIRS}</div>
        </div>
        <TimerRing timeLeft={timeLeft} total={duration} />
        <div style={{
          background: 'linear-gradient(135deg,#001f4d,#003380)', borderRadius: '10px',
          padding: '8px 14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', minWidth: '84px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '1px' }}>PUNTAJE</div>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{score}</div>
        </div>
      </div>

      {/* Board */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {cards.map((card, i) => (
            <Card
              key={card.id}
              card={card}
              faceUp={card.flipped || card.matched}
              wrong={wrong.includes(i)}
              onClick={() => handleFlip(i)}
            />
          ))}
        </div>

        {/* End overlay */}
        {status !== 'playing' && (
          <div style={{
            position: 'absolute', inset: '-12px', zIndex: 10,
            background: status === 'won' ? 'rgba(0,20,10,0.94)' : 'rgba(0,10,30,0.94)',
            borderRadius: '18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
            animation: 'memFade 0.4s ease',
          }}>
            <div style={{ fontSize: '48px' }}>{status === 'won' ? '🎉' : '⏱️'}</div>
            <div style={{ fontSize: '30px', fontWeight: 900, color: status === 'won' ? '#00e08a' : '#00aaff' }}>
              {status === 'won' ? '¡Todos los pares!' : '¡Tiempo!'}
            </div>
            <div style={{
              marginTop: '8px', background: 'linear-gradient(135deg,#001f4d,#003380)',
              borderRadius: '14px', padding: '14px 28px', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.12)', animation: 'memUp 0.5s ease 0.15s both',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>Puntaje Final</div>
              <div style={{ color: 'white', fontSize: '42px', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{score}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', letterSpacing: '2px', fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif" }}>
              CARGANDO RANKING... {countdown}
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {status === 'playing' && (
        <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: '14px', textAlign: 'center' }}>
          Toca dos cartas y encuentra las parejas
        </div>
      )}
    </div>
  );
}

export default Memorice;
