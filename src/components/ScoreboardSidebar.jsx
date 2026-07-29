import React, { useState, useEffect, useCallback } from 'react';
import { BRAND } from '../brand';

const GAME_IDS = ['2048', 'memorice', 'primeNinja'];

const GAME_LABELS = {
  '2048': '6561',
  'memorice': 'Memorice',
  'primeNinja': 'Prime Ninja',
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

const headerCell = {
  color: 'rgba(26,26,46,0.55)', fontSize: 'clamp(8px, 1vh, 10px)',
  letterSpacing: '1.5px', fontFamily: BRAND.font,
};

function Row({ rank, entry }) {
  const isTop3 = rank <= 3;
  const textColor = entry
    ? (isTop3 ? BRAND.purple : BRAND.textOnLight)
    : 'rgba(26,26,46,0.3)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '24px 1fr 64px',
      gap: '2px 8px', alignItems: 'center',
      padding: 'clamp(3px, 0.6vh, 6px) clamp(4px, 0.8vw, 8px)',
      background: isTop3 && entry ? 'rgba(255,255,255,0.25)' : 'transparent',
      borderRadius: '6px',
    }}>
      <span style={{ color: textColor, fontSize: 'clamp(11px, 1.3vh, 14px)', fontWeight: isTop3 ? 900 : 700, textAlign: 'right', fontFamily: BRAND.font }}>
        {rank}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', overflow: 'hidden', minWidth: 0 }}>
        <span style={{
          color: textColor, fontSize: 'clamp(11px, 1.4vh, 15px)', fontWeight: 800,
          letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: BRAND.font,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry ? entry.name : '—'}
        </span>
        {entry && (
          <span style={{ color: 'rgba(26,26,46,0.45)', fontSize: 'clamp(7px, 0.9vh, 9px)', fontWeight: 700, fontFamily: BRAND.font, whiteSpace: 'nowrap' }}>
            {GAME_LABELS[entry.gameId] || entry.gameId}
          </span>
        )}
      </div>
      <span style={{ color: textColor, fontSize: 'clamp(11px, 1.3vh, 14px)', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontFamily: BRAND.font }}>
        {entry ? entry.score.toLocaleString('es-CL') : '—'}
      </span>
    </div>
  );
}

function Column({ entries, startRank }) {
  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '24px 1fr 64px', gap: '2px 8px',
        padding: '0 clamp(4px, 0.8vw, 8px)', marginBottom: '2px',
      }}>
        <span style={{ ...headerCell, textAlign: 'right' }}>#</span>
        <span style={headerCell}>NOMBRE</span>
        <span style={{ ...headerCell, textAlign: 'right' }}>PTS</span>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Row key={startRank + i} rank={startRank + i} entry={entries[i]} />
      ))}
    </div>
  );
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
      position: 'relative', width: '100%', flexShrink: 0,
      marginTop: 'clamp(16px, 2.5vh, 24px)',
      background: BRAND.gradientRanking,
      border: '3px solid white',
      borderRadius: 'clamp(16px, 2.2vh, 26px)',
      padding: 'clamp(14px, 2vh, 20px) clamp(14px, 2.5vw, 22px) clamp(8px, 1.2vh, 12px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    }}>
      {/* Floating "HIGH SCORES" pill, straddling the top border */}
      <div style={{
        position: 'absolute', top: 'clamp(-20px, -2.8vh, -14px)', left: 'clamp(14px, 3vw, 26px)',
        background: BRAND.purple, border: '3px solid white', borderRadius: '999px',
        padding: 'clamp(5px, 0.9vh, 9px) clamp(16px, 3vw, 26px)',
        color: 'white', fontWeight: 900, fontFamily: BRAND.font,
        fontSize: 'clamp(12px, 1.6vh, 17px)', letterSpacing: '2px',
        textTransform: 'uppercase', whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        High Scores
      </div>

      <div style={{
        display: 'flex', gap: 'clamp(12px, 2.5vw, 28px)',
        opacity: refreshing ? 0.7 : 1, transition: 'opacity 0.2s ease',
        marginTop: 'clamp(6px, 1vh, 10px)',
      }}>
        <Column entries={scores.slice(0, 5)} startRank={1} />
        <Column entries={scores.slice(5, 10)} startRank={6} />
      </div>
    </div>
  );
}

export default ScoreboardSidebar;
