const API_BASE_URL = 'http://localhost:5000/api';

// Store tokens
const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const getStoredTokens = () => {
  return {
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const { token } = getStoredTokens();
  
  if (!token) {
    console.error('❌ No JWT token found in localStorage');
    throw new Error('Authentication token missing. Please login again.');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Token refresh function
const refreshToken = async () => {
  const { refreshToken } = getStoredTokens();
  
  if (!refreshToken) {
    throw new Error('No refresh token available. Please login again.');
  }

  console.log('🔄 Refreshing token...');
  
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${refreshToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  console.log('✅ Token refreshed successfully');
  
  return data.access_token;
};

// Enhanced fetch with automatic token refresh
const fetchWithAuth = async (url, options) => {
  let retry = false;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: getAuthHeaders()
    });

    // If token expired, try to refresh it once
    if (response.status === 401 && !retry) {
      console.log('🔄 Token expired, attempting refresh...');
      retry = true;
      
      try {
        const newToken = await refreshToken();
        
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${newToken}`
          }
        });
        
        return retryResponse;
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
    
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

// Enhanced fetch with logging and auth
const fetchWithLogging = async (url, options) => {
  console.log(`🌐 Making ${options.method} request to: ${url}`);
  
  const response = await fetchWithAuth(url, options);
  
  console.log(`📡 Response status: ${response.status} ${response.statusText}`);
  
  const responseText = await response.text();
  console.log('📦 Response body:', responseText);
  
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.msg || errorData.error || responseText;
    } catch {
      errorMessage = responseText;
    }
    throw new Error(`HTTP ${response.status}: ${errorMessage}`);
  }
  
  const data = JSON.parse(responseText);
  console.log('✅ Response data parsed successfully');
  return data;
};

export const familyService = {
  // Get all family members
  getFamilyMembers: async () => {
    return await fetchWithLogging(`${API_BASE_URL}/family`, {
      method: 'GET',
    });
  },

  // Add new family member
  addFamilyMember: async (memberData) => {
    return await fetchWithLogging(`${API_BASE_URL}/family`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },
};

// Auth service for login/register
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${errorText}`);
    }

    const data = await response.json();
    
    // Store both tokens
    storeTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  register: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${errorText}`);
    }

    const data = await response.json();
    
    // Store both tokens
    storeTokens(data.access_token, data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};