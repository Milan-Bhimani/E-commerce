import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'https://e-commerce-ht4r.onrender.com',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401 errors
      localStorage.removeItem('authState');
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on initial load and handle errors properly
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get('/api/auth/me');
        
        if (res.data.user) {
          setUser(res.data.user);
          setIsAuthenticated(true);
          // Store auth state in localStorage
          localStorage.setItem('authState', JSON.stringify({
            user: res.data.user,
            isAuthenticated: true
          }));
        } else {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authState');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Only clear auth state on 401 errors
        if (error.response?.status === 401) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authState');
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Check localStorage first
    const storedAuth = localStorage.getItem('authState');
    if (storedAuth) {
      const { user: storedUser, isAuthenticated: storedAuthState } = JSON.parse(storedAuth);
      setUser(storedUser);
      setIsAuthenticated(storedAuthState);
    }

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      
      if (res.data.user) {
        // Call refreshUser to get complete user data
        await refreshUser();
      }
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      
      if (res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        // Store auth state in localStorage
        localStorage.setItem('authState', JSON.stringify({
          user: res.data.user,
          isAuthenticated: true
        }));
      }
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authState');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the server request fails, clear the local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authState');
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('authState', JSON.stringify({
          user: res.data.user,
          isAuthenticated: true
        }));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      // Handle error if needed, but don't clear auth state unless it's a 401
    }
  };

  // Add event listener for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authState') {
        if (e.newValue) {
          const { user: newUser, isAuthenticated: newAuthState } = JSON.parse(e.newValue);
          setUser(newUser);
          setIsAuthenticated(newAuthState);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add event listener for page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;