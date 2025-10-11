import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSetUserData } from '@/hooks/useAuth';
import { AuthUser } from '@/types/learning';
import { baseUrl } from '@/services/api';

export default function LoginEmail() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const setUserData = useSetUserData();

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Por favor preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      // Use the staging API endpoint for authentication
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError(data?.error?.details?.message || 'Credenciais inválidas');
        return;
      }

      if (response.status === 400) {
        setError(data?.error?.message || 'Pedido inválido');
        return;
      }

      if (!response.ok) {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
        return;
      }

      // Successful login
      if (data.success && data.jwt && data.user) {
        const token = data.jwt;

        // Fetch additional user data using the production endpoint
        const userData = await fetchUserData(token);

        // Create AuthUser object
        const authUser: AuthUser = {
          id: String(userData.id),
          documentId: userData.documentId,
          email: userData.email,
          fullname: userData.fullname,
          phone: userData.phone,
          yoma_id: userData.yoma_id || '',
          token: token,
        };

        // Save user data
        await setUserData.mutateAsync(authUser);

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
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Network')) {
        Alert.alert(
          'Erro de conexão',
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
        );
      } else {
        setError('Não foi possível fazer login. Por favor, tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
              editable={!loading}
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
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
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
            text={loading ? 'A processar...' : 'Entrar'}
            handle={handleLogin}
            disabled={!identifier || !password || loading}
            loading={loading}
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
