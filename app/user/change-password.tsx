import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import useUser from '@/hooks/useUser';
import { useChangePassword } from '@/app/hooks/useAuthMutations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigateAfterLogin } from '@/util/onboarding';

export default function ChangePasswordScreen() {
  const { data: user, isLoading, error } = useUser();
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Por favor, insira a senha actual';
    }

    if (newPassword.length < 6) {
      newErrors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        password: newPassword,
      });

      if (user) {
        const userWithToken = {
          ...user,
          token: user.token,
        };

        await AsyncStorage.setItem('@user', JSON.stringify(userWithToken));

        Alert.alert('Sucesso', 'Senha alterada com sucesso!', [
          {
            text: 'OK',
            onPress: async () => {
              await navigateAfterLogin(user.interests);
            },
          },
        ]);
      }
    } catch (error: any) {
      if (error?.status === 417) {
        setErrors({ currentPassword: 'Senha actual incorrecta' });
      } else {
        const errorMessage = error?.message || 'Erro ao alterar senha. Tente novamente.';
        setErrors({ general: errorMessage });
      }
    }
  };

  const isFormValid = currentPassword.trim().length > 0 && newPassword.length >= 6;

  const isSubmitting = changePasswordMutation.isPending;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Feather name="user-x" size={48} color="#1fa2df" />
          </View>
          <Text style={styles.errorTitle}>Sessão Expirada</Text>
          <Text style={styles.errorDescription}>
            A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Feather name="log-in" size={20} color="#FFF" style={styles.loginButtonIcon} />
            <Text style={styles.loginButtonText}>Iniciar Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={styles.iconButton} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        <Text style={styles.subtitle}>Para sua segurança, insira a sua senha actual e depois crie uma nova senha.</Text>

        {errors.general && (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#FF6B6B" />
            <Text style={styles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Senha Actual</Text>
          <View style={[styles.inputWrapper, errors.currentPassword ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha atual"
              placeholderTextColor="#666"
              value={currentPassword}
              onChangeText={(text) => {
                setCurrentPassword(text);
                clearError('currentPassword');
                clearError('general');
              }}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
              <Feather name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color="#7C7C8A" />
            </TouchableOpacity>
          </View>
          {errors.currentPassword && <Text style={styles.fieldError}>{errors.currentPassword}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nova Senha</Text>
          <View style={[styles.inputWrapper, errors.newPassword ? styles.inputError : null]}>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#666"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError('newPassword');
                clearError('general');
              }}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              editable={!isSubmitting}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
              <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#7C7C8A" />
            </TouchableOpacity>
          </View>
          {errors.newPassword && <Text style={styles.fieldError}>{errors.newPassword}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!isFormValid || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.saveButtonText}>A processar...</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>Alterar Senha</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    backgroundColor: '#202024',
    borderRadius: 16,
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#A8A8B3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 100,
    padding: 24,
    backgroundColor: '#202024',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 24,
    gap: 24,
    paddingBottom: 32,
  },
  subtitle: {
    color: '#A8A8B3',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorBannerText: {
    color: '#FF6B6B',
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    borderRadius: 24,
    height: 48,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    height: '100%',
  },
  eyeButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  fieldError: {
    color: '#FF6B6B',
    fontSize: 12,
    marginLeft: 8,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  saveButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#202024',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
