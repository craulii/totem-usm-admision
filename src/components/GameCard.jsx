import React from 'react';

const GameCard = ({ title, icon, color, onClick }) => {
  return (
    <div 
      style={{...styles.card, backgroundColor: color}} 
      onClick={onClick}
    >
      <span style={styles.icon}>{icon}</span>
      <h2 style={styles.text}>{title}</h2>
    </div>
  );
};

const styles = {
  card: {
    height: '350px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 60px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s', // Efecto táctil
    cursor: 'pointer'
  },
  icon: { fontSize: '100px', marginRight: '40px' },
  text: { fontSize: '50px', color: 'white', fontWeight: 'bold' }
};

export default GameCard;