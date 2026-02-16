import axios from 'axios';

const API_URL = 'http://localhost:8081/auth';

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

  // Login user
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post('/login', {
        email,
        password,
      });

      // Save token to localStorage or sessionStorage
      if (response.data.token) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', response.data.token);
        storage.setItem('email', response.data.email);
        storage.setItem('userId', response.data.userId);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || 'Login failed';
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userId');
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
};

export default authService;
