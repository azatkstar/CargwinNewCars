import { useState, useEffect, createContext, useContext } from 'react';

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
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check localStorage first for persisted auth
      const savedAuth = localStorage.getItem('cargwin_auth');
      if (savedAuth) {
        const authData = JSON.parse(savedAuth);
        setUser(authData.user);
        setRole(authData.role);
        console.log('Auth loaded from localStorage:', authData);
        setLoading(false);
        return;
      }

      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRole(data.role);
        // Persist auth state
        localStorage.setItem('cargwin_auth', JSON.stringify({
          user: data.user,
          role: data.role
        }));
        console.log('Auth check successful:', data);
      } else {
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
      await fetch('/api/auth/logout', {
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