import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface LoginPromptProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onLogin?: () => void;
}

export default function LoginPrompt({
  title = 'Sessão Expirada',
  message = 'A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente para aceder aos seus cursos.',
  buttonText = 'Iniciar Sessão',
  onLogin,
}: LoginPromptProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(() => StyleSheet.create({
    loginContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
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
      fontWeight: '700',
      marginBottom: 12,
      textAlign: 'center',
    },
    errorText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
      maxWidth: 320,
    },
    loginButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 50,
      width: '100%',
      maxWidth: 320,
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
  }), [colors]);

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      router.push('/login');
    }
  };

  return (
    <View style={themedStyles.loginContainer}>
      <View style={themedStyles.errorIconContainer}>
        <Feather name="user-x" size={48} color={colors.primary} />
      </View>
      <Text style={themedStyles.errorTitle}>{title}</Text>
      <Text style={themedStyles.errorText}>{message}</Text>
      <TouchableOpacity style={themedStyles.loginButton} onPress={handleLogin}>
        <Feather name="log-in" size={20} color="#FFF" style={themedStyles.loginButtonIcon} />
        <Text style={themedStyles.loginButtonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}
