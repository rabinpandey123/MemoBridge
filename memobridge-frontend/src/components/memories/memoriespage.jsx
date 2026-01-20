
import { memoriesAPI } from '../../services/api';   
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authcontext';
import LargeButton from '../shared/largebutton';

const MemoriesPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getToken, logout } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Alzheimer's-friendly styles
  const containerStyle = {
    padding: '20px',
    textAlign: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f8ff'
  };

  const titleStyle = {
    fontSize: '3rem',
    margin: '20px 0',
    color: '#2c5aa0',
    fontWeight: 'bold'
  };

  const photoGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    padding: '25px',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const photoCardStyle = {
    backgroundColor: 'white',
    border: '3px solid #2c5aa0',
    borderRadius: '15px',
    padding: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  };

  const photoStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '15px',
    backgroundColor: '#f5f5f5'
  };

  const descriptionStyle = {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#333',
    marginTop: '10px'
  };

  const emptyStateStyle = {
    padding: '60px',
    fontSize: '2rem',
    color: '#666',
    backgroundColor: 'white',
    borderRadius: '20px',
    margin: '40px auto',
    maxWidth: '600px'
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '20px',
    width: '90%',
    maxWidth: '500px'
  };

  // Load photos
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login first to view memories');
      navigate('/login');
      return;
    }
    loadPhotos();
  }, [isAuthenticated, navigate]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Loading photos...');
      
      const token = getToken();
      const response = await fetch('/api/memories/photos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Photos response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📸 Photos loaded:', data);
      
      if (data.success) {
        setPhotos(data.photos || []);
      } else {
        setError(data.error || 'Failed to load photos');
      }
    } catch (error) {
      console.error('💥 Error loading photos:', error);
      setError(`Failed to load photos: ${error.message}`);
      
      if (error.message.includes('401') || error.message.includes('authentication')) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const fileInput = event.target.photo;
    const description = event.target.description.value;

    if (!fileInput.files[0]) {
      alert('Please select a photo');
      return;
    }

    // Validate file size
    const file = fileInput.files[0];
    if (file.size > 16 * 1024 * 1024) {
      alert('File size too large. Please select a file smaller than 16MB.');
      return;
    }

    const token = getToken();
    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    formData.append('photo', file);
    formData.append('description', description);
    formData.append('category', 'family');

    setUploading(true);
    setError('');
    
    try {
      console.log('🔼 Starting upload...');
      
      const response = await fetch('/api/memories/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('📡 Upload response status:', response.status);

      if (!response.ok) {
        throw new Error(`Upload failed! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Upload response:', result);
      
      if (result.success) {
        setShowUpload(false);
        loadPhotos();
        event.target.reset();
        alert('Photo uploaded successfully!');
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Debug function to check image URLs
  const debugImage = (photo) => {
    console.log('🖼️ Image debug:', {
      id: photo.id,
      filename: photo.filename,
      url: photo.url,
      description: photo.description
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '2.5rem', color: '#2c5aa0', padding: '100px' }}>
          Redirecting to login...
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ fontSize: '2.5rem', color: '#2c5aa0', padding: '100px' }}>
          Loading Memories...
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>📸 My Memories</h1>
      
      {user && (
        <div style={{ marginBottom: '10px', fontSize: '1.2rem', color: '#555' }}>
          Welcome, {user.name}!
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
          border: '2px solid #ff4444',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ marginBottom: '30px' }}>
        <LargeButton 
          icon="📤" 
          text="Add New Photo" 
          onClick={() => setShowUpload(true)}
          fontSize="1.5rem"
        />
        <LargeButton 
          icon="⬅️" 
          text="Back to Home" 
          onClick={() => navigate('/')}
          fontSize="1.5rem"
          backgroundColor="#666"
          style={{ marginLeft: '20px' }}
        />
        <LargeButton 
          icon="🚪" 
          text="Logout" 
          onClick={handleLogout}
          fontSize="1.5rem"
          backgroundColor="#d32f2f"
          style={{ marginLeft: '20px' }}
        />
      </div>

      {photos.length === 0 ? (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📷</div>
          <div>No memories yet</div>
          <div style={{ fontSize: '1.5rem', marginTop: '10px', color: '#888' }}>
            Click "Add New Photo" to upload your first memory!
          </div>
        </div>
      ) : (
        <div style={photoGridStyle}>
          {photos.map(photo => (
            <div key={photo.id} style={photoCardStyle} onClick={() => debugImage(photo)}>
              <img 
                src={photo.url} 
                alt={photo.description}
                style={photoStyle}
                onError={(e) => {
                  console.error('❌ Failed to load image:', photo.url);
                  e.target.src = 'https://via.placeholder.com/250x200?text=Image+Not+Found';
                  e.target.onerror = null; // Prevent infinite loop
                }}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully:', photo.url);
                }}
              />
              <div style={descriptionStyle}>
                {photo.description}
              </div>
              <div style={{ fontSize: '1rem', color: '#666', marginTop: '5px' }}>
                {new Date(photo.uploaded_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2 style={{ marginBottom: '25px', color: '#2c5aa0', fontSize: '2rem' }}>
              Upload Memory Photo
            </h2>
            
            <form onSubmit={handleUploadPhoto} style={{ fontSize: '1.4rem' }}>
              <div style={{ marginBottom: '20px' }}>
                <input 
                  type="file" 
                  name="photo" 
                  accept="image/*" 
                  required 
                  style={{ 
                    fontSize: '1.2rem', 
                    padding: '12px',
                    width: '100%',
                    border: '2px solid #2c5aa0',
                    borderRadius: '8px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Enter photo description..." 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    fontSize: '1.3rem',
                    border: '2px solid #2c5aa0',
                    borderRadius: '10px'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <LargeButton 
                  type="button"
                  text="Cancel" 
                  onClick={() => setShowUpload(false)}
                  backgroundColor="#666"
                  fontSize="1.3rem"
                />
                <LargeButton 
                  type="submit"
                  text={uploading ? "Uploading..." : "Upload Photo"} 
                  disabled={uploading}
                  fontSize="1.3rem"
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;