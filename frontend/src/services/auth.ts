import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  dateOfBirth: string;
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;
  captchaToken: string;
}

interface SecurityVerification {
  email: string;
  dateOfBirth: string;
  answer1: string;
  answer2: string;
  captchaToken: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data.success && response.data.token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  }

  // Register new user
  static async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  }

  // Get security questions
  static async getSecurityQuestions(email: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/security-questions`, { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get security questions'
      };
    }
  }

  // Verify security questions
  static async verifySecurityQuestions(data: SecurityVerification) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-security`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Security verification failed'
      };
    }
  }

  // Reset password
  static async resetPassword(resetToken: string, newPassword: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        resetToken,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password reset failed'
      };
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Get current user from localStorage
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Get auth token
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export default AuthService;
