import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import { familyService } from '../../services/familyservice';
import LargeButton from '../shared/largebutton';

const FamilyPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: '',
    phone: '',
    email: '',
    icon: '👤'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  
  const handleTokenError = () => {
    console.error('🔄 Token error - redirecting to login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Force reload to reset auth state
  };

  // Check token on component mount and when authentication changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔐 Token check:', token ? 'Present' : 'Missing');
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    if (isAuthenticated) {
      loadFamilyMembers();
    }
  }, [isAuthenticated]);
  

  // Style objects - MUST BE DEFINED INSIDE THE COMPONENT
  const containerStyle = {
    padding: '20px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    margin: '20px 0',
    color: '#2c5aa0'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px',
    maxWidth: '900px',
    margin: '40px auto',
    padding: '20px'
  };

  const contactCardStyle = {
    backgroundColor: 'white',
    border: '3px solid #4CAF50',
    borderRadius: '20px',
    padding: '25px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  };

  const contactImageStyle = {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    margin: '0 auto 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem'
  };

  const addFormStyle = {
    backgroundColor: 'white',
    border: '3px solid #FF9800',
    borderRadius: '15px',
    padding: '30px',
    margin: '20px auto',
    maxWidth: '500px'
  };

  const inputStyle = {
    padding: '15px',
    fontSize: '1.2rem',
    border: '2px solid #ddd',
    borderRadius: '8px',
    width: '100%',
    margin: '10px 0'
  };

  const requiredFieldStyle = {
    border: '2px solid #ff4444'
  };

  // Load family members when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadFamilyMembers();
    }
  }, [isAuthenticated]);

  const loadFamilyMembers = async () => {
    try {
      console.log('🔄 Loading family members...');
      setLoading(true);
      setError('');
      
      const response = await familyService.getFamilyMembers();
      console.log('📋 Family members response:', response);
      
      // IMPORTANT: Backend returns { family_members: [...] }
      setFamilyMembers(response.family_members || []);
      
    } catch (error) {
      console.error('❌ Failed to load family members:', error);
      setError(`Failed to load family members: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    // Reset error
    setError('');

    // Validation
    if (!newMember.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!newMember.relation.trim()) {
      setError('Relation is required');
      return;
    }
    if (!newMember.phone.trim() && !newMember.email.trim()) {
      setError('Please provide at least one contact method (phone or email)');
      return;
    }

    try {
      console.log('🔄 Adding family member...', newMember);
      setAdding(true);
      setError('');
      
      const response = await familyService.addFamilyMember(newMember);
      console.log('✅ Add member response:', response);
      
      // Clear form and hide it
      setNewMember({ name: '', relation: '', phone: '', email: '', icon: '👤' });
      setShowAddForm(false);
      
      // Reload family members to get the updated list
      await loadFamilyMembers();
      
    } catch (error) {
      console.error('❌ Failed to add family member:', error);
      setError(`Failed to add family member: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      // Remove any non-digit characters except +
      const cleanPhone = phone.replace(/[^\d+]/g, '');
      window.open(`tel:${cleanPhone}`, '_self');
    }
  };

  const handleEmail = (email) => {
    if (email) {
      window.open(`mailto:${email}`, '_self');
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>👨‍👩‍👧 Family & Friends</h1>
      
      {/* Debug info */}
      <div style={{ 
        backgroundColor: '#f0f8ff', 
        padding: '10px', 
        margin: '10px 0', 
        borderRadius: '5px',
        fontSize: '0.9rem',
        display: isAuthenticated ? 'block' : 'none'
      }}>
        <strong>Debug Info:</strong> 
        Authenticated: {isAuthenticated ? 'Yes' : 'No'} | 
        User: {user ? user.name : 'None'} | 
        Token: {getToken ? (getToken() ? 'Present' : 'Missing') : 'No getToken'}
      </div>

      <p style={{fontSize: '1.3rem', marginBottom: '30px'}}>
        {user ? `Welcome, ${user.name}!` : 'Please login to manage family members'}
      </p>

      {/* Add Family Member Button */}
      {isAuthenticated && (
        <LargeButton 
          icon="➕" 
          text={adding ? "Adding..." : "Add Family Member"} 
          onClick={() => setShowAddForm(true)}
          disabled={adding}
        />
      )}

      {/* Add Family Member Form */}
      {showAddForm && isAuthenticated && (
        <div style={addFormStyle}>
          <h3 style={{color: '#FF9800', marginBottom: '20px'}}>Add New Family Member</h3>
          
          <input
            type="text"
            placeholder="Full Name *"
            value={newMember.name}
            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            style={{...inputStyle, ...requiredFieldStyle}}
            required
          />
          
          <input
            type="text"
            placeholder="Relation (e.g., Son, Daughter, Wife) *"
            value={newMember.relation}
            onChange={(e) => setNewMember({...newMember, relation: e.target.value})}
            style={{...inputStyle, ...requiredFieldStyle}}
            required
          />
          
          <input
            type="tel"
            placeholder="Phone Number"
            value={newMember.phone}
            onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
            style={inputStyle}
          />
          
          <input
            type="email"
            placeholder="Email Address"
            value={newMember.email}
            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
            style={inputStyle}
          />

          <select
            value={newMember.icon}
            onChange={(e) => setNewMember({...newMember, icon: e.target.value})}
            style={inputStyle}
          >
            <option value="👤">👤 Person</option>
            <option value="👨">👨 Man</option>
            <option value="👩">👩 Woman</option>
            <option value="👴">👴 Grandpa</option>
            <option value="👵">👵 Grandma</option>
            <option value="👦">👦 Boy</option>
            <option value="👧">👧 Girl</option>
            <option value="👨‍⚕️">👨‍⚕️ Doctor</option>
            <option value="👩‍⚕️">👩‍⚕️ Nurse</option>
          </select>

          <div style={{fontSize: '1rem', color: '#666', margin: '10px 0'}}>
            * Required fields. Provide at least phone or email.
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              color: 'red',
              fontSize: '1.1rem',
              padding: '10px',
              backgroundColor: '#ffe6e6',
              borderRadius: '5px',
              margin: '10px 0'
            }}>
              {error}
            </div>
          )}

          <div style={{display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px'}}>
            <button
              onClick={handleAddMember}
              disabled={adding}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: adding ? '#cccccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: adding ? 'not-allowed' : 'pointer'
              }}
            >
              {adding ? 'Adding...' : 'Add Member'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setError('');
                setNewMember({ name: '', relation: '', phone: '', email: '', icon: '👤' });
              }}
              style={{
                padding: '15px 25px',
                fontSize: '1.2rem',
                backgroundColor: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          color: 'red',
          fontSize: '1.1rem',
          padding: '15px',
          backgroundColor: '#ffe6e6',
          borderRadius: '8px',
          margin: '20px 0',
          border: '2px solid #ff4444'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          fontSize: '1.3rem',
          color: '#666',
          margin: '40px 0',
          textAlign: 'center'
        }}>
          🔄 Loading family members...
        </div>
      )}

      {/* Family Members Grid */}
      <div style={gridStyle}>
        {/* For non-logged in users, show demo cards */}
        {!isAuthenticated && (
          <>
            <div 
              style={contactCardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f5e8';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={() => navigate('/login')}
            >
              <div style={contactImageStyle}>👩</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>Sarah</div>
              <div style={{fontSize: '1.2rem'}}>Daughter</div>
              <div style={{fontSize: '1.1rem', color: '#666', marginTop: '5px'}}>
                📱 +1 (555) 123-4567
              </div>
              <div style={{fontSize: '1.1rem', color: '#666'}}>
                📧 sarah@email.com
              </div>
              <div style={{fontSize: '1.1rem', color: '#4CAF50', marginTop: '10px'}}>
                📞 Tap to Call
              </div>
            </div>
            
            <div 
              style={contactCardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#e8f5e8';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onClick={() => navigate('/login')}
            >
              <div style={contactImageStyle}>👨</div>
              <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>John</div>
              <div style={{fontSize: '1.2rem'}}>Son</div>
              <div style={{fontSize: '1.1rem', color: '#666', marginTop: '5px'}}>
                📱 +1 (555) 987-6543
              </div>
              <div style={{fontSize: '1.1rem', color: '#666'}}>
                📧 john@email.com
              </div>
              <div style={{fontSize: '1.1rem', color: '#4CAF50', marginTop: '10px'}}>
                📞 Tap to Call
              </div>
            </div>
          </>
        )}

        {/* User's family members from backend */}
        {isAuthenticated && familyMembers.map((member) => (
          <div 
            key={member.id}
            style={contactCardStyle}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e8f5e8';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={() => {
              if (member.phone) {
                handleCall(member.phone);
              } else if (member.email) {
                handleEmail(member.email);
              }
            }}
          >
            <div style={contactImageStyle}>{member.icon || '👤'}</div>
            <div style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{member.name}</div>
            <div style={{fontSize: '1.2rem'}}>{member.relation}</div>
            {member.phone && (
              <div style={{fontSize: '1.1rem', color: '#666', marginTop: '5px'}}>
                📱 {member.phone}
              </div>
            )}
            {member.email && (
              <div style={{fontSize: '1.1rem', color: '#666', marginTop: '5px'}}>
                📧 {member.email}
              </div>
            )}
            <div style={{fontSize: '1.1rem', color: '#4CAF50', marginTop: '10px'}}>
              {member.phone ? '📞 Tap to Call' : '✉️ Tap to Email'}
            </div>
          </div>
        ))}

        {/* Empty state for authenticated users */}
        {isAuthenticated && familyMembers.length === 0 && !loading && (
          <div style={{
            gridColumn: '1 / -1',
            padding: '40px',
            fontSize: '1.3rem',
            color: '#666'
          }}>
            No family members added yet. Click "Add Family Member" to get started!
          </div>
        )}
      </div>

      

      <LargeButton 
        icon="⬅️" 
        text="Back to Home" 
        onClick={() => navigate('/')}
      />
    </div>
  );
};

export default FamilyPage;