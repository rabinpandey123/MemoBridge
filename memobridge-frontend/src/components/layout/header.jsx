import React, { useState } from 'react';
import { useAuth } from '../contexts/authcontext';
import Navigation from './navigation';

const Header = () => {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const headerStyle = {
    backgroundColor: '#2c5aa0',
    color: 'white',
    padding: '10px 20px',
    position: 'relative'
  };

  const userInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    margin: '0',
    color: 'white'
  };

  const authButtonsStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  };

  const authButtonStyle = {
    padding: '8px 16px',
    fontSize: '1rem',
    backgroundColor: 'white',
    color: '#2c5aa0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none'
  };

  const profileButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '10px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '15px'
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '100%',
    right: '20px',
    backgroundColor: 'white',
    border: '2px solid #2c5aa0',
    borderRadius: '10px',
    padding: '20px',
    minWidth: '300px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    zIndex: 1000
  };

  const profileItemStyle = {
    padding: '10px 0',
    fontSize: '1.1rem',
    color: '#333',
    borderBottom: '1px solid #eee'
  };

  const userInitialStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  };

  const aboutSectionStyle = {
    backgroundColor: '#f0f8ff',
    padding: '15px',
    borderRadius: '8px',
    margin: '15px 0',
    borderLeft: '4px solid #2c5aa0'
  };

  const aboutTitleStyle = {
    color: '#2c5aa0',
    fontWeight: 'bold',
    marginBottom: '8px',
    fontSize: '1.1rem'
  };

  return (
    <header style={headerStyle}>
      <div style={userInfoStyle}>
        {/* Memobridge Title - Always Visible */}
        <div>
          <h1 style={titleStyle}>Memobridge</h1>
        </div>
        
        <div style={authButtonsStyle}>
          {user ? (
            <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
              <span style={{marginRight: '15px', fontSize: '1.1rem'}}>
                Hello, {user.name}!
              </span>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                style={profileButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
              >
                <div style={userInitialStyle}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              
              {showProfile && (
                <div style={dropdownStyle}>
                  {/* Welcome Section */}
                  <div style={profileItemStyle}>
                    <strong>Welcome to Memobridge, {user.name}!</strong>
                  </div>
                  
                  {/* About Memobridge Section */}
                  <div style={aboutSectionStyle}>
                    <div style={aboutTitleStyle}>About Memobridge</div>
                    <div style={{fontSize: '0.9rem', color: '#555', lineHeight: '1.4'}}>
                      Memobridge is a supportive platform designed to help individuals 
                      with Alzheimer's disease and their caregivers. We provide memory 
                      preservation tools, daily assistance, and family connection features 
                      to make life easier and more meaningful.
                    </div>
                  </div>

                  {/* User Information */}
                  <div style={profileItemStyle}>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div style={profileItemStyle}>
                    <strong>Family Members:</strong> {user.familyMembers ? user.familyMembers.length : 0}
                  </div>
                  <div style={profileItemStyle}>
                    <strong>User ID:</strong> {String(user.id).substring(0, 8)}...
                  </div>
                  
                  {/* Logout Button */}
                  <div style={{...profileItemStyle, borderBottom: 'none', paddingTop: '15px'}}>
                    <button 
                      onClick={logout}
                      style={{
                        ...authButtonStyle,
                        backgroundColor: '#ff4444',
                        color: 'white',
                        width: '100%',
                        padding: '12px',
                        fontSize: '1.1rem'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" style={authButtonStyle}>Login</a>
              <a href="/signup" style={authButtonStyle}>Sign Up</a>
            </>
          )}
        </div>
      </div>
      <Navigation />
    </header>
  );
};

export default Header;