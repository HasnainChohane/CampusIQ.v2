import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dphub_token') || null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    async function verifySession() {
      if (token) {
        try {
          const res = await api.getMe();
          let userData = res.data.user;
          const userKey = `dphub_user_profile_${userData.email}`;
          const savedProfile = localStorage.getItem(userKey);
          if (savedProfile) {
            try {
              const parsed = JSON.parse(savedProfile);
              if (parsed) {
                userData = { ...userData, ...parsed };
              }
            } catch (e) {}
          }
          setUser(userData);
        } catch (error) {
          console.warn('Session expired or invalid token:', error.message);
          logout();
        }
      }
      setLoading(false);
    }
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success && res.data.token) {
      localStorage.setItem('dphub_token', res.data.token);
      setToken(res.data.token);
      let userData = res.data.user;
      const userKey = `dphub_user_profile_${userData.email}`;
      const savedProfile = localStorage.getItem(userKey);
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (parsed) {
            userData = { ...userData, ...parsed };
          }
        } catch (e) {}
      }
      setUser(userData);
      return userData;
    }
  };

  const switchUserFast = async (email) => {
    return login(email, 'Password123!');
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updatedFields };
      if (nextUser?.email) {
        try {
          localStorage.setItem(`dphub_user_profile_${nextUser.email}`, JSON.stringify(nextUser));
        } catch (e) {}
      }
      return nextUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('dphub_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      login,
      switchUserFast,
      updateUserProfile,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
