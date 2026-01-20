import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LargeButton from '../shared/largebutton';

const DailyActivities = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [completedActivities, setCompletedActivities] = useState([]);
  const [currentActivity, setCurrentActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // STYLE DEFINITIONS (same as before)
  const containerStyle = {
    padding: '20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto'
  };
  const titleStyle = {
    fontSize: '2.2rem', margin: '20px 0', color: '#2c5aa0'
  };
  const currentTimeStyle = {
    fontSize: '1.8rem', color: '#4CAF50', margin: '10px 0', fontWeight: 'bold'
  };
  const currentActivityStyle = {
    backgroundColor: '#e8f5e8', border: '3px solid #4CAF50', borderRadius: '15px',
    padding: '20px', margin: '20px auto', maxWidth: '500px', fontSize: '1.2rem'
  };
  const scheduleGridStyle = {
    display: 'flex', flexDirection: 'column', gap: '15px', margin: '30px 0', alignItems: 'center'
  };
  const activityCardStyle = (isCompleted, isCurrent, importance) => {
    let backgroundColor = 'white';
    let borderColor = '#e0e0e0';
    if (isCompleted) {
      backgroundColor = '#f0f8f0';
      borderColor = '#4CAF50';
    } else if (isCurrent) {
      backgroundColor = '#fff3e0';
      borderColor = '#FF9800';
    }
    if (importance === 'critical') borderColor = '#ff4444';
    else if (importance === 'high') borderColor = '#FF9800';
    return {
      backgroundColor, border: `3px solid ${borderColor}`, borderRadius: '12px',
      padding: '20px', width: '100%', maxWidth: '500px', display: 'flex',
      alignItems: 'center', gap: '20px', transition: 'all 0.3s ease',
      opacity: isCompleted ? 0.7 : 1
    };
  };
  const timeStyle = {
    fontSize: '1.3rem', fontWeight: 'bold', color: '#2c5aa0', minWidth: '100px', textAlign: 'center'
  };
  const activityInfoStyle = {
    flex: 1, textAlign: 'left'
  };
  const activityTitleStyle = {
    fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px'
  };
  const activityDescStyle = {
    fontSize: '1rem', color: '#666', marginBottom: '5px'
  };
  const importanceStyle = (importance) => {
    const colors = { critical: '#ff4444', high: '#FF9800', medium: '#2196F3', low: '#4CAF50' };
    return {
      display: 'inline-block', padding: '4px 12px', backgroundColor: colors[importance],
      color: 'white', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold'
    };
  };
  const checkboxStyle = {
    width: '25px', height: '25px', cursor: 'pointer'
  };
  const iconStyle = {
    fontSize: '2.5rem'
  };

  // Daily Schedule
  const dailySchedule = [
    { id: 1, time: "9:00 AM", activity: "Morning Medication", description: "Take prescribed morning medications with water", icon: "💊", importance: "critical", type: "health" },
    { id: 2, time: "11:00 AM", activity: "Lunch with Family", description: "Enjoy lunch together with family members", icon: "🍽️", importance: "high", type: "nutrition" },
    { id: 3, time: "2:00 PM", activity: "Afternoon Rest", description: "Quiet time, nap, or relaxation", icon: "🛌", importance: "medium", type: "rest" },
    { id: 4, time: "4:00 PM", activity: "Read Newspaper", description: "Read headlines together, discuss current events", icon: "📰", importance: "low", type: "cognitive" },
    { id: 5, time: "6:00 PM", activity: "Evening Medication", description: "Take prescribed evening medications", icon: "💊", importance: "critical", type: "health" },
    { id: 6, time: "8:00 PM", activity: "Dinner with Family", description: "Evening meal, share stories from the day", icon: "🍲", importance: "high", type: "nutrition" }
  ];

  // Check token validity
  const checkTokenValidity = () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setTokenValid(false);
      setDebugInfo('No token found');
      return false;
    }

    // Basic JWT token validation (check if it has 3 parts)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      setTokenValid(false);
      setDebugInfo('Invalid token format');
      localStorage.removeItem('access_token');
      return false;
    }

    setTokenValid(true);
    setDebugInfo('Token is valid');
    return true;
  };

  // Load completed activities on component mount
  useEffect(() => {
    checkTokenValidity();
    
    // Load from localStorage first
    const savedActivities = localStorage.getItem('dailyActivities_completed');
    if (savedActivities) {
      setCompletedActivities(JSON.parse(savedActivities));
    }

    // Then try to sync with backend if token is valid
    if (checkTokenValidity()) {
      fetchCompletedActivitiesFromBackend();
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateCurrentActivity();
    }, 60000);

    updateCurrentActivity();
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage whenever completedActivities changes
  useEffect(() => {
    localStorage.setItem('dailyActivities_completed', JSON.stringify(completedActivities));
  }, [completedActivities]);

  // Fetch completed activities from backend
  const fetchCompletedActivitiesFromBackend = async () => {
    if (!checkTokenValidity()) {
      setDebugInfo('Cannot fetch: Invalid token');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      console.log('🔄 Fetching completed activities from backend...');

      // Test backend connection first
      const healthResponse = await fetch('http://localhost:5000/api/activities/health');
      if (!healthResponse.ok) {
        setDebugInfo('Backend not reachable');
        return;
      }

      // Get user activities
      const response = await fetch('http://localhost:5000/api/activities/debug/user-activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend data:', data);
        setDebugInfo(`Backend connected: ${data.activities_count} activities`);
        
        // We'll keep using localStorage for now since frontend has hardcoded activities
      } else if (response.status === 401 || response.status === 422) {
        setTokenValid(false);
        setDebugInfo('Token expired or invalid');
        localStorage.removeItem('access_token');
      } else {
        setDebugInfo(`Backend error: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching from backend:', error);
      setDebugInfo('Backend connection failed');
    }
  };

  // Update current activity
  const updateCurrentActivity = () => {
    const now = new Date();
    let foundActivity = null;

    for (const activity of dailySchedule) {
      const [time, period] = activity.time.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      
      let activityHour = hours;
      if (period === 'PM' && hours !== 12) activityHour += 12;
      if (period === 'AM' && hours === 12) activityHour = 0;

      const activityTime = new Date();
      activityTime.setHours(activityHour, minutes, 0, 0);
      
      const timeDiff = (now - activityTime) / (1000 * 60);
      
      if (timeDiff >= -15 && timeDiff <= 60 && !completedActivities.includes(activity.id)) {
        foundActivity = activity;
        break;
      }
    }

    setCurrentActivity(foundActivity);
  };

  // API call to mark activity as completed
  const markActivityCompleted = async (activityId, activityName, activityTime) => {
    if (!checkTokenValidity()) {
      console.log('Using localStorage only - no valid token');
      return true; // Use localStorage
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('access_token');
      console.log(`🎯 Sending to backend: ${activityName}`);

      const response = await fetch('http://localhost:5000/api/activities/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_name: activityName,
          time: activityTime,
          suppress_notifications: true
        })
      });

      console.log('📡 Backend response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Backend success:', result);
        return true;
      } else if (response.status === 401 || response.status === 422) {
        // Token issues - fall back to localStorage
        setTokenValid(false);
        localStorage.removeItem('access_token');
        console.log('Token invalid, using localStorage');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        // Still use localStorage as fallback
        return true;
      }
    } catch (error) {
      console.error('🚨 Network error:', error);
      // Use localStorage fallback
      return true;
    } finally {
      setLoading(false);
    }
  };

  // Toggle activity completion
  const toggleActivityCompletion = async (activity) => {
    if (loading) return;
    
    const activityId = activity.id;
    const isCurrentlyCompleted = completedActivities.includes(activityId);
    
    if (isCurrentlyCompleted) {
      // Uncheck locally
      setCompletedActivities(completedActivities.filter(id => id !== activityId));
      console.log(`❌ Activity ${activityId} unchecked locally`);
    } else {
      // Check locally first
      setCompletedActivities([...completedActivities, activityId]);
      
      // Then try to save to backend
      const success = await markActivityCompleted(activityId, activity.activity, activity.time);
      
      if (!success) {
        // This shouldn't happen with our fallback, but just in case
        console.log('Unexpected failure, keeping local version');
      }
    }
  };

  // Login again function
  const handleReLogin = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        const data = await response.json();
        alert(`Backend is running! Status: ${data.status}`);
      } else {
        alert('Backend connection failed');
      }
    } catch (error) {
      alert(`Backend error: ${error.message}`);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit', hour12: true 
    });
  };

  const getCurrentDay = () => {
    return currentTime.toLocaleDateString('en-US', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
  };

  const resetDailyActivities = () => {
    setCompletedActivities([]);
    localStorage.removeItem('dailyActivities_completed');
    setCurrentActivity(null);
    updateCurrentActivity();
  };

  // Calculate progress
  const progress = dailySchedule.length > 0 ? (completedActivities.length / dailySchedule.length) * 100 : 0;

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>📅 Daily Activities</h1>
      
      {/* Debug Info */}
      <div style={{
        backgroundColor: tokenValid ? '#e8f5e8' : '#ffeaa7',
        border: `2px solid ${tokenValid ? '#4CAF50' : '#FF9800'}`,
        borderRadius: '8px',
        padding: '15px',
        margin: '15px 0',
        fontSize: '0.9rem'
      }}>
        <div><strong>Status:</strong> {debugInfo}</div>
        <div><strong>Token:</strong> {tokenValid ? '✅ Valid' : '❌ Invalid'}</div>
        <div><strong>Mode:</strong> {tokenValid ? 'Backend + LocalStorage' : 'LocalStorage Only'}</div>
        <div><strong>Completed:</strong> {completedActivities.length} of {dailySchedule.length}</div>
        
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={testBackendConnection}
            style={{
              padding: '5px 10px',
              margin: '2px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Test Backend
          </button>
          <button 
            onClick={fetchCompletedActivitiesFromBackend}
            style={{
              padding: '5px 10px',
              margin: '2px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Refresh Data
          </button>
          {!tokenValid && (
            <button 
              onClick={handleReLogin}
              style={{
                padding: '5px 10px',
                margin: '2px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Re-login
            </button>
          )}
        </div>
      </div>

      {/* Current Date and Time */}
      <div style={currentTimeStyle}>
        {getCurrentDay()}
      </div>
      <div style={{fontSize: '1.3rem', color: '#666', marginBottom: '20px'}}>
        ⏰ {formatTime(currentTime)}
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        height: '20px',
        margin: '20px auto',
        maxWidth: '500px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: '#4CAF50',
          transition: 'width 0.5s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {Math.round(progress)}% Complete
        </div>
      </div>

      {/* Current Activity Alert */}
      {currentActivity && !completedActivities.includes(currentActivity.id) && (
        <div style={currentActivityStyle}>
          <div style={{fontSize: '1.3rem', fontWeight: 'bold', color: '#FF9800', marginBottom: '10px'}}>
            ⏰ Current Activity Alert!
          </div>
          <div style={{fontSize: '1.2rem'}}>
            <span style={iconStyle}>{currentActivity.icon}</span> {currentActivity.time} - {currentActivity.activity}
          </div>
          <div style={{fontSize: '1rem', color: '#666', marginTop: '5px'}}>
            {currentActivity.description}
          </div>
        </div>
      )}

      {/* Activities List */}
      <div style={scheduleGridStyle}>
        {dailySchedule.map((activity) => {
          const isCompleted = completedActivities.includes(activity.id);
          const isCurrent = currentActivity && currentActivity.id === activity.id;
          
          return (
            <div 
              key={activity.id}
              style={activityCardStyle(isCompleted, isCurrent, activity.importance)}
            >
              <div style={iconStyle}>
                {activity.icon}
              </div>
              
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={() => toggleActivityCompletion(activity)}
                style={checkboxStyle}
                disabled={loading}
              />
              
              <div style={timeStyle}>
                {activity.time}
              </div>
              
              <div style={activityInfoStyle}>
                <div style={activityTitleStyle}>
                  {activity.activity}
                  <span style={importanceStyle(activity.importance)}>
                    {activity.importance.toUpperCase()}
                  </span>
                </div>
                <div style={activityDescStyle}>
                  {activity.description}
                </div>
              </div>
              
              <div style={{
                fontSize: '1rem',
                color: isCompleted ? '#4CAF50' : '#999',
                minWidth: '100px',
                textAlign: 'center'
              }}>
                {isCompleted ? '✅ Done' : (isCurrent ? '🕐 Now' : '⏳ Upcoming')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div style={{display: 'flex', gap: '15px', justifyContent: 'center', margin: '30px 0', flexWrap: 'wrap'}}>
        <LargeButton 
          icon="🔄" 
          text="Reset Day" 
          onClick={resetDailyActivities}
          disabled={loading}
        />
        <LargeButton 
          icon="📸" 
          text="View Memories" 
          onClick={() => navigate('/memories')}
        />
        <LargeButton 
          icon="🎵" 
          text="Music Therapy" 
          onClick={() => navigate('/music')}
        />
        <LargeButton 
          icon="⬅️" 
          text="Back to Home" 
          onClick={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default DailyActivities;