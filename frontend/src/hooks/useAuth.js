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
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRole(data.role);
        console.log('Auth check successful:', data);
      } else {
        console.log('Auth check failed, using demo user');
        // For demo purposes, auto-login as admin
        setUser({ id: 'demo_admin', email: 'admin@cargwin.com' });
        setRole('admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // For demo purposes, auto-login as admin
      setUser({ id: 'demo_admin', email: 'admin@cargwin.com' });
      setRole('admin');
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
        
        setUser({ id: 'demo_user', email });
        setRole(role);
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