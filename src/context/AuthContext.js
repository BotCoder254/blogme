import React, { createContext, useState, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Parse from '../services/parseConfig';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component that wraps the app and makes auth object available to any child component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const user = Parse.User.current();
        if (user) {
          // Verify the session is still valid
          await Parse.User.become(user.getSessionToken());
          setCurrentUser(user);
        }
      } catch (error) {
        console.error('Session expired or invalid:', error);
        await logout(); // Force logout if session is invalid
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (username, email, password) => {
    setError(null);
    try {
      const user = new Parse.User();
      user.set('username', username);
      user.set('email', email);
      user.set('password', password);
      
      const result = await user.signUp();
      setCurrentUser(result);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Login user
  const login = async (username, password) => {
    setError(null);
    try {
      const user = await Parse.User.logIn(username, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await Parse.User.logOut();
      setCurrentUser(null);
      // Clear any user-related queries from the cache
      queryClient.invalidateQueries();
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      await Parse.User.requestPasswordReset(email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError(null);
    try {
      const user = Parse.User.current();
      
      // Update user properties
      Object.keys(userData).forEach(key => {
        user.set(key, userData[key]);
      });
      
      const updatedUser = await user.save();
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Value object that will be shared with components using this context
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    register,
    login,
    logout,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 