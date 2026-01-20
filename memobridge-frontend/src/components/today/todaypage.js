import React from 'react';
import { useNavigate } from 'react-router-dom';
import LargeButton from '../shared/largebutton';

const TodayPage = () => {
  const navigate = useNavigate();
  
  const containerStyle = {
    padding: '20px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    margin: '20px 0',
    color: '#2c5aa0'
  };

  const infoCardStyle = {
    backgroundColor: 'white',
    border: '3px solid #FF9800',
    borderRadius: '15px',
    padding: '30px',
    margin: '20px auto',
    maxWidth: '600px',
    fontSize: '1.5rem'
  };

  const reminderListStyle = {
    listStyle: 'none',
    padding: '0',
    margin: '30px 0',
    textAlign: 'left'
  };

  const reminderItemStyle = {
    padding: '15px',
    margin: '10px 0',
    backgroundColor: '#fff3e0',
    borderRadius: '10px',
    fontSize: '1.3rem',
    borderLeft: '5px solid #FF9800'
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>📅 Today's Plan</h1>
      
      <div style={infoCardStyle}>
        <div style={{fontSize: '2rem', marginBottom: '10px'}}>
          {currentDate}
        </div>
        <div style={{fontSize: '1.8rem', color: '#2c5aa0'}}>
          ⏰ {currentTime}
        </div>
        <div style={{fontSize: '1.3rem', marginTop: '10px', color: '#666'}}>
          ☀️ Sunny, 72°F • Perfect day!
        </div>
      </div>

      <div style={{...infoCardStyle, borderColor: '#4CAF50'}}>
        <h2 style={{color: '#4CAF50', marginBottom: '20px'}}>Today's Schedule</h2>
        <ul style={reminderListStyle}>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>💊</span> Morning Medication - <strong>9:00 AM</strong>
          </li>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>👥</span> Lunch with Family - <strong>11:00 AM</strong>
          </li>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>🛌</span> Afternoon Rest - <strong>2:00 PM</strong>
          </li>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>📖</span> Read Newspaper - <strong>4:00 PM</strong>
          </li>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>💊</span> Evening Medication - <strong>6:00 PM</strong>
          </li>
          <li style={reminderItemStyle}>
            <span style={{fontSize: '1.5rem'}}>👥</span> Dinner with Family - <strong>8:00 PM</strong>
          </li>
        </ul>
      </div>

      <LargeButton 
        icon="⬅️" 
        text="Back to Home" 
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default TodayPage;