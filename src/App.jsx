import React, { useState, useCallback } from 'react'
import Menu from './screens/Menu'
import Attract from './screens/Attract'
import Game2048 from './games/game2048/Game2048'
import Memorice from './games/memorice/Memorice'
import PrimeNinja from './games/primeNinja/PrimeNinja'
import Leaderboard from './components/Leaderboard'
import IdleReset from './components/IdleReset'
import { IDLE_TIMEOUT } from './config'

function Toast({ onDone }) {
  const [visible, setVisible] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,30,80,0.95)',
      color: 'white', fontSize: '22px', fontWeight: '600',
      padding: '18px 40px', borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.15)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      zIndex: 9999, pointerEvents: 'none',
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
      whiteSpace: 'nowrap',
      fontFamily: "'Geom Graphic', 'Segoe UI', system-ui, sans-serif"
    }}>
      🚧 Próximamente — ¡Muy pronto!
    </div>
  );
}

const GAME_META = {
  '2048': { title: '2187 (3⁷) — USM', screen: 'game2048' },
  'memorice': { title: 'Memorice USM', screen: 'memorice' },
  'primeNinja': { title: 'Prime Ninja', screen: 'primeNinja' },
};

function App() {
  const [screen, setScreen] = useState('attract');
  const [toast, setToast] = useState(false);
  const [gameResult, setGameResult] = useState(null); // { gameId, score }
  const [gameKey, setGameKey] = useState(0); // force remount on play-again

  // Registration is off-totem: QR → web form → ticket, checked by staff.
  // The totem just launches the game once the student is let through.
  const handleSelectGame = (id) => {
    if (GAME_META[id]) setScreen(GAME_META[id].screen);
    else setToast(true);
  };

  const handleGameEnd = (gameId, score) => {
    setGameResult({ gameId, score });
    setScreen('leaderboard');
  };

  const handlePlayAgain = () => {
    if (!gameResult) return;
    const meta = GAME_META[gameResult.gameId];
    setGameResult(null);
    setGameKey(k => k + 1);
    setScreen(meta ? meta.screen : 'menu');
  };

  const handleMenu = () => {
    setGameResult(null);
    setScreen('menu');
  };

  // Kiosk idle: after IDLE_TIMEOUT with no input, drop any in-progress game
  // (abandoned → no score saved) and return to the Attract screen.
  const handleIdle = useCallback(() => {
    setGameResult(null);
    setScreen('attract');
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <IdleReset enabled={screen !== 'attract'} timeout={IDLE_TIMEOUT} onIdle={handleIdle} />
      {screen === 'attract' && (
        <Attract onSelect={() => setScreen('menu')} />
      )}
      {screen === 'menu' && (
        <Menu onSelectGame={handleSelectGame} />
      )}
      {screen === 'game2048' && (
        <Game2048
          key={gameKey}
          onGameEnd={(score) => handleGameEnd('2048', score)}
          onMenu={handleMenu}
        />
      )}
      {screen === 'memorice' && (
        <Memorice
          key={gameKey}
          onGameEnd={(score) => handleGameEnd('memorice', score)}
          onMenu={handleMenu}
        />
      )}
      {screen === 'primeNinja' && (
        <PrimeNinja
          key={gameKey}
          onGameEnd={(score) => handleGameEnd('primeNinja', score)}
          onMenu={handleMenu}
        />
      )}
      {screen === 'leaderboard' && gameResult && (
        <Leaderboard
          gameId={gameResult.gameId}
          gameTitle={GAME_META[gameResult.gameId]?.title || gameResult.gameId}
          score={gameResult.score}
          onPlayAgain={handlePlayAgain}
          onMenu={handleMenu}
        />
      )}
      {toast && (
        <Toast onDone={() => setToast(false)} />
      )}
    </div>
  )
}

export default App
