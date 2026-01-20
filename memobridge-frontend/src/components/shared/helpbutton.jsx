import React from 'react';

const HelpButton = () => {
  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '20px',
    fontSize: '1.3rem',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    width: '80px',
    height: '80px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
  };

  return (
    <button style={buttonStyle}>
      🆘 Help
    </button>
  );
};

export default HelpButton;