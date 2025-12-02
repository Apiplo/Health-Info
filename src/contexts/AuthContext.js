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
    throw new Error('Authentication context is not available. Please ensure this component is wrapped within an AuthProvider.');
  }
  return context;
};

const getInitialToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Unable to access your authentication token. This may affect your ability to stay logged in.', error);
    return null;
  }
};

const getInitialUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Unable to retrieve your user information. You may need to log in again.', error);
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
        let errorMessage = 'Login failed. Please check your credentials and try again.';
        if (response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again or reset your password if you\'ve forgotten it.';
        } else if (response.status === 403) {
          errorMessage = 'Your account has been locked. Please contact support for assistance.';
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again later or contact support if the problem persists.';
        } else if (response.status >= 400 && response.status < 500) {
          errorMessage = 'Invalid request. Please check your information and try again.';
        }
        throw new Error(errorMessage);
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
          console.error('Unable to save your login information. You may need to log in again on your next visit.', error);
        }
      }
      setIsAuthenticated(true);
      setUser(data?.user || null);
      return data;
    } catch (error) {
      console.error('Login attempt failed:', error);
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
        let errorMessage = 'Registration failed. Please try again.';
        try {
          const errorData = await response.json();
          
          if (response.status === 400) {
            errorMessage = errorData.message || 'Please check all required fields and try again.';
          } else if (response.status === 409) {
            errorMessage = 'An account with this email already exists. Please use a different email or try logging in.';
          } else if (response.status === 500) {
            errorMessage = 'Server error occurred during registration. Please try again later.';
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = 'Please check all required fields and try again.';
          } else if (response.status === 409) {
            errorMessage = 'An account with this email already exists.';
          }
        }
        throw new Error(errorMessage);
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
          console.error('Unable to save your registration information. You may need to log in again on your next visit.', error);
        }
      }
      setIsAuthenticated(true);
      setUser(data?.user || null);
      return data;
    } catch (error) {
      console.error('Registration attempt failed:', error);
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
      console.error('Unable to completely clear your login data. You may want to clear your browser cache for complete privacy.', error);
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



