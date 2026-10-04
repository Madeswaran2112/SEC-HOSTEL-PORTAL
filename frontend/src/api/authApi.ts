import axiosInstance from './axiosInstance';
import { ApiResponse } from '../types/common';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  
  refreshToken: async (token: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await axiosInstance.post('/auth/refresh', { refreshToken: token });
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
  
  verifyEmail: async (token: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/auth/verify-email?token=${token}`);
    return response.data;
  },
  
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.post(`/auth/reset-password?token=${token}`, { password });
    return response.data;
  }
};

