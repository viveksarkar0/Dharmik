import React, { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { AuthContext, type User, type RegisterData, type AuthContextType } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// Utility: clear auth storage
const clearAuth = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}



export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const savedUser = sessionStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      loading: true,
      isAuthenticated: !!token,
      token
    };
  });
  
  const navigate = useNavigate();
  
  // Update state helper
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      const { token } = state;
      if (!token) {
        if (isMounted) {
          updateState({ loading: false, isAuthenticated: false, user: null });
        }
        return;
      }
      
      try {
        const response = await api.get<{ user: User }>('/auth/me', token);
        
        if (response.error || !response.data?.user) {
          throw new Error(response.error || 'Invalid user data');
        }
        
        if (isMounted) {
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
          updateState({ user: response.data.user, isAuthenticated: true, loading: false });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        clearAuth();
        if (isMounted) {
          updateState({ user: null, isAuthenticated: false, loading: false });
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [state.token, updateState]);

  // Check if the user is authenticated
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const { token } = state;
    if (!token) return false;
    
    try {
      const response = await api.get<{ user: User }>('/auth/me', token);
      
      if (response.error || !response.data?.user) {
        throw new Error(response.error || 'Invalid user data');
      }
      
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      updateState({ user: response.data.user, isAuthenticated: true });
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuth();
      updateState({ user: null, isAuthenticated: false });
      return false;
    }
  }, [state.token, updateState]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    updateState({ loading: true });
    
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', { email, password });
      
      if (response.error || !response.data?.token || !response.data.user) {
        throw new Error(response.error || 'Login failed - invalid response');
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      updateState({ user, token, isAuthenticated: true, loading: false });
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      clearAuth();
      updateState({ user: null, isAuthenticated: false, loading: false });
      throw error;
    }
  }, [updateState, navigate]);

  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    updateState({ loading: true });
    
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/register', userData);
      
      if (response.error || !response.data?.token || !response.data.user) {
        throw new Error(response.error || 'Registration failed - invalid response');
      }
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      updateState({ user, token, isAuthenticated: true, loading: false });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      clearAuth();
      updateState({ user: null, isAuthenticated: false, loading: false });
      throw error;
    }
  }, [updateState, navigate]);

  const logout = useCallback(async (): Promise<void> => {
    const { token } = state;
    
    try {
      if (token) {
        await api.post('/auth/logout', {}, token);
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuth();
      updateState({ user: null, token: null, isAuthenticated: false });
      navigate('/login');
    }
  }, [state.token, updateState, navigate]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user: state.user,
    token: state.token,
    loading: state.loading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }), [
    state.user, 
    state.token, 
    state.loading, 
    state.isAuthenticated, 
    login, 
    register, 
    logout, 
    checkAuth
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
