import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { baseUrl } from '@/services/api';
import { ErrorResponse, LoginResponse, User } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginEmail() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

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

          // Create User object with token
          const userWithToken: User = {
            ...userData,
            token: token,
          };
          console.log(`USER WITH TOKEN:`, JSON.stringify(userWithToken, null, 2));
          // Save user data
          // await setUserData.mutateAsync(userWithToken);
          await AsyncStorage.setItem('@user', JSON.stringify(userWithToken));

          Alert.alert('Sucesso', 'Login realizado com sucesso.');

          // Check if user has interests before navigating
          if (userData.interests && userData.interests.length > 0) {
            router.replace('/');
          } else {
            router.replace('/start/customize');
          }
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
            Alert.alert(
              'Erro do Servidor',
              'O servidor está temporariamente indisponível. Por favor, tente novamente em alguns instantes.'
            );
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
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
        );
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/maza-logo.png')}
            style={{ width: 129, height: 78, marginStart: 20 }}
            contentFit={'contain'}
          />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.headerText}>Login com Email</Text>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Não possui uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login/create-email')}>
              <Text style={styles.loginLink}>Registar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email ou Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com ou +258821231231"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError(undefined);
              }}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palavra-passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="********"
                placeholderTextColor="#666"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError(undefined);
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        <View>
          <Button
            text={isLoading ? 'A processar...' : 'Entrar'}
            handle={handleLogin}
            disabled={!identifier || !password || isLoading}
            loading={isLoading}
          />
        </View>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.bottomLinkText}>Prefere usar número de telefone?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  topSection: {
    backgroundColor: '#1E1E1E',
    paddingBottom: 20,
    marginBottom: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: '#121212',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 260,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  loginText: {
    color: '#999999',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
  },
  formContainer: {
    gap: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
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
  },
  textButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  bottomLinkText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
  },
});
