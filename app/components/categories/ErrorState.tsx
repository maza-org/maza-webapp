import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorState({ error, onRetry, title = 'Erro ao carregar' }: ErrorStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
        },
        errorTitle: {
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 8,
          textAlign: 'center',
        },
        errorText: {
          color: '#ff4444',
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 16,
          lineHeight: 22,
        },
        retryButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 50,
        },
        retryButtonText: {
          color: '#FFF',
          fontSize: 16,
          fontWeight: '600',
        },
      }),
    [colors]
  );

  return (
    <View style={themedStyles.errorContainer}>
      <Text style={themedStyles.errorTitle}>{title}</Text>
      <Text style={themedStyles.errorText}>{error}</Text>
      <TouchableOpacity style={themedStyles.retryButton} onPress={onRetry}>
        <Text style={themedStyles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
