import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import { ROLES } from '../constants/roles';

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
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token } = response.data;
      
      // Decode JWT to get user info (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userData = {
        email: payload.sub,
        roles: payload.roles || [],
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    // Log the outgoing payload for debugging
    console.log('Register payload:', userData);
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      // Log the error response for debugging
      console.error('Register error:', error.response);
      let message = 'Registration failed';
      if (error.response) {
        if (typeof error.response.data === 'string') {
          message = error.response.data;
        } else if (error.response.data?.message) {
          message = error.response.data.message;
        }
      }
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const getRoleBasedDashboardRoute = () => {
    if (!user || !user.roles || user.roles.length === 0) {
      return '/dashboard';
    }

    // Priority order: Admin > Faculty > Student
    if (user.roles.includes(ROLES.ADMIN)) {
      return '/dashboard?role=admin';
    } else if (user.roles.includes(ROLES.FACULTY)) {
      return '/dashboard?role=faculty';
    } else if (user.roles.includes(ROLES.STUDENT)) {
      return '/dashboard?role=student';
    }

    return '/dashboard';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    isAuthenticated,
    getRoleBasedDashboardRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};