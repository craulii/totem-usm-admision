import React, { useEffect, useRef, useState } from 'react';
import EndGameButton from '../../components/EndGameButton';
import { getGameDuration } from '../../lib/db';
import { isPrime, spawnValue } from './prime.mjs';

// ─── Tuning constants ────────────────────────────────────────────────────────
// ponytail: these are the physics/difficulty knobs. Calibrate on the real
// Android 42" portrait tablet — a touch panel "feels" different from a mouse.
const GRAVITY = 1500;      // px/s² pulling numbers back down
// Difficulty ramp: spawns start far apart (easy) and speed up toward SPAWN_MIN as
// the game goes on, but never below SPAWN_MIN so it stays beatable. Interpolated
// over the whole game duration.
const SPAWN_START = 1.6;   // s between spawns at t=0 (easy start)
const SPAWN_MIN = 0.8;     // s between spawns at the end (hardest, still fair)
const RADIUS = 44;         // number orb radius (px)
const BASE_POINTS = 10;    // points per prime sliced
const COMBO_CAP = 5;       // max multiplier within a single swipe
const START_LIVES = 3;
const TRAIL_MS = 180;      // how long the blade trail lingers

let uid = 0;

// Distance from point P to segment AB — used for slice hit-testing.
function pointSegDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// ─── Timer ring (same visual language as Game2048) ───────────────────────────
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

// ─── Main component ──────────────────────────────────────────────────────────
function PrimeNinja({ onGameEnd, onMenu }) {
  const [duration] = useState(getGameDuration);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [status, setStatus] = useState('playing'); // playing | lost | timeup
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [countdown, setCountdown] = useState(3);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  // All fast-changing game state lives in refs so the rAF loop never re-renders.
  const sizeRef = useRef({ w: 0, h: 0 });
  const objectsRef = useRef([]);
  const halvesRef = useRef([]);
  const particlesRef = useRef([]);
  const bladeRef = useRef([]);          // {x,y,t}
  const flashRef = useRef(null);        // {color, t}
  const comboRef = useRef(0);           // primes sliced in the current swipe
  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const statusRef = useRef('playing');
  const draggingRef = useRef(false);
  const lastPtRef = useRef(null);
  const testSliceRef = useRef(() => {}); // set by the game loop, used by pointer handlers
  useEffect(() => { statusRef.current = status; }, [status]);

  // ── score / lives helpers (only fire on events, so setState stays cheap) ──
  const addScore = (n) => { scoreRef.current += n; setScore(scoreRef.current); };
  const loseLife = () => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    flashRef.current = { color: '255,60,60', t: 1 };
    if (livesRef.current <= 0 && statusRef.current === 'playing') setStatus('lost');
  };

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

  // ── Canvas sizing (DPR-aware) ──
  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = wrap;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // ── The game loop ──
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let raf, last = performance.now(), spawnAcc = 0, elapsed = 0;

    // Canvas doesn't wait for the webfont; ask for it so the orbs' numbers render
    // in Geom Graphic once loaded (the rAF loop redraws every frame → self-heals).
    // ponytail: fire-and-forget; a couple of early frames may use the fallback.
    if (document.fonts) document.fonts.load(`700 ${RADIUS}px "Geom Graphic"`).catch(() => {});

    const spawn = () => {
      const { w, h } = sizeRef.current;
      if (!w) return;
      const value = spawnValue(0.5);
      const rise = h * (0.55 + Math.random() * 0.28);         // apex height
      objectsRef.current.push({
        id: ++uid, value, prime: isPrime(value),
        x: RADIUS * 2 + Math.random() * (w - RADIUS * 4),
        y: h + RADIUS,
        vx: (Math.random() * 2 - 1) * 170,
        vy: -Math.sqrt(2 * GRAVITY * rise),
        angle: 0, spin: (Math.random() * 2 - 1) * 2.2,
      });
    };

    const sliceObject = (o) => {
      o.gone = true;
      const dir = o.vx >= 0 ? 1 : -1;
      // two halves fly apart
      for (const side of [-1, 1]) {
        halvesRef.current.push({
          x: o.x, y: o.y, value: o.value, side,
          vx: side * 130 + o.vx * 0.3, vy: o.vy * 0.4 - 70,
          angle: o.angle, spin: side * 3, life: 1,
        });
      }
      const good = o.prime;
      const color = good ? '0,220,255' : '255,60,60';
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2, sp = 90 + Math.random() * 280;
        particlesRef.current.push({ x: o.x, y: o.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color });
      }
      if (good) {
        comboRef.current += 1;
        addScore(BASE_POINTS * Math.min(comboRef.current, COMBO_CAP));
      } else {
        loseLife();
      }
    };

    const testSlice = (ax, ay, bx, by) => {
      if (statusRef.current !== 'playing') return;
      for (const o of objectsRef.current) {
        if (o.gone) continue;
        if (pointSegDist(o.x, o.y, ax, ay, bx, by) < RADIUS) sliceObject(o);
      }
    };
    // expose to pointer handlers
    testSliceRef.current = testSlice;

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = sizeRef.current;
      const playing = statusRef.current === 'playing';

      // spawn — interval eases from SPAWN_START down to SPAWN_MIN over the game
      if (playing) {
        elapsed += dt;
        const ramp = Math.min(1, elapsed / duration); // 0 → 1, clamped
        const interval = SPAWN_START - (SPAWN_START - SPAWN_MIN) * ramp;
        spawnAcc += dt;
        while (spawnAcc >= interval) { spawnAcc -= interval; spawn(); }
      }

      // update numbers
      for (const o of objectsRef.current) {
        o.vy += GRAVITY * dt;
        o.x += o.vx * dt; o.y += o.vy * dt; o.angle += o.spin * dt;
        if (o.y - RADIUS > h && !o.gone) {           // fell off the bottom
          o.gone = true;
          if (o.prime && playing) loseLife();        // missed a prime
        }
      }
      objectsRef.current = objectsRef.current.filter(o => !o.gone);

      // update halves / particles
      for (const hf of halvesRef.current) {
        hf.vy += GRAVITY * dt; hf.x += hf.vx * dt; hf.y += hf.vy * dt;
        hf.angle += hf.spin * dt; hf.life -= dt * 0.9;
      }
      halvesRef.current = halvesRef.current.filter(hf => hf.life > 0);
      for (const p of particlesRef.current) {
        p.vy += GRAVITY * 0.5 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.7;
      }
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      // trim blade trail
      const cut = now - TRAIL_MS;
      bladeRef.current = bladeRef.current.filter(pt => pt.t >= cut);

      // ── render ──
      ctx.clearRect(0, 0, w, h);

      // numbers — all look identical on purpose; reading the value is the skill
      for (const o of objectsRef.current) {
        ctx.save();
        ctx.translate(o.x, o.y); ctx.rotate(o.angle);
        const grad = ctx.createLinearGradient(0, -RADIUS, 0, RADIUS);
        grad.addColorStop(0, '#0077cc'); grad.addColorStop(1, '#00305e');
        ctx.beginPath(); ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(0,150,255,0.6)'; ctx.shadowBlur = 18;
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(120,200,255,0.5)'; ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${RADIUS}px "Geom Graphic", "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(o.value), 0, 2);
        ctx.restore();
      }

      // sliced halves
      for (const hf of halvesRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, hf.life);
        ctx.translate(hf.x, hf.y); ctx.rotate(hf.angle);
        ctx.beginPath();
        const a0 = hf.side < 0 ? Math.PI / 2 : -Math.PI / 2;
        ctx.arc(0, 0, RADIUS, a0, a0 + Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#013b6b'; ctx.fill();
        ctx.strokeStyle = 'rgba(120,200,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
      }

      // particles
      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${p.color})`; ctx.fill();
      }
      ctx.globalAlpha = 1;

      // blade trail
      const b = bladeRef.current;
      if (b.length > 1) {
        for (let i = 1; i < b.length; i++) {
          const a = (i / b.length);
          ctx.beginPath();
          ctx.moveTo(b[i - 1].x, b[i - 1].y);
          ctx.lineTo(b[i].x, b[i].y);
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth = 2 + a * 12;
          ctx.lineCap = 'round';
          ctx.shadowColor = 'rgba(0,200,255,0.9)'; ctx.shadowBlur = 14;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      // damage flash
      if (flashRef.current) {
        flashRef.current.t -= dt * 2.2;
        if (flashRef.current.t <= 0) flashRef.current = null;
        else {
          ctx.fillStyle = `rgba(${flashRef.current.color},${flashRef.current.t * 0.35})`;
          ctx.fillRect(0, 0, w, h);
        }
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Pointer handling → blade trail + slice tests ──
  const pointFromEvent = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e.changedTouches ? e.changedTouches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };
  const startSwipe = (e) => {
    draggingRef.current = true;
    comboRef.current = 0;
    const p = pointFromEvent(e);
    lastPtRef.current = p;
    bladeRef.current.push({ x: p.x, y: p.y, t: performance.now() });
  };
  const moveSwipe = (e) => {
    if (!draggingRef.current) return;
    e.preventDefault();
    const p = pointFromEvent(e);
    const prev = lastPtRef.current;
    bladeRef.current.push({ x: p.x, y: p.y, t: performance.now() });
    if (prev) testSliceRef.current(prev.x, prev.y, p.x, p.y);
    lastPtRef.current = p;
  };
  const endSwipe = () => { draggingRef.current = false; lastPtRef.current = null; comboRef.current = 0; };

  const urgent = timeLeft <= 10;

  return (
    <div ref={wrapRef} style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'radial-gradient(circle at 50% 20%, #0d1b34 0%, #060a16 70%)',
      overflow: 'hidden', touchAction: 'none', userSelect: 'none',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif",
    }}>
      {onMenu && <EndGameButton onClick={onMenu} />}

      <canvas
        ref={canvasRef}
        onMouseDown={startSwipe} onMouseMove={moveSwipe} onMouseUp={endSwipe} onMouseLeave={endSwipe}
        onTouchStart={startSwipe} onTouchMove={moveSwipe} onTouchEnd={endSwipe}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* HUD */}
      <div style={{
        position: 'absolute', top: '16px', left: 0, right: 0, zIndex: 5,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: '4px', fontSize: '26px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
          {[0, 1, 2].map(i => (
            <span key={i} style={{ opacity: i < lives ? 1 : 0.18, transition: 'opacity 0.3s ease' }}>❤️</span>
          ))}
        </div>
        <TimerRing timeLeft={timeLeft} total={duration} />
        <div style={{
          background: 'linear-gradient(135deg,#001f4d,#003380)',
          borderRadius: '10px', padding: '8px 16px', textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.12)', minWidth: '86px',
        }}>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', letterSpacing: '1px' }}>PUNTAJE</div>
          <div style={{ color: 'white', fontSize: '20px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{score}</div>
        </div>
      </div>

      {/* Hint */}
      {status === 'playing' && (
        <div style={{
          position: 'absolute', bottom: '18px', left: 0, right: 0, textAlign: 'center',
          color: urgent ? 'rgba(255,120,120,0.7)' : 'rgba(255,255,255,0.28)', fontSize: '14px',
          letterSpacing: '0.5px', pointerEvents: 'none',
        }}>
          Desliza para cortar <b>solo números primos</b> ✂️
        </div>
      )}

      {/* End overlay */}
      {status !== 'playing' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 20,
          background: status === 'lost' ? 'rgba(20,0,0,0.9)' : 'rgba(0,10,30,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
          animation: 'pnFade 0.4s ease',
        }}>
          <style>{`@keyframes pnFade{from{opacity:0}to{opacity:1}}@keyframes pnUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div style={{ fontSize: '48px' }}>{status === 'lost' ? '💥' : '⏱️'}</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: status === 'lost' ? '#ff4444' : '#00aaff' }}>
            {status === 'lost' ? 'Sin vidas' : '¡Tiempo!'}
          </div>
          <div style={{
            marginTop: '8px', background: 'linear-gradient(135deg,#001f4d,#003380)',
            borderRadius: '14px', padding: '14px 28px', textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.12)', animation: 'pnUp 0.5s ease 0.15s both',
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
  );
}

export default PrimeNinja;
