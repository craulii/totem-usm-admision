import React from 'react';

const Attract = ({ onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      style={{
        width: '100%',
        height: '100%',
        background: '#003366',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <h1 style={{ color: 'white', fontSize: '72px', textAlign: 'center' }}>
        Admisión USM
      </h1>
      <p style={{ color: '#aac4ff', fontSize: '36px', marginTop: '30px' }}>
        Toca la pantalla para comenzar
      </p>
    </div>
  );
};

export default Attract;