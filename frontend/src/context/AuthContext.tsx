import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
      } else {
        fetchUser();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(data);
      const { accessToken, refreshToken, user: loggedInUser } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      setUser(loggedInUser);
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<boolean> => {
    try {
      setIsLoading(true);
      await authApi.register(data);
      toast.success('Registration successful! Please check your email to verify your account.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

