import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Button from '@/components/Button';
import { baseUrl } from '@/services/api';
import { ErrorResponse, LoginResponse, User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateAfterLogin } from '@/util/onboarding';
import AuthContainer, { AuthTopSection, AuthContent, AuthForm } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import FormInput from '@/app/components/auth/FormInput';
import AuthFooter from '@/app/components/auth/AuthFooter';
import { CompactModeProvider } from '@/app/components/auth/CompactModeContext';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { identifyAnalyticsUser } from '@/utils/analytics';

export default function LoginEmail() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [warning, setWarning] = useState<string | undefined>(undefined);

  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Mutation to fetch user data
  const fetchUserDataMutation = useMutation({
    mutationFn: async (token: string): Promise<User> => {
      const response = await axios.get<User>(`${baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onError: (error: AxiosError) => {
      console.error('Erro ao buscar dados do utilizador:', error);
      throw error;
    },
  });

  // Mutation to handle login
  const loginMutation = useMutation({
    mutationFn: async (credentials: { identifier: string; password: string }) => {
      const response = await axios.post<LoginResponse>(
        `${baseUrl}/auth/login`,
        {
          identifier: credentials.identifier,
          password: credentials.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      try {
        if (data.success && data.jwt && data.user) {
          const token = data.jwt;
          // Fetch additional user data
          const userData = await fetchUserDataMutation.mutateAsync(token);

          const userWithToken: User = {
            ...userData,
            token: token,
          };
          await AsyncStorage.setItem('@user', JSON.stringify(userWithToken));

          // Identify user in PostHog for analytics tracking
          identifyAnalyticsUser(userData);
          // Navigate based on onboarding status and interests
          await navigateAfterLogin(userData.interests);
        } else {
          setError('Resposta inválida do servidor');
        }
      } catch (error) {
        console.error('Error processing login:', error);
        setError('Erro ao processar dados do utilizador');
      }
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Login error:', error);

      // Handle specific HTTP status codes
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 400: {
            const serverMessage = errorData?.error?.message;
            let displayMessage = 'Pedido inválido. Verifique os dados inseridos.';
            
            if (serverMessage === 'Invalid identifier or password') {
              displayMessage = 'Credenciais inválidas. Verifique o email/username e palavra-passe.';
            } else if (serverMessage === 'No account for the provided identifier') {
              displayMessage = 'Nenhuma conta encontrada com este email ou username.';
            } else if (serverMessage) {
              displayMessage = serverMessage;
            }
            
            setError(displayMessage);
            break;
          }
          case 401:
            setError(
              errorData?.error?.details?.message || 'Credenciais inválidas. Verifique o email/telefone e palavra-passe.'
            );
            break;
          case 403:
            setError('Acesso negado. A sua conta pode estar desactivada.');
            break;
          case 404:
            setError('Serviço não encontrado. Tente novamente mais tarde.');
            break;
          case 429:
            setError('Demasiadas tentativas. Por favor, aguarde alguns minutos.');
            break;
          case 500:
            setError('Erro interno do servidor. Por favor, tente novamente mais tarde.');
            break;
          case 502:
          case 503:
          case 504:
            setError('Servidor temporariamente indisponível. Tente novamente em alguns instantes.');
            break;
          default:
            setError('Ocorreu um erro ao fazer login. Por favor, tente novamente.');
        }
      } else if (error.request) {
        // Network error
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError('Não foi possível fazer login. Por favor, tente novamente.');
      }
    },
  });

  const handleLogin = async () => {
    // Validate inputs
    const _identifier = identifier.trim();
    const _password = password.trim();
    if (!identifier || !password) {
      setError('Por favor preencha todos os campos');
      return;
    }

    if (_identifier.length === 0) {
      setError('Email ou telefone inválido');
      return;
    }

    if (_password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }

    // Clear previous error
    setError(undefined);

    // Execute login mutation
    loginMutation.mutate({ identifier: _identifier, password: _password });
  };

  const isLoading = loginMutation.isPending || fetchUserDataMutation.isPending;

  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700; // iPhone SE, 7, 8 have ~667px height

  const styles = useMemo(
    () =>
      StyleSheet.create({
        forgotPasswordLink: {
          color: colors.primary,
          fontSize: 14,
          textAlign: 'right',
          marginTop: 8,
          fontFamily: 'Manrope-Medium',
        },
        errorContainer: {
          backgroundColor: isDark ? '#3D1E1E' : '#FFE5E5',
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? '#FF6B6B' : '#FF4444',
        },
        errorText: {
          color: isDark ? '#FF6B6B' : '#CC0000',
          fontSize: 12,
          marginLeft: 8,
          fontFamily: 'Manrope-Regular',
        },
        warningContainer: {
          backgroundColor: isDark ? '#3D2E1E' : '#FFF4E5',
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? '#FFA726' : '#FF9800',
          marginBottom: 0,
        },
        warningText: {
          color: isDark ? '#FFA726' : '#EF6C00',
          fontSize: 12,
          marginLeft: 8,
          fontFamily: 'Manrope-Regular',
        },
      }),
    [colors, isDark]
  );

  return (
    <CompactModeProvider>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (isSmallScreen ? 60 : 100) : 0}
    >
      <AuthContainer edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthTopSection>
            <AuthHeader />
            <AuthTitle
              title="Login com Email"
              subtitle="Não possui uma conta?"
              linkText="Registar"
              linkAction={() => router.push('/login/create-email')}
            />
          </AuthTopSection>

          <AuthContent>
            <AuthForm>
            <FormInput
              label="Email ou Username"
              keyboardType="email-address"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError(undefined);
              }}
              autoCapitalize="none"
              editable={!isLoading}
            />

            <View>
              <FormInput
                label="Palavra-passe"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(undefined);
                  if (warning) setWarning(undefined);
                  if (text.includes(' ')) {
                    setWarning('Atenção: A palavra-passe contém espaços');
                  }
                }}
                showPasswordToggle
                isPasswordVisible={showPassword}
                onPasswordToggle={() => setShowPassword(!showPassword)}
                autoCapitalize="none"
                editable={!isLoading}
              />
              {!isSmallScreen && (
                <TouchableOpacity onPress={() => router.push('/login/forgot-password')} disabled={isLoading}>
                  <Text style={styles.forgotPasswordLink}>Esqueceu a palavra-passe?</Text>
                </TouchableOpacity>
              )}
            </View>

            {warning && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </AuthForm>

          <Button
            text={isLoading ? 'A processar...' : 'Entrar'}
            handle={handleLogin}
            disabled={!identifier || !password || isLoading}
            loading={isLoading}
          />

          <AuthFooter
            linkText="Prefere usar número de telefone?"
            onLinkPress={() => router.push('/login')}
          />
        </AuthContent>
        </ScrollView>
      </AuthContainer>
    </KeyboardAvoidingView>
    </CompactModeProvider>
  );
}

