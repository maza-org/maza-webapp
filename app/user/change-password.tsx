import React, { useState, useMemo } from 'react';
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
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function ChangePasswordScreen() {
  const { data: user, isLoading, error } = useUser();
  const changePasswordMutation = useChangePassword();
  const { isDark } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        },
        errorContainer: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        errorContent: {
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
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
          color: colors.text,
          fontSize: 24,
          fontFamily: 'Manrope-Bold',
          marginBottom: 12,
          textAlign: 'center',
        },
        errorDescription: {
          color: colors.textMuted,
          fontSize: 14,
          fontFamily: 'Manrope-Regular',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 20,
        },
        loginButton: {
          backgroundColor: colors.primary,
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
          fontFamily: 'Manrope-SemiBold',
        },
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          flexGrow: 1,
        },
        header: {
          height: 100,
          padding: 24,
          backgroundColor: colors.cardBackground,
        },
        headerActions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        headerTitle: {
          color: colors.text,
          fontSize: 20,
          fontFamily: 'Manrope-SemiBold',
        },
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        formContainer: {
          padding: 24,
          gap: 24,
          paddingBottom: 32,
        },
        subtitle: {
          color: colors.textMuted,
          fontSize: 14,
          lineHeight: 20,
          fontFamily: 'Manrope-Regular',
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
          fontFamily: 'Manrope-Regular',
        },
        inputGroup: {
          gap: 12,
        },
        inputLabel: {
          color: colors.text,
          fontSize: 14,
          fontFamily: 'Manrope-Medium',
        },
        inputWrapper: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.inputBackground,
          borderRadius: 24,
          height: 48,
          borderWidth: isDark ? 0 : 1,
          borderColor: colors.border,
        },
        inputError: {
          borderWidth: 1,
          borderColor: '#FF6B6B',
        },
        input: {
          flex: 1,
          paddingHorizontal: 16,
          fontSize: 16,
          color: colors.text,
          height: '100%',
          fontFamily: 'Manrope-Regular',
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
          fontFamily: 'Manrope-Regular',
        },
        footer: {
          padding: 24,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.footerBackground,
        },
        saveButton: {
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        saveButtonDisabled: {
          backgroundColor: colors.buttonBackground,
        },
        saveButtonText: {
          color: '#FFF',
          fontSize: 16,
          fontFamily: 'Manrope-SemiBold',
        },
      }),
    [colors, isDark]
  );

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
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={themedStyles.errorContainer}>
        <View style={themedStyles.errorContent}>
          <View style={themedStyles.errorIconContainer}>
            <Feather name="user-x" size={48} color={colors.primary} />
          </View>
          <Text style={themedStyles.errorTitle}>Sessão Expirada</Text>
          <Text style={themedStyles.errorDescription}>
            A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente.
          </Text>
          <TouchableOpacity style={themedStyles.loginButton} onPress={() => router.push('/login')}>
            <Feather name="log-in" size={20} color="#FFF" style={themedStyles.loginButtonIcon} />
            <Text style={themedStyles.loginButtonText}>Iniciar Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <ScrollView style={themedStyles.scrollView} contentContainerStyle={themedStyles.scrollContent}>
        <View style={themedStyles.header}>
          <View style={themedStyles.headerActions}>
            <TouchableOpacity style={themedStyles.iconButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={themedStyles.headerTitle}>Alterar Senha</Text>
            <View style={themedStyles.iconButton} />
          </View>
        </View>

        <View style={themedStyles.formContainer}>
        <Text style={themedStyles.subtitle}>
          Para sua segurança, insira a sua senha actual e depois crie uma nova senha.
        </Text>

        {errors.general && (
          <View style={themedStyles.errorBanner}>
            <Feather name="alert-circle" size={16} color="#FF6B6B" />
            <Text style={themedStyles.errorBannerText}>{errors.general}</Text>
          </View>
        )}

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Senha Actual</Text>
          <View style={[themedStyles.inputWrapper, errors.currentPassword ? themedStyles.inputError : null]}>
            <TextInput
              style={themedStyles.input}
              placeholderTextColor={colors.textSecondary}
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
            <TouchableOpacity
              style={themedStyles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Feather name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color={colors.iconColor} />
            </TouchableOpacity>
          </View>
          {errors.currentPassword && <Text style={themedStyles.fieldError}>{errors.currentPassword}</Text>}
        </View>

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Nova Senha</Text>
          <View style={[themedStyles.inputWrapper, errors.newPassword ? themedStyles.inputError : null]}>
            <TextInput
              style={themedStyles.input}
              placeholderTextColor={colors.textSecondary}
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
            <TouchableOpacity style={themedStyles.eyeButton} onPress={() => setShowNewPassword(!showNewPassword)}>
              <Feather name={showNewPassword ? 'eye-off' : 'eye'} size={20} color={colors.iconColor} />
            </TouchableOpacity>
          </View>
          {errors.newPassword && <Text style={themedStyles.fieldError}>{errors.newPassword}</Text>}
        </View>
        </View>
      </ScrollView>

      <View style={themedStyles.footer}>
        <TouchableOpacity
          style={[themedStyles.saveButton, (!isFormValid || isSubmitting) && themedStyles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={themedStyles.saveButtonText}>A processar...</Text>
            </>
          ) : (
            <Text style={themedStyles.saveButtonText}>Alterar Senha</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
