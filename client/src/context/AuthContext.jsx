import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('reelearn_token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('reelearn_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('reelearn_token', newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('reelearn_token');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!user;
  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';
  const isPrincipal = user?.role === 'PRINCIPAL';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isTeacher, isStudent, isPrincipal, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
