import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseUrl } from '@/services/api';
import {
  PhoneLoginRequest,
  EmailLoginRequest,
  OtpVerificationRequest,
  CreateAccountRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  OtpResponse,
  AuthError
} from '@/app/types/auth';
import { LoginResponse, User } from '@/types/user';

const authClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authError: AuthError = {
      message: 'Erro desconhecido',
      status: error.response?.status,
    };

    if (error.response) {
      switch (error.response.status) {
        case 400:
          authError.message = 'Dados inválidos. Verifique as informações fornecidas.';
          break;
        case 401:
          authError.message = 'Credenciais inválidas.';
          break;
        case 403:
          authError.message = 'Acesso negado.';
          break;
        case 404:
          authError.message = 'Serviço não encontrado.';
          break;
        case 417:
          authError.message = 'Senha atual incorreta.';
          break;
        case 429:
          authError.message = 'Muitas tentativas. Aguarde alguns minutos.';
          break;
        case 500:
        case 502:
        case 503:
          authError.message = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          authError.message = error.response.data?.message || 'Ocorreu um erro inesperado.';
      }
    } else if (error.request) {
      authError.message = 'Erro de conexão. Verifique sua internet.';
    }

    return Promise.reject(authError);
  }
);

export class AuthService {
  static async sendOtp(data: PhoneLoginRequest): Promise<OtpResponse> {
    try {
      const response = await authClient.post<OtpResponse>('/otps', {
        data: {
          phone: data.phone,
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async verifyOtp(data: OtpVerificationRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.post<LoginResponse>('/auth/verify-otp', {
        phone: data.phone,
        otp: data.otp,
        otpId: data.otpId,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async loginWithEmail(data: EmailLoginRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.post<LoginResponse>('/auth/login', {
        identifier: data.identifier,
        password: data.password,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async createAccount(data: CreateAccountRequest): Promise<void> {
    try {
      await authClient.post('/users', {
        data: {
          username: data.username,
          password: data.password,
          name: data.name,
          middlename: data.middlename,
          surname: data.surname,
          email: data.email,
          phone: data.phone,
          nationalID: data.nationalID,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          province: data.province,
          district: data.district,
          occupation: data.occupation,
          academicInstitution: data.academicInstitution,
          academicLevel: data.academicLevel,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      await authClient.post('/auth/forgot-password', {
        identifier: data.email,
      });
    } catch (error) {
      throw error;
    }
  }

  static async resetPassword(data: ResetPasswordRequest): Promise<LoginResponse> {
    try {
      const response = await authClient.post<LoginResponse>('/auth/reset-password', {
        code: data.code,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async changePassword(data: ChangePasswordRequest, token: string): Promise<void> {
    try {
      await authClient.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        password: data.password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getUserData(token: string): Promise<User> {
    try {
      const response = await authClient.get<User>('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async saveUserSession(user: User, token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving user session:', error);
      throw new Error('Erro ao salvar sessão do usuário');
    }
  }

  static async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }
}