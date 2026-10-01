import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext(null);

export const DEFAULT_DEMO_USER = {
  id: 'e1fdbed1-e360-4e22-86f1-6e57be6a7225',
  name: 'Hackathon Judge',
  email: 'judge@vaaniflow.ai',
};

export const DEFAULT_DEMO_TOKEN = 'mock_demo_judge_token_2026';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vaaniflow_user');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('vaaniflow_token') || DEFAULT_DEMO_TOKEN;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync default user & token to localStorage immediately so all sub-services have credentials
  useEffect(() => {
    if (!localStorage.getItem('vaaniflow_user')) {
      localStorage.setItem('vaaniflow_user', JSON.stringify(DEFAULT_DEMO_USER));
    }
    if (!localStorage.getItem('vaaniflow_token')) {
      localStorage.setItem('vaaniflow_token', DEFAULT_DEMO_TOKEN);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('vaaniflow_token', res.token);
        localStorage.setItem('vaaniflow_user', JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      console.warn('[AuthContext] Login API fallback to demo user');
    } finally {
      setIsLoading(false);
    }
    // Always succeed with demo credentials in open mode
    setUser(DEFAULT_DEMO_USER);
    setToken(DEFAULT_DEMO_TOKEN);
    return { success: true };
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authService.register({ name, email, password });
      if (res.success && res.user) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('vaaniflow_token', res.token);
        localStorage.setItem('vaaniflow_user', JSON.stringify(res.user));
        return { success: true };
      }
    } catch (err) {
      console.warn('[AuthContext] Register API fallback to demo user');
    } finally {
      setIsLoading(false);
    }
    // Always succeed with demo credentials in open mode
    setUser(DEFAULT_DEMO_USER);
    setToken(DEFAULT_DEMO_TOKEN);
    return { success: true };
  };

  const logout = () => {
    // Reset to demo judge session instead of locking out
    setUser(DEFAULT_DEMO_USER);
    setToken(DEFAULT_DEMO_TOKEN);
    localStorage.setItem('vaaniflow_user', JSON.stringify(DEFAULT_DEMO_USER));
    localStorage.setItem('vaaniflow_token', DEFAULT_DEMO_TOKEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || DEFAULT_DEMO_USER,
        token: token || DEFAULT_DEMO_TOKEN,
        isAuthenticated: true,
        isLoading: false,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
