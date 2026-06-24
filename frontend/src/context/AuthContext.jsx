import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persistent session keys
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, user: userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setToken(jwtToken);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed. Verify credentials and try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Log in with Google
   */
  const loginWithGoogle = async (credential) => {
    try {
      const response = await api.post('/auth/google-login', { credential });
      const { token: jwtToken, user: userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setToken(jwtToken);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Google login failed. Try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Update student academic profile
   */
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/update-profile', profileData);
      const { token: jwtToken, user: userData } = response.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setToken(jwtToken);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.error || 'Profile update failed. Try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Register a new student
   */
  const registerStudent = async (name, email, password, phone) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed. Try again.';
      return { success: false, error: message };
    }
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, updateProfile, registerStudent, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
