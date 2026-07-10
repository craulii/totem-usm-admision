import React, { useState } from 'react'
import Menu from './screens/Menu'
import Register from './screens/Register'
import Game2048 from './games/game2048/Game2048'
import Leaderboard from './components/Leaderboard'

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
      fontFamily: "'Segoe UI', system-ui, sans-serif"
    }}>
      🚧 Próximamente — ¡Muy pronto!
    </div>
  );
}

const GAME_META = {
  '2048': { title: '2187 (3⁷) — USM', screen: 'game2048' },
};

function App() {
  const [screen, setScreen] = useState('menu');
  const [toast, setToast] = useState(false);
  const [gameResult, setGameResult] = useState(null); // { gameId, score }
  const [gameKey, setGameKey] = useState(0); // force remount on play-again
  const [pendingGame, setPendingGame] = useState(null); // gameId awaiting registration
  const [student, setStudent] = useState(null); // last registered student (Fase 2: → Supabase)

  // Selecting a game always goes through registration first.
  const handleSelectGame = (id) => {
    if (GAME_META[id]) { setPendingGame(id); setScreen('register'); }
    else setToast(true);
  };

  const handleRegistered = (data) => {
    setStudent(data);
    // ponytail: Fase 2 enviará esto a Supabase / cola offline. Por ahora queda en memoria.
    console.log('Registro:', data);
    const meta = GAME_META[pendingGame];
    setGameKey(k => k + 1);
    setScreen(meta ? meta.screen : 'menu');
  };

  const handleGameEnd = (gameId, score) => {
    setGameResult({ gameId, score });
    setScreen('leaderboard');
  };

  // "Jugar de nuevo" también pide datos otra vez (aunque se repita el alumno).
  const handlePlayAgain = () => {
    if (!gameResult) return;
    const id = gameResult.gameId;
    setGameResult(null);
    setPendingGame(id);
    setScreen('register');
  };

  const handleMenu = () => {
    setGameResult(null);
    setScreen('menu');
  };

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {screen === 'menu' && (
        <Menu onSelectGame={handleSelectGame} />
      )}
      {screen === 'register' && (
        <Register onSubmit={handleRegistered} onCancel={handleMenu} />
      )}
      {screen === 'game2048' && (
        <Game2048
          key={gameKey}
          onGameEnd={(score) => handleGameEnd('2048', score)}
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
