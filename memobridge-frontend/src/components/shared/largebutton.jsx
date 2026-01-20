import React from 'react';

const LargeButton = ({ icon, text, onClick }) => {
  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontSize: '1.5rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    minHeight: '120px',
    gap: '10px'
  };

  const iconStyle = {
    fontSize: '2.5rem'
  };

  return (
    <button style={buttonStyle} onClick={onClick}>
      <span style={iconStyle}>{icon}</span>
      <span>{text}</span>
    </button>
  );
};

export default LargeButton;