import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { AuthService } from '@/app/services/authService';
import { navigateAfterLogin } from '@/util/onboarding';
import {
  PhoneLoginRequest,
  EmailLoginRequest,
  OtpVerificationRequest,
  CreateAccountRequest,
  ResetPasswordRequest,
  ForgotPasswordRequest,
  ChangePasswordRequest,
  AuthError,
} from '@/app/types/auth';
import useUser from '@/hooks/useUser';
import { LoginResponse, User } from '@/types/user';
import { usePostHog } from 'posthog-react-native';

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
  const posthostog = usePostHog();

  return useMutation({
    mutationFn: (data: OtpVerificationRequest) => AuthService.loginWithOtp(data),
    onSuccess: async (response: LoginResponse) => {
      try {
        const userData = await AuthService.getUserData(response.jwt);
        await AuthService.saveUserSession(userData, response.jwt);

        if(posthostog){
          posthostog.identify(userData.documentId, {
            name: userData.fullname,
            identifier: userData.email || userData.phone,
          });
        }

        navigateAfterLogin();
      } catch (error) {
        console.error('Error fetching user data after OTP verification:', error);
      }
    },
    onError: (error: AuthError) => {
      console.error('OTP verification error:', error);
    },
  });
}

export function useEmailLogin() {
  const posthostog = usePostHog();

  return useMutation({
    mutationFn: (data: EmailLoginRequest) => AuthService.loginWithEmail(data),
    onSuccess: async (response: LoginResponse) => {
      try {
        const userData = await AuthService.getUserData(response.jwt);
        await AuthService.saveUserSession(userData, response.jwt);

        if(posthostog){
          posthostog.identify(userData.documentId, {
            name: userData.fullname,
            identifier: userData.email || userData.phone,
          });
        }

        navigateAfterLogin();
      } catch (error) {
        console.error('Error fetching user data after email login:', error);
      }
    },
    onError: (error: AuthError) => {
      console.error('Email login error:', error);
    },
  });
}

export function useCreateAccount() {
  const posthostog = usePostHog();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => AuthService.createAccount(data),
    onSuccess: async (_, variables) => {
      try {
        // Auto-login after successful registration
        const loginResponse = await AuthService.loginWithEmail({
          identifier: variables.username,
          password: variables.password,
        });
        const userData = await AuthService.getUserData(loginResponse.jwt);
        await AuthService.saveUserSession(userData, loginResponse.jwt);

        if(posthostog){
          posthostog.identify(userData.documentId, {
            name: userData.fullname,
            identifier: userData.email || userData.phone,
          });
        if(posthostog){
        
          posthostog.identify(userData.documentId, {
            name: userData.fullname,
            identifier: userData.email || userData.phone,
          });
        }

        navigateAfterLogin();
      } catch (error) {
        console.error('Error during auto-login after registration:', error);
        // If auto-login fails, redirect to login page
        router.replace('/login/login-email');
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
    onSuccess: async (response: LoginResponse) => {
      try {
        await AuthService.saveUserSession(response.user, response.jwt);
      } catch (error) {
        console.error('Error saving user session after password reset:', error);
      }
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

export function useChangePassword() {
  const { data: user } = useUser();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      return AuthService.changePassword(data, user.token);
    },
    onError: (error: AuthError) => {
      console.error('Change password error:', error);
    },
  });
}
