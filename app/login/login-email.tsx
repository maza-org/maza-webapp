import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
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

export default function LoginEmail() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [warning, setWarning] = useState<string | undefined>(undefined);

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
          case 400:
            setError(errorData?.error?.message || 'Pedido inválido. Verifique os dados inseridos.');
            break;
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

  return (
    <AuthContainer edges={['top', 'bottom']}>
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
            <TouchableOpacity onPress={() => router.push('/login/forgot-password')} disabled={isLoading}>
              <Text style={styles.forgotPasswordLink}>Esqueceu a palavra-passe?</Text>
            </TouchableOpacity>
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
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  forgotPasswordLink: {
    color: '#2196F3',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'Manrope-Medium',
  },
  errorContainer: {
    backgroundColor: '#3D1E1E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'Manrope-Regular',
  },
  warningContainer: {
    backgroundColor: '#3D2E1E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFA726',
    marginBottom: 0,
  },
  warningText: {
    color: '#FFA726',
    fontSize: 12,
    marginLeft: 8,
    fontFamily: 'Manrope-Regular',
  },
});
