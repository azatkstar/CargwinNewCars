import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';

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
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      // Check localStorage first for token
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUser(response.data);
      console.log('Auth verified:', response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email,
      password
    });

    const { user, access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    setUser(user);
    return user;
  };

  // Register new user
  const register = async (email, password, name) => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      email,
      password,
      name
    });

    const { user, access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    setUser(user);
    return user;
  };

  // Process OAuth session_id
  const processOAuthSession = async (sessionId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/oauth/session`, {
        session_id: sessionId
      }, {
        withCredentials: true
      });

      setUser(response.data.user);
      await checkAuth(); // Recheck to get full user data
      return response.data.user;
    } catch (error) {
      console.error('OAuth session processing failed:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
        console.log('Auth check failed, using demo user');
        // For demo purposes, auto-login as admin
        const demoAuth = {
          user: { id: 'demo_admin', email: 'admin@cargwin.com' },
          role: 'admin'
        };
        setUser(demoAuth.user);
        setRole(demoAuth.role);
        // Persist demo auth
        localStorage.setItem('cargwin_auth', JSON.stringify(demoAuth));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // For demo purposes, auto-login as admin
      const demoAuth = {
        user: { id: 'demo_admin', email: 'admin@cargwin.com' },
        role: 'admin'
      };
      setUser(demoAuth.user);
      setRole(demoAuth.role);
      // Persist demo auth
      localStorage.setItem('cargwin_auth', JSON.stringify(demoAuth));
    } finally {
      setLoading(false);
    }
  };

  const login = async (email) => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/magic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.ok) {
        // For demo, immediately set user as authenticated
        let role = 'viewer';
        if (email.includes('admin@')) role = 'admin';
        else if (email.includes('editor@')) role = 'editor';
        
        const authData = {
          user: { id: 'demo_user', email },
          role: role
        };
        
        setUser(authData.user);
        setRole(authData.role);
        
        // Persist auth state
        localStorage.setItem('cargwin_auth', JSON.stringify(authData));
        console.log('Login successful, auth persisted:', authData);
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { ok: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setRole(null);
      // Clear persisted auth
      localStorage.removeItem('cargwin_auth');
      console.log('Logout successful, auth cleared');
    }
  };

  const hasPermission = (requiredRole) => {
    const roleHierarchy = {
      'viewer': 1,
      'editor': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};