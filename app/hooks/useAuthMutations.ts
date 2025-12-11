import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { AuthService } from '@/app/services/authService';
import { navigateAfterLogin } from '@/util/onboarding';
import { 
  PhoneLoginRequest, 
  EmailLoginRequest, 
  OtpVerificationRequest,
  CreateAccountRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  AuthError 
} from '@/app/types/auth';
import { LoginResponse, User } from '@/types/user';

export function usePhoneLogin() {
  return useMutation({
    mutationFn: (data: PhoneLoginRequest) => AuthService.sendOtp(data),
    onSuccess: (response, variables) => {
      router.push({
        pathname: '/login/otp',
        params: {
          phone: variables.phone,
          otpId: response.otpID,
        },
      });
    },
    onError: (error: AuthError) => {
      console.error('Phone login error:', error);
    },
  });
}

export function useOtpVerification() {
  return useMutation({
    mutationFn: (data: OtpVerificationRequest) => AuthService.verifyOtp(data),
    onSuccess: async (response: LoginResponse) => {
      try {
        const userData = await AuthService.getUserData(response.jwt);
        await AuthService.saveUserSession(userData, response.jwt);
        navigateAfterLogin();
      } catch (error) {
        console.error('Error fetching user data after OTP verification:', error);
        Alert.alert('Erro', 'Erro ao carregar dados do usuário');
      }
    },
    onError: (error: AuthError) => {
      console.error('OTP verification error:', error);
    },
  });
}

export function useEmailLogin() {
  return useMutation({
    mutationFn: (data: EmailLoginRequest) => AuthService.loginWithEmail(data),
    onSuccess: async (response: LoginResponse) => {
      try {
        const userData = await AuthService.getUserData(response.jwt);
        await AuthService.saveUserSession(userData, response.jwt);
        navigateAfterLogin();
      } catch (error) {
        console.error('Error fetching user data after email login:', error);
        Alert.alert('Erro', 'Erro ao carregar dados do usuário');
      }
    },
    onError: (error: AuthError) => {
      console.error('Email login error:', error);
    },
  });
}

export function useCreateAccount() {
  return useMutation({
    mutationFn: (data: CreateAccountRequest) => AuthService.createAccount(data),
    onSuccess: async (response: LoginResponse) => {
      try {
        const userData = await AuthService.getUserData(response.jwt);
        await AuthService.saveUserSession(userData, response.jwt);
        navigateAfterLogin();
      } catch (error) {
        console.error('Error fetching user data after account creation:', error);
        Alert.alert('Erro', 'Erro ao carregar dados do usuário');
      }
    },
    onError: (error: AuthError) => {
      console.error('Create account error:', error);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => AuthService.forgotPassword(data),
    onSuccess: (_, variables) => {
      router.push({
        pathname: '/login/reset-password',
        params: {
          email: variables.email,
        },
      });
    },
    onError: (error: AuthError) => {
      console.error('Forgot password error:', error);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => AuthService.resetPassword(data),
    onSuccess: () => {
      Alert.alert(
        'Sucesso',
        'Senha redefinida com sucesso! Faça login com sua nova senha.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login'),
          },
        ]
      );
    },
    onError: (error: AuthError) => {
      console.error('Reset password error:', error);
    },
  });
}

export function useGetUserData() {
  return useMutation({
    mutationFn: (token: string) => AuthService.getUserData(token),
    onError: (error: AuthError) => {
      console.error('Get user data error:', error);
    },
  });
}