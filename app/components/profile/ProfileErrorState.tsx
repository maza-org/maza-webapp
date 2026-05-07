import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import Button from '@/components/Button';

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
          maxWidth: 480,
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
          borderRadius: 24,
          padding: 48,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 10,
          borderWidth: 1,
          borderColor: colors.border,
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
          fontSize: 22,
          fontFamily: 'ManropeBold',
          marginBottom: 12,
          textAlign: 'center',
        },
        errorText: {
          color: colors.textMuted,
          fontSize: 15,
          fontFamily: 'ManropeRegular',
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 24,
        },
      }),
    [colors, isDark]
  );

  return (
    <View style={themedStyles.errorContainer}>
      <View style={themedStyles.errorContent}>
        <View style={themedStyles.errorIconContainer}>
          <Feather name="user-x" size={40} color={colors.primary} />
        </View>
        <Text style={themedStyles.errorTitle}>{title}</Text>
        <Text style={themedStyles.errorText}>{message}</Text>
        <Button text={buttonText} handle={onButtonPress} />
      </View>
    </View>
  );
}
