import React, { useState } from 'react'
import Menu from './screens/Menu'
import Game2048 from './games/game2048/Game2048'

function Toast({ message, onDone }) {
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

function App() {
  const [screen, setScreen] = useState('menu');
  const [toast, setToast] = useState(false);

  const handleSelectGame = (id) => {
    if (id === '2048') {
      setScreen('game2048');
    } else {
      setToast(true);
    }
  };

  const handleBack = () => setScreen('menu');

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {screen === 'menu' && (
        <Menu onSelectGame={handleSelectGame} />
      )}
      {screen === 'game2048' && (
        <Game2048 onBack={handleBack} />
      )}
      {toast && (
        <Toast message="Próximamente" onDone={() => setToast(false)} />
      )}
    </div>
  )
}

export default App
