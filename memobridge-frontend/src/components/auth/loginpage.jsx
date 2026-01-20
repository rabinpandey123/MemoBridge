// loginpage.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import LargeButton from '../shared/largebutton';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    margin: '20px 0',
    color: '#2c5aa0'
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    margin: '40px 0'
  };

  const inputStyle = {
    padding: '20px',
    fontSize: '1.3rem',
    border: '3px solid #2c5aa0',
    borderRadius: '10px',
    width: '100%'
  };

  const handleChange = (field, value) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🔐 Login to Memobridge</h1>
      
      <form style={formStyle} onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => handleChange('email', e.target.value)}
            style={inputStyle}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => handleChange('password', e.target.value)}
            style={inputStyle}
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{
            color: 'red',
            fontSize: '1.2rem',
            padding: '15px',
            backgroundColor: '#ffe6e6',
            borderRadius: '10px',
            border: '2px solid red'
          }}>
            {error}
          </div>
        )}

        <LargeButton 
          icon={loading ? "⏳" : "🔑"}
          text={loading ? "Logging in..." : "Login"}
          onClick={handleSubmit}
          disabled={loading}
        />
      </form>

      <div style={{marginTop: '30px', fontSize: '1.3rem'}}>
        <p>Don't have an account? </p>
        <Link 
          to="/signup" 
          style={{
            color: '#2c5aa0',
            fontSize: '1.3rem',
            textDecoration: 'underline',
            fontWeight: 'bold'
          }}
        >
          Create new account
        </Link>
      </div>

      <div style={{marginTop: '40px'}}>
        <LargeButton 
          icon="⬅️" 
          text="Back to Home" 
          onClick={() => navigate('/')}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default LoginPage;