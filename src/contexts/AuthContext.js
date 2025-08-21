// Import necessary libraries from React
import React, { createContext, useContext, useState } from 'react';
import { loginApi } from '../services/api';

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

// Component that provides authentication state to its children
export const AuthProvider = ({ children }) => {
    // State to track whether the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
    // State to store the authenticated user's data
  const [user, setUser] = useState(null);

    // Function to handle user login
  const login = async (username, password) => {
    // Mock async authentication via API wrapper
    const res = await loginApi(username, password);
    setIsAuthenticated(true);
    setUser(res);
    return true;
  };

    // Function to handle user logout
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

    // The value provided to the context consumers
  const value = {
    isAuthenticated,
    user,
    login,
    logout
  };

    // Provide the authentication context to the children components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



