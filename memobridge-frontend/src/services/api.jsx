const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com' 
  : 'http://localhost:5000';

export const apiService = {
  // Generic fetch with auth
  async fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  // Upload file with auth
  async uploadWithAuth(url, formData) {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }
      throw new Error(`Upload failed! status: ${response.status}`);
    }

    return response.json();
  },
};

// Memories API
export const memoriesAPI = {
  getPhotos: () => apiService.fetchWithAuth('/api/memories/photos'),
  
  uploadPhoto: (formData) => apiService.uploadWithAuth('/api/memories/upload', formData),
  
  getPhotoUrl: (filename) => `${API_BASE_URL}/api/memories/photos/${filename}`,
};