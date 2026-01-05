import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface LoadingStateProps {
  title?: string;
  message?: string;
}

export default function LoadingState({ title = 'Carregando categorias...', message }: LoadingStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingText: {
          color: colors.text,
          marginTop: 16,
          fontSize: 16,
          fontWeight: '500',
        },
        loadingMessage: {
          color: colors.textSecondary,
          marginTop: 8,
          fontSize: 14,
          textAlign: 'center',
        },
      }),
    [colors]
  );

  return (
    <View style={themedStyles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={themedStyles.loadingText}>{title}</Text>
      {message && <Text style={themedStyles.loadingMessage}>{message}</Text>}
    </View>
  );
}
