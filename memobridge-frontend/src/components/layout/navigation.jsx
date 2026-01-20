// src/components/layout/navigation.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '20px',
    backgroundColor: '#2c5aa0'
  };

  const buttonStyle = (isActive) => ({
    padding: '15px 25px',
    fontSize: '1.2rem',
    backgroundColor: isActive ? '#4CAF50' : 'white',
    color: isActive ? 'white' : '#333',
    border: '3px solid #1a3a6d',
    borderRadius: '8px',
    cursor: 'pointer',
    minWidth: '120px',
    textDecoration: 'none',
    textAlign: 'center'
  });

  return (
    <nav style={navStyle}>
      <Link 
        to="/" 
        style={buttonStyle(location.pathname === '/')}
      >
        Home
      </Link>
      <Link 
        to="/memories" 
        style={buttonStyle(location.pathname === '/memories')}
      >
        Memories
      </Link>
      <Link 
        to="/family" 
        style={buttonStyle(location.pathname === '/family')}
      >
        Family
      </Link>
      <Link 
        to="/music" 
        style={buttonStyle(location.pathname === '/music')}
      >
        Music
      </Link>
      <Link 
        to="/activities" 
        style={buttonStyle(location.pathname === '/activities')}
      >
        Activities
      </Link>
      {/* NEW GAMES TAB */}
      <Link 
        to="/games" 
        style={buttonStyle(location.pathname === '/games')}
      >
        Games
      </Link>
      <Link 
        to="/today" 
        style={buttonStyle(location.pathname === '/today')}
      >
        Today
      </Link>
    </nav>
  );
};

export default Navigation;