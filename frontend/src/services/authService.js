import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
const authService = {
  // Register new user
  register: async (name, email, password) => {
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Registration failed';
    }
  },

  // Verify Email
  verifyEmail: async (email, code) => {
    try {
      const response = await api.post('/verify-email', {
        email,
        code,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Verification failed';
    }
  },

  // Login user
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/login', {
        email,
        password,
      });

      // Save tokens to localStorage or sessionStorage
      if (response.data.accessToken) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', response.data.accessToken);

        if (response.data.refreshToken) {
          storage.setItem('refreshToken', response.data.refreshToken);
        }

        storage.setItem('email', response.data.email);
        storage.setItem('userId', response.data.userId);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || 'Login failed';
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (refreshToken) {
        // We use the base API gateway URL
        await api.post('/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Error during backend logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('email');
      localStorage.removeItem('userId');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('userId');
    }
  },

  // Get current user
  getCurrentUser: () => {
    return {
      token: localStorage.getItem('token') || sessionStorage.getItem('token'),
      email: localStorage.getItem('email') || sessionStorage.getItem('email'),
      id: localStorage.getItem('userId') || sessionStorage.getItem('userId'),
    };
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  },

  // Forgot password - send verification code
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to send verification code';
    }
  },

  // Verify reset code
  verifyCode: async (email, code) => {
    try {
      const response = await api.post('/verify-code', { email, code });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Invalid or expired code';
    }
  },

  // Reset password
  resetPassword: async (email, code, newPassword) => {
    try {
      const response = await api.post('/reset-password', {
        email,
        code,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || 'Failed to reset password';
    }
  },
};

export default authService;
