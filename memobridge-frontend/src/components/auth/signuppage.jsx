// signuppage.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import LargeButton from '../shared/largebutton';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { signup } = useAuth();

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await signup(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>👋 Join Memobridge</h1>
      
      <form style={formStyle} onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
            disabled={loading}
            minLength="6"
          />
        </div>

        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
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
          icon={loading ? "⏳" : "✅"}
          text={loading ? "Creating Account..." : "Create Account"}
          onClick={handleSubmit}
          disabled={loading}
        />
      </form>

      <div style={{marginTop: '30px', fontSize: '1.3rem'}}>
        <p>Already have an account? </p>
        <Link 
          to="/login" 
          style={{
            color: '#2c5aa0',
            fontSize: '1.3rem',
            textDecoration: 'underline',
            fontWeight: 'bold'
          }}
        >
          Login here
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

export default SignupPage;