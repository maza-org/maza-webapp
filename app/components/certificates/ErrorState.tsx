import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const styles = StyleSheet.create({
    errorContainer: {
      flex: 1,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 500,
    },
    errorIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(31, 162, 223, 0.1)' : 'rgba(31, 162, 223, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    errorTitle: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 12,
    },
    errorText: {
      color: colors.textMuted,
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    retryButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: 300,
      gap: 8,
    },
    retryButtonIcon: {
      marginRight: 8,
    },
    retryButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Feather name="alert-circle" size={48} color={colors.primary} />
      </View>
      <Text style={styles.errorTitle}>Erro</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Feather name="refresh-cw" size={20} color="#FFF" style={styles.retryButtonIcon} />
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );
}
