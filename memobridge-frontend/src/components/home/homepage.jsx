import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import LargeButton from '../shared/largebutton';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const containerStyle = {
    padding: '20px',
    textAlign: 'center'
  };

  const welcomeStyle = {
    fontSize: '2.5rem',
    margin: '20px 0',
    color: '#2c5aa0'
  };

  const taglineStyle = {
    fontSize: '1.5rem',
    color: '#2c5aa0',
    margin: '10px 0 40px 0',
    fontWeight: 'bold'
  };

  const actionsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={containerStyle}>
      {/* Welcome Message */}
      <div style={welcomeStyle}>
        {user ? `Welcome back, ${user.name}! 👋` : 'Welcome to Memobridge! 👋'}
      </div>

      {/* Logout button for authenticated users */}
      {user && (
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          Logout
        </button>
      )}

      {/* ONE LINE DESCRIPTION */}
      <div style={taglineStyle}>
        Supporting individuals with Alzheimer's through memory preservation and daily assistance
      </div>
      
      {/* Quick Actions */}
      <div style={actionsStyle}>
        <LargeButton 
          icon="📸" 
          text="View Memories" 
          onClick={() => navigate('/memories')}
        />
        <LargeButton 
          icon="👨‍👩‍👧" 
          text="Call Family" 
          onClick={() => navigate('/family')}
        />
        <LargeButton 
          icon="🎵" 
          text="Listen Music" 
          onClick={() => navigate('/music')}
        />
        <LargeButton 
          icon="📅" 
          text="Daily Activities" 
        onClick={() => navigate('/activities')}
        />
        
        <LargeButton 
          icon="🎮" 
          text="Play Games" 
          onClick={() => navigate('/games')}
        />
      </div>

      {/* Today's Reminders */}
      <div style={{marginTop: '40px', fontSize: '1.3rem'}}>
        <h2 style={{color: '#2c5aa0', marginBottom: '20px'}}>Today's Reminders</h2>
        <ul style={{listStyle: 'none', marginTop: '15px'}}>
          <li>💊 morning medication - 9:00 AM</li>
          <li>👥 Lunch with family - 11:00 AM</li>
          <li>💊 Evening Medication - 6:00 PM</li>
          <li>🍲 dinner with family - 8:00 PM</li>
        </ul>
      </div>
    </div>
  );
};

export default HomePage;