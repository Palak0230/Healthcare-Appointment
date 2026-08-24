import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, getAuthToken, setAuthToken, removeAuthToken } from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  phone?: string;
  doctorProfile?: {
    id: string;
    specialization: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    slotDurationMinutes: number;
    bio?: string;
    consultationFee: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registerUser: (data: any) => Promise<void>;
  quickDemoLogin: (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => Promise<void>;
  logout: () => void;
  seedData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch (err) {
      removeAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/login', 'POST', { email, password });
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (data: any) => {
    setLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/register', 'POST', data);
      setAuthToken(res.token);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (role: 'PATIENT' | 'DOCTOR' | 'ADMIN') => {
    let email = 'patient.john@example.com';
    let password = 'patient123';

    if (role === 'DOCTOR') {
      email = 'dr.smith@clinic.com';
      password = 'doctor123';
    } else if (role === 'ADMIN') {
      email = 'admin@clinic.com';
      password = 'admin123';
    }

    try {
      await login(email, password);
    } catch (err) {
      // If demo user doesn't exist, trigger seed and retry login
      await seedData();
      await login(email, password);
    }
  };

  const seedData = async () => {
    await apiRequest('/seed', 'POST');
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, registerUser, quickDemoLogin, logout, seedData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
