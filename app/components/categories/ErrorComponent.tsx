import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorComponentProps } from '@/app/types/categories';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function ErrorComponent({ error, onRetry }: ErrorComponentProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        },
        errorTitle: {
          color: colors.text,
          fontSize: 20,
          fontWeight: '600',
          marginTop: 16,
          marginBottom: 8,
          textAlign: 'center',
        },
        errorMessage: {
          color: colors.textSecondary,
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32,
        },
        retryButton: {
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 8,
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
    <View style={themedStyles.container}>
      <Ionicons name="alert-circle-outline" size={64} color="#FF5555" />
      <Text style={themedStyles.errorTitle}>Ops! Algo deu errado</Text>
      <Text style={themedStyles.errorMessage}>{error}</Text>
      <TouchableOpacity style={themedStyles.retryButton} onPress={onRetry}>
        <Text style={themedStyles.retryButtonText}>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
