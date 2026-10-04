export interface User {
  id: string;
  email: string;
  role: 'ROLE_STUDENT' | 'ROLE_ADMIN' | 'ROLE_SUPER_ADMIN' | string;
  isActive: boolean;
  emailVerified: boolean;
  name?: string;
  gender?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  registerNumber: string;
  email: string;
  password: string;
  confirmPassword?: string;
  department: string;
  year: number;
  phone: string;
  gender: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

