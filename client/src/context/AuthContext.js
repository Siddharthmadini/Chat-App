import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Set base URL for all axios requests
// Uses env var in production, hardcoded Render URL as fallback, proxy in local dev
const API_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://chat-app-9cti.onrender.com' : '');

if (API_URL) {
  axios.defaults.baseURL = API_URL;
}

// Prevent infinite loading if Render backend is sleeping (free tier spins down)
axios.defaults.timeout = 12000;

// Ping the backend on app load to wake it up (Render free tier spins down after inactivity)
if (process.env.NODE_ENV === 'production' && API_URL) {
  axios.get('/api/health').catch(() => {});
}

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    error: null
  });

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/me', { timeout: 10000 });
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data.user, token }
          });
        } catch (error) {
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR', payload: 'Invalid token' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', response.data.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error.response?.data?.message || 'Login failed' 
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (username, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });
      
      localStorage.setItem('token', response.data.token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error.response?.data?.message || 'Registration failed' 
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      dispatch
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};