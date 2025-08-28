import React, { useState, useEffect, type ReactNode } from 'react';
import { AuthContext, type User, type RegisterData } from '../contexts/AuthContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Clear any invalid tokens
        setUser(null);
        setIsAuthenticated(false);
        // Clear cookies on client side if possible
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed - invalid response');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        throw new Error('Registration failed - invalid response');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Clear cookies on client side
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

