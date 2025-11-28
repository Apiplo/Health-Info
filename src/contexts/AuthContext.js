// Import necessary libraries from React
import React, { createContext, useContext, useState } from 'react';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create a new context for authentication
const AuthContext = createContext();

// Custom hook to easily access the authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
    // Throw an error if the hook is used outside of an AuthProvider
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getInitialToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Failed to read token from localStorage:', error);
    return null;
  }
};

const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
};

// Component that provides authentication state to its children
export const AuthProvider = ({ children }) => {
    // State to track whether the user is authenticated
  const [token, setToken] = useState(getInitialToken);
    // State to store the authenticated user's data
  const [user, setUser] = useState(getInitialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getInitialToken());

    // Function to handle user login
  const login = async (email, password) => {
    try {
      // Direct fetch to backend authentication endpoint
      const response = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Expecting { token, user }
      if (data?.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      if (data?.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('Failed to store user in localStorage:', error);
        }
      }
      setIsAuthenticated(true);
      setUser(data?.user || null);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

    // Function to handle user registration
  const register = async (email, password, displayName) => {
    try {
      // Direct fetch to backend registration endpoint
      const response = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Expecting { token, user }
      if (data?.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      }
      if (data?.user) {
        try {
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          console.error('Failed to store user in localStorage:', error);
        }
      }
      setIsAuthenticated(true);
      setUser(data?.user || null);
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

    // Function to handle user logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to clear auth from localStorage:', error);
    }
  };

    // The value provided to the context consumers
  const value = {
    isAuthenticated,
    user,
    token,
    login,
    register,
    logout,
    isAdmin: () => user?.role === 'admin'
  };

    // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



