// context/authContext.js
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/users';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const currentUser = userService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await userService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    userService.logout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (requiredRoles) => {
    if (!user) return false;
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.type);
    }
    return user.type === requiredRoles;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};