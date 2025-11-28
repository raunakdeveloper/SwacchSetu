import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { getToken, setToken, removeToken, setUser as saveUser, removeUser } from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
          saveUser(response.data.user);
        } catch (error) {
          removeToken();
          removeUser();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    setToken(token);
    saveUser(user);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  };

  const logout = () => {
    removeToken();
    removeUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};