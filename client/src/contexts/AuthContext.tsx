import { createContext } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: 'admin' | 'member';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: 'admin' | 'member';
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type { User, AuthContextType, RegisterData };
