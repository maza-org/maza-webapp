import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ProfileErrorStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onButtonPress: () => void;
}

export default function ProfileErrorState({
  title = 'Sessão Expirada',
  message = 'A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente para aceder ao seu perfil.',
  buttonText = 'Iniciar Sessão',
  onButtonPress,
}: ProfileErrorStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: isDark ? 'rgba(31, 162, 223, 0.1)' : 'rgba(31, 162, 223, 0.15)',
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
        errorText: {
          color: colors.textMuted,
          fontSize: 16,
          fontFamily: 'Manrope-Regular',
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24,
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
      }),
    [colors, isDark]
  );

  return (
    <View style={themedStyles.errorContainer}>
      <View style={themedStyles.errorContent}>
        <View style={themedStyles.errorIconContainer}>
          <Feather name="user-x" size={48} color={colors.primary} />
        </View>
        <Text style={themedStyles.errorTitle}>{title}</Text>
        <Text style={themedStyles.errorText}>{message}</Text>
        <TouchableOpacity style={themedStyles.loginButton} onPress={onButtonPress}>
          <Text style={themedStyles.loginButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
